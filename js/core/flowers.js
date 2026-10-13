// Procedural SVG flowers. Every renderer draws around the origin and returns
// { svg, r } where r is the drawn outer radius (used to scale it into the bouquet).
import { shades, tone, mix, lightness, F, petalPath, GOLDEN, radialGrad, linearGrad } from './util.js';

const RAD = Math.PI / 180;

function shadowDisc(defs, color, r, op = 1) {
  const g = radialGrad(defs, 'sd' + color, [[0, color, 0.6], [0.7, color, 0.42], [1, color, 0]], { cx: 0.5, cy: 0.5, r: 0.5 });
  return `<circle r="${F(r)}" fill="${g}" opacity="${op}"/>`;
}

function dew(rng, r, defs, n = 3) {
  const g = radialGrad(defs, 'dew', [[0, '#ffffff', 0.85], [0.5, '#ffffff', 0.22], [1, '#ffffff', 0.08]], { cx: 0.35, cy: 0.35, r: 0.75 });
  let o = '';
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2, d = r * (0.25 + rng() * 0.55);
    const x = Math.cos(a) * d, y = Math.sin(a) * d, s = 1.3 + rng() * 1.5;
    o += `<ellipse cx="${F(x)}" cy="${F(y + s * 0.3)}" rx="${F(s)}" ry="${F(s * 0.85)}" fill="#000" opacity=".13"/>`;
    o += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(s)}" ry="${F(s * 0.88)}" fill="${g}" stroke="#fff" stroke-opacity=".55" stroke-width=".3"/>`;
    o += `<circle cx="${F(x - s * 0.35)}" cy="${F(y - s * 0.35)}" r="${F(s * 0.28)}" fill="#fff"/>`;
  }
  return o;
}

/* ---------------- Rose ---------------- */
function rose({ hex, grade, stage, rng, defs }) {
  const s = shades(hex), k = 'ro' + hex;
  const gO = radialGrad(defs, k + 'o', [[0, s.deep], [0.42, s.dark], [0.8, s.base], [1, s.light]], { r: 1.05 });
  const gM = radialGrad(defs, k + 'm', [[0, s.deep], [0.55, s.dark], [0.88, s.base], [1, s.light]], { r: 1.05 });
  const gI = radialGrad(defs, k + 'i', [[0, s.deep], [0.6, s.deep], [0.9, s.dark], [1, s.base]], { r: 1.05 });
  const gC = radialGrad(defs, k + 'c', [[0, s.deep], [0.7, s.dark], [1, s.base]], { cx: 0.5, cy: 0.5, r: 0.6 });
  let layers = [
    { n: 6, r: 54, ru: 0.07 }, { n: 5, r: 48, ru: 0.06 }, { n: 5, r: 41, ru: 0.05 },
    { n: 5, r: 34, ru: 0.03 }, { n: 4, r: 26 }, { n: 4, r: 19 },
  ];
  if (grade < 2) layers.shift();
  if (grade === 0) layers.splice(2, 1);
  const drop = [3, 1, 0][stage];
  layers = layers.slice(Math.min(drop, layers.length - 2));
  const R = layers[0].r;
  let o = '';
  let rot = rng() * 360;
  layers.forEach((Ly, i) => {
    const depth = i / Math.max(1, layers.length - 1);
    if (i > 0) o += shadowDisc(defs, s.deep, Ly.r * 1.2, 0.85);
    const g = depth < 0.34 ? gO : depth < 0.7 ? gM : gI;
    rot += 180 / Ly.n + rng() * 24;
    for (let p = 0; p < Ly.n; p++) {
      const a = rot + (p * 360) / Ly.n + (rng() - 0.5) * 12;
      const L = Ly.r * (0.93 + rng() * 0.12), W = L * Math.sin(Math.PI / Ly.n) * 1.34;
      const d = petalPath(L, W, { tip: Ly.ru ? 'ruffle' : 'round', ruffle: Ly.ru || 0, bumps: 2, widest: 0.64, rng, jitter: 0.025 });
      o += `<path d="${d}" transform="rotate(${F(a)})" fill="${g}" stroke="${s.light}" stroke-opacity=".6" stroke-width=".8"/>`;
    }
  });
  const cr = layers[layers.length - 1].r * 0.66;
  o += shadowDisc(defs, s.deep, cr * 1.35, 1);
  // tight spiral heart of the rose
  const a0 = rng() * Math.PI * 2;
  for (let q = 0; q < 5; q++) {
    const rho = cr * (1 - q * 0.17), a = a0 + q * 2.4;
    const cx = Math.cos(a) * rho * 0.16, cy = Math.sin(a) * rho * 0.16;
    const a1 = a - 1.9, a2 = a + 1.9;
    const p1 = [cx + rho * Math.cos(a1), cy + rho * Math.sin(a1)];
    const p2 = [cx + rho * Math.cos(a2), cy + rho * Math.sin(a2)];
    const qq = [cx + Math.cos(a) * rho * 0.15, cy + Math.sin(a) * rho * 0.15];
    o += `<path d="M${F(p1[0])} ${F(p1[1])}A${F(rho)} ${F(rho)} 0 1 1 ${F(p2[0])} ${F(p2[1])}Q${F(qq[0])} ${F(qq[1])} ${F(p1[0])} ${F(p1[1])}Z" fill="${gC}" stroke="${s.light}" stroke-opacity=".55" stroke-width=".6"/>`;
  }
  o += `<circle r="${F(cr * 0.15)}" fill="${s.deep}"/>`;
  if (grade === 2) o += dew(rng, R * 0.8, defs, 3);
  return { svg: o, r: R };
}

