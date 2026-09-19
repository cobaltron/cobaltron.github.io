"""Generate the highlighter strokes used by `.prose strong` / `.about strong`.

The marks are rough SVG paths baked into data URIs in src/styles/global.css.
They are baked rather than tokenised because a background-image SVG is an
isolated document: it cannot read a CSS custom property or currentColor. The
alternative — an absolutely-positioned pseudo-element tinted with
background-color and shaped with mask-image — loses `box-decoration-break:
clone`, so a highlight spanning a line break would render as one box over both
lines instead of one stroke per line. Baking the colour is the cheaper defect.

    python scripts/gen-highlighter.py        # prints the CSS block to stdout

Change INK here, re-run, and paste the block back into global.css.
"""
import random, math
from urllib.parse import quote

W, H = 200.0, 40.0


def catmull(pts):
    """Catmull-Rom through pts -> cubic bezier 'd' segments (smooth, not jagged:
    a chisel tip drags a wavy edge, it does not cut a zigzag)."""
    d = "M%.1f,%.1f" % pts[0]
    n = len(pts)
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else pts[0]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else pts[-1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        d += "C%.1f,%.1f %.1f,%.1f %.1f,%.1f" % (c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
    return d


def sample(pts, steps=14):
    """Same curve, densely sampled — used for the PIL preview so the picture
    matches the shipped path instead of approximating it."""
    out, n = [], len(pts)
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else pts[0]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else pts[-1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        for s in range(steps):
            t = s / steps
            u = 1 - t
            x = u*u*u*p1[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p2[0]
            y = u*u*u*p1[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p2[1]
            out.append((x, y))
    out.append(pts[-1])
    return out


def edge(rnd, base, amp, n=11, tilt=0.0):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = -6 + (W + 12) * t
        # a long slow undulation plus a small jitter: the hand drifts and the
        # tip chatters, and those are different frequencies
        y = (base
             + math.sin(t * math.pi * 1.6 + rnd.uniform(0, 3)) * amp * 0.55
             + rnd.uniform(-amp, amp) * 0.55
             + tilt * (t - 0.5))
        pts.append((x, y))
    return pts


def stroke(seed):
    rnd = random.Random(seed)
    tilt = rnd.uniform(-2.6, 2.6)          # the page is never perfectly square
    top = edge(rnd, rnd.uniform(5.0, 7.5), 4.6, tilt=tilt)
    bot = edge(rnd, rnd.uniform(32.5, 35.0), 5.2, tilt=tilt)

    # A skip: somewhere along the run the tip lifted and the paper kept its
    # colour. At 16px this reads as "highlighter" far more loudly than any
    # amount of wobble on an otherwise even band.
    i = rnd.randrange(3, len(bot) - 3)
    lift = rnd.uniform(7.0, 11.0)
    bot[i] = (bot[i][0], bot[i][1] - lift)
    bot[i + 1] = (bot[i + 1][0], bot[i + 1][1] - lift * 0.55)
    bot[i - 1] = (bot[i - 1][0], bot[i - 1][1] - lift * 0.35)

    # and a matching bite out of the top edge somewhere else
    j = rnd.randrange(2, len(top) - 2)
    while abs(j - i) < 3:
        j = rnd.randrange(2, len(top) - 2)
    top[j] = (top[j][0], top[j][1] + rnd.uniform(4.0, 7.0))

    # Chisel ends: the tip is a flat blade held at an angle, so the two corners
    # of each end are offset from one another rather than cut square.
    top[0] = (top[0][0] + rnd.uniform(4, 9), top[0][1])
    bot[0] = (bot[0][0] - rnd.uniform(0, 3), bot[0][1])
    top[-1] = (top[-1][0] + rnd.uniform(-3, 2), top[-1][1])
    bot[-1] = (bot[-1][0] - rnd.uniform(5, 11), bot[-1][1])

    d = catmull(top) + "L%.1f,%.1f" % bot[-1] + catmull(list(reversed(bot)))[1:] + "Z"
    poly = sample(top) + [bot[-1]] + sample(list(reversed(bot)))

    # A second pass of the pen, not a box: the tip lands light, presses in the
    # middle and lifts light, so the shape tapers to nothing at both ends.
    x0 = rnd.uniform(0.02, 0.35) * W
    x1 = x0 + rnd.uniform(0.35, 0.60) * W
    mid = rnd.uniform(18, 23)
    peak = rnd.uniform(9.5, 12.0)
    n2 = 9
    st, sb = [], []
    for i in range(n2 + 1):
        t = i / n2
        x = x0 + (x1 - x0) * t
        # sine taper -> zero half-height at each end
        hh = math.sin(t * math.pi) * peak
        drift = math.sin(t * math.pi * 2.1 + rnd.uniform(0, 2)) * 1.4
        st.append((x, mid + drift - hh))
        sb.append((x, mid + drift + hh))
    d2 = catmull(st) + catmull(list(reversed(sb)))[1:] + "Z"
    poly2 = sample(st) + sample(list(reversed(sb)))
    return d, d2, poly, poly2


INK = "%23e8b93c"   # '#' must be percent-encoded inside a data URI

def svg(seed):
    d, d2, _, _ = stroke(seed)
    s = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='-7 -4 214 48' "
         "preserveAspectRatio='none'>"
         "<path d='" + d + "' fill='INK' fill-opacity='.42'/>"
         "<path d='" + d2 + "' fill='INK' fill-opacity='.24'/>"
         "</svg>")
    return "url(\"data:image/svg+xml," + quote(s, safe="/:='<>? ").replace('#', '%23') + "\")"


if __name__ == "__main__":
    # Three strokes so consecutive marks are not the same sticker twice.
    SEEDS = [11, 29, 47]
    a, b, c = [svg(x).replace("INK", INK) for x in SEEDS]
    print("""/* highlighter:start - generated by scripts/gen-highlighter.py, do not hand-edit */
.prose strong,
.about strong {
  /* Emphasis on a printed sheet is not a heavier weight, it is someone taking
     a marker to the page afterwards. The stroke is a rough SVG rather than a
     linear-gradient because a gradient's edges are perfectly straight, which
     is the one thing a real highlighter never produces.

     This rides on <strong>, not <mark>, so the bold button in Keystatic keeps
     working and nobody has to type an element into their prose.

     Regenerate with: python scripts/gen-highlighter.py */
  font-weight: inherit;
  color: var(--text);
  background-image: %s;
  background-repeat: no-repeat;
  background-size: 100%% 100%%;
  /* the ink overshoots the words, and the negative margin keeps it from
     pushing the line's measure out */
  padding: 0.16em 0.22em 0.2em;
  margin: 0 -0.06em;
  /* one stroke per line when a highlight wraps, instead of a single box
     stretched across the break */
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.prose p:nth-of-type(3n + 2) strong,
.about p:nth-of-type(3n + 2) strong {
  background-image: %s;
}

.prose p:nth-of-type(3n + 3) strong,
.about p:nth-of-type(3n + 3) strong {
  background-image: %s;
}

/* Forced-colours strips background images, so emphasis would vanish entirely.
   Give the weight back there, and in print, where backgrounds are dropped by
   default. */
@media (forced-colors: active) {
  .prose strong,
  .about strong {
    background-image: none;
    font-weight: 700;
  }
}

@media print {
  .prose strong,
  .about strong {
    background-image: none;
    font-weight: 700;
  }
}
/* highlighter:end */""" % (a, b, c))
