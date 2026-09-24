// Craft page: the full-screen image preview for the grid tiles.
// Ported unchanged from the page's old logic class.
(function () {
  function bootPreview(){
    var grid = document.querySelector('.craft-grid');
    if(!grid) return;
    var figs = Array.prototype.slice.call(grid.querySelectorAll('figure'));
    var items = figs.map(function(f){
      var img = f.querySelector('img'), spans = f.querySelectorAll('figcaption span');
      return { src: img.getAttribute('src'), alt: img.getAttribute('alt'), title: spans[0] ? spans[0].textContent : '', meta: spans[1] ? spans[1].textContent : '' };
    });
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ov = document.createElement('div');
    ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','Image preview');
    ov.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(9,28,22,.94);color:var(--chalk);display:flex;flex-direction:column;padding:clamp(14px,2.4vw,28px) var(--gut);opacity:0;visibility:hidden;transition:opacity .28s ease,visibility .28s';
    ov.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px">' +
        '<span class="tag" data-k="count" style="color:var(--sage)"></span>' +
        '<button type="button" data-k="close" aria-label="Close preview" style="min-width:44px;min-height:44px;background:transparent;border:0;color:var(--chalk);font-family:var(--mono);font-size:13px;cursor:pointer">close &times;</button>' +
      '</div>' +
      '<div style="flex:1;min-height:0;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:clamp(8px,2vw,24px)">' +
        '<button type="button" data-k="prev" aria-label="Previous image" style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(241,238,231,.3);background:transparent;color:var(--chalk);font-size:18px;cursor:pointer">&larr;</button>' +
        '<div style="height:100%;min-height:0;display:flex;align-items:center;justify-content:center;position:relative"><p class="tag" data-k="miss" hidden style="margin:0;color:var(--sage)">image coming soon</p><img data-k="img" alt="" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 30px 80px rgba(0,0,0,.45);transform:scale(.97);transition:transform .35s cubic-bezier(.2,.7,.3,1),opacity .25s ease" /></div>' +
        '<button type="button" data-k="next" aria-label="Next image" style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(241,238,231,.3);background:transparent;color:var(--chalk);font-size:18px;cursor:pointer">&rarr;</button>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding-top:16px;flex-wrap:wrap">' +
        '<strong data-k="title" style="font-family:var(--display);font-weight:800;letter-spacing:-.02em;font-size:clamp(20px,2vw,28px)"></strong>' +
        '<span class="tag" data-k="meta" style="color:var(--chalk-dim)"></span>' +
      '</div>';
    document.body.appendChild(ov);
    var q = function(k){ return ov.querySelector('[data-k="'+k+'"]'); };
    var img = q('img'), idx = 0, last = null, open = false;
    var show = function(i){
      idx = (i + items.length) % items.length;
      var it = items[idx];
      img.style.opacity = '0';
      var pre = new Image();
      // a file that isn't there yet shows a note, never a broken-image icon
      pre.onload = function(){ q('miss').hidden = true; img.hidden = false; img.src = it.src; img.alt = it.alt; img.style.opacity = '1'; };
      pre.onerror = function(){ img.hidden = true; img.removeAttribute('src'); q('miss').hidden = false; };
      pre.src = it.src;
      q('title').textContent = it.title;
      q('meta').textContent = it.meta;
      q('count').textContent = String(idx + 1).padStart(2,'0') + ' / ' + String(items.length).padStart(2,'0');
    };
    var onKey = function(e){
      if(e.key === 'Escape'){ e.preventDefault(); close(); }
      else if(e.key === 'ArrowRight'){ show(idx + 1); }
      else if(e.key === 'ArrowLeft'){ show(idx - 1); }
      else if(e.key === 'Tab'){
        var f = Array.prototype.slice.call(ov.querySelectorAll('button'));
        var first = f[0], lastB = f[f.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); lastB.focus(); }
        else if(!e.shiftKey && document.activeElement === lastB){ e.preventDefault(); first.focus(); }
      }
    };
    var openAt = function(i){
      last = document.activeElement; open = true;
      show(i);
      // visibility flips at once (only opacity fades) so focus() can land in the dialog
      ov.style.transition = 'opacity .28s ease,visibility 0s';
      ov.style.visibility = 'visible'; ov.style.opacity = '1';
      if(!reduce) requestAnimationFrame(function(){ img.style.transform = 'scale(1)'; });
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey, true);
      q('close').focus();
    };
    var close = function(){
      if(!open) return; open = false;
      ov.style.transition = 'opacity .28s ease,visibility .28s';
      ov.style.opacity = '0'; ov.style.visibility = 'hidden';
      img.style.transform = 'scale(.97)';
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey, true);
      if(last && last.focus) last.focus();
    };
    figs.forEach(function(f, i){
      var b = f.querySelector('.craft-open');
      if(!b) return;
      b.addEventListener('click', function(){ openAt(i); });
      var im = b.querySelector('img');
      b.addEventListener('mouseenter', function(){ if(!reduce) im.style.transform = 'scale(1.03)'; });
      b.addEventListener('mouseleave', function(){ im.style.transform = ''; });
    });
    q('close').addEventListener('click', close);
    q('prev').addEventListener('click', function(){ show(idx - 1); });
    q('next').addEventListener('click', function(){ show(idx + 1); });
    ov.addEventListener('click', function(e){ if(e.target === ov || e.target === img.parentElement) close(); });
    var sx = null;
    ov.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, { passive: true });
    ov.addEventListener('touchend', function(e){
      if(sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if(Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootPreview);
  else bootPreview();
})();
