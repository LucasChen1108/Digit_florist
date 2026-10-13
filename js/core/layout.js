// Where each stem goes. All maths happens in a normalised space where the bouquet
// head fits roughly inside the unit disk; callers scale by the pixel radius.
import { rngFrom, GOLDEN } from './util.js';

const HEART_K = 1.18;
const INSIDE = {
  round: (x, y) => x * x + (y / 0.92) ** 2 <= 1,
  wide: (x, y) => (x / 1.14) ** 2 + ((y + 0.06) / 0.78) ** 2 <= 1,
  heart: (x, y) => {
    const X = x * HEART_K, Y = -y * HEART_K + 0.12;
    const a = X * X + Y * Y - 1;
    return a * a * a - X * X * Y * Y * Y <= 0;
  },
};

export const insideShape = (shape, x, y) => (INSIDE[shape] || INSIDE.round)(x, y);

/** Distance from centre to the shape outline in direction theta (0 = up, clockwise). */
export function boundaryAt(shape, theta) {
  const dx = Math.sin(theta), dy = -Math.cos(theta);
  let r = 0;
  while (r < 1.5 && insideShape(shape, dx * r, dy * r)) r += 0.01;
  return r;
}

function vogel(n, rot) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const r = n === 1 ? 0 : Math.sqrt(i / (n - 0.5)), th = rot + i * GOLDEN;
    pts.push({ x: Math.cos(th) * r * 1.15, y: Math.sin(th) * r * 1.15 });
  }
  return pts;
}

