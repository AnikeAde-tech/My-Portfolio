// Site-wide helpers that must not depend on the page runtime having booted.
(function () {
  // ---- image slots: reveal on load, leave the placeholder on error ----
  function settle(img) {
    if (!img.hasAttribute('data-ph') || !img.complete || !img.getAttribute('src')) return;
    if (img.naturalWidth > 0) { img.removeAttribute('data-missing'); img.setAttribute('data-loaded', ''); }
    else { img.removeAttribute('data-loaded'); img.setAttribute('data-missing', ''); }
  }
  // The static <x-dc> template is the page's first paint, and the runtime
  // re-reads it as its source when it boots, so nothing here may modify it.
  var raw = function (el) { return !!(el.closest && el.closest('x-dc')); };
  document.addEventListener('load', function (e) { var t = e.target; if (t && t.tagName === 'IMG' && !raw(t)) settle(t); }, true);
  document.addEventListener('error', function (e) { var t = e.target; if (t && t.tagName === 'IMG' && !raw(t)) settle(t); }, true);
  // React can build an image off-document, so its load event may never reach
  // the document-level listeners above: also listen on each image directly,
  // and re-check once it has decoded.
  function watch(img) {
    if (!img.hasAttribute('data-ph') || img.closest('x-dc')) return;
    settle(img);
    if (img.__phWatched) return;
    img.__phWatched = true;
    img.addEventListener('load', function () { settle(img); });
    img.addEventListener('error', function () { settle(img); });
    if (img.decode) img.decode().then(function () { settle(img); }, function () { settle(img); });
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.tagName === 'IMG') watch(root);
    else root.querySelectorAll('img[data-ph]').forEach(watch);
  }
  new MutationObserver(function (list) {
    list.forEach(function (m) { m.addedNodes.forEach(scan); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.body) scan(document.body);
})();
