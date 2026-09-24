// Mobile nav menu (below 900px): a two-hairline button in the nav opens a
// full-screen overlay. Loaded from each page's <head>, so it works whether or
// not the page runtime has booted; the nav itself paints later, so the button
// is (re)attached whenever a .nav-in appears.
(function () {
  if (window.__navMenu) return;
  window.__navMenu = true;

  const MQ = window.matchMedia('(max-width: 899.98px)');
  const EMAIL = 'olorunsolavictoria902@gmail.com';
  let toggle = null, menu = null, closeBtn = null;
  let isOpen = false, pushed = false, pendingNav = null, savedY = 0, prevRestoration = null;

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function makeToggle() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'nav-toggle';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', 'site-menu');
    b.setAttribute('aria-label', 'Open menu');
    b.innerHTML = '<span class="hl" aria-hidden="true"></span><span class="hl" aria-hidden="true"></span>';
    b.addEventListener('click', () => (isOpen ? close() : open()));
    return b;
  }

  function buildMenu(nav) {
    const links = Array.from(nav.querySelectorAll('.nav-links a'));
    const name = nav.querySelector('.nav-name');
    const mail = document.querySelector('a[href^="mailto:"]');
    const email = mail ? mail.getAttribute('href').replace(/^mailto:/, '') : EMAIL;
    const m = document.createElement('div');
    m.className = 'menu';
    m.id = 'site-menu';
    m.hidden = true;
    m.setAttribute('data-open', 'false');
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', 'Site menu');
    m.innerHTML =
      '<div class="menu-top">' +
        '<span class="nav-name">' + esc(name ? name.textContent : 'Victoria Olorunsola') + '</span>' +
        '<button type="button" class="nav-toggle menu-x" aria-label="Close menu">' +
          '<span class="hl" aria-hidden="true"></span><span class="hl" aria-hidden="true"></span></button>' +
      '</div>' +
      '<nav class="menu-body" aria-label="Main">' +
        '<ul class="menu-list">' +
        links.map((a, i) => {
          const ext = a.target === '_blank';
          return '<li style="--i:' + (i + 1) + '"><a href="' + esc(a.getAttribute('href')) + '"' +
            (a.getAttribute('aria-current') ? ' aria-current="page"' : '') +
            (ext ? ' target="_blank" rel="noopener"' : '') + '>' +
            esc(a.textContent.trim()) + (ext ? '<span class="menu-ext" aria-hidden="true"> ↗</span>' : '') +
            '</a></li>';
        }).join('') +
        '</ul>' +
        '<div class="menu-foot" style="--i:' + (links.length + 1) + '">' +
          '<span class="tag menu-status"><span class="nav-dot" aria-hidden="true"></span>open to work</span>' +
          '<a class="menu-mail" href="mailto:' + esc(email) + '">' + esc(email) + '</a>' +
        '</div>' +
      '</nav>';
    document.body.appendChild(m);
    closeBtn = m.querySelector('.menu-x');
    closeBtn.addEventListener('click', () => close());
    m.querySelectorAll('.menu-list a').forEach((a) => {
      if (a.target === '_blank') return; // résumé: the PDF viewer below closes the menu
      a.addEventListener('click', (e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const href = a.href;
        if (pushed) {
          // drop the menu's history entry first, then navigate from the real one
          pendingNav = href;
          pushed = false;
          close({ restoreFocus: false, back: false });
          history.back();
          setTimeout(() => { if (pendingNav) { const h = pendingNav; pendingNav = null; location.assign(h); } }, 500);
        } else {
          close({ restoreFocus: false });
          location.assign(href);
        }
      });
    });
    m.addEventListener('keydown', onKey);
    return m;
  }

  function focusables() {
    return Array.from(menu.querySelectorAll('a[href], button:not([disabled])'));
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables();
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!menu.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  // Tab from outside (e.g. focus lost to the body) is pulled back in
  document.addEventListener('keydown', (e) => { if (isOpen && !menu.contains(e.target)) onKey(e); }, true);
  document.addEventListener('focusin', (e) => { if (isOpen && !menu.contains(e.target)) closeBtn.focus({ preventScroll: true }); });

  function lockScroll() {
    savedY = window.scrollY;
    const b = document.body.style;
    b.position = 'fixed'; b.top = -savedY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%';
    document.documentElement.style.overflow = 'hidden';
  }
  function unlockScroll() {
    const b = document.body.style;
    b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = '';
    document.documentElement.style.overflow = '';
    const html = document.documentElement, prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedY);
    html.style.scrollBehavior = prev;
  }

  function open() {
    if (isOpen || !menu) return;
    isOpen = true;
    // Push the menu's history entry before locking scroll, and stop the
    // browser restoring scroll when that entry is popped: we restore it.
    try {
      if ('scrollRestoration' in history) { prevRestoration = history.scrollRestoration; history.scrollRestoration = 'manual'; }
      history.pushState({ navMenu: true }, ''); pushed = true;
    } catch (err) { pushed = false; }
    document.body.setAttribute('data-menu', 'open');
    lockScroll();
    const root = document.getElementById('dc-root');
    if (root) root.inert = true;
    menu.hidden = false;
    void menu.offsetWidth; // let the entrance transition run from the closed state
    menu.setAttribute('data-open', 'true');
    if (toggle) { toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Close menu'); }
    requestAnimationFrame(() => closeBtn.focus({ preventScroll: true }));
  }

  function close(opts) {
    opts = opts || {};
    if (!isOpen) return;
    isOpen = false;
    menu.setAttribute('data-open', 'false');
    const root = document.getElementById('dc-root');
    if (root) root.inert = false;
    unlockScroll();
    // keep the flag briefly so motion.js doesn't read the restore as a scroll-down and hide the nav
    setTimeout(() => { if (!isOpen) document.body.removeAttribute('data-menu'); }, 200);
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); }
    setTimeout(() => { if (!isOpen) menu.hidden = true; }, 320);
    if (opts.back !== false && pushed) { pushed = false; history.back(); }
    if (opts.restoreFocus !== false && toggle) toggle.focus({ preventScroll: true });
  }
  window.__navMenuClose = () => close();

  window.addEventListener('popstate', () => {
    if (pendingNav) { const h = pendingNav; pendingNav = null; location.assign(h); return; }
    if (isOpen) { pushed = false; close({ back: false }); }
    if (prevRestoration) { const r = prevRestoration; prevRestoration = null; setTimeout(() => { history.scrollRestoration = r; }, 0); }
  });
  const onMQ = () => { if (!MQ.matches && isOpen) close(); };
  if (MQ.addEventListener) MQ.addEventListener('change', onMQ); else MQ.addListener(onMQ);

  function ensure() {
    const nav = document.querySelector('.nav');
    const navIn = nav && nav.querySelector('.nav-in');
    if (!navIn || !nav.querySelector('.nav-links')) return;
    if (!menu) menu = buildMenu(nav);
    if (!toggle) toggle = makeToggle();
    if (toggle.parentNode !== navIn) navIn.appendChild(toggle);
  }
  new MutationObserver(ensure).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensure);
  else ensure();
})();

