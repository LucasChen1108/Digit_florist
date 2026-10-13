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
import { hexToRgb, Defs } from './util.js';

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
const NO_TINT = new Set(['rose', 'peony']);

export function pickAsset(type, color, stage, seed = 0) {
  const list = manifest?.assets?.[type];
  if (!list?.length) return null;
  // dyeing a white photo looks natural for simple petals, but roses/peonies turn waxy → use illustration instead
  const canTint = !NO_TINT.has(type);
  const score = (a) => (a.color === color ? 0 : a.recolor && canTint ? 10 : 100) + Math.abs((a.stage ?? 2) - stage) * 3;
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

/** "Dyes" a neutral (white) photo: desaturate, then multiply by the target colour.
 *  Keeps the real petal shading, so it reads like a dyed fresh flower rather than a metallic tint. */
export function recolorFilter(defs, hex) {
  const id = defs.id('rc' + hex);
  if (!defs.has(id)) {
    const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
    // pale targets get a flatter, brighter dye (real champagne/blush petals have soft shading)
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    const a = lum > 0.75 ? 0.88 : 1.0;
    const off = 1.06 - a;
    const row = (c) => `${(0.3 * c * a).toFixed(3)} ${(0.59 * c * a).toFixed(3)} ${(0.11 * c * a).toFixed(3)} 0 ${(c * off).toFixed(3)}`;
    defs.add(id, `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${row(r)} ${row(g)} ${row(b)} 0 0 0 1 0"/></filter>`);
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
