/* dither.js — ordered + error-diffusion dithering for the hero field and portrait.
   No dependencies. Everything degrades to plain markup if canvas is unavailable. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 8x8 Bayer ordered-dither matrix, normalised to [0,1). */
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

  /* ---------- value noise ---------- */

  function hash(x, y) {
    /* unsigned shifts matter: with >> the sign bit is duplicated into the
       xor and always cancels, capping the output at 0.5 */
    var n = (x * 374761393 + y * 668265263) | 0;
    n = ((n ^ (n >>> 13)) * 1274126177) | 0;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }

  function smooth(t) { return t * t * (3 - 2 * t); }

  function noise2(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = smooth(x - xi), yf = smooth(y - yi);
    var a = hash(xi, yi), b = hash(xi + 1, yi);
    var c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return (a + (b - a) * xf) + ((c + (d - c) * xf) - (a + (b - a) * xf)) * yf;
  }

  function fbm(x, y) {
    var sum = 0, amp = 0.5, freq = 1;
    for (var o = 0; o < 4; o++) {
      sum += noise2(x * freq, y * freq) * amp;
      freq *= 2.07;
      amp *= 0.5;
    }
    return sum / 0.9375; // normalise the octave sum back to [0,1]
  }

  /* ---------- palettes (flat RGB triplets) ---------- */

  var FIELD = [
    10, 10, 10,      // ground
    18, 62, 70,      // deep cyan shadow
    32, 142, 160,    // mid cyan
    72, 222, 246     // accent
  ];

  var PORTRAIT = [
    10, 10, 10,
    16, 62, 72,
    62, 176, 198,
    235, 250, 253
  ];

  /* ---------- hero field ---------- */

  function HeroField(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.cell = 4;              // css px per dither dot
    this.t = 0;
    this.running = false;
    this.last = 0;
    this.visible = true;
    if (!this.ctx) return;
    this.ctx.imageSmoothingEnabled = false;
    this.resize();
  }

  HeroField.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.ceil(rect.width / this.cell));
    this.h = Math.max(1, Math.ceil(rect.height / this.cell));
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.image = this.ctx.createImageData(this.w, this.h);
    this.draw();
  };

  HeroField.prototype.draw = function () {
    var w = this.w, h = this.h, d = this.image.data, t = this.t;
    var levels = 4, maxIdx = levels - 1;
    var cx = w * 0.5, cy = h * 0.5;
    var inv = 1 / Math.max(cx, cy);

    for (var y = 0; y < h; y++) {
      var by = (y & 7) << 3;
      for (var x = 0; x < w; x++) {
        /* drifting cloud field */
        var v = fbm(x * 0.035 + t * 0.15, y * 0.055 - t * 0.08);

        /* a slow horizontal wave keeps it from reading as static noise */
        v += 0.10 * Math.sin(x * 0.05 + t * 0.6 + y * 0.02);

        /* radial falloff so the field dissolves into the page ground */
        var dx = (x - cx) * inv, dy = (y - cy) * inv;
        var r = Math.sqrt(dx * dx + dy * dy);
        var fall = 1.35 - r * 0.8;
        v *= fall < 0 ? 0 : fall > 1 ? 1 : fall;

        /* contrast stretch — value noise clusters around 0.5 and would
           otherwise quantise almost entirely into the ground level.
           These constants give roughly a 66/27/6/1 split across the ramp. */
        v = (v - 0.35) * 1.7;
        v = v < 0 ? 0 : v > 1 ? 1 : v;

        /* ordered dither into the palette */
        var q = v * maxIdx + (BAYER[by + (x & 7)] - 0.5);
        var idx = Math.round(q);
        idx = idx < 0 ? 0 : idx > maxIdx ? maxIdx : idx;

        var p = (y * w + x) << 2, c = idx * 3;
        d[p] = FIELD[c];
        d[p + 1] = FIELD[c + 1];
        d[p + 2] = FIELD[c + 2];
        d[p + 3] = 255;
      }
    }
    this.ctx.putImageData(this.image, 0, 0);
  };

  HeroField.prototype.frame = function (now) {
    if (!this.running) return;
    /* throttle to ~15fps — the chunky look wants a low frame rate anyway */
    if (now - this.last > 66) {
      this.last = now;
      this.t += 0.05;
      this.draw();
    }
    var self = this;
    requestAnimationFrame(function (n) { self.frame(n); });
  };

  HeroField.prototype.start = function () {
    if (this.running || !this.ctx) return;
    this.running = true;
    var self = this;
    requestAnimationFrame(function (n) { self.frame(n); });
  };

  HeroField.prototype.stop = function () { this.running = false; };

  /* ---------- portrait: Floyd–Steinberg into a duotone ramp ---------- */

  function ditherPortrait(img, canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return false;

    var cell = 3;
    var box = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round((box.width || 320) / cell));
    var h = Math.max(1, Math.round(w * (img.naturalHeight / img.naturalWidth)));

    canvas.width = w;
    canvas.height = h;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, w, h);

    var image;
    try {
      image = ctx.getImageData(0, 0, w, h);
    } catch (e) {
      return false; // tainted canvas (file:// in some browsers)
    }

    var src = image.data;
    /* luminance buffer, with a contrast lift so the dither has range to work with */
    var lum = new Float32Array(w * h);
    for (var i = 0, j = 0; i < src.length; i += 4, j++) {
      var l = (0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]) / 255;
      l = (l - 0.5) * 1.25 + 0.52;
      lum[j] = l < 0 ? 0 : l > 1 ? 1 : l;
    }

    var levels = 4, maxIdx = levels - 1;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var k = y * w + x;
        var old = lum[k];
        var idx = Math.round(old * maxIdx);
        idx = idx < 0 ? 0 : idx > maxIdx ? maxIdx : idx;
        var err = old - idx / maxIdx;

        var c = idx * 3, p = k << 2;
        src[p] = PORTRAIT[c];
        src[p + 1] = PORTRAIT[c + 1];
        src[p + 2] = PORTRAIT[c + 2];
        src[p + 3] = 255;

        /* diffuse the quantisation error to the neighbours */
        if (x + 1 < w) lum[k + 1] += err * 0.4375;
        if (y + 1 < h) {
          if (x > 0) lum[k + w - 1] += err * 0.1875;
          lum[k + w] += err * 0.3125;
          if (x + 1 < w) lum[k + w + 1] += err * 0.0625;
        }
      }
    }

    ctx.putImageData(image, 0, 0);
    return true;
  }

  /* ---------- scroll reveal ---------- */

  function reveal() {
    var nodes = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || REDUCED) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    for (var n = 0; n < nodes.length; n++) io.observe(nodes[n]);
  }

  /* ---------- boot ---------- */

  function init() {
    var canvas = document.querySelector('.dither-field');
    if (canvas) {
      var field = new HeroField(canvas);
      if (field.ctx) {
        canvas.classList.add('is-ready');
        if (!REDUCED) {
          field.start();
          /* stop burning frames once the hero has scrolled away */
          if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
              entries[0].isIntersecting ? field.start() : field.stop();
            }, { threshold: 0 }).observe(canvas);
          }
        }
        var timer;
        window.addEventListener('resize', function () {
          clearTimeout(timer);
          timer = setTimeout(function () { field.resize(); }, 150);
        });
      }
    }

    var portrait = document.getElementById('portrait-dither');
    var source = document.getElementById('portrait-src');
    if (portrait && source) {
      var run = function () {
        if (ditherPortrait(source, portrait)) {
          portrait.classList.add('is-ready');
        }
      };
      source.complete && source.naturalWidth ? run() : source.addEventListener('load', run);
    }

    reveal();

    /* nav shadow-line once scrolled */
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
