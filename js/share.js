// Gift links: the whole bouquet travels inside the URL hash, so no server is needed.
// Format: "1" + base64url(deflate-raw(json))  or  "0" + base64url(json) as a fallback.
import { FLOWERS, TYPE_KEYS, DIST_KEYS, SIZE_KEYS, SHAPE_KEYS, WRAP_KEYS, RIBBON_KEYS } from './core/catalog.js';

const b64url = (bytes) => {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const unb64url = (s) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

const idx = (arr, v) => Math.max(0, arr.indexOf(v));

export function pack(design, card, lang) {
  return {
    v: 1,
    z: idx(SIZE_KEYS, design.size), h: idx(SHAPE_KEYS, design.shape),
    w: idx(WRAP_KEYS, design.wrap), r: idx(RIBBON_KEYS, design.ribbon),
    e: design.greenery, s: design.seed,
    g: design.groups.map((g) => {
      const f = FLOWERS[g.type];
      return [g.id, idx(TYPE_KEYS, g.type), Math.max(0, f.colors.findIndex((c) => c.id === g.color)), g.grade, g.stage, g.count, idx(DIST_KEYS, g.dist), g.clusters || 2];
    }),
    o: Object.fromEntries(Object.entries(design.overrides || {}).map(([k, [x, y]]) => [k, [Math.round(x), Math.round(y)]])),
    t: card.to || '', f: card.from || '', m: card.msg || '', l: lang,
  };
}

export function unpack(p) {
  if (!p || p.v !== 1 || !Array.isArray(p.g)) throw new Error('bad payload');
  const groups = p.g.map(([id, ti, ci, grade, stage, count, di, clusters]) => {
    const type = TYPE_KEYS[ti] || 'rose';
    const f = FLOWERS[type];
    return {
      id, type, color: (f.colors[ci] || f.colors[0]).id,
      grade: Math.min(2, Math.max(0, grade | 0)), stage: Math.min(2, Math.max(0, stage | 0)),
      count: Math.min(99, Math.max(1, count | 0)), dist: DIST_KEYS[di] || 'scatter', clusters: Math.min(3, Math.max(1, clusters | 0)),
    };
  });
  return {
    design: {
      size: SIZE_KEYS[p.z] || 'M', shape: SHAPE_KEYS[p.h] || 'round', wrap: WRAP_KEYS[p.w] || 'kraft',
      ribbon: RIBBON_KEYS[p.r] || 'ivory', greenery: p.e ?? 2, seed: p.s ?? 1, groups,
      overrides: p.o && typeof p.o === 'object' ? p.o : {},
    },
    card: { to: String(p.t || '').slice(0, 60), from: String(p.f || '').slice(0, 60), msg: String(p.m || '').slice(0, 500) },
    lang: p.l === 'zh' ? 'zh' : 'en',
  };
}

export async function encodeGift(design, card, lang) {
  const bytes = new TextEncoder().encode(JSON.stringify(pack(design, card, lang)));
  if (typeof CompressionStream !== 'undefined') {
    try { return '1' + b64url(await pipe(bytes, new CompressionStream('deflate-raw'))); } catch {}
  }
  return '0' + b64url(bytes);
}

export async function decodeGift(code) {
  const kind = code[0], body = code.slice(1);
  let bytes = unb64url(body);
  if (kind === '1') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (kind !== '0') throw new Error('unknown format');
  return unpack(JSON.parse(new TextDecoder().decode(bytes)));
}

export function giftUrl(code) {
  const u = new URL('gift.html', location.href);
  u.search = '';
  u.hash = code;
  return u.toString();
}