/* ---------------- Peony ---------------- */
function peony({ hex, grade, stage, rng, defs }) {
  const s = shades(hex), k = 'pe' + hex;
  const gO = radialGrad(defs, k + 'o', [[0, s.dark], [0.5, s.base], [0.85, s.light], [1, s.pale]], { r: 1.05 });
  const gM = radialGrad(defs, k + 'm', [[0, s.deep], [0.45, s.dark], [0.85, s.base], [1, s.light]], { r: 1.05 });
  const gI = radialGrad(defs, k + 'i', [[0, s.deep], [0.55, s.dark], [1, s.base]], { r: 1.05 });
  let layers = [
    { n: 10, r: 56 }, { n: 9, r: 50 }, { n: 8, r: 44 }, { n: 8, r: 38 },
    { n: 7, r: 32 }, { n: 7, r: 26 }, { n: 6, r: 20 }, { n: 6, r: 15 },
  ];
  if (grade < 2) layers.shift();
  if (grade === 0) layers.splice(2, 2);
  const drop = [4, 1, 0][stage];
  layers = layers.slice(Math.min(drop, layers.length - 3));
  const R = layers[0].r;
  let o = '';
  let rot = rng() * 360;
  layers.forEach((Ly, i) => {
    const depth = i / Math.max(1, layers.length - 1);
    if (i > 0) o += shadowDisc(defs, s.deep, Ly.r * 1.18, 0.6);
    const g = depth < 0.4 ? gO : depth < 0.75 ? gM : gI;
    rot += 180 / Ly.n + rng() * 30;
    for (let p = 0; p < Ly.n; p++) {
      const a = rot + (p * 360) / Ly.n + (rng() - 0.5) * 30;
      const L = Ly.r * (0.84 + rng() * 0.22), W = L * Math.sin(Math.PI / Ly.n) * 1.8;
      const d = petalPath(L, W, { tip: 'ruffle', bumps: 3, ruffle: 0.09, widest: 0.7, rng, jitter: 0.04 });
      o += `<path d="${d}" transform="rotate(${F(a)})" fill="${g}" stroke="${s.pale}" stroke-opacity=".5" stroke-width=".7"/>`;
    }
  });
  // crinkled centre
  const cr = layers[layers.length - 1].r;
  o += shadowDisc(defs, s.deep, cr * 0.95, 0.9);
  for (let i = 0; i < 9; i++) {
    const a = rng() * 360, L = cr * (0.45 + rng() * 0.3);
    const tx = (rng() - 0.5) * cr * 0.35, ty = (rng() - 0.5) * cr * 0.35;
    o += `<path d="${petalPath(L, L * 0.75, { tip: 'ruffle', bumps: 3, ruffle: 0.16, rng, jitter: 0.06 })}" transform="translate(${F(tx)} ${F(ty)}) rotate(${F(a)})" fill="${gM}" stroke="${s.light}" stroke-opacity=".5" stroke-width=".5"/>`;
  }
  if (stage === 2 && grade >= 1) {
    for (let i = 0; i < 12; i++) {
      const a = rng() * Math.PI * 2, d = cr * (0.1 + rng() * 0.3);
      o += `<circle cx="${F(Math.cos(a) * d)}" cy="${F(Math.sin(a) * d)}" r="${F(0.9 + rng() * 0.6)}" fill="#e9c35a"/>`;
    }
  }
  if (grade === 2) o += dew(rng, R * 0.75, defs, 3);
  return { svg: o, r: R };
}

