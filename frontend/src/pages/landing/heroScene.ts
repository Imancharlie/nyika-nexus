/* Hero scene: a drone scans the field and wakes the crops. Ported from the AGRIMIKA landing design. */

type Plant = { x: number; y: number; t: number; ph: number; g: number };
type Fly = { x: number; y: number; s: number; ph: number; v: number };
type Ripple = { x: number; y: number; t0: number; sp: number; life: number };

export function startHeroScene(
  hero: HTMLElement,
  cv: HTMLCanvasElement,
  cv2: HTMLCanvasElement,
  hint: HTMLElement | null,
  opts?: { compact?: boolean },
): () => void {
  const compact = Boolean(opts?.compact);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctxMain = cv.getContext("2d")!;
  const ctx2 = cv2.getContext("2d")!;
  let ctx = ctxMain;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  function rng(a: number) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let W = 0, H = 0, DPR = 1, horizon = 0, vx = 0, fieldB = 0, HS = 0, mob = false;
  let plants: Plant[] = [], flies: Fly[] = [];
  let skyC: HTMLCanvasElement, hillC: HTMLCanvasElement;
  let t0 = performance.now(), last = t0, raf = 0, running = false, inView = true, disposed = false;
  const S = {
    px: compact ? 0.8 : 0.72,
    py: compact ? 0.4 : 0.35,
    tx: compact ? 0.8 : 0.72,
    ty: compact ? 0.4 : 0.35,
    tilt: 0,
    lastMove: -1e9,
    ripples: [] as Ripple[],
  };

  function makeGlow() {
    const s = 64, c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, "rgba(214,255,120,.85)");
    r.addColorStop(0.25, "rgba(150,235,80,.4)");
    r.addColorStop(1, "rgba(200,241,105,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, s, s);
    return c;
  }
  const glow = makeGlow();

  function pos(xb: number, t: number): [number, number] {
    const off = Math.sin(t * 2.3 + 0.35) * W * 0.085 * t;
    return [vx + (xb - vx) * t + off, horizon + (fieldB - horizon) * t];
  }

  function build() {
    const r = hero.getBoundingClientRect();
    W = Math.max(compact ? 300 : 320, Math.round(r.width));
    H = Math.max(compact ? 300 : 480, Math.round(r.height));
    DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv2.width = Math.round(W * DPR);
    cv.height = cv2.height = Math.round(H * DPR);
    mob = W < 700;
    horizon = mob ? (compact ? Math.min(250, H * 0.42) : Math.min(H * 0.4, 380)) : H * 0.6;
    vx = W * (mob ? 0.62 : compact ? 0.72 : 0.68);
    fieldB = mob ? horizon + W * 1.3 : H * (compact ? 1.15 : 1.12);
    HS = mob ? (compact ? Math.min(520, H) : Math.min(H, 760)) : compact ? H * 1.5 : H;
    const mk = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
      const c = document.createElement("canvas");
      c.width = cv.width;
      c.height = cv.height;
      const g = c.getContext("2d")!;
      g.scale(DPR, DPR);
      return [c, g];
    };
    let g: CanvasRenderingContext2D;
    [skyC, g] = mk();
    let gr = g.createLinearGradient(0, 0, 0, horizon);
    gr.addColorStop(0, "#020D07");
    gr.addColorStop(0.45, "#063A20");
    gr.addColorStop(0.82, "#0E7A48");
    gr.addColorStop(1, "#3FB16C");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    [hillC, g] = mk();
    const ridge = (base: number, amp: number, f1: number, p1: number, f2: number, p2: number, c1: string, c2: string) => {
      const gg = g.createLinearGradient(0, base - amp * 1.2, 0, base + amp);
      gg.addColorStop(0, c1);
      gg.addColorStop(1, c2);
      g.beginPath();
      g.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) {
        const y = base - amp * (0.55 * Math.sin((x / W) * f1 * 6.283 + p1) + 0.45 * Math.sin((x / W) * f2 * 6.283 + p2));
        g.lineTo(x, y);
      }
      g.lineTo(W, H);
      g.closePath();
      g.fillStyle = gg;
      g.fill();
    };
    ridge(horizon - HS * 0.05, HS * 0.06, 1.1, 0.6, 2.6, 1.9, "#1B9456", "#0A5A33");
    ridge(horizon - HS * 0.016, HS * 0.04, 1.7, 2.2, 3.4, 0.4, "#0B7040", "#06482A");
    ridge(horizon - HS * 0.004, HS * 0.014, 2.4, 0.9, 5.1, 2.7, "#08592F", "#053A21");
    gr = g.createLinearGradient(0, horizon, 0, H);
    gr.addColorStop(0, "#0C7A44");
    gr.addColorStop(0.45, "#06502B");
    gr.addColorStop(1, "#02200F");
    g.fillStyle = gr;
    g.fillRect(0, horizon + HS * 0.012, W, H);
    const sp = clamp(W * 0.09, 70, 150), half = Math.ceil((W * 1.3) / sp) + 2, N = 44, rand = rng(11);
    const rows: [number, number][][] = [];
    for (let i = -half; i <= half; i++) {
      const xb = vx + i * sp, pts: [number, number][] = [];
      for (let k = 0; k <= 34; k++) pts.push(pos(xb, 0.012 + 1.06 * Math.pow(k / 34, 1.9)));
      rows.push(pts);
    }
    for (let i = 0; i < rows.length - 1; i += 2) {
      g.beginPath();
      rows[i].forEach((p, k) => (k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      for (let k = rows[i + 1].length - 1; k >= 0; k--) g.lineTo(rows[i + 1][k][0], rows[i + 1][k][1]);
      g.closePath();
      g.fillStyle = "rgba(190,255,200,.035)";
      g.fill();
    }
    g.lineWidth = 1;
    g.strokeStyle = "rgba(160,255,190,.085)";
    rows.forEach((pts) => {
      g.beginPath();
      pts.forEach((p, k) => (k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      g.stroke();
    });
    plants = [];
    for (let i = -half; i <= half; i++) {
      const xb = vx + i * sp;
      for (let k = 0; k < N; k++) {
        const t = 0.022 + 1.04 * Math.pow(k / (N - 1), 1.9), p = pos(xb, t), jx = (rand() - 0.5) * sp * 0.1 * t;
        const x = p[0] + jx, y = p[1];
        if (x < -50 || x > W + 50 || y > H + 30) continue;
        plants.push({ x, y, t, ph: rand() * 6.283, g: 0 });
      }
    }
    flies = [];
    const r2 = rng(5);
    for (let i = 0; i < (W < 700 ? 28 : 64); i++)
      flies.push({ x: r2() * W, y: lerp(horizon - HS * 0.16, mob ? fieldB : H, r2()), s: 0.5 + r2(), ph: r2() * 6.283, v: 0.006 + r2() * 0.012 });
  }

  function rr(x: number, y: number, w: number, h: number, r: number, fill: string) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function drawDrone(cx: number, cy: number, s: number, tilt: number, now: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.scale(s, s);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(200,241,105,.55)";
    ctx.shadowBlur = 30;
    ctx.strokeStyle = "#CDEED8";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-26, 16); ctx.lineTo(-40, 34); ctx.lineTo(-40, 54);
    ctx.moveTo(26, 16); ctx.lineTo(40, 34); ctx.lineTo(40, 54);
    ctx.stroke();
    ctx.strokeStyle = "#E8FBEF";
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(-26, -6); ctx.lineTo(-84, -10);
    ctx.moveTo(26, -6); ctx.lineTo(84, -10);
    ctx.stroke();
    ctx.shadowBlur = 0;
    rr(-101, -22, 30, 26, 10, "#E8FBEF");
    rr(71, -22, 30, 26, 10, "#E8FBEF");
    ctx.fillStyle = "#B7E3C6";
    ctx.fillRect(-88, -34, 4, 13);
    ctx.fillRect(84, -34, 4, 13);
    const f1 = 0.7 + 0.3 * Math.sin(now * 0.05), f2 = 0.7 + 0.3 * Math.sin(now * 0.05 + 1.7);
    ([[-86, f1], [86, f2]] as const).forEach(([x, f]) => {
      const w = 78 * f;
      ctx.fillStyle = "rgba(246, 230, 196, .34)";
      ctx.beginPath();
      ctx.ellipse(x, -38, w / 2 + 6, 6, 0, 0, 6.283);
      ctx.fill();
      rr(x - w / 2, -41, w, 6, 3, "#F6E6C4");
    });
    ctx.shadowColor = "rgba(200,241,105,.45)";
    ctx.shadowBlur = 26;
    rr(-31, -29, 62, 50, 17, "#F4FFF8");
    ctx.shadowBlur = 0;
    rr(-31, 6, 62, 15, 8, "#CFEBD9");
    rr(-19, -9, 38, 9, 4.5, "#0A3D73");
    ctx.fillStyle = "#0A3D73";
    ctx.beginPath(); ctx.arc(0, 27, 10, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#C8F169";
    ctx.beginPath(); ctx.arc(0, 27, 5.2, 0, 6.283); ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.8;
    ctx.drawImage(glow, -26, 1, 52, 52);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  function render(now: number, still: boolean) {
    const since = still ? 1e6 : now - t0, dt = Math.min(50, now - last);
    last = now;
    const sunP = ease(clamp(since / 3200, 0, 1)), droneP = ease(clamp((since - 700) / 2400, 0, 1)), beamA = smooth(clamp((since - 2100) / 1100, 0, 1));
    if (still) { S.tx = compact ? 0.8 : 0.72; S.ty = compact ? 0.4 : 0.36; }
    else if (now - S.lastMove > 3000) {
      if (compact) {
        S.tx = W >= 900 ? 0.8 + 0.1 * Math.sin(now * 0.00035) : 0.55 + 0.3 * Math.sin(now * 0.00035);
        S.ty = 0.4 + 0.15 * Math.sin(now * 0.0007 + 1.2);
      } else {
        S.tx = W >= 1000 ? 0.77 + 0.12 * Math.sin(now * 0.00035) : 0.5 + 0.3 * Math.sin(now * 0.00035);
        S.ty = 0.38 + 0.14 * Math.sin(now * 0.0007 + 1.2);
      }
    }
    const k = Math.min(1, dt * 0.0016), prev = S.px;
    S.px += (S.tx - S.px) * k;
    S.py += (S.ty - S.py) * k;
    const vel = ((S.px - prev) * W) / Math.max(dt, 1);
    S.tilt += (clamp(vel * 0.32, -0.2, 0.2) - S.tilt) * 0.05;
    const sc = compact
      ? (mob ? 0.5 : clamp(Math.min(W / 1400, H / 380), 0.42, 0.8))
      : clamp(W / 1250, 0.56, 1.2);
    const bob = still ? 0 : Math.sin(now * 0.0021) * (compact ? 5 : 6);
    const dy = compact
      ? (mob ? lerp(62, 130, S.py) : lerp(0.16, 0.36, S.py) * H) + bob - (1 - droneP) * H * 0.7
      : (mob ? lerp(120, 240, S.py) : lerp(0.2, 0.4, S.py) * H) + bob - (1 - droneP) * H * 0.62;
    const dx = S.px * W;
    const tc = clamp(S.py, 0, 1), gx = dx;
    const gy = compact
      ? horizon + (mob ? (fieldB - horizon) * lerp(0.03, 0.15, tc) : (H - horizon) * lerp(0.2, 0.75, tc))
      : horizon + (mob ? (fieldB - horizon) * lerp(0.1, 0.36, tc) : (H * 1.02 - horizon) * lerp(0.2, 0.62, tc));
    const tt = clamp((gy - horizon) / (fieldB - horizon), 0, 1);
    const rx = Math.max(lerp(compact ? 0.06 : 0.075, compact ? 0.14 : 0.2, tt) * W, compact ? 64 : 84), ry = rx * 0.3;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(skyC, 0, 0, W, H);
    const sx = W * (mob ? 0.7 : 0.74), sy = lerp(horizon + HS * 0.28, horizon - HS * 0.035, sunP), R = Math.max(W, HS) * 0.62;
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R);
    g.addColorStop(0, "rgba(255,240,160," + 0.6 * sunP + ")");
    g.addColorStop(0.16, "rgba(214,255,130," + 0.34 * sunP + ")");
    g.addColorStop(0.5, "rgba(95,211,138," + 0.1 * sunP + ")");
    g.addColorStop(1, "rgba(95,211,138,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255,247,200," + 0.95 * sunP + ")";
    ctx.beginPath(); ctx.arc(sx, sy, HS * 0.042, 0, 6.283); ctx.fill();
    ctx.drawImage(hillC, 0, 0, W, H);
    ctx.fillStyle = "rgba(1,9,5," + (1 - sunP) * 0.9 + ")";
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "lighter";
    for (const f of flies) {
      if (!still) {
        f.y -= f.v * dt;
        f.x += Math.sin(now * 0.0006 + f.ph) * 0.18;
        if (f.y < horizon - HS * 0.2) f.y = (mob ? fieldB : H) + 10;
      }
      ctx.globalAlpha = (0.25 + 0.45 * Math.abs(Math.sin(now * 0.0012 + f.ph))) * sunP;
      const s = 10 * f.s;
      ctx.drawImage(glow, f.x - s, f.y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    S.ripples = S.ripples.filter((r) => now - r.t0 < r.life);
    const introR = still ? 1e6 : (Math.max(0, since - 1200) / 1000) * 820, ox = vx, oy = mob ? fieldB + 60 : H * 1.2;
    const dim: Plant[][] = [[], [], []], bright: Plant[] = [];
    for (const p of plants) {
      let tgt = 0;
      const ddx = p.x - ox, ddy = p.y - oy, di = Math.sqrt(ddx * ddx + ddy * ddy);
      if (introR > di) tgt = 0.3;
      const wv = Math.abs(di - introR);
      if (!still && wv < 110 && introR < 2400) tgt = Math.max(tgt, Math.exp(-(wv / 70) * (wv / 70)) * 1.05);
      const nx = (p.x - gx) / rx, ny = (p.y - gy) / ry, f = 1 - (nx * nx + ny * ny);
      if (f > 0 && introR > di) tgt = Math.max(tgt, Math.pow(f, 0.7) * 1.08 * beamA);
      for (const r of S.ripples) {
        const age = (now - r.t0) / r.life, rad = ((now - r.t0) / 1000) * r.sp;
        const ex = p.x - r.x, ey = (p.y - r.y) * 1.5, d = Math.sqrt(ex * ex + ey * ey);
        const w = Math.exp(-((d - rad) / 62) * ((d - rad) / 62)) * (1 - age);
        if (w > 0.02) tgt = Math.max(tgt, w * 1.1);
      }
      p.g += (tgt - p.g) * Math.min(1, dt * 0.011);
      if (p.g < 0.02) continue;
      (p.g < 0.42 ? dim[p.t < 0.2 ? 0 : p.t < 0.5 ? 1 : 2] : bright).push(p);
    }
    const stem = (p: Plant, gk: number): [number, number] => {
      const h = (4 + 24 * p.t) * (0.3 + gk), sw = Math.sin(now * 0.0016 + p.ph) * h * 0.1 * (still ? 0 : 1);
      return [h, sw];
    };
    const leaf = (x: number, y: number, h: number, sw: number) => {
      ctx.moveTo(x, y); ctx.quadraticCurveTo(x, y - h * 0.6, x + sw, y - h);
      ctx.moveTo(x + sw * 0.5, y - h * 0.5); ctx.quadraticCurveTo(x + sw * 0.5 - h * 0.3, y - h * 0.56, x + sw * 0.7 - h * 0.4, y - h * 0.78);
      ctx.moveTo(x + sw * 0.5, y - h * 0.5); ctx.quadraticCurveTo(x + sw * 0.5 + h * 0.3, y - h * 0.56, x + sw * 0.7 + h * 0.4, y - h * 0.78);
    };
    ctx.lineCap = "round";
    const col = [[0.28, 1.0], [0.42, 1.4], [0.55, 1.9]];
    dim.forEach((arr, bi) => {
      if (!arr.length) return;
      ctx.beginPath();
      for (const p of arr) {
        const [h, sw] = stem(p, p.g);
        leaf(p.x, p.y, h, sw);
      }
      ctx.strokeStyle = "rgba(64,206,118," + col[bi][0] * 1.5 + ")";
      ctx.lineWidth = col[bi][1];
      ctx.stroke();
    });
    for (const p of bright) {
      const gk = clamp(p.g, 0, 1.2), c = clamp(p.g, 0, 1);
      const [h, sw] = stem(p, gk), x = p.x, y = p.y;
      ctx.strokeStyle = "rgba(" + Math.round(lerp(64, 214, c)) + "," + Math.round(lerp(206, 255, c)) + "," + Math.round(lerp(118, 122, c)) + "," + (0.8 + 0.2 * c) + ")";
      ctx.lineWidth = 0.8 + 2.2 * p.t;
      ctx.beginPath();
      leaf(x, y, h, sw);
      ctx.stroke();
      if (p.g > 0.5) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = clamp((p.g - 0.45) * 1.3, 0, 1) * 0.9;
        const s = (5 + 26 * p.t) * c;
        ctx.drawImage(glow, x + sw - s, y - h - s, s * 2, s * 2);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    }

    const lensY = dy + 27 * sc, lensX = dx + Math.sin(S.tilt) * 27 * sc;
    if (beamA > 0.01) {
      ctx.globalCompositeOperation = "lighter";
      const bg = ctx.createLinearGradient(0, lensY, 0, gy);
      bg.addColorStop(0, "rgba(226,255,140," + 0.5 * beamA + ")");
      bg.addColorStop(1, "rgba(200,241,105," + 0.07 * beamA + ")");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(lensX - 7 * sc, lensY); ctx.lineTo(lensX + 7 * sc, lensY); ctx.lineTo(gx + rx * 0.92, gy);
      ctx.quadraticCurveTo(gx, gy + ry * 1.15, gx - rx * 0.92, gy);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(1, ry / rx);
      const eg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      eg.addColorStop(0, "rgba(236,255,170," + 0.55 * beamA + ")");
      eg.addColorStop(0.6, "rgba(200,241,105," + 0.16 * beamA + ")");
      eg.addColorStop(1, "rgba(200,241,105,0)");
      ctx.fillStyle = eg;
      ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.283); ctx.fill();
      ctx.setLineDash([10, 14]);
      ctx.lineDashOffset = -now * 0.02;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(236,255,170," + 0.5 * beamA + ")";
      ctx.beginPath(); ctx.arc(0, 0, rx * 0.8, 0, 6.283); ctx.stroke();
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
    }
    ctx2.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx2.clearRect(0, 0, W, H);
    ctx = ctx2;
    drawDrone(dx, dy, sc, S.tilt, now);
    ctx = ctxMain;
  }

  function loop(now: number) {
    if (!running) return;
    render(now, false);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduce || disposed) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function sync() {
    if (inView && !document.hidden) start();
    else stop();
  }

  const rect = () => hero.getBoundingClientRect();
  const onMove = (e: PointerEvent) => {
    const r = rect();
    S.tx = clamp((e.clientX - r.left) / W, 0.12, 0.9);
    S.ty = clamp((e.clientY - r.top) / H, 0, 1);
    S.lastMove = performance.now();
    hint?.classList.add("gone");
  };
  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,input")) return;
    const r = rect();
    S.ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now(), sp: 560, life: 1900 });
    S.lastMove = performance.now();
    hint?.classList.add("gone");
  };
  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerdown", onDown);
  const onPulse = () => {
    S.ripples.push({ x: W * 0.5, y: H * 1.1, t0: performance.now(), sp: 760, life: 2400 });
  };
  window.addEventListener("agrimika:pulse", onPulse);
  const io = new IntersectionObserver((es) => {
    inView = es[0].isIntersecting;
    sync();
  }, { threshold: 0 });
  io.observe(hero);
  document.addEventListener("visibilitychange", sync);
  let rt: ReturnType<typeof setTimeout>;
  const ro = new ResizeObserver(() => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      build();
      if (reduce) render(performance.now(), true);
    }, 120);
  });
  ro.observe(hero);
  build();
  if (reduce) render(performance.now(), true);
  else {
    t0 = performance.now();
    start();
  }

  return () => {
    disposed = true;
    stop();
    clearTimeout(rt);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", sync);
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerdown", onDown);
    window.removeEventListener("agrimika:pulse", onPulse);
  };
}
