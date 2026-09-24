// Mobile nav menu — builds a full-screen menu from the page's own nav links.
// Loaded on every page; does nothing above 767px except keep the menu closed.
(function () {
  function init() {
    const nav = document.querySelector('.nav');
    const navIn = nav && nav.querySelector('.nav-in');
    const links = nav && nav.querySelector('.nav-links');
    if (!nav || !navIn || !links || document.querySelector('.menu')) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.innerHTML = '<span>menu</span><span class="bars" aria-hidden="true"><i></i><i></i></span>';
    navIn.appendChild(toggle);

    const menu = document.createElement('div');
    menu.className = 'menu';
    menu.setAttribute('data-open', 'false');
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-label', 'Site menu');

    const name = nav.querySelector('.nav-name');
    const anchors = Array.from(links.querySelectorAll('a'));
    const isStatus = (a) => /r[ée]sum[ée]|cv/i.test(a.textContent || '');
    const pages = anchors.filter((a) => !isStatus(a));
    const extras = anchors.filter(isStatus);
    const status = links.querySelector('.nav-dot') ? links.querySelector('.nav-dot').parentElement : null;

    menu.innerHTML =
      '<div class="menu-top">' +
      '<span class="nav-name">' + (name ? name.textContent : '') + '</span>' +
      '<button type="button" class="menu-close" aria-label="Close menu">close &times;</button>' +
      '</div>' +
      '<ul class="menu-list">' +
      pages.map((a) => '<li><a href="' + a.getAttribute('href') + '"' +
        (a.getAttribute('aria-current') ? ' aria-current="page"' : '') + '>' +
        a.textContent.trim() + '</a></li>').join('') +
      '</ul>' +
      '<div class="menu-foot">' +
      (status ? '<span class="tag" style="color:var(--marigold)">' + status.textContent.trim() + '</span>' : '') +
      extras.map((a) => '<a class="tag" href="' + a.getAttribute('href') + '"' +
        (a.target ? ' target="' + a.target + '" rel="noopener"' : '') + '>' +
        a.textContent.trim() + '</a>').join('') +
      '</div>';
    document.body.appendChild(menu);

    const closeBtn = menu.querySelector('.menu-close');
    let lastFocus = null;

    const focusables = () => Array.from(
      menu.querySelectorAll('a[href], button:not([disabled])')
    ).filter((el) => el.offsetParent !== null);

    function open() {
      lastFocus = document.activeElement;
      menu.setAttribute('data-open', 'true');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.setAttribute('data-menu', 'open');
      const f = focusables();
      if (f.length) f[0].focus();
      document.addEventListener('keydown', onKey, true);
    }

    function close() {
      menu.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.removeAttribute('data-menu');
      document.removeEventListener('keydown', onKey, true);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    toggle.addEventListener('click', () => (menu.getAttribute('data-open') === 'true' ? close() : open()));
    closeBtn.addEventListener('click', close);
    menu.querySelectorAll('.menu-list a').forEach((a) => a.addEventListener('click', close));
    window.addEventListener('resize', () => { if (window.innerWidth >= 768) close(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

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
    openViewer(a.getAttribute('href'), 'victoria olorunsola \u2014 r\u00e9sum\u00e9');
  }, true);
  // DC pages paint progressively: retry once the nav has streamed in
  let tries = 0;
  const t = setInterval(() => { if (document.querySelector('.menu') || ++tries > 20) clearInterval(t); else init(); }, 300);
})();