/* ---------------- Carnation ---------------- */
function carnation({ hex, grade, stage, rng, defs }) {
  const s = shades(hex), k = 'ca' + hex;
  const gO = radialGrad(defs, k + 'o', [[0, s.deep], [0.5, s.dark], [0.85, s.base], [1, s.pale]], { r: 1.05 });
  const gI = radialGrad(defs, k + 'i', [[0, s.deep], [0.6, s.dark], [1, s.light]], { r: 1.05 });
  let layers = [{ n: 12, r: 50 }, { n: 11, r: 45 }, { n: 10, r: 39 }, { n: 9, r: 33 }, { n: 8, r: 26 }, { n: 7, r: 19 }, { n: 6, r: 12 }];
  if (grade < 2) layers.shift();
  if (grade === 0) layers.splice(1, 1);
  const drop = [3, 1, 0][stage];
  layers = layers.slice(Math.min(drop, layers.length - 3));
  const R = layers[0].r;
  let o = '';
  let rot = rng() * 360;
  layers.forEach((Ly, i) => {
    if (i > 0) o += shadowDisc(defs, s.deep, Ly.r * 1.15, 0.55);
    const g = i < layers.length / 2 ? gO : gI;
    rot += 180 / Ly.n + rng() * 30;
    for (let p = 0; p < Ly.n; p++) {
      const a = rot + (p * 360) / Ly.n + (rng() - 0.5) * 22;
      const L = Ly.r * (0.85 + rng() * 0.2), W = L * Math.sin(Math.PI / Ly.n) * 1.7;
      const d = petalPath(L, W, { tip: 'fringe', teeth: 5, toothDepth: 0.18, widest: 0.66, rng, jitter: 0.03, tension: 0.8 });
      o += `<path d="${d}" transform="rotate(${F(a)})" fill="${g}" stroke="${s.pale}" stroke-opacity=".7" stroke-width=".7"/>`;
    }
  });
  if (grade === 2) o += dew(rng, R * 0.7, defs, 2);
  return { svg: o, r: R };
}

/* ---------------- Sunflower ---------------- */
function sunflower({ hex, grade, stage, rng, defs }) {
  const s = shades(hex), k = 'sf' + hex;
  const gP = radialGrad(defs, k + 'p', [[0, s.deep], [0.28, s.dark], [0.7, s.base], [1, s.light]], { r: 1.05 });
  const gB = radialGrad(defs, k + 'b', [[0, s.deep], [0.5, s.dark], [1, s.base]], { r: 1.05 });
  const n = [18, 22, 28][grade], Lp = [30, 44, 52][stage], cr = [18, 18.5, 19.5][stage];
  let o = '';
  const rot = rng() * 360;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 360) / n + (rng() - 0.5) * 6, L = Lp * (0.93 + rng() * 0.12);
    o += `<path d="${petalPath(L, L * 0.18, { tip: 'point', widest: 0.45, rng, jitter: 0.03 })}" transform="rotate(${F(a)})" fill="${gB}" stroke="${s.deep}" stroke-opacity=".3" stroke-width=".5"/>`;
  }
  for (let i = 0; i < n; i++) {
    const a = rot + ((i + 0.5) * 360) / n + (rng() - 0.5) * 6, L = Lp * (0.84 + rng() * 0.12);
    o += `<path d="${petalPath(L, L * 0.19, { tip: 'point', widest: 0.45, rng, jitter: 0.03 })}" transform="rotate(${F(a)})" fill="${gP}" stroke="${s.deep}" stroke-opacity=".25" stroke-width=".5"/>`;
  }
  const gD = radialGrad(defs, 'sfdisk', [[0, '#2b170a'], [0.5, '#3f2511'], [0.8, '#5b3916'], [0.92, '#6e4c1d'], [1, '#2e1a0b']], { cx: 0.5, cy: 0.5, r: 0.5 });
  o += `<circle r="${F(cr + 3)}" fill="#2a170a" opacity=".35"/>`;
  o += `<circle r="${F(cr)}" fill="${gD}"/>`;
  const m = Math.round(cr * cr * 0.38);
  for (let i = 1; i < m; i++) {
    const rr = Math.sqrt(i / m) * cr * 0.9, th = i * GOLDEN;
    const sz = 0.45 + 0.55 * (rr / cr);
    o += `<circle cx="${F(Math.cos(th) * rr)}" cy="${F(Math.sin(th) * rr)}" r="${F(sz)}" fill="${i % 3 ? '#7a5422' : '#1a0e06'}"/>`;
  }
  o += `<ellipse cx="${F(-cr * 0.3)}" cy="${F(-cr * 0.35)}" rx="${F(cr * 0.45)}" ry="${F(cr * 0.3)}" fill="#fff" opacity=".08"/>`;
  return { svg: o, r: Lp + 2 };
}

