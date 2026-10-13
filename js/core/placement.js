// Persistent placement of every stem.
//
// design.place[id] = { x, y, th?, m?, f? }
//   x, y  – position in normalised head units (multiplied by the head radius when drawn)
//   th    – sprig direction in radians (0 = up, clockwise)
//   m     – 1 when the customer placed/oriented this stem by hand (never moved automatically)
//   f     – facing override [angleFromUpDeg, amount 0..1]
//
// Placements are only (re)computed when needed, so adding flowers never disturbs
// the ones already in the bouquet.
import { FLOWERS } from './catalog.js';
import { computeLayout, pointsInShape, boundaryAt } from './layout.js';
import { rngFrom, hashStr } from './util.js';

export function groupKeys(g) {
  if (!Array.isArray(g.keys)) g.keys = Array.from({ length: g.count || 0 }, (_, i) => i);
  g.count = g.keys.length;
  if (!(g.nextK > Math.max(-1, ...g.keys))) g.nextK = Math.max(-1, ...g.keys) + 1;
  return g.keys;
}

export function expandStems(design) {
  const stems = [];
  for (const g of design.groups) {
    const def = FLOWERS[g.type];
    if (!def) continue;
    for (const k of groupKeys(g)) {
      const id = `${g.id}.${k}`;
      stems.push({
        id, gid: g.id, k, type: g.type, color: g.color, kind: def.kind,
        grade: g.grade ?? 1, stage: def.stages ? g.stage ?? 2 : 2,
        dist: g.dist || 'scatter', clusters: g.clusters || 2,
        seed: hashStr(`${design.seed}|${id}`),
      });
    }
  }
  return stems;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const norm = (p) => Math.hypot(p.x, p.y);
const SPAN = 118 * (Math.PI / 180);
const angDist = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

function fullLayout(design, stems) {
  const place = design.place;
  const lay = computeLayout(stems, { shape: design.shape, seed: design.seed });
  // Hand-placed stems keep their spot; the automatic stem that would have landed
  // nearest to it takes over the hand-placed stem's computed slot instead.
  const used = new Set();
  for (const s of stems) {
    const p = place[s.id];
    if (!p?.m || s.kind === 'sprig') continue;
    let best = null, bd = Infinity;
    for (const o of stems) {
      if (o === s || o.kind !== s.kind || place[o.id]?.m || used.has(o.id)) continue;
      const d = dist(lay.get(o.id), p);
      if (d < bd) { bd = d; best = o; }
    }
    if (best) {
      used.add(best.id);
      const tmp = lay.get(best.id);
      lay.set(best.id, lay.get(s.id));
      lay.set(s.id, tmp);
    }
  }
  for (const s of stems) {
    if (place[s.id]?.m) continue;
    const p = lay.get(s.id);
    place[s.id] = p.theta !== undefined ? { x: p.x, y: p.y, th: p.theta } : { x: p.x, y: p.y };
  }
}

function incremental(design, stems, missing) {
  const place = design.place;
  const shape = design.shape;
  const cand = pointsInShape(shape, 260, rngFrom(design.seed, 'cand', shape));
  const placed = stems.filter((s) => place[s.id] && s.kind !== 'sprig').map((s) => ({ ...place[s.id], gid: s.gid }));
  const sprigs = stems.filter((s) => place[s.id] && s.kind === 'sprig').map((s) => ({ th: place[s.id].th ?? 0, gid: s.gid }));
  const order = { center: 0, edge: 1, cluster: 2, scatter: 3 };
  missing.sort((a, b) => (order[a.dist] ?? 3) - (order[b.dist] ?? 3));

  for (const s of missing) {
    const rng = rngFrom(design.seed, s.id, 'inc');
    if (s.kind === 'sprig') {
      const same = sprigs.filter((q) => q.gid === s.gid);
      let best = 0, bs = -Infinity;
      for (let a = -SPAN; a <= SPAN; a += 0.05) {
        const dAll = sprigs.length ? Math.min(...sprigs.map((q) => angDist(a, q.th))) : 1;
        const dSame = same.length ? Math.min(...same.map((q) => angDist(a, q.th))) : 1;
        const sc = s.dist === 'cluster' && same.length && same.length >= (s.clusters || 2)
          ? Math.min(dAll, 0.12) * 2 - dSame
          : dAll + 0.3 * dSame;
        const v = sc + rng() * 0.01;
        if (v > bs) { bs = v; best = a; }
      }
      const b = boundaryAt(shape, best) * 0.8;
      place[s.id] = { x: Math.sin(best) * b, y: -Math.cos(best) * b, th: best };
      sprigs.push({ th: best, gid: s.gid });
      continue;
    }
    const same = placed.filter((q) => q.gid === s.gid);
    let best = cand[0], bs = -Infinity;
    for (const c of cand) {
      const dAll = placed.length ? Math.min(...placed.map((q) => dist(c, q))) : 1;
      const dSame = same.length ? Math.min(...same.map((q) => dist(c, q))) : 1;
      let sc;
      if (s.kind === 'filler') sc = dAll;
      else if (s.dist === 'center') sc = dAll * 0.8 - norm(c);
      else if (s.dist === 'edge') sc = dAll * 0.8 + norm(c);
      else if (s.dist === 'cluster') {
        sc = same.length >= (s.clusters || 2) ? Math.min(dAll, 0.3) * 1.2 - dSame : dAll + 0.6 * dSame;
      } else sc = dAll + 0.35 * Math.min(1, dSame);
      const v = sc + rng() * 0.01;
      if (v > bs) { bs = v; best = c; }
    }
    place[s.id] = { x: best.x, y: best.y };
    placed.push({ x: best.x, y: best.y, gid: s.gid });
  }
}

/**
 * Make sure every stem has a placement and drop stale ones.
 * full = true re-lays out every stem that was not placed by hand.
 */
export function syncPlacement(design, { full = false } = {}) {
  if (!design.place || typeof design.place !== 'object') design.place = {};
  const place = design.place;
  const stems = expandStems(design);
  const ids = new Set(stems.map((s) => s.id));
  for (const id of Object.keys(place)) if (!ids.has(id)) delete place[id];
  const missing = stems.filter((s) => !place[s.id]);
  if (full || missing.length === stems.length) fullLayout(design, stems);
  else if (missing.length) incremental(design, stems, missing);
  return stems;
}

/** Forget automatic placements so the next sync lays everything out afresh (hand-placed stems stay). */
export function relayout(design, { keepManual = true } = {}) {
  if (!keepManual) design.place = {};
  syncPlacement(design, { full: true });
}
