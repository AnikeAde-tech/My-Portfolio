// Homepage behaviour in plain JavaScript: the hero layout and Lagos clock,
// the character's speech bubble, and the testimonial card stack. Ported from
// the page's old React logic class; the methods are unchanged, refs are now
// live lookups of [data-ref] elements. Scroll reveals come from page.js.
(function () {
  function ref(name) {
    return { get current() { return document.querySelector('[data-ref="' + name + '"]'); } };
  }

  class Home {

  constructor(){
    this.hero = ref('hero');
    this.stack = ref('stack');
    this.clock = ref('clock');
    this.s0 = ref('s0');
    this.s1 = ref('s1');
    this.s2 = ref('s2');
    this.s3 = ref('s3');
    this.s4 = ref('s4');
    this.s5 = ref('s5');
    this.bubble = ref('bubble');
    this.bubbleText = ref('bubbleText');
    this.figure = ref('figure');
    this.sayHi = ref('sayHi');
    this.figCell = ref('figCell');
    this.bubbleSvg = ref('bubbleSvg');
    this.bubblePath = ref('bubblePath');
    this.bubbleTime = ref('bubbleTime');
    this.bubbleChip = ref('bubbleChip');
    this.bubbleCount = ref('bubbleCount');
    this.ground = ref('ground');
    this.tSection = ref('tSection');
    this.tStage = ref('tStage');
    this.tCounter = ref('tCounter');
    this.tTotal = ref('tTotal');
    this.tMeta = ref('tMeta');
    this.tName = ref('tName');
    this.tRole = ref('tRole');
    this.tProj = ref('tProj');
    this.tLive = ref('tLive');
    this.tPrevBtn = ref('tPrevBtn');
    this.tNextBtn = ref('tNextBtn');
    this.c0 = ref('c0');
    this.c1 = ref('c1');
    this.c2 = ref('c2');
    this.c3 = ref('c3');
    this.c4 = ref('c4');
  }

  bootCards(){
    var self = this;
    var cards = [this.c0,this.c1,this.c2,this.c3,this.c4].map(function(r){ return r.current; }).filter(Boolean);
    if(!cards.length) return;
    var stage = this.tStage.current;
    var n = cards.length;
    this.tN = n;
    if(this.tTotal.current) this.tTotal.current.textContent = ('0' + n).slice(-2);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.tReduce = reduce;

    if(n < 3){
      var grid = document.querySelector('.t-stage');
      if(grid){
        grid.style.aspectRatio = 'auto';
        grid.style.display = 'flex';
        grid.style.gap = '20px';
        cards.forEach(function(c){ c.style.position = 'relative'; c.style.inset = 'auto'; c.style.flex = '1 1 0'; c.style.transform = 'none'; });
      }
      return;
    }

    cards.forEach(function(c){ if(c.getAnimations) c.getAnimations().forEach(function(a){ a.cancel(); }); });
    var P = cards.map(function(c){
      return { el: c, rot: parseFloat(c.dataset.rot) || 0, x: parseFloat(c.dataset.x) || 0 };
    });
    var order = cards.map(function(_, i){ return i; });
    this.tOrder = order;
    this.tBusy = false;
    this.tFan = 0;

    var depth = function(){ return (document.documentElement.clientWidth <= 900) ? 2 : 3; };

    var slotFor = function(pos){
      var d = depth();
      if(pos > d) return null;
      return { y: pos * 14, s: 1 - pos * 0.05, veil: pos === 0 ? 0 : (pos === 1 ? .15 : (pos === 2 ? .30 : .45)) };
    };

    var apply = function(animate){
      order.forEach(function(idx, pos){
        var p = P[idx];
        var sl = slotFor(pos);
        var hidden = !sl;
        var use = sl || slotFor(depth());
        var fan = (pos > 0 && self.tFan) ? pos * 5 : 0;
        var fanR = (pos > 0 && self.tFan) ? (p.rot > 0 ? pos * 1.1 : -pos * 1.1) : 0;
        p.el.style.transition = animate ? 'transform .58s cubic-bezier(.22,1.12,.36,1)' : 'none';
        p.el.style.transitionDelay = animate ? (pos * 0.04) + 's' : '0s';
        p.el.style.zIndex = String(100 - pos);
        p.el.style.transform = 'translate(' + (p.x + fan) + 'px,' + use.y + 'px) rotate(' + (p.rot + fanR) + 'deg) scale(' + use.s + ')';
        p.el.style.opacity = hidden ? '0' : '1';
        p.el.style.pointerEvents = pos === 0 ? 'auto' : 'none';
        var veil = p.el.querySelector('.t-veil');
        if(veil) veil.style.opacity = String(use.veil);
        var body = p.el.querySelector('.t-body');
        var foot = p.el.querySelector('.t-foot');
        [body, foot].forEach(function(b){ if(b) b.style.opacity = pos === 0 ? '1' : '0'; });
        p.el.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
        p.el.querySelectorAll('a').forEach(function(a){ a.tabIndex = pos === 0 ? 0 : -1; });
      });
      self.syncMeta();
    };
    this.tApply = apply;

    this.syncMeta = function(){
      var front = P[order[0]].el;
      var nm = front.querySelector('.t-foot div > span:not([aria-hidden]) > span');
      var meta = self.tMeta.current;
      if(self.tCounter.current) self.tCounter.current.textContent = ('0' + (order[0] + 1)).slice(-2);
      var who = front.querySelectorAll('.t-foot div > span:not([aria-hidden]) > span');
      var nmT = who[0] ? who[0].textContent.trim() : '', rlT = who[1] ? who[1].textContent.trim() : '';
      if(self.tName.current) self.tName.current.textContent = nmT;
      if(self.tRole.current) self.tRole.current.textContent = rlT;
      if(self.tLive.current) self.tLive.current.textContent = 'Testimonial ' + (order[0] + 1) + ' of ' + n + ', ' + nmT + ', ' + rlT;
      if(meta && !reduce){
        meta.style.transition = 'none';
        meta.style.transform = 'translateY(14px)';
        meta.style.opacity = '0';
        requestAnimationFrame(function(){
          meta.style.transition = 'transform .5s cubic-bezier(.2,.7,.3,1),opacity .4s ease';
          meta.style.transform = 'translateY(0)';
          meta.style.opacity = '1';
        });
      }
    };

    apply(false);

    this.advance = function(dir){
      if(self.tBusy) return;
      self.tBusy = true;
      if(reduce){
        var front0 = P[order[0]].el;
        front0.style.transition = 'opacity .15s ease';
        if(dir > 0) order.push(order.shift()); else order.unshift(order.pop());
        apply(false);
        setTimeout(function(){ self.tBusy = false; }, 160);
        return;
      }
      var w = stage ? stage.getBoundingClientRect().width : 500;
      var throwX = w * 1.12 * dir;
      if(dir > 0){
        var idx = order[0];
        var p = P[idx];
        var el = p.el;
        var d = depth();
        var end = slotFor(d);
        el.style.transition = 'none';
        el.style.zIndex = '200';
        var body = el.querySelector('.t-body'), foot = el.querySelector('.t-foot'), veil = el.querySelector('.t-veil');
        [body, foot].forEach(function(b){ if(b) b.style.opacity = '0'; });
        el.style.transform = 'translate(' + p.x + 'px,0px) rotate(' + p.rot + 'deg) scale(1)';
        void el.offsetWidth;
        el.style.transition = 'transform .12s cubic-bezier(.3,0,.2,1)';
        el.style.transform = 'translate(' + p.x + 'px,-10px) rotate(' + p.rot + 'deg) scale(1.03)';
        setTimeout(function(){
          void el.offsetWidth;
          el.style.transition = 'transform .26s cubic-bezier(.45,0,.55,1)';
          el.style.transform = 'translate(' + (p.x + throwX) + 'px,-4px) rotate(' + (p.rot + 8) + 'deg) scale(1)';
        }, 120);
        setTimeout(function(){
          void el.offsetWidth;
          el.style.zIndex = '1';
          if(veil) veil.style.opacity = String(end.veil);
          el.style.transition = 'transform .32s cubic-bezier(.22,1.08,.36,1)';
          el.style.transform = 'translate(' + p.x + 'px,' + end.y + 'px) rotate(' + p.rot + 'deg) scale(' + end.s + ')';
        }, 386);
        var anim = { set onfinish(f){ setTimeout(f, 714); } };
        order.push(order.shift());
        order.forEach(function(oi, pos){
          if(oi === idx) return;
          var q = P[oi];
          var sl = slotFor(pos) || slotFor(d);
          q.el.style.transition = 'transform .58s cubic-bezier(.22,1.12,.36,1)';
          q.el.style.transitionDelay = (pos * 0.04) + 's';
          q.el.style.zIndex = String(100 - pos);
          q.el.style.transform = 'translate(' + q.x + 'px,' + sl.y + 'px) rotate(' + q.rot + 'deg) scale(' + sl.s + ')';
          q.el.style.opacity = slotFor(pos) ? '1' : '0';
          var v = q.el.querySelector('.t-veil');
          if(v) v.style.opacity = String(sl.veil);
        });
        anim.onfinish = function(){
          el.style.transition = 'none';
          apply(false);
          self.tBusy = false;
        };
        setTimeout(function(){ self.syncMeta(); }, 560);
      } else {
        var lastPos = order.length - 1;
        var bidx = order[lastPos];
        var bp = P[bidx];
        var bel = bp.el;
        var dd = depth();
        var from = slotFor(Math.min(lastPos, dd));
        bel.style.transition = 'none';
        bel.style.zIndex = '200';
        bel.style.opacity = '1';
        var bb = bel.querySelector('.t-body'), bf = bel.querySelector('.t-foot'), bv = bel.querySelector('.t-veil');
        [bb, bf].forEach(function(b){ if(b) b.style.opacity = '0'; });
        bel.style.transform = 'translate(' + bp.x + 'px,' + from.y + 'px) rotate(' + bp.rot + 'deg) scale(' + from.s + ')';
        void bel.offsetWidth;
        bel.style.transition = 'transform .35s cubic-bezier(.3,0,.2,1)';
        bel.style.transform = 'translate(' + (bp.x - w * 1.12) + 'px,-4px) rotate(' + (bp.rot - 8) + 'deg) scale(1)';
        setTimeout(function(){
          void bel.offsetWidth;
          bel.style.transition = 'transform .35s cubic-bezier(.22,1.08,.36,1)';
          bel.style.transform = 'translate(' + bp.x + 'px,0px) rotate(' + bp.rot + 'deg) scale(1)';
        }, 356);
        var banim = { set onfinish(f){ setTimeout(f, 714); } };
        if(bv) bv.style.opacity = '0';
        order.unshift(order.pop());
        order.forEach(function(oi, pos){
          if(oi === bidx) return;
          var q = P[oi];
          var sl = slotFor(pos) || slotFor(dd);
          q.el.style.transition = 'transform .58s cubic-bezier(.22,1.12,.36,1)';
          q.el.style.transitionDelay = (pos * 0.04) + 's';
          q.el.style.zIndex = String(100 - pos);
          q.el.style.transform = 'translate(' + q.x + 'px,' + sl.y + 'px) rotate(' + q.rot + 'deg) scale(' + sl.s + ')';
          q.el.style.opacity = slotFor(pos) ? '1' : '0';
          var v = q.el.querySelector('.t-veil');
          if(v) v.style.opacity = String(sl.veil);
        });
        banim.onfinish = function(){
          bel.style.transition = 'none';
          apply(false);
          self.tBusy = false;
        };
        setTimeout(function(){ self.syncMeta(); }, 560);
      }
    };

    if(stage && !reduce){
      stage.addEventListener('pointerenter', function(){ self.tFan = 1; if(!self.tBusy) apply(true); });
      stage.addEventListener('pointerleave', function(){ self.tFan = 0; if(!self.tBusy) apply(true); });
    }

    cards.forEach(function(el, i){
      var sx = 0, dragging = false, id = null, t0 = 0, last = 0;
      el.addEventListener('pointerdown', function(e){
        if(reduce || self.tBusy) return;
        if(order[0] !== i) return;
        if(e.target.closest('a')) { /* still allow drag detection */ }
        id = e.pointerId; sx = e.clientX; t0 = Date.now(); last = 0; dragging = false;
      });
      el.addEventListener('pointermove', function(e){
        if(id === null || e.pointerId !== id) return;
        var dx = e.clientX - sx;
        if(!dragging && Math.abs(dx) > 6){
          dragging = true;
          self.tDrag = true;
          try{ el.setPointerCapture(id); }catch(err){}
          el.style.transition = 'none';
        }
        if(dragging){
          last = dx;
          var p = P[i];
          var rot = Math.max(-12, Math.min(12, dx / 18));
          el.style.transform = 'translate(' + (p.x + dx) + 'px,0px) rotate(' + (p.rot + rot) + 'deg) scale(1)';
        }
      });
      var release = function(e){
        if(id === null) return;
        id = null;
        if(!dragging) return;
        dragging = false;
        var w = stage.getBoundingClientRect().width;
        var dt = Math.max(1, Date.now() - t0);
        var v = Math.abs(last) / dt;
        setTimeout(function(){ self.tDrag = false; }, 0);
        if(Math.abs(last) > w * 0.3 || v > 0.7){
          el.style.transition = 'none';
          self.advance(last > 0 ? 1 : -1);
        } else {
          el.style.transition = 'transform .5s cubic-bezier(.22,1.12,.36,1)';
          var p = P[i];
          el.style.transform = 'translate(' + p.x + 'px,0px) rotate(' + p.rot + 'deg) scale(1)';
        }
      };
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('click', function(e){ if(self.tDrag) e.preventDefault(); }, true);
    });

    var sec = this.tSection.current;
    if(sec){
      sec.addEventListener('keydown', function(e){
        if(e.key === 'ArrowRight'){ e.preventDefault(); self.advance(1); }
        if(e.key === 'ArrowLeft'){ e.preventDefault(); self.advance(-1); }
      });
    }

    this.tLayout = function(){
      var g = document.querySelector('.t-grid');
      var side = document.querySelector('.t-side');
      var col = document.querySelector('.t-stage-col');
      if(!g || !side || !col) return;
      if(document.documentElement.clientWidth <= 900){
        g.style.flexDirection = 'column';
        side.style.flex = '1 1 auto';
        side.style.maxWidth = 'none';
        side.style.width = '100%';
        col.style.width = '100%';
        col.style.order = '2';
      } else {
        g.style.flexDirection = 'row';
        side.style.flex = '0 0 35%';
        side.style.maxWidth = '35%';
        col.style.order = '';
      }
      if(!self.tBusy) apply(false);
    };
    this.tLayout();
    this.onTResize = function(){ self.tLayout(); };
    window.addEventListener('resize', this.onTResize);
  }
  start(){ this.bootClock(); this.bootLayout(); this.bootCards(); this.bootChat(); }

  bootLayout(){
    var self = this;
    // small-viewport height (svh): stable while mobile browser bars show/hide
    var probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    this.svh = function(){ return probe.offsetHeight || window.innerHeight; };
    // the character stands in the open space beside the short second headline
    // line: its head starts at that line's top, its feet on the chips hairline.
    this.layout = function(){
      var grid = document.querySelector('.hero-grid');
      var fig = self.stack.current;
      var lines = document.querySelectorAll('.hero-tight h1.display .hl-line');
      if(!grid || !fig || lines.length < 2) return;
      var vw = document.documentElement.clientWidth;
      self.narrow = vw < 1024;
      if(self.narrow){
        var mob = vw < 768;
        var nh = Math.round(Math.min(self.svh() * (vw < 900 ? 0.42 : 0.5), mob ? 360 : 420));
        fig.style.height = nh + 'px';
        fig.style.width = Math.round(Math.min(vw - 40, nh * 0.5)) + 'px';
        fig.style.setProperty('--fig-h', nh + 'px');
        return;
      }
      // head level with the top of the FIRST headline line, feet on the ground line
      var top = lines[0].getBoundingClientRect().top;
      var bottom = grid.getBoundingClientRect().bottom;
      var want = Math.round(bottom - top);
      var cap = Math.round(self.svh() * 0.72);
      var h = Math.max(320, Math.min(want, cap));
      // stay inside the column: she is ~0.46 body-heights wide
      var cell = fig.parentElement.getBoundingClientRect().width;
      if (cell > 0 && h * 0.5 > cell) h = Math.max(320, Math.floor(cell / 0.5));
      fig.style.height = h + 'px';
      fig.style.width = Math.round(Math.min(cell || h * 0.5, h * 0.5)) + 'px';
      fig.style.setProperty('--fig-h', h + 'px');
    };
    this.layout();
    setTimeout(this.layout, 400);
    this.onResize = function(){
      self.layout();
      if(self.sizeBubble) self.sizeBubble();
      var ch = document.querySelector('hero-character');
      if(ch && ch._report) ch._report();
      if(self.placeBubble) self.placeBubble();
    };
    window.addEventListener('resize', this.onResize);
  }

  bootClock(){
    // Look the clock elements up on every paint rather than holding refs from
    // mount: DC pages paint progressively, so on a slow network the spans may
    // not exist yet when this runs (which left them on "--:--" in production).
    var self = this;
    var fmt = null;
    try{ fmt = new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit',hour12:false}); }catch(e){}
    this.lagosNow = function(){
      if(fmt) return fmt.format(new Date());
      // no tz data: Lagos is UTC+1 all year
      var d = new Date(Date.now() + 3600000);
      return ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2);
    };
    this.paintClock = function(){
      var els = document.querySelectorAll('[data-lagos-clock]');
      var t = self.lagosNow();
      for(var i = 0; i < els.length; i++) if(els[i].textContent !== t) els[i].textContent = t;
      return els.length;
    };
    var tries = 0;
    var first = function(){
      if(self.paintClock() >= 2 || ++tries > 100) return;
      self.clockRetry = setTimeout(first, 100);
    };
    first();
    this.clockTimer = setInterval(this.paintClock, 5000);
  }

  bootChat(){
    var self = this;
    var bub = this.bubble.current, txt = this.bubbleText.current, btn = this.sayHi.current;
    var chipSlot = this.bubbleChip.current, count = this.bubbleCount.current;
    var timeEl = this.bubbleTime.current, pathEl = this.bubblePath.current, svg = this.bubbleSvg.current;
    if(!bub || !txt || !btn || !chipSlot || !pathEl || !svg){ setTimeout(function(){ self.bootChat(); }, 250); return; }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var lagos = function(){ return self.lagosNow ? self.lagosNow() : '--:--'; };

    var LINES = [
      { seg:[["Hi, I'm Victoria. ",0],["The work's just below.",1]], react:'wave',
        chip:{label:'see the work \u2193', href:'#main', scroll:true} },
      { seg:[["It's {T} in Lagos. ",0],["Good time to talk?",1]], react:'nod',
        chip:{label:'email me \u2197', href:'mailto:olorunsolavictoria902@gmail.com'} },
      { seg:[["Ask me why ",0],["the conflict check has no override.",1]], react:'tilt',
        chip:{label:'read the case study \u2192', href:'/firmly'} },
      { seg:[["I design for people who've ",0],["been let down before.",1]], react:'nod' },
      { seg:[["Five products, one question:",1],[" why would anyone trust this?",0]], react:'shrug' },
      { seg:[["Currently open to ",0],["remote roles.",1],[" Anywhere.",0]], react:'wave',
        chip:{label:'view r\u00e9sum\u00e9 \u2197', href:'victoria-olorunsola-cv.pdf', blank:true} },
      { seg:[["The decisions page",1],[" is where I'm most honest.",0]], react:'tilt',
        chip:{label:'open decisions \u2192', href:'/decisions'} },
      { seg:[["Still here? ",0],["The case studies are better than my jokes.",1]], react:'nod' }
    ];
    var LAST = { seg:[["Okay, you like me. ",0],["My email's at the bottom.",1]], react:'nod' };

    // card + tail drawn as one path, sized in real pixels so the corners never distort
    var tailSide = 'left';   // 'left' | 'right' | 'centre'
    this.sizeBubble = function(){
      var w = Math.round(bub.clientWidth), h = Math.round(bub.clientHeight), r = 14;
      if(!w || !h) return;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var tx = tailSide === 'left' ? 30 : (tailSide === 'right' ? w - 30 : Math.round(w / 2));
      var dx = tailSide === 'left' ? -18 : (tailSide === 'right' ? 18 : 0);
      pathEl.setAttribute('d',
        'M' + r + ',0 H' + (w - r) + ' A' + r + ',' + r + ' 0 0 1 ' + w + ',' + r +
        ' V' + (h - r) + ' A' + r + ',' + r + ' 0 0 1 ' + (w - r) + ',' + h +
        ' H' + (tx + 22) +
        ' C' + (tx + 14) + ',' + h + ' ' + (tx + 10 + dx * 0.4) + ',' + (h + 8) + ' ' + (tx + dx) + ',' + (h + 22) +
        ' C' + (tx + dx * 0.25) + ',' + (h + 7) + ' ' + (tx - 10) + ',' + h + ' ' + (tx - 22) + ',' + h +
        ' H' + r + ' A' + r + ',' + r + ' 0 0 1 0,' + (h - r) +
        ' V' + r + ' A' + r + ',' + r + ' 0 0 1 ' + r + ',0 Z');
    };
    if(window.ResizeObserver){ new ResizeObserver(function(){ self.sizeBubble(); self.placeBubble(); }).observe(bub); }

    // anchored to the crown of her head, in hero-relative pixels
    var headPt = null, bx = -9999, by = -9999, bScale = 0.85, bRot = 0;
    var applyT = function(){
      bub.style.transformOrigin = tailSide === 'right' ? '100% 100%' : (tailSide === 'centre' ? '50% 100%' : '0% 100%');
      bub.style.transform = 'translate(' + bx + 'px,' + by + 'px) scale(' + bScale + ') rotate(' + bRot + 'deg)';
    };
    this.applyBubbleT = applyT;

    this.placeBubble = function(){
      if(!headPt) return;
      // clientWidth, not innerWidth: on phones innerWidth grows with any
      // overflow, which let the bubble widen the page and then itself
      var VW = document.documentElement.clientWidth, VH = self.svh ? self.svh() : window.innerHeight;
      var mobile = VW < 768;
      var M = mobile ? 20 : 16, GAP_Y = 12, GAP_X = 16;
      var hero = document.querySelector('.hero');
      if(!hero) return;
      var hL = headPt.heroLeft, hT = headPt.heroTop;

      if(mobile){ bub.style.width = (VW - M * 2) + 'px'; bub.style.maxWidth = 'none'; }
      else { bub.style.width = 'max-content'; bub.style.maxWidth = '300px'; }
      var bw = bub.offsetWidth, bh = bub.offsetHeight;
      if(!bw || !bh) return;

      var x, y;
      if(mobile){
        tailSide = 'centre';
        x = (VW - bw) / 2 - hL;
      } else if(VW < 900){
        // single-column hero: centred over her head, tail straight down
        tailSide = 'centre';
        x = headPt.x - bw / 2;
      } else {
        tailSide = 'left';
        x = headPt.x + GAP_X;
        if(hL + x + bw > VW - M){
          x = headPt.x - GAP_X - bw;      // no room to the right: flip above-left
          tailSide = 'right';
        }
      }
      y = headPt.y - GAP_Y - bh;

      // never below her shoulders or the ground line
      var maxY = Math.min(headPt.shoulderY, headPt.groundY) - bh;
      if(y > maxY) y = maxY;
      // keep clear of the nav, and inside the viewport with a 16px margin
      var nav = document.querySelector('.nav');
      var navB = nav ? nav.getBoundingClientRect().bottom : 0;
      var minY = Math.max(M, navB + 8) - hT;
      y = Math.max(minY, Math.min(y, VH - M - bh - hT));
      x = Math.max(M - hL, Math.min(x, VW - M - bw - hL));

      if(!isFinite(x) || !isFinite(y)) return;   // keep the last valid position
      bx = Math.round(x); by = Math.round(y);
      self.sizeBubble();
      applyT();
    };
    var attach = function(){
      var ch0 = document.querySelector('hero-character');
      if(!ch0){ setTimeout(attach, 300); return; }
      ch0.onHead = function(p){ headPt = p; self.placeBubble(); };
      if(ch0._report) ch0._report();
    };
    attach();
    window.addEventListener('scroll', function(){ self.placeBubble(); }, { passive: true });

    var timers = [];
    var clearT = function(){ timers.forEach(clearTimeout); timers = []; };

    var renderWords = function(line){
      txt.innerHTML = '';
      var spans = [];
      line.seg.forEach(function(s){
        var host = s[1] ? document.createElement('em') : txt;
        s[0].replace('{T}', lagos()).split(/(\s+)/).forEach(function(tok){
          if(!tok) return;
          if(/^\s+$/.test(tok)){ host.appendChild(document.createTextNode(tok)); return; }
          var el = document.createElement('span');
          el.className = 'w';
          el.textContent = tok;
          host.appendChild(el);
          spans.push(el);
        });
        if(s[1]) txt.appendChild(host);
      });
      if(reduce){ spans.forEach(function(el){ el.classList.add('on'); }); self.sizeBubble(); return; }
      spans.forEach(function(el, n){
        timers.push(setTimeout(function(){
          el.classList.add('on');
          if(n === spans.length - 1) self.sizeBubble();
        }, n * 25));
      });
    };

    var i = Math.floor(Math.random() * LINES.length), shown = 0, hideT = null, lastShown = -1;

    var show = function(){
      if(hideT){ clearTimeout(hideT); hideT = null; }
      clearT();
      var line, n;
      if(shown >= LINES.length){ if(lastShown === 1) return; line = LAST; n = LINES.length; lastShown = 1; }
      else { line = LINES[i % LINES.length]; n = (i % LINES.length) + 1; i++; }
      shown++;
      if(self.paintClock) self.paintClock();
      if(count) count.textContent = n + ' / ' + LINES.length;

      chipSlot.innerHTML = '';
      if(line.chip){
        var a = document.createElement('a');
        a.className = 'bubble-chip';
        a.textContent = line.chip.label;
        a.href = line.chip.href;
        if(line.chip.blank){ a.target = '_blank'; a.rel = 'noopener'; }
        if(line.chip.scroll){
          a.addEventListener('click', function(e){
            e.preventDefault();
            var m = document.getElementById('main');
            if(m) window.scrollTo({ top: m.getBoundingClientRect().top + window.pageYOffset - 70, behavior: reduce ? 'auto' : 'smooth' });
          });
        }
        chipSlot.appendChild(a);
      }

      if(reduce){ renderWords(line); }
      else {
        txt.innerHTML = '<span class="bubble-dots" aria-hidden="true"><span></span><span></span><span></span></span>';
        timers.push(setTimeout(function(){ renderWords(line); }, 400));
      }

      bub.style.pointerEvents = 'auto';
      bub.style.opacity = '1';
      bScale = 1; bRot = 0; applyT();
      if(!reduce) timers.push(setTimeout(function(){ bRot = -1.5; applyT(); }, 300));
      self.sizeBubble();
      self.placeBubble();
      var ch = document.querySelector('hero-character') || document.querySelector('hero-avatar');
      if(ch && ch.play) ch.play(line.react);
    };

    var hide = function(){
      if(hideT) clearTimeout(hideT);
      hideT = setTimeout(function(){
        bub.style.opacity = '0';
        bub.style.pointerEvents = 'none';
        if(!reduce){ bScale = 0.85; bRot = 0; applyT(); }
      }, 400);
    };
    var keep = function(){ if(hideT){ clearTimeout(hideT); hideT = null; } };

    btn.addEventListener('pointerenter', show);
    btn.addEventListener('pointerleave', hide);
    btn.addEventListener('focus', show);
    btn.addEventListener('blur', hide);
    btn.addEventListener('click', show);
    bub.addEventListener('pointerenter', keep);
    bub.addEventListener('pointerleave', hide);

    this.sizeBubble();
  }
  }

  function start() {
    var home = new Home();
    home.start();
    var next = document.querySelector('[data-on-click="tNext"]');
    var prev = document.querySelector('[data-on-click="tPrev"]');
    if (next) next.addEventListener('click', function () { if (home.advance) home.advance(1); });
    if (prev) prev.addEventListener('click', function () { if (home.advance) home.advance(-1); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