/* ---------------- Daisy ---------------- */
function daisy({ hex, grade, stage, rng, defs }) {
  const k = 'da' + hex;
  const shade = mix(hex, '#8f8a70', 0.38);
  const g = radialGrad(defs, k, [[0, tone(shade, { l: -6 })], [0.38, hex], [1, tone(hex, { l: 3 })]], { r: 1.05 });
  const gb = radialGrad(defs, k + 'b', [[0, tone(shade, { l: -10 })], [0.5, shade], [1, mix(hex, shade, 0.4)]], { r: 1.05 });
  const n = [16, 21, 26][grade], L = [22, 36, 44][stage], cr = [12, 11, 11][stage];
  let o = '';
  const rot = rng() * 360;
  for (let i = 0; i < n; i++) {
    const a = rot + ((i + 0.5) * 360) / n, LL = L * (0.9 + rng() * 0.12);
    o += `<path d="${petalPath(LL, 5.2, { tip: 'notch', widest: 0.55, rng, jitter: 0.03 })}" transform="rotate(${F(a)})" fill="${gb}"/>`;
  }
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 360) / n + (rng() - 0.5) * 5, LL = L * (0.92 + rng() * 0.12);
    o += `<path d="${petalPath(LL, 5.4, { tip: 'notch', widest: 0.55, rng, jitter: 0.03 })}" transform="rotate(${F(a)})" fill="${g}" stroke="${shade}" stroke-opacity=".35" stroke-width=".5"/>`;
  }
  const gc = radialGrad(defs, 'dacenter', [[0, '#fbe27a'], [0.55, '#f2b62b'], [1, '#bf7f0f']], { cx: 0.42, cy: 0.4, r: 0.62 });
  o += `<circle r="${cr + 2}" fill="#6b5a2a" opacity=".25"/>`;
  o += `<circle r="${cr}" fill="${gc}"/>`;
  for (let i = 1; i < 55; i++) {
    const rr = Math.sqrt(i / 55) * cr * 0.9, th = i * GOLDEN;
    o += `<circle cx="${F(Math.cos(th) * rr)}" cy="${F(Math.sin(th) * rr)}" r=".65" fill="#b77a0c" opacity=".7"/>`;
  }
  return { svg: o, r: L };
}

