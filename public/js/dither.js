/* dither.js — ordered dithering as the site's one reproduction material.
 *
 * Dithering simulates tones a limited palette cannot hold. That only means
 * something when there is a real image to reproduce, so this runs on
 * photographs and nothing else: no procedural fields, no animated noise.
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
      inks = [[7, 11, 9], [30, 47, 34], [65, 97, 63], [132, 168, 119], [223, 227, 207]];
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
  function render(img, canvas) {
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
       centre. On a wide group shot the same curve crushes the people at the
       edges and blows the middle, so it is opt-in per image rather than a
       property of the material. */
    var portrait = img.getAttribute('data-dither') === 'portrait';
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

        if (portrait) {
          var dx = x - cx, dy = (y - cy) * 0.94;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var t = dist <= r0 ? 0 : dist >= r1 ? 1 : (dist - r0) / (r1 - r0);
          t = t * t * (3 - 2 * t);
          lum *= 1 - t * 0.58;
        }

        /* Lift contrast around mid-grey so the five inks span the subject
           instead of piling into the middle two. */
        lum = (lum - 0.5) * gain + pivot;

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

    var draw = function () {
      if (render(img, canvas)) wrap.classList.add('is-ready');
    };

    if (img.complete && img.naturalWidth) draw();
    else img.addEventListener('load', draw);

    return draw;
  }

  function reveal() {
    var nodes = document.querySelectorAll('[data-reveal]');
    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reduced) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    for (var n = 0; n < nodes.length; n++) io.observe(nodes[n]);
  }

  function init() {
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

    reveal();

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
