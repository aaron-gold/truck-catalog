// Smooth zoom & pan for the photo viewer (.lb). Takes over the bundle's
// React wheel/drag handlers, which re-rendered on every mouse move.
(function () {
  var MIN = 1, MAX = 8;
  var s = { z: 1, x: 0, y: 0, src: null, raf: 0 };
  var ptrs = new Map(), drag = null, pinch = null, moved = false;

  function el() { return document.querySelector('.lb .lb-imgc'); }
  function vp() { return document.querySelector('.lb .lb-vp'); }
  function label() {
    var g = document.querySelector('.lb .lb-ctrl .lb-cg');
    var v = g && g.querySelector('.lb-cv');
    if (v) v.textContent = Math.round(s.z * 100) + '%';
  }
  function clamp() {
    var e = el(), v = vp(); if (!e || !v) return;
    var w = e.offsetWidth, h = e.offsetHeight, W = w * s.z, H = h * s.z;
    // keep the zoomed image covering its own box (no empty gaps)
    s.x = Math.min(0, Math.max(w - W, s.x));
    s.y = Math.min(0, Math.max(h - H, s.y));
    if (s.z <= 1) { s.x = 0; s.y = 0; }
  }
  function paint() {
    s.raf = 0;
    var e = el(); if (!e) return;
    e.style.transform = 'translate3d(' + s.x + 'px,' + s.y + 'px,0) scale(' + s.z + ')';
    e.style.cursor = s.z > 1 ? (drag ? 'grabbing' : 'grab') : 'zoom-in';
    e.classList.toggle('lbz-moving', !!(drag || pinch));
    label();
  }
  function req() { if (!s.raf) s.raf = requestAnimationFrame(paint); }
  function base() { var e = el(), r = e.getBoundingClientRect(); return { l: r.left - s.x, t: r.top - s.y }; }
  function zoomAt(nz, cx, cy, animate) {
    var e = el(); if (!e) return;
    nz = Math.min(MAX, Math.max(MIN, nz));
    var b = base(), px = cx - b.l, py = cy - b.t, k = nz / s.z;
    s.x = px - (px - s.x) * k; s.y = py - (py - s.y) * k; s.z = nz;
    clamp();
    e.classList.toggle('lbz-anim', !!animate);
    req();
  }
  function center() { var r = el().getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function reset() { s.z = 1; s.x = 0; s.y = 0; drag = pinch = null; ptrs.clear(); req(); }
  function sync() {
    var lb = document.querySelector('.lb');
    var img = lb && lb.querySelector('.lb-imgc img');
    var src = lb ? (img ? img.src : 'ph') + '|' + (lb.querySelector('.lb-n') || {}).textContent : null;
    if (src !== s.src) { s.src = src; reset(); }
  }
  new MutationObserver(sync).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });

  function inVp(t) { return t && t.closest && t.closest('.lb .lb-stage') && !t.closest('.lb-nav'); }

  document.addEventListener('wheel', function (ev) {
    if (!inVp(ev.target) || !el()) return;
    ev.preventDefault(); ev.stopPropagation();
    var dy = ev.deltaY * (ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? 100 : 1);
    var f = ev.ctrlKey ? 0.01 : 0.0022; // trackpad pinch sends ctrl+wheel
    zoomAt(s.z * Math.exp(-dy * f), ev.clientX, ev.clientY);
  }, { capture: true, passive: false });

  ['mousedown', 'mousemove', 'mouseup', 'mouseleave', 'touchstart', 'touchmove', 'touchend'].forEach(function (t) {
    document.addEventListener(t, function (ev) { if (inVp(ev.target)) ev.stopPropagation(); }, true);
  });

  document.addEventListener('pointerdown', function (ev) {
    if (!inVp(ev.target) || !el() || ev.button > 0) return;
    ev.preventDefault();
    var v = vp(); v.setPointerCapture && v.setPointerCapture(ev.pointerId);
    ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    moved = false;
    if (ptrs.size === 2) {
      var p = Array.from(ptrs.values());
      pinch = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), z: s.z };
      drag = null;
    } else if (ptrs.size === 1) {
      drag = { x: ev.clientX - s.x, y: ev.clientY - s.y, sx: ev.clientX, sy: ev.clientY };
    }
    req();
  }, true);

  document.addEventListener('pointermove', function (ev) {
    if (!ptrs.has(ev.pointerId)) return;
    ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pinch && ptrs.size >= 2) {
      var p = Array.from(ptrs.values());
      var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      zoomAt(pinch.z * d / pinch.d, (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
      moved = true;
    } else if (drag) {
      if (Math.abs(ev.clientX - drag.sx) + Math.abs(ev.clientY - drag.sy) > 4) moved = true;
      if (s.z > 1) { s.x = ev.clientX - drag.x; s.y = ev.clientY - drag.y; clamp(); el().classList.remove('lbz-anim'); req(); }
    }
  }, true);

  function up(ev) {
    if (!ptrs.has(ev.pointerId)) return;
    ptrs.delete(ev.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (ptrs.size === 0) drag = null;
    req();
  }
  document.addEventListener('pointerup', up, true);
  document.addEventListener('pointercancel', up, true);

  // Double-click / double-tap: zoom to 2.5x at that spot, or back to fit.
  var lastTap = 0;
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var btn = t.closest && t.closest('.lb .lb-ctrl .lb-cg:first-child button');
    if (btn && el()) {
      ev.preventDefault(); ev.stopPropagation();
      var c = center(), a = btn.getAttribute('aria-label');
      if (a === 'Zoom in') zoomAt(s.z * 1.5, c[0], c[1], true);
      else if (a === 'Zoom out') zoomAt(s.z / 1.5, c[0], c[1], true);
      else { el().classList.add('lbz-anim'); reset(); }
      return;
    }
    if (!inVp(t) || !el() || moved) return;
    var now = Date.now();
    if (now - lastTap < 300) {
      if (s.z > 1) { el().classList.add('lbz-anim'); reset(); } else zoomAt(2.5, ev.clientX, ev.clientY, true);
      lastTap = 0;
    } else lastTap = now;
  }, true);

  document.addEventListener('keydown', function (ev) {
    if (!document.querySelector('.lb') || !el() || /INPUT|TEXTAREA/.test(ev.target.tagName)) return;
    var c = center();
    if (ev.key === '+' || ev.key === '=') zoomAt(s.z * 1.5, c[0], c[1], true);
    else if (ev.key === '-') zoomAt(s.z / 1.5, c[0], c[1], true);
    else if (ev.key === '0') { el().classList.add('lbz-anim'); reset(); }
    else if (ev.key === 'Escape') { var x = document.querySelector('.lb .lb-x'); x && x.click(); }
    else if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      var n = document.querySelectorAll('.lb .lb-nav'); var b = n[ev.key === 'ArrowRight' ? n.length - 1 : 0]; b && b.click();
    }
  });
  window.addEventListener('resize', function () { clamp(); req(); });
})();
