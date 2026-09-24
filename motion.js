// Site motion: scroll reveals, counters, nav hide, reading progress, cover morph names.
// Everything responds to the reader; nothing loops.
(function () {
  if (window.__motion) return; window.__motion = true;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  if (!reduce) root.classList.add('mo');

  // clean URLs: "/" is home, "/anywork" (or "/anywork.html") is anywork
  const slugOf = (href) => {
    if (href == null) return null;
    let p;
    try { p = new URL(href, location.href).pathname; } catch (e) { return null; }
    const seg = p.replace(/\/+$/, '').split('/').pop().replace(/\.html$/, '').toLowerCase();
    return !seg || seg === 'index' ? 'home' : seg;
  };
  const here = slugOf(location.pathname);

  // ---- cover → case-study hero morph (cross-document view transitions) ----
  if (!reduce) {
    window.addEventListener('pageswap', (e) => {
      const to = e.activation && e.activation.entry && slugOf(e.activation.entry.url);
      if (!to) return;
      document.querySelectorAll('a.cover').forEach((a) => {
        if (slugOf(a.getAttribute('href')) === to) {
          a.style.viewTransitionName = 'cover-' + to;
          a.style.viewTransitionClass = 'cover';
        }
      });
    });
    // the incoming half (naming the case-study hero) is an inline <head>
    // script on every page, so it runs before the first frame
  }

  // ---- reveals ----
  const seen = new WeakSet();
  const io = reduce ? null : new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      el.classList.add('in');
      if (el.__count) el.__count();
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  const splitWords = (h) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 3) {
          const parts = c.nodeValue.split(/(\s+)/);
          if (parts.length < 2 && !c.nodeValue.trim()) return;
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
            else { const s = document.createElement('span'); s.className = 'rv-word'; s.textContent = p; frag.appendChild(s); }
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && !c.classList.contains('rv-word')) {
          if (/^(EM|I|STRONG|B|SPAN|A)$/.test(c.tagName) && getComputedStyle(c).display === 'inline') {
            c.classList.add('rv-word');
          } else walk(c);
        }
      });
    };
    walk(h);
    // stagger by line, never by letter: every word on a line shares a delay
    const words = h.querySelectorAll('.rv-word');
    let line = -1, lastTop = null;
    words.forEach((w) => {
      const t = Math.round(w.offsetTop);
      if (lastTop === null || Math.abs(t - lastTop) > 4) { line++; lastTop = t; }
      w.style.transitionDelay = (line * 60) + 'ms';
    });
  };

  const countUp = (el) => {
    const raw = el.textContent.trim();
    if (!/^\d{1,3}(,\d{3})*$|^\d+$/.test(raw)) return;
    const final = parseInt(raw.replace(/,/g, ''), 10);
    const fmt = (n) => raw.includes(',') ? n.toLocaleString('en-US') : String(n);
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    el.style.display = 'inline-block';
    el.textContent = '0';
    return () => {
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 900);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(final * e));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
  };

  const watch = (el) => { if (seen.has(el)) return false; seen.add(el); if (io) io.observe(el); return true; };

  const all = (sel) => Array.from(document.querySelectorAll(sel));
  const scan = () => {
    if (reduce) return;
    all('.section-head, .cs-block h2, .contact h2, .ledger-intro + h2').forEach((el) => {
      if (seen.has(el)) return;
      const h = el.matches('h2') ? el : el.querySelector('h2');
      if (h && !h.querySelector('.rv-word')) splitWords(h);
      watch(el);
    });
    all('.cs-block h2, .contact h2').forEach((h) => { if (h.querySelector('.rv-word')) watch(h); });

    const groups = new Map();
    all('.decision-card').forEach((c) => {
      if (seen.has(c)) return;
      c.classList.add('rv');
      const p = c.parentElement;
      const i = groups.get(p) || 0; groups.set(p, i + 1);
      const d = i * 80;
      c.style.transitionDelay = d + 'ms';
      const cost = c.querySelector('.cost');
      if (cost) cost.style.transitionDelay = (d + 150) + 'ms';
      watch(c);
    });

    all('.outcomes li').forEach((li) => {
      if (seen.has(li)) return;
      li.classList.add('rv');
      const n = li.querySelector('.n');
      if (n) li.__count = countUp(n);
      watch(li);
    });

    all('.pull').forEach((q) => { if (!seen.has(q)) { q.classList.add('rv'); watch(q); } });

    all('.shot, .shot-bleed, .shot-full, .cs-body figure, .ha-pair').forEach((s) => {
      if (seen.has(s) || s.closest('.hero')) return;
      s.classList.add('img-rv');
      watch(s);
    });
  };

  // ---- nav hide + case-study reading progress, driven by rAF ----
  let bar = null, barFill = null, ticking = false, lastY = window.scrollY;
  const frame = () => {
    ticking = false;
    const nav = all('.nav')[0];
    const y = window.scrollY;
    if (nav) {
      const hero = document.querySelector('.hero');
      const past = hero ? y > hero.offsetTop + hero.offsetHeight - nav.offsetHeight : y > 400;
      const menuOpen = document.body.hasAttribute('data-menu');
      if (!menuOpen && past && y > lastY + 2) nav.classList.add('nav-hidden');
      else if (y < lastY - 2 || !past) nav.classList.remove('nav-hidden');
    }
    if (!bar && document.querySelector('.cs-body')) {
      bar = document.createElement('div');
      bar.className = 'read-progress';
      bar.setAttribute('aria-hidden', 'true');
      barFill = document.createElement('i');
      bar.appendChild(barFill);
      document.body.appendChild(bar);
    }
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      barFill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) + ')';
      const hidden = nav && nav.classList.contains('nav-hidden');
      bar.style.transform = 'translateY(' + (hidden || !nav ? 0 : nav.getBoundingClientRect().bottom) + 'px)';
    }
    lastY = y;
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });

  // the page renders after this script, so keep scanning as content arrives
  let pending = null;
  const kick = () => {
    if (pending) return;
    pending = setTimeout(() => { pending = null; scan(); request(); }, 120);
  };
  const start = () => {
    const go = () => { scan(); request(); new MutationObserver(kick).observe(document.body, { childList: true, subtree: true }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
