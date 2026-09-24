// Site-wide helpers that must not depend on the page runtime having booted.
(function () {
  // ---- image slots: reveal on load, leave the placeholder on error ----
  function settle(img) {
    if (!img.hasAttribute('data-ph') || !img.complete || !img.getAttribute('src')) return;
    if (img.naturalWidth > 0) { img.removeAttribute('data-missing'); img.setAttribute('data-loaded', ''); }
    else { img.removeAttribute('data-loaded'); img.setAttribute('data-missing', ''); }
  }
  document.addEventListener('load', function (e) { var t = e.target; if (t && t.tagName === 'IMG') settle(t); }, true);
  document.addEventListener('error', function (e) { var t = e.target; if (t && t.tagName === 'IMG') settle(t); }, true);
  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.tagName === 'IMG') settle(root);
    else root.querySelectorAll('img[data-ph]').forEach(settle);
  }
  new MutationObserver(function (list) {
    list.forEach(function (m) { m.addedNodes.forEach(scan); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.body) scan(document.body);
})();