/* ---------------- Lily ---------------- */
function lily({ hex, grade, stage, rng, defs, cdef }) {
  const s = shades(hex), k = 'li' + hex;
  const throat = mix(hex, '#cdd86c', 0.55);
  const edge = lightness(hex) > 85 ? hex : tone(hex, { l: 16, s: -12 });
  const g = radialGrad(defs, k, [[0, throat], [0.3, tone(hex, { l: -4 })], [0.72, hex], [1, edge]], { r: 1.05 });
  const L = [26, 40, 52][stage], Wb = L * 0.3, Wf = L * 0.25;
  const rot = rng() * 360;
  let o = '';
  for (const i of [0, 2, 4, 1, 3, 5]) {
    const back = i % 2 === 0;
    const a = rot + i * 60 + (rng() - 0.5) * 8;
    const Lp = L * (back ? 1 : 0.94) * (0.95 + rng() * 0.08);
    o += `<g transform="rotate(${F(a)})"><path d="${petalPath(Lp, back ? Wb : Wf, { tip: 'point', widest: 0.42, rng, jitter: 0.02 })}" fill="${g}" stroke="${s.dark}" stroke-opacity=".28" stroke-width=".6"/>`;
    o += `<path d="M0 -4Q${F((rng() - 0.5) * 3)} ${F(-Lp * 0.45)} 0 ${F(-Lp * 0.82)}" stroke="${tone(hex, { l: -14 })}" stroke-opacity=".32" stroke-width="1.1" fill="none"/>`;
    if (cdef?.spots && stage > 0) {
      for (let q = 0; q < 9; q++) {
        const t = 0.14 + rng() * 0.42;
        o += `<circle cx="${F((rng() - 0.5) * Wf * 0.9 * (1 - t))}" cy="${F(-Lp * t)}" r="${F(0.5 + rng() * 0.9)}" fill="${tone(hex, { l: -26, s: 10 })}" opacity=".85"/>`;
      }
    }
    o += '</g>';
  }
  if (stage > 0) {
    const sl = L * 0.55;
    for (let i = 0; i < 6; i++) {
      const a = (rot + 30 + i * 60 + (rng() - 0.5) * 16) * RAD, len = sl * (0.9 + rng() * 0.2);
      const ex = Math.cos(a) * len, ey = Math.sin(a) * len;
      const cx = Math.cos(a + 0.25) * len * 0.5, cy = Math.sin(a + 0.25) * len * 0.5;
      o += `<path d="M0 0Q${F(cx)} ${F(cy)} ${F(ex)} ${F(ey)}" stroke="#dfe3b4" stroke-width="1.1" fill="none"/>`;
      o += `<ellipse cx="${F(ex)}" cy="${F(ey)}" rx="3.3" ry="1.3" transform="rotate(${F(a / RAD + 90)} ${F(ex)} ${F(ey)})" fill="#8f3f18"/>`;
    }
    const pa = rng() * Math.PI * 2;
    o += `<path d="M0 0L${F(Math.cos(pa) * sl * 0.8)} ${F(Math.sin(pa) * sl * 0.8)}" stroke="#cfd88e" stroke-width="1.6"/>`;
    o += `<circle cx="${F(Math.cos(pa) * sl * 0.8)}" cy="${F(Math.sin(pa) * sl * 0.8)}" r="2.2" fill="#b9c56a"/>`;
  }
  if (grade === 2) o += dew(rng, L * 0.7, defs, 3);
  return { svg: o, r: L };
}

/* ---------------- Tulip (side view, upright) ---------------- */
function tulip({ hex, grade, stage, rng, defs }) {
  const s = shades(hex), k = 'tu' + hex;
  const g = linearGrad(defs, k, [[0, mix(s.dark, '#7d8f3c', 0.3)], [0.25, s.dark], [0.65, s.base], [1, s.light]], { x1: 0, y1: 1, x2: 0, y2: 0 });
  const gb = linearGrad(defs, k + 'b', [[0, s.deep], [0.5, s.dark], [1, s.base]], { x1: 0, y1: 1, x2: 0, y2: 0 });
  const open = [0.75, 1, 1.22][stage];
  const back = 'M0 22C-12 22-19 8-18-8C-17-22-10-33-2-41C6-30 14-18 14-4C14 10 10 22 0 22Z';
  const front = 'M0 23C-15 23-22 10-21-6C-20-20-12-31 0-38C12-31 20-20 21-6C22 10 15 23 0 23Z';
  let o = '';
  if (stage === 2) o += `<ellipse cx="0" cy="-26" rx="14" ry="6" fill="${s.deep}"/>`;
  o += `<path d="${back}" transform="translate(${F(-6 * open)} 0) rotate(${F(-9 * open)})" fill="${gb}" stroke="${s.deep}" stroke-opacity=".3" stroke-width=".6"/>`;
  o += `<path d="${back}" transform="translate(${F(6 * open)} 0) scale(-1 1) rotate(${F(-9 * open)})" fill="${gb}" stroke="${s.deep}" stroke-opacity=".3" stroke-width=".6"/>`;
  o += `<path d="${front}" transform="scale(${F(0.82 + open * 0.14)} 1)" fill="${g}" stroke="${s.deep}" stroke-opacity=".3" stroke-width=".6"/>`;
  o += `<path d="M0 20Q-2 -6 0 -34" stroke="${s.light}" stroke-opacity=".4" stroke-width="1.2" fill="none"/>`;
  o += `<ellipse cx="-8" cy="-6" rx="3.2" ry="13" transform="rotate(8 -8 -6)" fill="#fff" opacity=".16"/>`;
  o += `<path d="M-3 23Q0 30 0 34" stroke="#6b8a45" stroke-width="3.2" fill="none"/>`;
  if (grade === 2) o += dew(rng, 16, defs, 2);
  void rng;
  return { svg: o, r: 40 };
}

