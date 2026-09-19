/* dither.js — ordered dithering as the site's one material.
 *
 * Two surfaces, one material.
 *
 * Photographs are dithered because a five-ink ramp genuinely cannot hold them,
 * which is what the technique is for.
 *
 * The page field is dithered because it is the same ink at the same dot
 * pitch — the material used as ground rather than as reproduction. It runs
 * under the whole page, prose included, and what keeps that honest is a hard
 * ceiling on dot coverage rather than a mask: see --field-amp below.
 *
 * Every dithered surface shares one dot pitch (--dither-cell) and one ink ramp
 * (--ink-0 … --ink-4), both read from CSS so the palette is defined once. The
 * pitch is enforced by the backing store: the canvas is sized in dots, not
 * pixels, and CSS scales it up with image-rendering: pixelated. That makes the
 * dot size independent of device pixel ratio and identical on every element.
 *
 * Degrades to the undithered <img> if canvas is unavailable or the pixels
 * cannot be read.
 */
(function () {
  'use strict';

  /* 8x8 Bayer ordered-dither matrix, normalised to [0,1). Ordered rather than
     error-diffused on purpose: the crosshatch is the recognisable artefact,
     and it stays stable across resizes where diffusion would reflow. */
  var BAYER = [
     0, 32,  8, 40,  2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44,  4, 36, 14, 46,  6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
     3, 35, 11, 43,  1, 33,  9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47,  7, 39, 13, 45,  5, 37,
    63, 31, 55, 23, 61, 29, 53, 21
  ].map(function (v) { return v / 64; });

  /* ---------- palette, read once from CSS ---------- */

  function parseColor(value) {
    var s = (value || '').trim();
    var hex = s.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      var n = parseInt(hex[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var rgb = s.match(/^rgba?\(([^)]+)\)$/i);
    if (rgb) {
      var parts = rgb[1].split(/[,\s/]+/);
      return [+parts[0] || 0, +parts[1] || 0, +parts[2] || 0];
    }
    return null;
  }

  var config = null;

  function readConfig() {
    if (config) return config;
    var root = getComputedStyle(document.documentElement);

    var inks = [];
    for (var i = 0; i < 8; i++) {
      var c = parseColor(root.getPropertyValue('--ink-' + i));
      if (!c) break;
      inks.push(c);
    }
    /* Fallback ramp keeps the page correct if the stylesheet has not parsed. */
    if (inks.length < 2) {
      inks = [[20, 19, 15], [74, 70, 60], [131, 126, 112], [189, 184, 168], [245, 243, 237]];
    }

    var cell = parseFloat(root.getPropertyValue('--dither-cell')) || 3;

    config = { inks: inks, cell: Math.max(1, cell) };
    return config;
  }

  /* ---------- the dither ---------- */

  /*
   * A true palette dither: the output contains only ramp colours. Luminance is
   * quantised with the Bayer threshold applied *before* rounding, so the
   * crosshatch appears in the mid-tones where the ramp cannot hold the value —
   * which is the whole point of the technique, and where the previous version
   * lost it by quantising luminance and then rescaling the original RGB.
   */
  function render(img, canvas, progress) {
    var cfg = readConfig();
    var box = img.getBoundingClientRect();
    var cssW = box.width || img.naturalWidth;
    var cssH = box.height || img.naturalHeight;
    if (!cssW || !cssH) return false;

    /* Backing store measured in dots. CSS stretches it back up, so one dot is
       always cfg.cell CSS pixels wide regardless of screen density. */
    var w = Math.max(1, Math.round(cssW / cfg.cell));
    var h = Math.max(1, Math.round(cssH / cfg.cell));

    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return false;

    canvas.width = w;
    canvas.height = h;

    /* Downscale through the browser's own filter, which box-averages, so each
       dot decides from the whole area it covers instead of one sampled pixel. */
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    /* Cover, not stretch: match the CSS object-fit the element is laid out with. */
    var sw = img.naturalWidth, sh = img.naturalHeight;
    var scale = Math.max(w / sw, h / sh);
    var dw = sw * scale, dh = sh * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

    var frame;
    try {
      frame = ctx.getImageData(0, 0, w, h);
    } catch (e) {
      return false; /* tainted canvas — file:// in some browsers */
    }

    var d = frame.data;
    var inks = cfg.inks;
    var top = inks.length - 1;

    /* A vignette suits a portrait, where there is one subject to hold the
       centre. On a wide group shot the same curve washes out the people at
       the edges, so it is opt-in per image rather than a property of the
       material.

       On paper the vignette lifts *towards* the top ink rather than down
       towards the bottom one: the top ink is the page background, so the dots
       thin out until the photograph has simply become page again. A dark
       vignette here would draw a halo instead. */
    var portrait = img.getAttribute('data-dither') === 'portrait';
    if (typeof progress !== 'number') progress = 1;
    var cx = w * 0.5, cy = h * 0.46;
    var r0 = Math.max(w, h) * 0.30;
    var r1 = Math.max(w, h) * 0.62;

    /* Flat images take a gentler lift: they arrive already exposed, and the
       portrait's curve pushes their highlights into the top ink. */
    var gain = portrait ? 1.22 : 1.1;
    var pivot = portrait ? 0.46 : 0.5;

    for (var y = 0; y < h; y++) {
      var by = (y & 7) << 3;
      for (var x = 0; x < w; x++) {
        var k = (y * w + x) << 2;

        var lum = (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255;

        /* Lift contrast around mid-grey so the five inks span the subject
           instead of piling into the middle two. */
        lum = (lum - 0.5) * gain + pivot;

        /* The vignette runs last and reaches 1 exactly, so beyond r1 every
           dot is the top ink — the page — and the image has no edge to see.
           Lifting before the contrast curve pulled the corners back down into
           a permanent 50% checkerboard in the shape of the element. */
        if (portrait) {
          var dx = x - cx, dy = (y - cy) * 0.94;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var t = dist <= r0 ? 0 : dist >= r1 ? 1 : (dist - r0) / (r1 - r0);
          t = t * t * (3 - 2 * t);
          lum += (1 - lum) * t;
        }

        /* The print comes up in the tray. At progress 0 every dot has lifted
           to the top ink and the plate is blank paper; at 1 the photograph is
           fully inked. It is the same lift the vignette uses, applied to the
           whole frame instead of its edges — so developing is the material's
           own move, not an opacity fade borrowed from somewhere else. */
        if (progress < 1) lum += (1 - lum) * (1 - progress);

        var q = lum * top + (BAYER[by + (x & 7)] - 0.5);
        var idx = Math.round(q);
        idx = idx < 0 ? 0 : idx > top ? top : idx;

        var ink = inks[idx];
        d[k] = ink[0];
        d[k + 1] = ink[1];
        d[k + 2] = ink[2];
        d[k + 3] = 255;
      }
    }

    ctx.putImageData(frame, 0, 0);
    return true;
  }

  /* ---------- the page field ---------- */

  /*
   * A halftone of one ink on paper, across the whole page.
   *
   * Three slow sine waves sum into a smooth coverage field, which the same
   * Bayer matrix turns into dots. Because the field's ramp is two steps — one
   * ink and the paper — the amplitude *is* the dot coverage: --field-amp of
   * 0.24 means the densest part of the field is 24% ink and no more. That is
   * what makes this checkable rather than a matter of taste. At 24% coverage
   * of --field-ink the local ground stays light enough that the faintest text
   * on the page still holds 4.5:1 over it, so the field may sit under the
   * prose instead of hiding in the margins.
   *
   * The waves are separable — sin(x), sin(y) and sin(x+y) — so a frame
   * precomputes three small tables and the per-dot loop is three array reads,
   * a multiply and one comparison.
   */
  function mountField(canvas) {
    var cfg = readConfig();
    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    var root = getComputedStyle(document.documentElement);

    var ink = parseColor(root.getPropertyValue('--field-ink')) || [205, 215, 230];
    /* Paper is the shared ramp's own top step, never a second opinion about
       what the page colour is. */
    var paper = cfg.inks[cfg.inks.length - 1];

    var amp = parseFloat(root.getPropertyValue('--field-amp'));
    if (!(amp > 0 && amp <= 1)) amp = 0.24;

    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* A lamp needs a pointer to hold it. A coarse pointer gets nothing at all
       rather than a halo parked wherever the last tap landed. */
    var fine = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
    var lampOn = !reduced && fine;

    var w = 0, h = 0, frame, data, waveX, waveY, waveD;
    var interval = 66;

    /* The lamp: a soft area where the tint lifts off the paper, following the
       pointer like a reading light moved across the page. It only ever
       *removes* ink, so it cannot spend any of the contrast budget that
       --field-amp is holding — the ground under it can only get lighter. */
    var lampR = 0, lx = 0, ly = 0, lamp = 0, lampTarget = 0;
    var prevBox = null, paintedX = -1, paintedY = -1, paintedAmt = -1;

    function measure() {
      w = Math.max(1, Math.ceil(window.innerWidth / cfg.cell));
      h = Math.max(1, Math.ceil(window.innerHeight / cfg.cell));
      canvas.width = w;
      canvas.height = h;

      /* One buffer for the life of the size. Alpha is opaque everywhere and
         never written again in the hot loop. */
      frame = ctx.createImageData(w, h);
      data = frame.data;
      for (var a = 3; a < data.length; a += 4) data[a] = 255;

      waveX = new Float32Array(w);
      waveY = new Float32Array(h);
      waveD = new Float32Array(w + h);

      lampR = Math.max(8, Math.round(170 / cfg.cell));
      prevBox = null;
      paintedX = paintedY = paintedAmt = -1;

      /* Separable waves make a frame cheap — about 1.7ms at 1440x900 and
         4.7ms on a 3440-wide ultrawide — so 15fps costs a couple of percent
         of a core, and rAF stops it dead on a hidden tab. The throttle easing
         to 10fps on very large viewports is a ceiling, not a fix. If anything
         ever has to give it is the frame rate, never the dot pitch: that is
         shared with the photographs and cannot drift. */
      interval = w * h > 300000 ? 100 : 66;
    }

    function waves(now) {
      var t = now * 0.00028;
      /* Slower than the page, so the field reads as something behind the
         document rather than something painted on the window. */
      var scroll = (window.scrollY || 0) * 0.006;
      var i;

      /* Wavelengths of roughly 600, 730 and 1000 CSS px. Broad on purpose:
         tighter waves came out as even mottle, and the drifting bands only
         read once a band is wider than the eye takes for texture. */
      for (i = 0; i < w; i++) waveX[i] = Math.sin(i * 0.032 + t);
      for (i = 0; i < h; i++) waveY[i] = Math.sin(i * 0.026 - t * 0.82 - scroll);
      for (i = 0; i < w + h; i++) waveD[i] = Math.sin(i * 0.019 + t * 0.55);
    }

    function region(x0, y0, x1, y1) {
      var lit = lamp > 0.004;
      for (var y = y0; y <= y1; y++) {
        var by = (y & 7) << 3;
        var wy = waveY[y];
        var row = y * w;
        var dy = y - ly;
        for (var x = x0; x <= x1; x++) {
          /* Three waves in [-1,1] into roughly [0,1]; the odd coefficient is
             1/3 scaled to fill the range the sum actually reaches. Clamped
             because it overshoots when all three peak together, and
             --field-amp is a contrast ceiling — an overshoot there is text
             losing contrast, not a brighter dot. */
          var f = 0.5 + (waveX[x] + wy + waveD[x + y]) * 0.2067;
          f = f < 0 ? 0 : f > 1 ? 1 : f;
          var cov = f * amp;

          if (lit) {
            var dx = x - lx;
            var dd = Math.sqrt(dx * dx + dy * dy) / lampR;
            if (dd < 1) {
              var e = 1 - dd;
              cov *= 1 - lamp * (e * e * (3 - 2 * e));
            }
          }

          /* The same ordered comparison the photographs use, specialised to
             two inks: a dot takes ink when its threshold falls below the
             coverage asked for here. */
          var c = BAYER[by + (x & 7)] < cov ? ink : paper;

          var k = (row + x) << 2;
          data[k] = c[0];
          data[k + 1] = c[1];
          data[k + 2] = c[2];
        }
      }
    }

    function lampBox() {
      if (lamp <= 0.004) return null;
      var r = lampR + 1;
      return [
        Math.max(0, Math.floor(lx - r)),
        Math.max(0, Math.floor(ly - r)),
        Math.min(w - 1, Math.ceil(lx + r)),
        Math.min(h - 1, Math.ceil(ly + r))
      ];
    }

    function drawAll(now) {
      waves(now);
      region(0, 0, w - 1, h - 1);
      ctx.putImageData(frame, 0, 0);
      canvas.classList.add('is-ready');
      prevBox = lampBox();
      paintedX = lx; paintedY = ly; paintedAmt = lamp;
    }

    /* Between full frames only the lamp's own neighbourhood is repainted, so
       the halo tracks the pointer at display rate while the field itself stays
       on its slow clock. The previous box is repainted with it, or the lamp
       would drag a trail of cleared paper behind it. */
    function drawLamp() {
      if (lx === paintedX && ly === paintedY &&
          Math.abs(lamp - paintedAmt) < 0.002) return;

      var box = lampBox();
      var u = box;
      if (prevBox) {
        u = box ? [
          Math.min(box[0], prevBox[0]), Math.min(box[1], prevBox[1]),
          Math.max(box[2], prevBox[2]), Math.max(box[3], prevBox[3])
        ] : prevBox;
      }
      if (!u) return;

      region(u[0], u[1], u[2], u[3]);
      ctx.putImageData(frame, 0, 0, u[0], u[1], u[2] - u[0] + 1, u[3] - u[1] + 1);
      prevBox = box;
      paintedX = lx; paintedY = ly; paintedAmt = lamp;
    }

    measure();

    if (reduced) {
      /* One frame, held. The pattern is the point; the drift is not, and for
         anyone who asked not to be moved it is only a liability. */
      drawAll(0);
    } else {
      var last = -Infinity;
      (function tick(now) {
        requestAnimationFrame(tick);

        if (lampOn) lamp += (lampTarget - lamp) * 0.2;

        if (now - last >= interval) {
          last = now;
          drawAll(now);
        } else if (lampOn) {
          drawLamp();
        }
      })(0);
    }

    if (lampOn) {
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        lx = e.clientX / cfg.cell;
        ly = e.clientY / cfg.cell;
        lampTarget = 1;
      }, { passive: true });

      /* Take the lamp away when the pointer or the window leaves, so it never
         sits burned into the corner of a page nobody is looking at. */
      var douse = function () { lampTarget = 0; };
      document.documentElement.addEventListener('pointerleave', douse);
      window.addEventListener('blur', douse);
    }

    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        measure();
        if (reduced) drawAll(0);
      }, 180);
    });
  }

  /* ---------- wiring ---------- */

  function mount(img) {
    if (img.__dithered) return;
    img.__dithered = true;

    var wrap = document.createElement('span');
    wrap.className = 'dither';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);

    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var developed = false;

    var draw = function () {
      if (render(img, canvas)) wrap.classList.add('is-ready');
    };

    /* Develop once, on arrival. At progress 0 the canvas is solid --paper and
       indistinguishable from the page behind it, so this needs no fade-in of
       its own: the dots appearing *are* the entrance. `dither--print` drops
       the cross-fade the opacity path uses, or the two entrances would run
       over each other and read as a plain fade. */
    var develop = function () {
      if (!render(img, canvas, 0)) return false;
      wrap.className += ' dither--print is-ready';

      var DUR = 1250;
      var t0 = 0;

      requestAnimationFrame(function step(now) {
        if (!t0) t0 = now;
        var p = (now - t0) / DUR;
        if (p >= 1) {
          render(img, canvas, 1);
          developed = true;
          return;
        }
        /* Cubic ease-out, not exponential. An exponential curve put half the
           image down in the first 110ms, which pops rather than develops —
           the ramp has to be slow enough to watch, because watching it is the
           entire moment. */
        render(img, canvas, 1 - Math.pow(1 - p, 3));
        requestAnimationFrame(step);
      });
      return true;
    };

    var start = function () {
      if (reduced || developed || !develop()) draw();
    };

    if (img.complete && img.naturalWidth) start();
    else img.addEventListener('load', start);

    /* Resize redraws go straight to the finished print; the tray moment is
       for arriving at the page, not for dragging a window edge. */
    return draw;
  }

  function init() {
    var field = document.querySelector('canvas.page-field');
    if (field) mountField(field);

    var redraws = [];
    var images = document.querySelectorAll('img[data-dither]');
    for (var i = 0; i < images.length; i++) {
      var draw = mount(images[i]);
      if (draw) redraws.push(draw);
    }

    if (redraws.length) {
      var timer;
      window.addEventListener('resize', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          for (var j = 0; j < redraws.length; j++) redraws[j]();
        }, 180);
      });
    }

    /* nav rule appears once the header stops sitting on the page top */
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', window.scrollY > 8);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
