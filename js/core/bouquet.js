// Composes a full bouquet SVG: paper wrap, greenery, stems, flowers, ribbon.
import { FLOWERS, GRADES, STAGES, SIZES, WRAPS, RIBBONS, colorOf } from './catalog.js';
import { renderFlower, leaf } from './flowers.js';
import { boundaryAt, pointsInShape } from './layout.js';
import { syncPlacement, expandStems, groupKeys } from './placement.js';
import { Defs, F, rngFrom, tone, mix, radialGrad, linearGrad, hashStr } from './util.js';

/* One defs registry + flower cache per SVG document prefix. */
const CTX = new Map();
function ctxFor(prefix) {
  if (!CTX.has(prefix)) CTX.set(prefix, { defs: new Defs(prefix), cache: new Map() });
  return CTX.get(prefix);
}

function flowerFor(ctx, st) {
  const key = `${st.type}|${st.color}|${st.grade}|${st.stage}|${st.seed}`;
  let v = ctx.cache.get(key);
  if (!v) {
    const cdef = colorOf(st.type, st.color);
    v = renderFlower(st.type, { hex: cdef.hex, cdef, grade: st.grade, stage: st.stage, rng: rngFrom(st.seed, 'f'), defs: ctx.defs });
    ctx.cache.set(key, v);
  }
  return v;
}

export { expandStems };

export function stemCount(design) {
  return design.groups.reduce((a, g) => a + groupKeys(g).length, 0);
}

/* ---------------- paper & ribbon ---------------- */
const dirUp = (deg) => [Math.sin(deg * Math.PI / 180), -Math.cos(deg * Math.PI / 180)];

function backWrap(defs, D, wrap, neckY) {
  const sheets = [
    { ang: 0, L: 2.3, hw: 17, col: wrap.outer },
    { ang: -29, L: 1.9, hw: 13, col: wrap.outer },
    { ang: 30, L: 1.92, hw: 13, col: wrap.outer },
    { ang: -16, L: 2.12, hw: 13, col: wrap.inner },
    { ang: 18, L: 2.1, hw: 13, col: wrap.inner },
  ];
  const shade = linearGrad(defs, 'wrapshade', [[0, '#2a1a12', 0.32], [0.55, '#2a1a12', 0.06], [1, '#2a1a12', 0]], { x1: 0, y1: neckY, x2: 0, y2: -D * 1.2, units: 'userSpaceOnUse' });
  let o = '';
  for (const sh of sheets) {
    const L = sh.L * D;
    const B = [0, neckY];
    const pt = (deg, len) => { const [dx, dy] = dirUp(deg); return [B[0] + dx * len, B[1] + dy * len]; };
    const lc = pt(sh.ang - sh.hw, L * 0.88), rc = pt(sh.ang + sh.hw, L * 0.9), tip = pt(sh.ang, L);
    const bl = [B[0] - 14, B[1]], br = [B[0] + 14, B[1]];
    const lite = tone(sh.col, { l: 5 }), dark = tone(sh.col, { l: -8 });
    const P = (p) => `${F(p[0])} ${F(p[1])}`;
    const mid = (a, b, k) => [(a[0] + b[0]) / 2 + k * (b[1] - a[1]) * 0.04, (a[1] + b[1]) / 2 - k * (b[0] - a[0]) * 0.04];
    o += `<path d="M${P(bl)}Q${P(mid(bl, lc, 1))} ${P(lc)}L${P(tip)}L${P(B)}Z" fill="${lite}"/>`;
    o += `<path d="M${P(B)}L${P(tip)}L${P(rc)}Q${P(mid(rc, br, 1))} ${P(br)}Z" fill="${dark}"/>`;
    o += `<path d="M${P(bl)}Q${P(mid(bl, lc, 1))} ${P(lc)}L${P(tip)}L${P(rc)}Q${P(mid(rc, br, 1))} ${P(br)}Z" fill="${shade}" stroke="${tone(sh.col, { l: -22 })}" stroke-opacity=".25" stroke-width="1"/>`;
    o += `<path d="M${P(B)}L${P(tip)}" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>`;
  }
  return `<g filter="url(#${defs.id('paper')})">${o}</g>`;
}