/* ---------------- Hydrangea ---------------- */
function hydrangea({ hex, grade, stage, rng, defs }) {
  const base = stage === 0 ? mix(hex, '#b7cf8c', 0.5) : stage === 1 ? mix(hex, '#d2e2a8', 0.15) : hex;
  const R = [34, 44, 50][stage];
  const n = Math.round([24, 32, 42][grade] * (R / 50) ** 1.2);
  const glow = radialGrad(defs, 'hyglow', [[0, '#ffffff', 0.35], [1, '#ffffff', 0]], { cx: 0.5, cy: 0.5, r: 0.5 });
  const pts = [];
  const rot = rng() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const rr = Math.sqrt((i + 0.3) / n) * R * 0.8, th = rot + i * GOLDEN;
    pts.push([Math.cos(th) * rr + (rng() - 0.5) * 3, Math.sin(th) * rr + (rng() - 0.5) * 3]);
  }
  pts.sort((a, b) => Math.hypot(b[0], b[1]) - Math.hypot(a[0], a[1]));
  let o = `<circle r="${F(R * 0.88)}" fill="${tone(base, { l: -30 })}" opacity=".55"/>`;
  for (const [x, y] of pts) {
    const d = Math.hypot(x, y) / R;
    const col = tone(base, { l: (rng() - 0.5) * 12 - 16 * d * d, h: (rng() - 0.5) * 12, s: (rng() - 0.5) * 10 });
    const f = (R / 50) * (9 + rng() * 2.5) * (1 - 0.12 * d);
    const fr = rng() * 90;
    o += `<g transform="translate(${F(x)} ${F(y)})"><circle cy="1.6" r="${F(f * 0.9)}" fill="${tone(base, { l: -38 })}" opacity=".22"/>`;
    for (let j = 0; j < 4; j++) {
      o += `<path d="${petalPath(f, f * 0.72, { tip: 'round', widest: 0.62 })}" transform="rotate(${F(fr + j * 90)})" fill="${col}" stroke="${tone(col, { l: -14 })}" stroke-opacity=".55" stroke-width=".45"/>`;
    }
    o += `<circle r="${F(f * 0.85)}" fill="${glow}"/><circle r="${F(f * 0.13)}" fill="${tone(col, { l: -22 })}"/></g>`;
  }
  return { svg: o, r: R };
}

/* ---------------- Lavender (sprig, points up from anchor) ---------------- */
function lavender({ hex, grade, rng, defs }) {
  const s = shades(hex);
  const g = radialGrad(defs, 'lv' + hex, [[0, s.light], [0.6, s.base], [1, s.dark]], { cx: 0.4, cy: 0.35, r: 0.75 });
  const spikes = [2, 3, 4][grade];
  let o = '';
  for (let j = 0; j < spikes; j++) {
    const ang = (j - (spikes - 1) / 2) * 11 + (rng() - 0.5) * 6, len = 100 + rng() * 25;
    o += `<g transform="rotate(${F(ang)})"><path d="M0 0Q${F((rng() - 0.5) * 6)} ${F(-len * 0.5)} 0 ${F(-len)}" stroke="#6b8a55" stroke-width="1.6" fill="none"/>`;
    const m = 18;
    for (let i = 0; i < m; i++) {
      const t = 0.38 + (0.62 * i) / (m - 1), y = -len * t, side = i % 2 ? 1 : -1, sz = 1 - t * 0.45;
      const x = side * 2.2 * sz;
      o += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(3.1 * sz)}" ry="${F(4.4 * sz)}" transform="rotate(${side * 22} ${F(x)} ${F(y)})" fill="${g}"/>`;
    }
    o += `<ellipse cx="0" cy="${F(-len - 2)}" rx="1.8" ry="3" fill="${g}"/></g>`;
  }
  return { svg: o, r: 60 };
}