/** n evenly spread points inside the shape. */
export function pointsInShape(shape, n, rng) {
  if (n <= 0) return [];
  const rot = rng() * Math.PI * 2;
  let M = n, pts = [];
  for (let it = 0; it < 80; it++) {
    pts = vogel(M, rot).filter((p) => insideShape(shape, p.x, p.y));
    if (pts.length >= n) break;
    M = Math.ceil(M * 1.06) + 1;
  }
  while (pts.length > n) {
    // drop the most crowded point
    let worst = 0, wd = Infinity;
    for (let i = 0; i < pts.length; i++) {
      let nd = Infinity;
      for (let j = 0; j < pts.length; j++) {
        if (i === j) continue;
        const d = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2;
        if (d < nd) nd = d;
      }
      // prefer removing outer points slightly so the dome stays full in the middle
      nd -= (pts[i].x ** 2 + pts[i].y ** 2) * 0.0005;
      if (nd < wd) { wd = nd; worst = i; }
    }
    pts.splice(worst, 1);
  }
  return pts;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const norm = (p) => Math.hypot(p.x, p.y);

function argBest(iterable, score) {
  let best = null, bs = -Infinity;
  for (const v of iterable) {
    const s = score(v);
    if (s > bs) { bs = s; best = v; }
  }
  return best;
}

/**
 * @param stems [{id, gid, kind, dist, clusters}]
 * @returns Map id -> {x, y, theta?} in normalised units (sprigs also get theta)
 */
export function computeLayout(stems, { shape = 'round', seed = 1 }) {
  const rng = rngFrom(seed, 'layout', shape);
  const out = new Map();
  const groupsOf = (kind) => {
    const m = new Map();
    for (const s of stems) if (s.kind === kind) {
      if (!m.has(s.gid)) m.set(s.gid, { gid: s.gid, dist: s.dist, clusters: s.clusters, stems: [] });
      m.get(s.gid).stems.push(s);
    }
    return [...m.values()];
  };

  /* ---- blooms: fill evenly spread slots ---- */
  const blooms = stems.filter((s) => s.kind === 'bloom');
  const slots = pointsInShape(shape, blooms.length, rng);
  const spacing = Math.sqrt(2.6 / Math.max(1, blooms.length));
  slots.forEach((p) => {
    p.x += (rng() - 0.5) * spacing * 0.3;
    p.y += (rng() - 0.5) * spacing * 0.3;
  });
  const free = new Set(slots.map((_, i) => i));
  const take = (st, i) => { out.set(st.id, { x: slots[i].x, y: slots[i].y }); free.delete(i); };
  const order = { center: 0, edge: 1, cluster: 2, scatter: 3 };
  const bg = groupsOf('bloom').sort((a, b) => (order[a.dist] ?? 3) - (order[b.dist] ?? 3) || b.stems.length - a.stems.length);
  const centers = [];
  for (const g of bg) {
    const list = g.stems;
    if (g.dist === 'center') {
      for (const st of list) take(st, argBest(free, (i) => -norm(slots[i]) - rng() * 0.03));
    } else if (g.dist === 'edge') {
      for (const st of list) take(st, argBest(free, (i) => norm(slots[i]) + rng() * 0.05));
    } else if (g.dist === 'cluster') {
      const k = Math.max(1, Math.min(g.clusters || 2, list.length));
      const cs = [];
      for (let c = 0; c < k; c++) {
        const inner = [...free].filter((i) => norm(slots[i]) < 0.68);
        const pool = inner.length ? inner : [...free];
        const ref = [...centers, ...cs];
        const best = ref.length === 0
          ? pool[Math.floor(rng() * pool.length)]
          : argBest(pool, (i) => Math.min(...ref.map((p) => dist(slots[i], p))) + rng() * 0.08);
        cs.push({ x: slots[best].x, y: slots[best].y });
      }
      centers.push(...cs);
      list.forEach((st, j) => {
        const c = cs[j % k];
        take(st, argBest(free, (i) => -dist(slots[i], c)));
      });
    } else {
      const targets = pointsInShape(shape, list.length, rng);
      for (const st of list) {
        const tg = targets.pop();
        take(st, argBest(free, (i) => -dist(slots[i], tg)));
      }
    }
  }

  /* ---- fillers: tuck into the gaps between blooms ---- */
  const fillers = groupsOf('filler');
  if (fillers.length) {
    const cand = pointsInShape(shape, 140, rng).map((p) => ({ x: p.x * 1.02, y: p.y * 1.02 }));
    const taken = [...out.values()];
    const score = (p) => (taken.length ? Math.min(...taken.map((q) => dist(p, q))) : 1) + rng() * 0.02;
    for (const g of fillers) {
      let center = null;
      if (g.dist === 'cluster') center = cand[Math.floor(rng() * cand.length)];
      for (const st of g.stems) {
        const p = argBest(cand, (c) => (center ? -dist(c, center) * 0.9 + score(c) * 0.6 : score(c)));
        cand.splice(cand.indexOf(p), 1);
        out.set(st.id, { x: p.x, y: p.y });
        taken.push(p);
      }
    }
  }

  /* ---- sprigs: poke out around the rim ---- */
  const sprigs = groupsOf('sprig');
  const span = 118 * (Math.PI / 180);
  let offset = rng();
  for (const g of sprigs) {
    const n = g.stems.length;
    let angles;
    if (g.dist === 'cluster') {
      const k = Math.max(1, Math.min(g.clusters || 2, n));
      const cs = Array.from({ length: k }, (_, c) => -span + 2 * span * ((c + 0.5 + (offset - 0.5) * 0.6) / k));
      angles = g.stems.map((_, j) => cs[j % k] + (Math.floor(j / k) - (n / k - 1) / 2) * 0.13 + (rng() - 0.5) * 0.05);
    } else {
      angles = g.stems.map((_, j) => -span + 2 * span * ((j + 0.5 + (offset - 0.5) * 0.8) / n) + (rng() - 0.5) * 0.08);
    }
    offset = (offset + 0.37) % 1;
    g.stems.forEach((st, j) => {
      const th = angles[j], b = boundaryAt(shape, th) * 0.8;
      out.set(st.id, { x: Math.sin(th) * b, y: -Math.cos(th) * b, theta: th });
    });
  }
  return out;
}