function frontWrap(defs, D, wrap, neckY) {
  const out = wrap.outer, inn = wrap.inner;
  const gL = linearGrad(defs, 'fwL' + out, [[0, tone(out, { l: 7 })], [0.6, out], [1, tone(out, { l: -9 })]], { x1: 0, y1: 0, x2: 1, y2: 0.4 });
  const gR = linearGrad(defs, 'fwR' + out, [[0, tone(out, { l: -10 })], [0.45, out], [1, tone(out, { l: 5 })]], { x1: 0, y1: 0.4, x2: 1, y2: 0 });
  const shade = linearGrad(defs, 'fwshade', [[0, '#2a1a12', 0], [0.6, '#2a1a12', 0.08], [1, '#2a1a12', 0.3]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  const P = (x, y) => `${F(x)} ${F(y)}`;
  const sheet = (A, Bp, C, Dd, dip, grad, lift) => {
    const qx = (A[0] + Bp[0]) / 2, qy = (A[1] + Bp[1]) / 2 + dip;
    const d = `M${P(...A)}Q${P(qx, qy)} ${P(...Bp)}L${P(...C)}L${P(...Dd)}Z`;
    const dl = `M${P(A[0] - 4, A[1] - lift)}Q${P(qx, qy - lift)} ${P(Bp[0] + 2, Bp[1] - lift)}L${P(...C)}L${P(...Dd)}Z`;
    return `<path d="${dl}" fill="${inn}" stroke="${tone(inn, { l: -18 })}" stroke-opacity=".3"/>` +
      `<path d="${d}" fill="${grad}"/><path d="${d}" fill="${shade}" stroke="${tone(out, { l: -24 })}" stroke-opacity=".3"/>` +
      `<path d="M${P(...A)}Q${P(qx, qy)} ${P(...Bp)}" stroke="#fff" stroke-opacity=".45" stroke-width="2.2" fill="none"/>`;
  };
  const ny = neckY + 8;
  let o = '';
  o += sheet([-1.0 * D, 0.36 * D], [0.3 * D, 0.9 * D], [0.07 * D, ny], [-0.09 * D, ny], -0.07 * D, gL, 12);
  o += `<path d="M${P(-0.55 * D, 0.62 * D)}Q${P(-0.2 * D, 0.98 * D)} ${P(-0.03 * D, ny)}" stroke="#2a1a12" stroke-opacity=".12" stroke-width="2" fill="none"/>`;
  o += sheet([0.98 * D, 0.3 * D], [-0.26 * D, 0.94 * D], [-0.07 * D, ny], [0.09 * D, ny], -0.06 * D, gR, 12);
  o += `<path d="M${P(0.5 * D, 0.6 * D)}Q${P(0.18 * D, 1.0 * D)} ${P(0.04 * D, ny)}" stroke="#fff" stroke-opacity=".22" stroke-width="2" fill="none"/>`;
  return `<g filter="url(#${defs.id('paper')})">${o}</g>`;
}

function ribbonBow(defs, D, ribbon, neckY) {
  const h = ribbon.hex;
  const sat = linearGrad(defs, 'rib' + h, [[0, tone(h, { l: -14 })], [0.3, h], [0.48, tone(h, { l: 14, s: -6 })], [0.62, h], [1, tone(h, { l: -16 })]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  const dk = tone(h, { l: -22 });
  const u = D / 175;
  const P = (x, y) => `${F(x * u)} ${F(y * u)}`;
  let o = `<g transform="translate(0 ${F(neckY)})">`;
  // tails
  o += `<path d="M${P(-4, 4)}C${P(-14, 50)} ${P(-30, 95)} ${P(-46, 140)}L${P(-34, 134)}L${P(-30, 148)}C${P(-16, 100)} ${P(-4, 55)} ${P(4, 6)}Z" fill="${sat}" stroke="${dk}" stroke-opacity=".35" stroke-width=".8"/>`;
  o += `<path d="M${P(2, 4)}C${P(12, 46)} ${P(24, 84)} ${P(38, 126)}L${P(27, 122)}L${P(25, 136)}C${P(12, 92)} ${P(2, 50)} ${P(-6, 6)}Z" fill="${sat}" stroke="${dk}" stroke-opacity=".35" stroke-width=".8"/>`;
  // band
  o += `<rect x="${F(-34 * u)}" y="${F(-10 * u)}" width="${F(68 * u)}" height="${F(18 * u)}" rx="${F(4 * u)}" fill="${sat}" stroke="${dk}" stroke-opacity=".3"/>`;
  // loops
  o += `<path d="M${P(0, 0)}C${P(-22, -40)} ${P(-80, -38)} ${P(-76, -4)}C${P(-73, 24)} ${P(-26, 16)} ${P(0, 0)}Z" fill="${sat}" stroke="${dk}" stroke-opacity=".35" stroke-width=".8"/>`;
  o += `<path d="M${P(-4, -2)}C${P(-22, -26)} ${P(-58, -26)} ${P(-60, -6)}C${P(-46, -14)} ${P(-24, -12)} ${P(-4, -2)}Z" fill="${dk}" opacity=".35"/>`;
  o += `<path d="M${P(0, 0)}C${P(22, -42)} ${P(82, -36)} ${P(78, -2)}C${P(74, 26)} ${P(26, 16)} ${P(0, 0)}Z" fill="${sat}" stroke="${dk}" stroke-opacity=".35" stroke-width=".8"/>`;
  o += `<path d="M${P(4, -2)}C${P(22, -28)} ${P(60, -24)} ${P(62, -4)}C${P(48, -13)} ${P(24, -12)} ${P(4, -2)}Z" fill="${dk}" opacity=".35"/>`;
  // knot
  o += `<ellipse cx="0" cy="${F(1 * u)}" rx="${F(14 * u)}" ry="${F(12 * u)}" fill="${sat}" stroke="${dk}" stroke-opacity=".45"/>`;
  o += `<ellipse cx="${F(-4 * u)}" cy="${F(-3 * u)}" rx="${F(5 * u)}" ry="${F(3 * u)}" fill="#fff" opacity=".28"/>`;
  return o + '</g>';
}

function stemTails(D, neckY, n, rng) {
  let o = '';
  const greens = ['#5b7a3e', '#668646', '#4f6d37', '#6f8d4c'];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x0 = (t - 0.5) * 0.12 * D, x1 = (t - 0.5) * 0.24 * D + (rng() - 0.5) * 6;
    const y1 = neckY + D * (0.5 + rng() * 0.08);
    const w = D * 0.022;
    o += `<path d="M${F(x0)} ${F(neckY)}L${F(x1)} ${F(y1)}" stroke="${greens[i % 4]}" stroke-width="${F(w)}" stroke-linecap="round"/>`;
    o += `<ellipse cx="${F(x1)}" cy="${F(y1)}" rx="${F(w / 2)}" ry="${F(w / 4)}" fill="#c8d79c"/>`;
  }
  return o;
}

function paperFilter(defs) {
  const id = defs.id('paper');
  defs.add(id, `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .2  0 0 0 0 .14  0 0 0 0 .1  .5 0 0 0 -.2" result="s"/><feComposite in="s" in2="SourceGraphic" operator="in" result="t"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="t"/></feMerge></filter>`);
}

/* ---------------- main ---------------- */
export function renderBouquet(design, opts = {}) {
  const { prefix = 'b', interactive = false, animate = false, background = true, width, height, selected = null } = opts;
  const ctx = ctxFor(prefix);
  const defs = ctx.defs;
  paperFilter(defs);
  const size = SIZES[design.size] || SIZES.M;
  const D = size.D;
  const wrap = WRAPS[design.wrap] || WRAPS.kraft;
  const ribbon = RIBBONS[design.ribbon] || RIBBONS.ivory;
  const stems = syncPlacement(design);
  const blooms = stems.filter((s) => s.kind === 'bloom');

  // global flower scale so the head looks full whatever the stem count
  const nominal = (s) => 50 * (FLOWERS[s.type].size || 1) * GRADES[s.grade].f * STAGES[s.stage].f;
  const sumA = blooms.reduce((a, s) => a + Math.PI * nominal(s) ** 2, 0) || 1;
  const domeA = Math.PI * (D * 0.95) ** 2 * 0.85;
  const gs = Math.min(1.7, Math.max(0.5, Math.sqrt((0.86 * domeA) / sumA)));
  const De = D * Math.max(0.5, Math.min(1, Math.sqrt((sumA * gs * gs) / (0.86 * domeA))));
  const Rp = De * 0.82;

  const pos = new Map();
  for (const s of stems) {
    const p = design.place[s.id] || { x: 0, y: 0 };
    let theta = p.th;
    if (s.kind === 'sprig' && theta === undefined) theta = Math.atan2(p.x, -p.y);
    pos.set(s.id, { x: p.x * Rp, y: p.y * Rp, theta, f: p.f });
  }

  const neckY = D * 1.36;
  const rng = rngFrom(design.seed, 'compose');
  const vb = [-1.62 * D, -1.42 * D, 3.24 * D, 3.42 * D];

  let bg = '';
  if (background) {
    const g = radialGrad(defs, 'bg', [[0, '#fffaf4'], [0.65, '#f6ede3'], [1, '#ecdfd2']], { cx: 0.5, cy: 0.4, r: 0.75 });
    bg = `<rect x="${F(vb[0])}" y="${F(vb[1])}" width="${F(vb[2])}" height="${F(vb[3])}" fill="${g}"/>`;
  }
  const halo = radialGrad(defs, 'halo', [[0, '#5a3a2a', 0.16], [0.6, '#5a3a2a', 0.06], [1, '#5a3a2a', 0]], { cx: 0.5, cy: 0.5, r: 0.5 });
  bg += `<ellipse cx="0" cy="${F(D * 0.25)}" rx="${F(D * 1.45)}" ry="${F(D * 1.55)}" fill="${halo}"/>`;

  const A = (cls, i) => (animate ? ` class="${cls}" style="animation-delay:${(i).toFixed(2)}s"` : '');

  /* back paper */
  let back = `<g${A('fade', 0.05)}>${backWrap(defs, D, wrap, neckY)}</g>`;

  /* stems behind the head */
  let stemsSvg = '';
  for (const s of stems) {
    if (s.kind === 'sprig') continue;
    const p = pos.get(s.id);
    const ex = p.x * 0.06;
    stemsSvg += `<path d="M${F(p.x)} ${F(p.y)}Q${F(p.x * 0.4)} ${F(p.y + (neckY - p.y) * 0.62)} ${F(ex)} ${F(neckY)}" stroke="#5f7f45" stroke-width="${F(D * 0.016)}" fill="none" stroke-linecap="round"/>`;
  }

  /* greenery */
  let green = '';
  const lv = design.greenery ?? 2;
  if (lv > 0) {
    const grng = rngFrom(design.seed, 'green', design.shape);
    const inner = pointsInShape(design.shape, Math.ceil((lv * (blooms.length + 4)) / 1.5), grng);
    for (const p of inner) {
      const L = De * (0.24 + grng() * 0.12);
      green += `<g transform="translate(${F(p.x * Rp * 0.9)} ${F(p.y * Rp * 0.9)}) rotate(${F(grng() * 360)})">${leaf(defs, grng, L)}</g>`;
    }
    const ring = Math.round(lv * (7 + De / 30));
    for (let i = 0; i < ring; i++) {
      const th = (-150 + (300 * (i + 0.5)) / ring + (grng() - 0.5) * 10) * (Math.PI / 180);
      const b = boundaryAt(design.shape, th) * Rp * (0.82 + grng() * 0.1);
      const L = De * (0.3 + grng() * 0.14);
      const deg = (th * 180) / Math.PI + (grng() - 0.5) * 24;
      green += `<g transform="translate(${F(Math.sin(th) * b)} ${F(-Math.cos(th) * b)}) rotate(${F(deg)})">${leaf(defs, grng, L)}</g>`;
    }
  }

  /* sprigs, fillers, blooms */
  const sprigScale = Math.min(1.5, Math.max(0.7, De / 250));
  const items = [];
  let idx = 0;
  for (const s of stems) {
    const p = pos.get(s.id);
    const fl = flowerFor(ctx, s);
    const r2 = rngFrom(s.seed, 't');
    let inner, z;
    const f = p.f;
    let ring = 0, face = null; // face = [angleFromUpDeg, amount]
    if (s.kind === 'sprig') {
      const jit = (r2() - 0.5) * 10;
      const deg = f ? f[0] : (p.theta * 180) / Math.PI + jit;
      const sc = sprigScale * GRADES[s.grade].f;
      inner = `rotate(${F(deg)}) scale(${F(sc)})`;
      z = -2000 + p.y;
      ring = 34 * sc; face = [deg, 1];
    } else if (s.kind === 'filler') {
      const sc = (0.95 * 50 * gs) / fl.r * (0.9 + r2() * 0.2);
      inner = `rotate(${F(r2() * 360)}) scale(${F(sc)})`;
      z = -1000 + p.y;
      ring = fl.r * sc;
    } else {
      const rr = Math.min(1.2, Math.hypot(p.x, p.y) / De);
      const persp = 1 + 0.08 * (p.y / De);
      const want = nominal(s) * gs * persp * (0.94 + r2() * 0.12);
      const sc = want / fl.r;
      const spin = r2() * 360, jit = (r2() - 0.5) * 14;
      ring = want * 1.12;
      if (FLOWERS[s.type].upright) {
        let lean = (p.x / De) * 30 + jit;
        if (f) { const a = ((f[0] + 540) % 360) - 180; lean = f[1] < 0.12 ? 0 : Math.max(-80, Math.min(80, a)); }
        inner = `rotate(${F(lean)}) scale(${F(sc)})`;
        face = [lean, f ? f[1] : Math.min(1, Math.abs(lean) / 45)];
      } else {
        const auto = [(Math.atan2(p.x, -p.y) * 180) / Math.PI, (0.22 * Math.min(1, rr) ** 1.6) / 0.45];
        face = f || auto;
        const phi = face[0] - 90;
        const comp = 1 - 0.45 * Math.min(1, face[1]);
        inner = `rotate(${F(phi)}) scale(${F(comp)} 1) rotate(${F(-phi + spin)}) scale(${F(sc)})`;
      }
      z = p.y;
    }
    p.ring = ring; p.face = face;
    items.push({ s, p, fl, inner, z, i: idx++ });
  }
  items.sort((a, b) => a.z - b.z);
  const flowerShadow = radialGrad(defs, 'fshadow', [[0, '#2a1410', 0.4], [0.6, '#2a1410', 0.22], [1, '#2a1410', 0]], { cx: 0.5, cy: 0.5, r: 0.5 });
  let head = '';
  items.forEach((it, order) => {
    const { s, p, fl, inner } = it;
    const attrs = interactive ? ` data-stem="${s.id}" class="stem"` : '';
    let shadow = '';
    if (s.kind === 'bloom') {
      const m = inner.match(/scale\(([\d.]+)\)$/);
      const rr = fl.r * (m ? parseFloat(m[1]) : 1);
      shadow = `<ellipse cx="0" cy="${F(rr * 0.18)}" rx="${F(rr * 1.18)}" ry="${F(rr * 1.12)}" fill="${flowerShadow}"/>`;
    }
    const delay = 0.55 + Math.min(2.4, order * (2.4 / Math.max(1, items.length)));
    head += `<g transform="translate(${F(p.x)} ${F(p.y)})"${attrs}>${shadow}<g${A('grow', delay)}><g transform="${inner}">${fl.svg}</g></g></g>`;
  });

  /* front paper, stem tails, ribbon */
  const front = `<g${A('fade', 0.25)}>${frontWrap(defs, D, wrap, neckY)}${stemTails(D, neckY, Math.min(13, 5 + Math.round(stems.length / 6)), rng)}${ribbonBow(defs, D, ribbon, neckY)}</g>`;

  let sel = '';
  const sp = selected && pos.get(selected);
  if (sp) {
    const R = sp.ring, k = D * 0.045;
    sel = `<g class="sel-ui" transform="translate(${F(sp.x)} ${F(sp.y)})"><circle r="${F(R)}" fill="none" stroke="#2d2226" stroke-opacity=".35" stroke-width="${F(k * 0.5)}"/><circle r="${F(R)}" fill="none" stroke="#fff" stroke-width="${F(k * 0.22)}" stroke-dasharray="${F(k * 0.6)} ${F(k * 0.5)}"/>`;
    if (sp.face) {
      const a = (sp.face[0] * Math.PI) / 180, m = Math.max(0.18, Math.min(1, sp.face[1]));
      const kx = Math.sin(a) * R * m, ky = -Math.cos(a) * R * m;
      sel += `<line x2="${F(kx)}" y2="${F(ky)}" stroke="#fff" stroke-width="${F(k * 0.28)}" stroke-linecap="round"/><circle r="${F(k * 0.25)}" fill="#fff"/>` +
        `<circle cx="${F(kx)}" cy="${F(ky)}" r="${F(k * 1.6)}" fill="transparent" data-knob="${selected}" class="knob-hit"/>` +
        `<circle cx="${F(kx)}" cy="${F(ky)}" r="${F(k)}" fill="#a8324a" stroke="#fff" stroke-width="${F(k * 0.3)}" pointer-events="none"/>`;
    }
    sel += '</g>';
  }

  const body = `${bg}${back}<g${A('fade', 0.3)}>${stemsSvg}</g><g${A('fade', 0.35)}>${green}</g><g class="head">${head}</g>${front}${sel}`;
  const wh = width ? ` width="${width}" height="${height ?? Math.round((width * vb[3]) / vb[2])}"` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(F).join(' ')}"${wh} role="img"><defs>${defs.markup()}</defs>${body}</svg>`;
  return { svg, pos, D, De, Rp, stems, viewBox: vb };
}

/** A single flower on a transparent square, for pickers and lists. */
export function renderFlowerPreview(type, colorId, grade, stage, prefix, seed = 7) {
  const ctx = ctxFor(prefix);
  const def = FLOWERS[type];
  const st = { type, color: colorId, grade, stage: def.stages ? stage : 2, seed: hashStr(`${type}${seed}`) };
  const fl = flowerFor(ctx, st);
  let vb, inner = fl.svg;
  if (def.kind === 'sprig') {
    vb = '-70 -150 140 160';
    inner = `<g transform="rotate(8)">${fl.svg}</g>`;
  } else if (type === 'tulip') {
    vb = '-50 -50 100 100';
  } else {
    const r = fl.r * 1.08;
    vb = `${F(-r)} ${F(-r)} ${F(2 * r)} ${F(2 * r)}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true"><defs>${ctx.defs.markup()}</defs>${inner}</svg>`;
}

export { mix };
