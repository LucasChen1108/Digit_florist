// Small shared helpers: seeded randomness, colour maths, path geometry, SVG defs.

/* ---------- seeded random ---------- */
export function hashStr(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rngFrom = (...parts) => mulberry32(hashStr(parts.join('|')));

/* ---------- colour ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

export function tone(hex, { h = 0, s = 0, l = 0 } = {}) {
  const [H, S, L] = rgbToHsl(hexToRgb(hex));
  return hslToHex((H + h + 360) % 360, clamp(S + s, 0, 100), clamp(L + l, 2, 99));
}

export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}

export function lightness(hex) {
  return rgbToHsl(hexToRgb(hex))[2];
}

/** Five-step tonal ramp used by most petals. Very light colours get warmer, softer shadows. */
export function shades(hex) {
  const L = lightness(hex);
  if (L > 85) {
    const shadow = mix(hex, '#b49a86', 0.55);
    return {
      deep: mix(hex, '#8f7464', 0.7),
      dark: shadow,
      base: mix(hex, '#e9ddd1', 0.25),
      light: hex,
      pale: mix(hex, '#ffffff', 0.6),
    };
  }
  return {
    deep: tone(hex, { l: -L * 0.42, s: 8 }),
    dark: tone(hex, { l: -L * 0.2, s: 5 }),
    base: hex,
    light: tone(hex, { l: (100 - L) * 0.28, s: -4 }),
    pale: tone(hex, { l: (100 - L) * 0.5, s: -10 }),
  };
}

/* ---------- geometry ---------- */
export const F = (v) => Math.round(v * 10) / 10;

/** Closed (or open) Catmull–Rom spline through points, as an SVG path. */
export function smooth(pts, closed = true, t = 1) {
  const n = pts.length;
  const get = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = `M${F(pts[0][0])} ${F(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * t, c1y = p1[1] + ((p2[1] - p0[1]) / 6) * t;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * t, c2y = p2[1] - ((p3[1] - p1[1]) / 6) * t;
    d += `C${F(c1x)} ${F(c1y)} ${F(c2x)} ${F(c2y)} ${F(p2[0])} ${F(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}

/**
 * Outline of a single petal pointing up (−y) with its base at the origin.
 * tip: round | notch | ruffle | fringe | point
 */
export function petalPts(L, W, o = {}) {
  const {
    tip = 'round', widest = 0.6, baseW = 0.16, jitter = 0, rng = Math.random,
    bumps = 3, ruffle = 0.05, teeth = 6, toothDepth = 0.16,
  } = o;
  const s = Math.max(widest + 0.14, 0.78);
  const c = tip === 'fringe' ? s * 0.82 : s;
  const ws = tip === 'point' ? 0.5 : 0.86;
  const rx = W * ws, ry = L * (1 - c);
  const right = [
    [W * baseW, -L * 0.05],
    [W * 0.74, -L * widest * 0.48],
    [W, -L * widest],
    [rx, -L * c],
  ];
  const tipPts = [];
  if (tip === 'point') {
    tipPts.push([0, -L], [0, -L]);
  } else if (tip === 'fringe') {
    const m = teeth * 2;
    for (let i = 1; i < m; i++) {
      const a = (i / m) * Math.PI;
      const k = i % 2 ? 1 + (rng() - 0.5) * 0.08 : 1 - toothDepth;
      tipPts.push([rx * Math.cos(a) * k, -L * c - ry * Math.sin(a) * k]);
    }
  } else {
    const m = tip === 'ruffle' ? bumps * 2 : 4;
    for (let i = 1; i < m; i++) {
      const a = (i / m) * Math.PI;
      let k = 1;
      if (tip === 'ruffle') k = 1 + (i % 2 ? ruffle : -ruffle * 0.6) + (rng() - 0.5) * ruffle;
      let y = -L * c - ry * Math.sin(a) * k;
      if (tip === 'notch' && i === m / 2) y += L * 0.06;
      tipPts.push([rx * Math.cos(a) * k, y]);
    }
  }
  const left = right.slice().reverse().map(([x, y]) => [-x, y]);
  let pts = [[0, 0], ...right, ...tipPts, ...left];
  if (jitter) {
    pts = pts.map((p, i) => (i === 0 ? p : [p[0] + (rng() - 0.5) * 2 * jitter * W, p[1] + (rng() - 0.5) * 2 * jitter * L]));
  }
  return pts;
}

export const petalPath = (L, W, o = {}) => smooth(petalPts(L, W, o), true, o.tension ?? 1);

export const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/* ---------- SVG defs registry (per SVG document, prefixed ids) ---------- */
export class Defs {
  constructor(prefix) {
    this.prefix = prefix;
    this.map = new Map();
  }
  id(key) {
    return this.prefix + '-' + key.replace(/[^a-zA-Z0-9]/g, '');
  }
  add(id, markup) {
    if (!this.map.has(id)) this.map.set(id, markup);
  }
  has(id) {
    return this.map.has(id);
  }
  markup() {
    return [...this.map.values()].join('');
  }
}

const stopsMarkup = (stops) =>
  stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');

export function radialGrad(defs, key, stops, o = {}) {
  const id = defs.id(key);
  if (!defs.has(id)) {
    const { cx = 0.5, cy = 1, r = 1, fx = cx, fy = cy, units = 'objectBoundingBox' } = o;
    defs.add(id, `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}" gradientUnits="${units}">${stopsMarkup(stops)}</radialGradient>`);
  }
  return `url(#${id})`;
}

export function linearGrad(defs, key, stops, o = {}) {
  const id = defs.id(key);
  if (!defs.has(id)) {
    const { x1 = 0, y1 = 0, x2 = 1, y2 = 0, units = 'objectBoundingBox' } = o;
    defs.add(id, `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="${units}">${stopsMarkup(stops)}</linearGradient>`);
  }
  return `url(#${id})`;
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