/* ---------------- Eucalyptus (sprig) ---------------- */
function eucalyptus({ hex, grade, rng, defs }) {
  const s = shades(hex);
  const g = radialGrad(defs, 'eu' + hex, [[0, s.pale], [0.35, s.light], [0.75, s.base], [1, s.dark]], { cx: 0.42, cy: 0.4, r: 0.7 });
  const len = 115 + rng() * 20, bend = (rng() - 0.5) * 34;
  const P0 = [0, 0], C = [bend * 0.6, -len * 0.5], P2 = [bend, -len];
  const at = (t) => [
    (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * C[0] + t * t * P2[0],
    (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * C[1] + t * t * P2[1],
  ];
  const tan = (t) => [2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P2[0] - C[0]), 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P2[1] - C[1])];
  let o = `<path d="M0 0Q${F(C[0])} ${F(C[1])} ${F(P2[0])} ${F(P2[1])}" stroke="#7d6a5a" stroke-width="1.6" fill="none"/>`;
  const pairs = [5, 6, 7][grade];
  for (let i = pairs - 1; i >= 0; i--) {
    const t = 0.16 + (0.84 * i) / (pairs - 1);
    const [px, py] = at(t), [tx, ty] = tan(t);
    const tl = Math.hypot(tx, ty), nx = -ty / tl, ny = tx / tl;
    const r = 13 * (1 - t * 0.42);
    for (const side of [-1, 1]) {
      const cx = px + nx * r * 0.85 * side, cy = py + ny * r * 0.85 * side;
      o += `<ellipse cx="${F(cx)}" cy="${F(cy)}" rx="${F(r)}" ry="${F(r * 0.9)}" fill="${g}" stroke="${s.dark}" stroke-opacity=".4" stroke-width=".6"/>`;
      o += `<path d="M${F(px)} ${F(py)}L${F(cx)} ${F(cy)}" stroke="${s.dark}" stroke-opacity=".3" stroke-width=".6"/>`;
    }
  }
  return { svg: o, r: 50 };
}

/* ---------------- Baby's breath (filler) ---------------- */
function babysbreath({ hex, grade, rng, defs }) {
  const g = radialGrad(defs, 'bb' + hex, [[0, '#ffffff'], [0.6, hex], [1, tone(hex, { l: -14 })]], { cx: 0.4, cy: 0.4, r: 0.7 });
  const branches = [6, 8, 10][grade];
  let o = '', fl = '';
  for (let b = 0; b < branches; b++) {
    const a = (-90 + (rng() - 0.5) * 220) * RAD, len = 16 + rng() * 22;
    const ex = Math.cos(a) * len, ey = Math.sin(a) * len;
    o += `<path d="M0 8Q${F(ex * 0.4 + (rng() - 0.5) * 8)} ${F(ey * 0.5)} ${F(ex)} ${F(ey)}" stroke="#8aa070" stroke-width=".8" fill="none"/>`;
    const m = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < m; i++) {
      const fx = ex + (rng() - 0.5) * 15, fy = ey + (rng() - 0.5) * 13, r = 2.4 + rng() * 1.8;
      o += `<path d="M${F(ex)} ${F(ey)}L${F(fx)} ${F(fy)}" stroke="#93a87a" stroke-width=".5"/>`;
      fl += `<circle cx="${F(fx)}" cy="${F(fy)}" r="${F(r)}" fill="${g}"/><circle cx="${F(fx)}" cy="${F(fy)}" r="${F(r * 0.3)}" fill="#d6dbbb"/>`;
    }
  }
  return { svg: o + fl, r: 38 };
}

export const RENDERERS = { rose, tulip, peony, sunflower, lily, carnation, daisy, hydrangea, lavender, eucalyptus, babysbreath };

export function renderFlower(type, ctx) {
  return (RENDERERS[type] || rose)(ctx);
}

/* ---------------- Greenery leaf (used by the bouquet composer) ---------------- */
const LEAF_GREENS = ['#3e5c3a', '#4b6b40', '#5c7b47', '#36513a', '#6a8650'];
export function leaf(defs, rng, L) {
  const col = LEAF_GREENS[Math.floor(rng() * LEAF_GREENS.length)];
  const g = linearGrad(defs, 'lf' + col, [[0, tone(col, { l: -10 })], [0.55, col], [1, tone(col, { l: 12, s: -5 })]], { x1: 0, y1: 1, x2: 0, y2: 0 });
  const W = L * (0.2 + rng() * 0.1);
  const d = petalPath(L, W, { tip: 'point', widest: 0.45, rng, jitter: 0.03 });
  return `<path d="${d}" fill="${g}" stroke="${tone(col, { l: -16 })}" stroke-opacity=".4" stroke-width=".8"/>` +
    `<path d="M0 -2Q${F(W * 0.12)} ${F(-L * 0.5)} 0 ${F(-L * 0.92)}" stroke="${tone(col, { l: 18 })}" stroke-opacity=".45" stroke-width="1" fill="none"/>`;
}