(function () {
  if (window.__pdfViewer) return;
  window.__pdfViewer = true;
  // PDF links: open in an in-page viewer. The file is fetched with the page's
  // own access and drawn with pdf.js, so nothing depends on the browser being
  // allowed to open a new tab or its built-in PDF viewer.
  const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';
  const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
  let viewer = null, lastFocus = null;

  function closeViewer() {
    if (!viewer) return;
    viewer.remove(); viewer = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onViewerKey, true);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onViewerKey(e) { if (e.key === 'Escape') { e.preventDefault(); closeViewer(); } }

  async function openViewer(href, label) {
    lastFocus = document.activeElement;
    viewer = document.createElement('div');
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', label || 'Document');
    viewer.style.cssText = 'position:fixed;inset:0;z-index:400;background:rgba(9,28,22,.96);display:flex;flex-direction:column;color:#F1EEE7';
    viewer.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px clamp(20px,4.5vw,64px);border-bottom:1px solid rgba(241,238,231,.16)">' +
        '<span style="font-family:\'IBM Plex Mono\',ui-monospace,monospace;font-size:12px">' + (label || 'document') + '</span>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<a data-k="dl" download="victoria-olorunsola-cv.pdf" style="min-height:44px;display:inline-flex;align-items:center;padding:0 14px;border:1px solid rgba(241,238,231,.3);border-radius:999px;color:#F1EEE7;text-decoration:none;font-family:\'IBM Plex Mono\',ui-monospace,monospace;font-size:12px">download &darr;</a>' +
          '<button type="button" data-k="close" aria-label="Close" style="min-width:44px;min-height:44px;background:transparent;border:0;color:#F1EEE7;font-family:\'IBM Plex Mono\',ui-monospace,monospace;font-size:13px;cursor:pointer">close &times;</button>' +
        '</div>' +
      '</div>' +
      '<div data-k="pages" style="flex:1;overflow:auto;padding:28px clamp(12px,3vw,40px);display:flex;flex-direction:column;align-items:center;gap:18px">' +
        '<p data-k="msg" style="font-family:\'IBM Plex Mono\',ui-monospace,monospace;font-size:12px;color:#D9D4C8">loading&hellip;</p>' +
      '</div>';
    document.body.appendChild(viewer);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onViewerKey, true);
    const q = (k) => viewer.querySelector('[data-k="' + k + '"]');
    q('close').addEventListener('click', closeViewer);
    q('close').focus();
    q('dl').href = href;

    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = await res.arrayBuffer();
      try { q('dl').href = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' })); } catch (e) {}
      const pdfjs = await import(PDFJS);
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
      if (!viewer) return;
      q('msg').remove();
      const pagesEl = q('pages');
      const maxW = Math.min(900, pagesEl.clientWidth - 24);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const scale = maxW / base.width;
        const vp = page.getViewport({ scale: scale * dpr });
        const c = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        c.style.cssText = 'width:' + Math.round(vp.width / dpr) + 'px;max-width:100%;height:auto;background:#fff;border-radius:3px;box-shadow:0 20px 50px rgba(0,0,0,.4)';
        pagesEl.appendChild(c);
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        if (!viewer) return;
      }
    } catch (err) {
      const m = viewer && q('msg');
      if (m) m.textContent = 'Couldn\u2019t display the file here. Use download instead.';
    }
  }

  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[href$=".pdf"]');
    if (!a || (viewer && viewer.contains(a)) || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    if (window.__navMenuClose) window.__navMenuClose();
    openViewer(a.getAttribute('href'), 'victoria olorunsola \u2014 r\u00e9sum\u00e9');
  }, true);
})();
