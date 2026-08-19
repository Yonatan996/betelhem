/**
 * cursor.js — Smooth custom cursor tracker
 * Uses requestAnimationFrame to prevent cursor jitter/shake.
 * Replaces the inline cursor script in each page.
 */
(function () {
  var c  = document.getElementById('cursor');
  var l  = document.getElementById('cursor-label');
  if (!c) return;

  var mx = 0, my = 0;   // target (mouse) position
  var cx = 0, cy = 0;   // current rendered position
  var raf;

  // Capture mouse position on every move — no DOM writes here
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
  });

  // Smooth loop — only write to DOM once per animation frame
  function loop() {
    // Lerp for extra smoothness (0.18 = slight lag, feels premium)
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;

    c.style.left = cx + 'px';
    c.style.top  = cy + 'px';
    if (l) {
      l.style.left = cx + 'px';
      l.style.top  = cy + 'px';
    }
    raf = requestAnimationFrame(loop);
  }
  loop();

  // Expand/label on interactive cards
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.prod-card, .cta-bar').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        c.classList.add('expanded');
        if (l) l.classList.add('visible');
      });
      el.addEventListener('mouseleave', function () {
        c.classList.remove('expanded');
        if (l) l.classList.remove('visible');
      });
    });
  });
})();
