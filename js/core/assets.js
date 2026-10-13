// Photo flower assets.
//
// assets/flowers/manifest.json (written by tools/prepare_assets.py) lists every
// transparent cut-out we have:
//   { "version": 1, "assets": { "rose": [ { "file": "rose/white-full-1.webp", "color": "white",
//       "stage": 2, "w": 512, "h": 512, "ax": 0.5, "ay": 0.5, "r": 0.45, "recolor": true }, … ] } }
//   ax/ay – anchor (flower centre, or the stem base for sprigs) as a fraction of width/height
//   r     – radius of the bloom as a fraction of the image width (sprigs: stem length / width)
//   recolor – the image is neutral (white/cream) and may be tinted to any colour
//
// Images are fetched once into blob: URLs (cheap to repeat inside the live SVG) and
// converted to data: URLs only when a standalone image is needed (PNG export, thumbnails).
import { shades, hexToRgb, Defs } from './util.js';

const BASE = new URL('../../assets/flowers/', import.meta.url);
let manifest = null;
let manifestPromise = null;
const blobs = new Map(); // file -> blob url
const pending = new Map(); // file -> promise
const dataUrls = new Map(); // blob url -> data url
const listeners = new Set();

export const onAssetsReady = (fn) => listeners.add(fn);
const notify = () => listeners.forEach((fn) => fn());

export function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(new URL('manifest.json', BASE))
      .then((r) => (r.ok ? r.json() : { assets: {} }))
      .catch(() => ({ assets: {} }))
      .then((m) => { manifest = m && m.assets ? m : { assets: {} }; return manifest; });
  }
  return manifestPromise;
}

export const manifestReady = () => !!manifest;
export const assetCount = () => (manifest ? Object.values(manifest.assets).reduce((a, l) => a + l.length, 0) : 0);
export const hasAssetsFor = (type) => !!manifest?.assets?.[type]?.length;

function fetchBlob(file) {
  if (blobs.has(file)) return Promise.resolve(blobs.get(file));
  if (!pending.has(file)) {
    pending.set(file, fetch(new URL(file, BASE))
      .then((r) => { if (!r.ok) throw new Error(file); return r.blob(); })
      .then((b) => { const u = URL.createObjectURL(b); blobs.set(file, u); return u; })
      .catch(() => null));
  }
  return pending.get(file);
}

/** Best image for a stem: exact colour → recolourable neutral; same stage preferred. */
export function pickAsset(type, color, stage, seed = 0) {
  const list = manifest?.assets?.[type];
  if (!list?.length) return null;
  const score = (a) => (a.color === color ? 0 : a.recolor ? 10 : 100) + Math.abs((a.stage ?? 2) - stage) * 3;
  const best = Math.min(...list.map(score));
  if (best >= 100) return null;
  const options = list.filter((a) => score(a) === best);
  const a = options[seed % options.length];
  return { ...a, tint: a.color !== color, stageDiff: stage - (a.stage ?? 2) };
}

/** Returns a ready blob URL, or null while it loads (and re-renders once it has). */
export function assetUrl(file) {
  if (blobs.has(file)) return blobs.get(file);
  fetchBlob(file).then((u) => { if (u) notify(); });
  return null;
}

/** Preload every image a design needs (used before showing a gift or exporting). */
export async function preloadDesign(design) {
  await loadManifest();
  const jobs = [];
  for (const g of design.groups) {
    const a = pickAsset(g.type, g.color, g.stage ?? 2, 0);
    if (!a) continue;
    for (const x of manifest.assets[g.type]) if (x.color === a.color && x.stage === a.stage) jobs.push(fetchBlob(x.file));
  }
  for (const x of manifest.assets._foliage || []) jobs.push(fetchBlob(x.file));
  await Promise.all(jobs);
}

/** Photo leaves for the greenery, if any were prepared (manifest key "_foliage"). */
export function foliageAssets() {
  return (manifest?.assets?._foliage || []).map((a) => ({ ...a, url: assetUrl(a.file) })).filter((a) => a.url);
}

/** Gradient-map filter that tints a neutral photo to the target colour. */
export function recolorFilter(defs, hex) {
  const id = defs.id('rc' + hex);
  if (!defs.has(id)) {
    const s = shades(hex);
    // white petals mostly sit between 45% and 100% luminance: spread that range over the whole ramp
    const pts = [[0, s.deep], [0.45, s.deep], [0.62, s.dark], [0.8, s.base], [0.93, s.light], [1, s.pale]].map(([t, c]) => [t, hexToRgb(c)]);
    const at = (t) => {
      let i = 1;
      while (i < pts.length - 1 && pts[i][0] < t) i++;
      const [t0, c0] = pts[i - 1], [t1, c1] = pts[i];
      const k = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      return c0.map((v, j) => v + (c1[j] - v) * Math.min(1, Math.max(0, k)));
    };
    const stops = Array.from({ length: 21 }, (_, i) => at(i / 20));
    const ch = (i) => stops.map((c) => (c[i] / 255).toFixed(3)).join(' ');
    defs.add(id, `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".3 .59 .11 0 0 .3 .59 .11 0 0 .3 .59 .11 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="${ch(0)}"/><feFuncG type="table" tableValues="${ch(1)}"/><feFuncB type="table" tableValues="${ch(2)}"/></feComponentTransfer></filter>`);
  }
  return id;
}

async function toDataUrl(blobUrl) {
  if (dataUrls.has(blobUrl)) return dataUrls.get(blobUrl);
  const b = await (await fetch(blobUrl)).blob();
  const d = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
  dataUrls.set(blobUrl, d);
  return d;
}

/** Replace blob: image references with data: URLs so the SVG works as a standalone image. */
export async function inlineAssets(svg) {
  const urls = [...new Set(svg.match(/blob:[^"')\s]+/g) || [])];
  if (!urls.length) return svg;
  const map = new Map(await Promise.all(urls.map(async (u) => [u, await toDataUrl(u)])));
  return svg.replace(/blob:[^"')\s]+/g, (u) => map.get(u) || u);
}

export { Defs };
