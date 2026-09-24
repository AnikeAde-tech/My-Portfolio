// <hero-avatar> — stylised figurine for the home hero. Procedural rig + animation.
// Head rotates from the neck pivot only: yaw ±15°, pitch ±8°, roll always 0.
(function () {
  const SRC = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

  const SKIN = 0x8a5334;
  const SKIN_D = 0x6d3f26;
  const HAIR = 0x1b1512;
  const TOP = 0xf1eee7;
  const SKIRT = 0x143a2e;
  const ACCENT = 0xe8a317;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  class HeroAvatar extends HTMLElement {
    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      this.style.display = 'block';
      this.style.position = 'relative';
      this.style.width = '100%';
      this.style.height = '100%';
      this.style.pointerEvents = 'none';
      this.setAttribute('aria-hidden', 'true');
      this._mount();
    }

    disconnectedCallback() {
      this._stop = true;
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
      window.removeEventListener('pointermove', this._onMove);
      if (this._renderer) this._renderer.dispose();
    }

    // bubble API: play('wave' | 'nod' | 'tilt' | 'shrug' | 'point')
    play(kind) { return this.react(kind === 'wave' ? 'halfwave' : kind); }

    react(kind) {
      const now = performance.now();
      if (this._reactUntil && now < this._reactUntil) return false;
      if (!this._rig || this._reduce) return false;
      this._reactUntil = now + 3000;
      this._anim = { kind: kind || 'nod', t: 0, dur: kind === 'point' ? 900 : 620 };
      return true;
    }

    async _mount() {
      let THREE;
      try { THREE = await import(SRC); } catch (e) { return; }
      if (this._stop) return;
      const host = this;
      const w = () => host.clientWidth || 300;
      const h = () => host.clientHeight || 420;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._reduce = reduce;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w(), h());
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const cv = renderer.domElement;
      cv.style.display = 'block';
      cv.style.width = '100%';
      cv.style.height = '100%';
      host.appendChild(cv);
      this._renderer = renderer;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, w() / h(), 0.1, 100);
      camera.position.set(0, 1.9, 7.3);
      camera.lookAt(0, 1.9, 0);

      scene.add(new THREE.HemisphereLight(0xdfeee6, 0x0e2a22, 0.62));
      const key = new THREE.DirectionalLight(0xfff1d8, 1.7);
      key.position.set(-3.6, 5.6, 4.6);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.55);
      fill.position.set(0.8, 1.6, 6);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x9fc4b4, 1.0);
      rim.position.set(2.8, 3.4, -4.2);
      scene.add(rim);

      const skinMat = new THREE.MeshStandardMaterial({
        color: SKIN, roughness: 0.78, metalness: 0.0,
        emissive: 0x2a1108, emissiveIntensity: 0.28
      });
      const skinDMat = new THREE.MeshStandardMaterial({
        color: SKIN_D, roughness: 0.8, metalness: 0.0,
        emissive: 0x240e06, emissiveIntensity: 0.25
      });
      const clothMat = new THREE.MeshStandardMaterial({ color: TOP, roughness: 0.88, metalness: 0.0 });
      const skirtMat = new THREE.MeshStandardMaterial({ color: SKIRT, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide });
      const hairMat = new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.42, metalness: 0.05 });
      const goldMat = new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.26, metalness: 0.75 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x241d19, roughness: 0.55 });

      const folds = (geo, amp, n) => {
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), z = p.getZ(i);
          const a = Math.atan2(z, x);
          const k = 1 + amp * Math.cos(n * a);
          p.setX(i, x * k); p.setZ(i, z * k);
        }
        geo.computeVertexNormals();
        return geo;
      };

      const root = new THREE.Group(); scene.add(root);
      const body = new THREE.Group(); root.add(body);
      const hips = new THREE.Group(); body.add(hips);

      const chest = new THREE.Group();
      chest.position.y = 1.72;
      hips.add(chest);
      const torsoProf = [
        [0.02, 0.00], [0.34, 0.02], [0.32, 0.18], [0.38, 0.44],
        [0.405, 0.66], [0.43, 0.84], [0.44, 0.94], [0.39, 1.01],
        [0.26, 1.06], [0.13, 1.09], [0.05, 1.10]
      ].map((q) => new THREE.Vector2(q[0], q[1]));
      const torso = new THREE.Mesh(folds(new THREE.LatheGeometry(torsoProf, 72), 0.014, 7), clothMat);
      chest.add(torso);

      const skirtProf = [
        [0.355, 0.86], [0.40, 0.66], [0.47, 0.44], [0.545, 0.22],
        [0.60, 0.08], [0.625, 0.01], [0.60, 0.0]
      ].map((q) => new THREE.Vector2(q[0], q[1]));
      const skirt = new THREE.Mesh(folds(new THREE.LatheGeometry(skirtProf, 72), 0.02, 9), skirtMat);
      skirt.position.y = 0.92;
      hips.add(skirt);
      const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.37, 40, 26), skirtMat);
      pelvis.scale.set(1, 0.6, 0.92);
      pelvis.position.y = 1.76;
      hips.add(pelvis);

      const legs = [];
      [-0.16, 0.16].forEach((x) => {
        const hip = new THREE.Group();
        hip.position.set(x, 1.02, 0);
        hips.add(hip);
        const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.34, 10, 28), skinMat);
        thigh.position.y = -0.25;
        hip.add(thigh);
        const knee = new THREE.Group();
        knee.position.y = -0.48;
        hip.add(knee);
        const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.34, 10, 28), skinMat);
        shin.position.y = -0.25;
        knee.add(shin);
        const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.14, 8, 20), darkMat);
        shoe.rotation.z = Math.PI / 2; shoe.rotation.y = Math.PI / 2;
        shoe.position.set(0, -0.48, 0.05);
        knee.add(shoe);
        legs.push({ hip, knee });
      });

      const arms = [];
      [-1, 1].forEach((s) => {
        const sh = new THREE.Group();
        sh.position.set(s * 0.43, 2.62, 0);
        hips.add(sh);
        const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.115, 28, 20), clothMat);
        sh.add(shoulderCap);
        const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.093, 0.36, 10, 28), skinMat);
        upper.position.y = -0.25;
        sh.add(upper);
        const el = new THREE.Group();
        el.position.y = -0.47;
        sh.add(el);
        const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.081, 0.34, 10, 28), skinMat);
        fore.position.y = -0.23;
        el.add(fore);
        const hand = new THREE.Group();
        hand.position.y = -0.47;
        el.add(hand);
        const palm = new THREE.Mesh(new THREE.SphereGeometry(0.092, 22, 16), skinDMat);
        palm.scale.set(1, 1.2, 0.66);
        hand.add(palm);
        sh.rotation.z = s * 0.13;
        el.rotation.x = -0.12;
        arms.push({ sh, el, hand, side: s });
      });
      const armL = arms[0], armR = arms[1];

      // neck pivot at the base of the neck — the head never rotates about its own centre
      const neckPivot = new THREE.Group();
      neckPivot.position.y = 2.78;
      hips.add(neckPivot);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.13, 0.26, 28), skinMat);
      neck.position.y = 0.07;
      neckPivot.add(neck);

      const headPivot = new THREE.Group();
      headPivot.position.y = 0.17;
      neckPivot.add(headPivot);

      const HS = [0.9, 1.07, 0.93];
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.375, 56, 40), skinMat);
      head.scale.set(HS[0], HS[1], HS[2]);
      head.position.y = 0.3;
      headPivot.add(head);
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.29, 40, 28), skinMat);
      jaw.scale.set(0.88, 0.68, 0.87);
      jaw.position.set(0, 0.17, 0.02);
      headPivot.add(jaw);

      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.39, 56, 36, 0, Math.PI * 2, 0, Math.PI * 0.46), hairMat);
      cap.scale.set(HS[0] * 1.02, HS[1] * 1.03, HS[2] * 1.02);
      cap.position.y = 0.3;
      headPivot.add(cap);
      const back = new THREE.Mesh(new THREE.SphereGeometry(0.385, 44, 30), hairMat);
      back.scale.set(HS[0] * 1.01, HS[1], 0.55);
      back.position.set(0, 0.28, -0.12);
      headPivot.add(back);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.2, 34, 26), hairMat);
      bun.position.set(0, 0.56, -0.3);
      headPivot.add(bun);
      const nape = new THREE.Mesh(new THREE.SphereGeometry(0.23, 32, 22), hairMat);
      nape.scale.set(0.95, 0.85, 0.58);
      nape.position.set(0, 0.1, -0.18);
      headPivot.add(nape);

      const eyes = [];
      [-0.125, 0.125].forEach((x) => {
        const g = new THREE.Group();
        g.position.set(x, 0.3, 0.3);
        headPivot.add(g);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 22, 16), new THREE.MeshStandardMaterial({ color: 0x14130f, roughness: 0.2 }));
        eye.position.z = 0.016;
        g.add(eye);
        eyes.push(g);
        const brow = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.011, 10, 20, Math.PI * 0.72), hairMat);
        brow.position.set(x, 0.375, 0.295);
        brow.rotation.z = x < 0 ? -0.1 : 0.1;
        headPivot.add(brow);
      });
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 22, 16), skinMat);
      nose.scale.set(0.92, 0.72, 0.85);
      nose.position.set(0, 0.235, 0.318);
      headPivot.add(nose);
      const smile = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.016, 12, 28, Math.PI * 0.82), new THREE.MeshStandardMaterial({ color: 0x8c4436, roughness: 0.45 }));
      smile.position.set(0, 0.16, 0.285);
      smile.rotation.z = Math.PI + Math.PI * 0.09;
      headPivot.add(smile);

      [-0.315, 0.315].forEach((x) => {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.013, 14, 30), goldMat);
        hoop.position.set(x, 0.19, 0.0);
        hoop.rotation.y = Math.PI / 2;
        headPivot.add(hoop);
      });

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.66, 48),
        new THREE.MeshBasicMaterial({ color: 0x05130e, transparent: true, opacity: 0.28 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.004;
      root.add(shadow);

      this._rig = { hips, chest, neckPivot, headPivot, armL, armR, legs, eyes, torso, root, body };

      this._px = 0; this._py = 0; this._pointerIn = false;
      this._onMove = (e) => {
        const r = host.getBoundingClientRect();
        const hero = host.closest('.hero') || document.body;
        const hr = hero.getBoundingClientRect();
        this._pointerIn = e.clientX >= hr.left && e.clientX <= hr.right && e.clientY >= hr.top && e.clientY <= hr.bottom;
        this._px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        this._py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      };
      if (!reduce) window.addEventListener('pointermove', this._onMove, { passive: true });

      const resize = () => {
        renderer.setSize(w(), h());
        camera.aspect = w() / h();
        camera.updateProjectionMatrix();
      };
      this._ro = new ResizeObserver(resize);
      this._ro.observe(host);

      let visible = true, running = false;
      this._io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          visible = e.isIntersecting;
          if (visible && !running && !this._stop) { running = true; clock.getDelta(); requestAnimationFrame(tick); }
        });
      }, { threshold: 0 });
      this._io.observe(host);

      const D2R = THREE.MathUtils.degToRad;
      const clampN = (v, m) => (v < -m ? -m : (v > m ? m : v));
      const YAW_MAX = D2R(15), PITCH_MAX = D2R(8);
      const NECK_Y = neckPivot.position.y;

      // body facing is set here and nowhere else
      const FACE = 0;
      const TURNED = -D2R(18);
      let phase = reduce ? 'idle' : 'walk';
      let pt = 0;
      const WALK = 1400, TURN = 300, LIFT = 260, SWINGS = 750, LOWER = 400;
      const WAVE = LIFT + SWINGS;
      root.position.x = reduce ? 0 : 3.4;
      root.rotation.y = reduce ? TURNED : FACE;

      host.style.opacity = '0';
      host.style.transition = 'opacity .9s cubic-bezier(.2,.7,.3,1)';
      requestAnimationFrame(() => { host.style.opacity = '1'; });

      let t = 0, hx = 0, hy = 0, ex = 0, sway = 0;
      let blinkAt = 2 + Math.random() * 3, blinkT = -1;
      let shiftAt = 8 + Math.random() * 4, shift = 0, shiftT = -1;
      const clock = new THREE.Clock();

      const tick = () => {
        if (this._stop || !visible) { running = false; return; }
        running = true;
        requestAnimationFrame(tick);
        const dt = Math.min(clock.getDelta(), 0.05);
        t += dt;
        pt += dt * 1000;

        // reset per-frame pose — nothing accumulates across frames
        let bob = 0;
        neckPivot.rotation.set(0, 0, 0);
        neckPivot.position.y = NECK_Y;
        headPivot.rotation.set(0, 0, 0);
        legs[0].hip.rotation.x = 0; legs[1].hip.rotation.x = 0;
        legs[0].knee.rotation.x = 0; legs[1].knee.rotation.x = 0;
        armL.sh.rotation.set(0, 0, -0.13);
        armR.sh.rotation.set(0, 0, 0.13);
        armL.el.rotation.set(-0.12, 0, 0);
        armR.el.rotation.set(-0.12, 0, 0);
        armL.hand.rotation.set(0, 0, 0);
        armR.hand.rotation.set(0, 0, 0);

        if (phase === 'walk') {
          const p = Math.min(1, pt / WALK);
          const e = easeOut(p);
          root.position.x = 3.4 * (1 - e);
          const cycle = (1 - Math.pow(1 - p, 2)) * 5.4;
          const settle = 1 - p * 0.55;
          const sw = Math.sin(cycle * Math.PI * 2) * settle;
          legs[0].hip.rotation.x = sw * D2R(22);
          legs[1].hip.rotation.x = -sw * D2R(22);
          legs[0].knee.rotation.x = Math.max(0, -sw) * D2R(28);
          legs[1].knee.rotation.x = Math.max(0, sw) * D2R(28);
          armL.sh.rotation.x = -sw * D2R(15);
          armR.sh.rotation.x = sw * D2R(15);
          armL.el.rotation.x = -0.12 - Math.max(0, sw) * 0.2;
          armR.el.rotation.x = -0.12 - Math.max(0, -sw) * 0.2;
          bob = Math.abs(Math.sin(cycle * Math.PI * 2)) * 0.03 * settle;
          root.rotation.y = FACE;
          if (p >= 1) { phase = 'turn'; pt = 0; }
        } else if (phase === 'turn') {
          const p = Math.min(1, pt / TURN);
          root.rotation.y = FACE + (TURNED - FACE) * easeInOut(p);
          if (p >= 1) { phase = 'wave'; pt = 0; }
        } else if (phase === 'wave') {
          const p = Math.min(1, pt / WAVE);
          const lift = easeOut(Math.min(1, pt / LIFT));
          armR.sh.rotation.z = 0.13 + (1.15 - 0.13) * lift;
          armR.sh.rotation.x = -0.25 * lift;
          armR.el.rotation.z = -1.25 * lift;
          if (pt > LIFT) {
            const wv = (pt - LIFT) / 250;
            armR.hand.rotation.z = Math.sin(wv * Math.PI) * D2R(18);
            armR.el.rotation.z = -1.25 + Math.sin(wv * Math.PI) * 0.1;
          }
          root.rotation.y = TURNED;
          if (p >= 1) { phase = 'lower'; pt = 0; }
        } else if (phase === 'lower') {
          const p = Math.min(1, pt / LOWER);
          const e = 1 - easeInOut(p);
          armR.sh.rotation.z = 0.13 + (1.15 - 0.13) * e;
          armR.sh.rotation.x = -0.25 * e;
          armR.el.rotation.z = -1.25 * e;
          root.rotation.y = TURNED;
          if (p >= 1) { phase = 'idle'; pt = 0; }
        }

        if (phase === 'idle') {
          root.rotation.y = TURNED + sway;
          if (!reduce) {
            const br = 1 + (Math.sin(t * (Math.PI * 2 / 4)) * 0.5 + 0.5) * 0.015;
            chest.scale.set(br, 1 + (br - 1) * 0.5, br);
            armL.sh.rotation.x = Math.sin(t * 0.62) * 0.035;
            armR.sh.rotation.x = Math.sin(t * 0.62 + 1.2) * 0.035;
            armL.sh.rotation.z = -0.13 - Math.sin(t * 0.8) * 0.018;
            armR.sh.rotation.z = 0.13 + Math.sin(t * 0.8 + 0.7) * 0.018;
            bob = Math.sin(t * 0.62) * 0.008;

            if (shiftT < 0 && t > shiftAt) { shiftT = 0; }
            if (shiftT >= 0) {
              shiftT += dt;
              const p = Math.min(1, shiftT / 2.2);
              shift = Math.sin(p * Math.PI) * 0.055;
              if (p >= 1) { shiftT = -1; shiftAt = t + 8 + Math.random() * 4; }
            }
            hips.position.x = shift;
            hips.rotation.z = -shift * 0.22;

            if (blinkT < 0 && t > blinkAt) blinkT = 0;
            if (blinkT >= 0) {
              blinkT += dt;
              const p = blinkT / 0.12;
              const k = p < 1 ? 1 - Math.sin(p * Math.PI) * 0.94 : 1;
              eyes.forEach((g) => g.scale.set(1, k, 1));
              if (p >= 1) { blinkT = -1; blinkAt = t + 3 + Math.random() * 3; }
            }
          }
        }

        let nod = 0, lean = 0;
        const an = this._anim;
        if (an && phase === 'idle') {
          an.t += dt * 1000;
          const p = Math.min(1, an.t / an.dur);
          const s = Math.sin(p * Math.PI);
          if (an.kind === 'nod') nod = s * D2R(11);
          else if (an.kind === 'tilt') lean = s * D2R(10);
          else if (an.kind === 'shrug') {
            armL.sh.rotation.z -= s * 0.34; armR.sh.rotation.z += s * 0.34;
            armL.el.rotation.z += s * 0.5; armR.el.rotation.z -= s * 0.5;
            neckPivot.position.y = NECK_Y - s * 0.045;
          } else if (an.kind === 'halfwave') {
            armR.sh.rotation.z = 0.13 + s * 0.95;
            armR.el.rotation.z = -s * 1.05;
            armR.hand.rotation.z = Math.sin(p * Math.PI * 5) * D2R(18) * s;
          } else if (an.kind === 'point') {
            armR.sh.rotation.z = 0.13 + s * 0.22;
            armR.sh.rotation.x = s * 0.55;
            armR.el.rotation.x = -s * 0.2;
            nod = s * D2R(7);
          }
          if (p >= 1) { this._anim = null; neckPivot.position.y = NECK_Y; }
        }

        // head tracking: clamped into the spring, clamped out of it, never any roll
        if (!reduce && phase === 'idle') {
          const tx = clampN(this._pointerIn ? this._px * YAW_MAX : 0, YAW_MAX);
          const ty = clampN(this._pointerIn ? this._py * PITCH_MAX : 0, PITCH_MAX);
          hx = clampN(hx + (tx - hx) * Math.min(1, dt * 3.4), YAW_MAX);
          hy = clampN(hy + (ty - hy) * Math.min(1, dt * 3.4), PITCH_MAX);
          ex += (tx * 6 - ex) * Math.min(1, dt * 6);
          eyes.forEach((g) => { g.position.x = (g.position.x < 0 ? -0.125 : 0.125) + clampN(ex, 1) * 0.028; });
          sway += (hx * 0.35 - sway) * Math.min(1, dt * 1.5);
          if (!this._pointerIn && Math.abs(hx) < 0.002 && Math.abs(hy) < 0.002) { hx = 0; hy = 0; ex = 0; sway = 0; }
        } else {
          hx = 0; hy = 0; ex = 0;
        }
        neckPivot.rotation.y = clampN(hx + lean, YAW_MAX + D2R(10));
        neckPivot.rotation.x = clampN(hy + nod, PITCH_MAX + D2R(11));
        neckPivot.rotation.z = 0;

        body.position.y = bob;
        renderer.render(scene, camera);
      };
      running = true;
      tick();
    }
  }

  if (!customElements.get('hero-avatar')) customElements.define('hero-avatar', HeroAvatar);
})();
