// <hero-character> — real rigged character for the home hero.
//
//   <hero-character glb="character.glb"></hero-character>
//
// Expects a Mixamo-style GLB with clips: idle, walk, wave, nod.
// The file's own root transform (0.01 scale, 90° X) is left untouched; the
// model is measured after loading and fitted by a wrapper group.
(function () {
  // Pinned, pre-bundled ES modules from jsDelivr. The loader's 'three' import is
  // rewritten server-side to the same THREE_SRC URL, so the browser resolves no
  // bare specifiers and three.js is only fetched once.
  const THREE_SRC = 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
  const GLTF_SRC = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm';
  const idle = (fn) => ('requestIdleCallback' in window)
    ? requestIdleCallback(fn, { timeout: 1500 })
    : setTimeout(fn, 200);
  const afterPaint = (fn) => {
    const go = () => setTimeout(() => idle(fn), 0);
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
  };
  const D2R = Math.PI / 180;
  const YAW = 15 * D2R, PITCH = 8 * D2R;
  const clampN = (v, m) => (v < -m ? -m : v > m ? m : v);

  // model is normalised to 1 unit tall, so all distances below are body-heights
  const START_X = 1.75;        // off beyond the right edge
  const STRIDE = 0.92;         // ground covered by one 1s walk cycle
  const TURN = -20 * D2R;      // toward the reader, once she has stopped

  class HeroCharacter extends HTMLElement {
    connectedCallback() {
      if (this._booted) {
        // re-attached by the page renderer before the deferred load ran
        if (this._stop && !this._renderer) {
          this._stop = false;
          const g = this.getAttribute('glb');
          if (g && !this._posterOnly) afterPaint(() => { if (!this._stop && !this._renderer) this._mount(g); });
        }
        return;
      }
      this._booted = true;
      this.style.display = 'block';
      this.style.position = 'relative';
      this.style.width = '100%';
      this.style.height = '100%';
      this.style.pointerEvents = 'none';
      this.setAttribute('aria-hidden', 'true');

      const conn = navigator.connection;
      this._still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Save-Data or a low-memory device: poster only, the model is never fetched
      this._posterOnly = !!(conn && conn.saveData) ||
        (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4);

      this._shadow();
      this._placeholder();
      const glb = this.getAttribute('glb');
      if (glb && !this._posterOnly && !document.querySelector('link[data-glb-preload]')) {
        // preload in parallel with first paint; added from JS so Save-Data skips it
        const l = document.createElement('link');
        l.rel = 'preload'; l.as = 'fetch'; l.href = glb; l.crossOrigin = 'anonymous';
        l.setAttribute('data-glb-preload', '');
        document.head.appendChild(l);
      }
      if (glb && !this._posterOnly) afterPaint(() => { if (!this._stop && !this._renderer) this._mount(glb); });
    }

    disconnectedCallback() {
      this._stop = true;
      if (this._io) this._io.disconnect();
      if (this._ro) this._ro.disconnect();
      if (this._onMove) window.removeEventListener('pointermove', this._onMove);
      if (this._onVis) document.removeEventListener('visibilitychange', this._onVis);
      if (this._renderer) this._renderer.dispose();
    }

    // called by the speech bubble. 'wave' forces a wave; anything else alternates.
    play(kind) {
      const now = performance.now();
      if (this._coolUntil && now < this._coolUntil) return false;
      if (this._still || !this._playClip || this._phase !== 'idle') return false;
      this._coolUntil = now + 3000;
      let next;
      if (kind === 'wave') next = 'wave';
      else { this._alt = !this._alt; next = this._alt ? 'nod' : 'wave'; }
      this._phase = 'react';
      this._playClip(next, 300, next === 'wave' ? 2 : 1, () => {
        this._phase = 'idle';
        this._playClip('idle', 300, Infinity);
      });
      return true;
    }

    _shadow() {
      const s = document.createElement('div');
      s.setAttribute('aria-hidden', 'true');
      s.style.cssText = 'position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);' +
        'width:52%;height:24px;border-radius:50%;pointer-events:none;' +
        'background:radial-gradient(ellipse at center,rgba(5,19,14,.5),rgba(5,19,14,0) 70%)';
      this.appendChild(s);
      this._shadowEl = s;
    }

    _placeholder() {
      if (this._ph) return;
      const d = document.createElement('div');
      d.setAttribute('aria-hidden', 'true');
      d.style.cssText = 'position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;pointer-events:none';
      const form = document.createElement('div');
      form.style.cssText = 'width:58%;height:84%;background:#F1EEE7;opacity:.08;' +
        'border-radius:46% 46% 22% 22%/38% 38% 8% 8%';
      const label = document.createElement('span');
      label.textContent = 'character';
      label.style.cssText = 'position:absolute;left:50%;bottom:14px;transform:translateX(-50%);' +
        'font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;' +
        'color:rgba(241,238,231,.42)';
      d.appendChild(form); d.appendChild(label);
      this.appendChild(d);
      this._ph = d;
    }

    async _mount(url) {
      let THREE, GLTFLoader;
      try {
        THREE = await import(THREE_SRC);
        ({ GLTFLoader } = await import(GLTF_SRC));
      } catch (e) { console.warn('[hero-character] three.js failed to load', e); this._placeholder(); return; }
      if (this._stop) return;

      const host = this;
      const w = () => host.clientWidth || 300;
      const h = () => host.clientHeight || 420;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
      renderer.setSize(w(), h());
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;opacity:0;transition:opacity 300ms cubic-bezier(.2,.7,.3,1)';
      host.appendChild(renderer.domElement);
      this._renderer = renderer;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, w() / h(), 0.01, 100);
      scene.add(new THREE.HemisphereLight(0xdfeee6, 0x0e2a22, 0.7));
      const key = new THREE.DirectionalLight(0xfff1d8, 2.0); key.position.set(-2.6, 4.2, 3.6);
      const fill = new THREE.DirectionalLight(0xffffff, 0.6); fill.position.set(0.8, 1.4, 5);
      const rim = new THREE.DirectionalLight(0x9fc4b4, 1.1); rim.position.set(2.4, 3.0, -3.4);
      scene.add(key, fill, rim);

      let gltf;
      try { gltf = await new GLTFLoader().loadAsync(url); }
      catch (e) { console.warn('[hero-character] model failed to load', e); this._placeholder(); return; }
      if (this._stop) return;

      const model = gltf.scene;
      model.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; } });

      // stage carries travel + turn; fit carries the measured scale/offset
      const stage = new THREE.Group();
      const fit = new THREE.Group();
      fit.add(model);
      stage.add(fit);
      scene.add(stage);

      const mixer = new THREE.AnimationMixer(model);
      const actions = {};
      (gltf.animations || []).forEach((c) => {
        const a = mixer.clipAction(c);
        actions[c.name.toLowerCase().trim()] = a;
      });
      const has = (n) => !!actions[n];

      // measure in the idle pose. A quantized skinned mesh reports a useless
      // geometry box, so measure the posed skeleton instead and allow for the
      // skull sitting above the topmost bone.
      if (has('idle')) { actions.idle.reset().play(); mixer.update(0); }
      model.updateWorldMatrix(true, true);

      const bones = [];
      model.traverse((o) => { if (o.isBone) bones.push(o); });
      const v = new THREE.Vector3();
      let bMinY = Infinity, bMaxY = -Infinity, sumX = 0, sumZ = 0;
      bones.forEach((b) => {
        b.getWorldPosition(v);
        if (v.y < bMinY) bMinY = v.y;
        if (v.y > bMaxY) bMaxY = v.y;
        sumX += v.x; sumZ += v.z;
      });

      let H, footY, cx, cz;
      if (bones.length > 4 && isFinite(bMinY) && bMaxY > bMinY) {
        H = (bMaxY - bMinY) / 0.90;   // topmost bone sits at ~90% of standing height
        footY = bMinY;
        cx = sumX / bones.length;
        cz = sumZ / bones.length;
      } else {
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3(), centre = new THREE.Vector3();
        box.getSize(size); box.getCenter(centre);
        H = size.y || 1; footY = box.min.y; cx = centre.x; cz = centre.z;
      }
      if (has('idle')) actions.idle.stop();

      const s = 1 / H;
      fit.scale.setScalar(s);
      fit.position.set(-cx * s, -footY * s, -cz * s);

      // frame tightly: feet on the bottom edge, 6% of her height as headroom
      const frameH = 1.01;
      const FIG_W = 0.46;                    // her widest reach, in body heights
      const halfTan = Math.tan((camera.fov / 2) * D2R);
      const setCam = () => {
        const aspect = Math.max(w() / h(), 0.01);
        camera.aspect = aspect;
        // pull back only if the column is narrower than she is
        const byH = (frameH / 2) / halfTan;
        const byW = (FIG_W / 2) / (halfTan * aspect);
        const d = Math.max(byH, byW);
        const visH = 2 * halfTan * d;
        const camY = visH / 2 - 0.015;       // feet just above the bottom edge
        camera.position.set(0, camY, d);
        camera.lookAt(0, camY, 0);
        camera.updateProjectionMatrix();
      };
      setCam();

      let headBone = null;
      model.traverse((o) => { if (!headBone && o.isBone && /head$/i.test(o.name)) headBone = o; });

