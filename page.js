// Shared page behaviour, in plain JavaScript. This replaces the per-page
// logic classes the pages used to run through a React runtime: scroll
// reveals, the case-study hero glow, and the "more screens" carousels.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- scroll reveals ----
  var REVEAL = '.work-item, .gap-note, .row, .cell, .teaser, .cs-block, .shot, .about-body p, .facts, .timeline li, .craft-tile, .signoff, .outcomes li, .decision-card';
  function reveals() {
    document.body.classList.add('loaded');
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) show(e.target); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    function show(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      io.unobserve(el);
    }
    function check() {
      var h = window.innerHeight || 0;
      document.querySelectorAll('[data-reveal-bound]').forEach(function (el) {
        if (el.style.opacity === '1') return;
        if (el.getBoundingClientRect().top < h * 0.92) show(el);
      });
    }
    function reveal() {
      document.querySelectorAll(REVEAL).forEach(function (el) {
        if (el.dataset.revealBound) return;
        el.dataset.revealBound = '1';
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = 'opacity .7s cubic-bezier(.2,.7,.3,1), transform .7s cubic-bezier(.2,.7,.3,1)';
        io.observe(el);
      });
      check();
      requestAnimationFrame(check);
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    reveal();
    [120, 500, 1200].forEach(function (t) { setTimeout(reveal, t); });
  }

  // ---- case-study hero glow: pause the drift while the hero is off screen ----
  function glow() {
    var hero = document.querySelector('.hero');
    if (!hero || !('IntersectionObserver' in window)) return;
    var layers = hero.querySelectorAll('.glow-bloom, .glow-counter');
    if (!layers.length) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        layers.forEach(function (l) { l.style.animationPlayState = e.isIntersecting ? 'running' : 'paused'; });
      });
    }, { threshold: 0 }).observe(hero);
  }

  // ---- "more screens" carousels ----
  function carousels() {
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('[data-ref="track"]');
      var dots = root.querySelector('[data-ref="dots"]');
      var counter = root.querySelector('[data-ref="counter"]');
      if (!track) return;
      var n = track.children.length, i = 0;
      function slide(k) {
        i = (k + n) % n;
        track.style.transform = 'translateX(' + (i * -100) + '%)';
        if (counter) counter.textContent = String(i + 1);
        if (dots) {
          Array.prototype.forEach.call(dots.children, function (b, k2) {
            var bar = b.firstElementChild;
            if (bar) bar.style.background = k2 === i ? 'var(--deep)' : 'var(--rule-ink)';
            b.setAttribute('aria-current', k2 === i ? 'true' : 'false');
          });
        }
      }
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-on-click]');
        if (!b || !root.contains(b)) return;
        var a = b.getAttribute('data-on-click');
        if (a === 'prev') slide(i - 1);
        else if (a === 'next') slide(i + 1);
        else if (/^go\d+$/.test(a)) slide(+a.slice(2));
      });
    });
  }

  function init() { reveals(); glow(); carousels(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