// where her head is on screen, for anything anchored to it
      const wv = new THREE.Vector3();
      const report = () => {
        if (!this.onHead) return;
        const hero = host.closest('.hero') || document.body;
        const rect = renderer.domElement.getBoundingClientRect();
        const heroRect = hero.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        // project() returns NDC in -1..1; convert to px relative to the hero
        const at = (yUnits) => {
          if (headBone) { headBone.getWorldPosition(wv); wv.y = yUnits; }
          else wv.set(stage.position.x, yUnits, 0);
          wv.project(camera);
          return {
            x: (wv.x + 1) / 2 * rect.width + (rect.left - heroRect.left),
            y: (1 - wv.y) / 2 * rect.height + (rect.top - heroRect.top)
          };
        };
        const top = at(0.94);        // crown
        const sh = at(0.78);         // shoulders
        if (!isFinite(top.x) || !isFinite(top.y)) return;
        this.onHead({
          x: top.x, y: top.y,
          shoulderY: sh.y,
          groundY: rect.bottom - heroRect.top,
          heroLeft: heroRect.left, heroTop: heroRect.top
        });
      };
      this._report = report;

      let neck = null;
      model.traverse((o) => { if (!neck && o.isBone && /neck/i.test(o.name)) neck = o; });
      const neckBase = neck ? neck.rotation.clone() : null;

      let current = null, onDone = null;
      const playClip = (name, fade, reps, done) => {
        const next = actions[name];
        if (!next) { if (done) done(); return false; }
        onDone = null;
        next.reset();
        next.enabled = true;
        next.timeScale = 1;
        next.setEffectiveWeight(1);
        if (reps === Infinity) { next.setLoop(THREE.LoopRepeat, Infinity); next.clampWhenFinished = false; }
        else { next.setLoop(THREE.LoopRepeat, reps || 1); next.clampWhenFinished = true; }
        next.play();
        if (current && current !== next) current.crossFadeTo(next, (fade || 300) / 1000, false);
        current = next;
        if (reps !== Infinity && done) onDone = { action: next, cb: done };
        return true;
      };
      this._playClip = playClip;
      mixer.addEventListener('finished', (e) => {
        if (onDone && e.action === onDone.action) { const cb = onDone.cb; onDone = null; cb(); }
      });

      const walkA = actions.walk;
      const reveal = () => requestAnimationFrame(() => {
        renderer.domElement.style.opacity = '1';
        if (this._ph) {
          const ph = this._ph; this._ph = null;
          ph.style.transition = 'opacity 300ms cubic-bezier(.2,.7,.3,1)';
          ph.style.opacity = '0';
          setTimeout(() => ph.remove(), 320);
        }
      });

      if (this._still) {
        stage.position.x = 0; stage.rotation.y = TURN;
        playClip('idle', 0, Infinity);
        mixer.update(0);
        renderer.render(scene, camera);
        this._phase = 'idle';
        this._ro = new ResizeObserver(() => {
          renderer.setSize(w(), h()); setCam(); mixer.update(0); renderer.render(scene, camera);
          if (this._report) this._report();
        });
        this._ro.observe(host);
        this._stillReport = true;
        reveal();
        return;
      }

      // she walks in on every load
      if (walkA) {
        this._phase = 'walk';
        stage.position.x = START_X;
        stage.rotation.y = 0;
        playClip('walk', 0, Infinity);
      } else {
        this._phase = 'idle';
        stage.position.x = 0;
        stage.rotation.y = TURN;
        playClip('idle', 0, Infinity);
      }

      this._px = 0; this._py = 0; this._in = false;
      this._onMove = (e) => {
        // head tracking follows a mouse only; a finger scrolling past shouldn't steer her
        if (e.pointerType && e.pointerType !== 'mouse') { this._in = false; this._px = 0; this._py = 0; return; }
        const hero = host.closest('.hero') || document.body;
        const r = hero.getBoundingClientRect();
        this._in = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        this._px = clampN((e.clientX - (r.left + r.width / 2)) / (r.width / 2), 1);
        this._py = clampN((e.clientY - (r.top + r.height / 2)) / (r.height / 2), 1);
      };
      window.addEventListener('pointermove', this._onMove, { passive: true });

      this._ro = new ResizeObserver(() => { renderer.setSize(w(), h()); setCam(); if (this._report) this._report(); });
      this._ro.observe(host);

      let visible = true, running = false, tabOn = !document.hidden;
      const clock = new THREE.Clock();
      let hx = 0, hy = 0, turnT = -1;

      const tick = () => {
        if (this._stop || !visible || !tabOn) { running = false; return; }
        running = true;
        requestAnimationFrame(tick);
        step(Math.min(clock.getDelta(), 0.05));
      };

      const step = (dt) => {
        if (this._phase === 'walk') {
          // travel speed is tied to the stride, so the feet never skate;
          // the last stride eases out and the clip slows with it
          const x = stage.position.x;
          const easeZone = STRIDE * 0.9;
          const v = x > easeZone ? 1 : Math.max(0.12, x / easeZone);
          if (walkA) walkA.timeScale = v;
          stage.position.x = Math.max(0, x - STRIDE * v * dt);
          if (stage.position.x <= 0.004) {
            stage.position.x = 0;
            if (walkA) walkA.timeScale = 1;
            this._phase = 'wave';
            turnT = 0;
            playClip('wave', 300, 3, () => {
              this._phase = 'idle';
              playClip('idle', 300, Infinity);
            });
          }
        } else if (turnT >= 0) {
          turnT += dt;
          const p = Math.min(1, turnT / 0.45);
          stage.rotation.y = TURN * (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
          if (p >= 1) turnT = -1;
        }

        mixer.update(dt);

        // head tracking, applied after the mixer so the clip can't fight it
        if (neck) {
          const idle = this._phase === 'idle';
          const tx = clampN(idle && this._in ? this._px * YAW : 0, YAW);
          const ty = clampN(idle && this._in ? this._py * PITCH : 0, PITCH);
          hx = clampN(hx + (tx - hx) * Math.min(1, dt * 3.4), YAW);
          hy = clampN(hy + (ty - hy) * Math.min(1, dt * 3.4), PITCH);
          if (!this._in && Math.abs(hx) < 0.002 && Math.abs(hy) < 0.002) { hx = 0; hy = 0; }
          neck.rotation.set(neckBase.x + hy, neckBase.y + hx, neckBase.z);
        }
        renderer.render(scene, camera);
        report();
      };

      this._step = step;

      this._probe = () => {
        step(0);
        const gl = renderer.getContext();
        const W = gl.drawingBufferWidth, Hh = gl.drawingBufferHeight;
        const buf = new Uint8Array(W * Hh * 4);
        gl.readPixels(0, 0, W, Hh, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        let count = 0, minY = Hh, maxY = -1, minX = W, maxX = -1;
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
          if (buf[(y * W + x) * 4 + 3] > 12) {
            count++;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            if (x < minX) minX = x; if (x > maxX) maxX = x;
          }
        }
        return {
          coverage: +(count / (W * Hh)).toFixed(4),
          topFrac: maxY < 0 ? null : +(1 - maxY / Hh).toFixed(3),
          bottomFrac: maxY < 0 ? null : +(1 - minY / Hh).toFixed(3),
          leftFrac: maxX < 0 ? null : +(minX / W).toFixed(3),
          rightFrac: maxX < 0 ? null : +(maxX / W).toFixed(3)
        };
      };

      this._dbg = () => ({
        x: +stage.position.x.toFixed(3),
        yaw: +(stage.rotation.y / D2R).toFixed(1),
        phase: this._phase,
        clip: current && current.getClip().name,
        clips: Object.keys(actions),
        H: +H.toFixed(3)
      });

      this._io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          visible = e.isIntersecting;
          if (visible && tabOn && !running && !this._stop) { running = true; clock.getDelta(); requestAnimationFrame(tick); }
        });
      }, { threshold: 0 });
      this._io.observe(host);
      this._onVis = () => {
        tabOn = !document.hidden;
        if (tabOn && visible && !running && !this._stop) { running = true; clock.getDelta(); requestAnimationFrame(tick); }
      };
      document.addEventListener('visibilitychange', this._onVis);
      this._isRunning = () => running;

      reveal();
      running = true;
      tick();
    }
  }

  if (!customElements.get('hero-character')) customElements.define('hero-character', HeroCharacter);
})();
