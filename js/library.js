import { t, L, getLang, setLang, onLang, applyI18n } from './i18n.js';
import { FLOWERS, SIZES, WRAPS, RIBBONS, GRADES, STAGES, colorOf } from './core/catalog.js';
import { renderBouquet, renderFlowerPreview, stemCount, STYLE_KEYS, clearFlowerCache } from './core/bouquet.js';
import { loadManifest, preloadDesign, inlineAssets, assetCount } from './core/assets.js';
import { bouquetMeaning } from './core/meaning.js';
import {
  TEMPLATES, OCCASIONS, OCCASION_KEYS, THEMES, THEME_KEYS, LANGUAGES, LANGUAGE_KEYS, templateById, cloneDesign,
} from './core/templates.js';
import { esc } from './core/util.js';

const $ = (s) => document.querySelector(s);
const MODES = {
  occasion: { labels: OCCASIONS, keys: OCCASION_KEYS, of: (tp) => tp.occasions },
  theme: { labels: THEMES, keys: THEME_KEYS, of: (tp) => [tp.theme] },
  language: { labels: LANGUAGES, keys: LANGUAGE_KEYS, of: (tp) => [catOf(tp)] },
};

let mode = 'occasion';
let filter = 'all';
try {
  const u = new URLSearchParams(location.search);
  if (MODES[u.get('by')]) mode = u.get('by');
  if (u.get('f')) filter = u.get('f');
} catch {}

const cats = new Map();
function catOf(tp) {
  if (!cats.has(tp.id)) cats.set(tp.id, bouquetMeaning(cloneDesign(tp), 'en').cat);
  return cats.get(tp.id);
}

/* ---------- thumbnails (rendered lazily to image URLs) ---------- */
const STYLE_PREF = 'digit-florist-style';
let style = (() => { try { const v = localStorage.getItem(STYLE_PREF); return STYLE_KEYS.includes(v) ? v : 'illustrated'; } catch { return 'illustrated'; } })();
const images = new Map();
function imageFor(tp) {
  const key = style + '|' + tp.id;
  if (!images.has(key)) {
    images.set(key, (async () => {
      const d = cloneDesign(tp);
      d.style = style;
      if (style === 'photo') await preloadDesign(d);
      const svg = await inlineAssets(renderBouquet(d, { prefix: 'lb' + tp.id, width: 700 }).svg);
      return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    })());
  }
  return images.get(key);
}
async function fillImg(img) {
  img.src = await imageFor(templateById(img.dataset.id));
  img.onload = () => img.classList.add('in');
}
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      fillImg(e.target);
    }
  }, { rootMargin: '300px' })
  : null;

/* ---------- rendering ---------- */
const nm = (c, f) => (getLang() === 'zh' ? `${L(c.name)}${L(f.name)}` : `${L(c.name)} ${L(f.name)}`);

function card(tp) {
  const m = MODES.language.labels[catOf(tp)];
  return `<button type="button" class="tpl-card" data-id="${tp.id}">
    <span class="tpl-img"><img data-id="${tp.id}" alt="${esc(L(tp.name))}" /></span>
    <span class="tpl-info">
      <span class="tpl-name">${esc(L(tp.name))}</span>
      <span class="tpl-desc">${esc(L(tp.desc))}</span>
      <span class="tpl-tags"><i>${esc(L(THEMES[tp.theme]))}</i><i class="lang">${esc(t('meaning'))} · ${esc(L(m))}</i><i class="n">${esc(t('stemsN', { n: stemCount(tp.design) }))}</i></span>
    </span>
  </button>`;
}

function renderStyleSeg() {
  const avail = STYLE_KEYS.filter((k) => k !== 'photo' || assetCount() > 0);
  $('#styleSeg').innerHTML = `<span>${esc(t('styleLabel'))}</span>` + avail.map((k) =>
    `<button type="button" class="${k === style ? 'on' : ''}" data-style="${k}">${esc(t('style.' + k))}</button>`).join('');
}

function renderControls() {
  renderStyleSeg();
  $('#modeSeg').innerHTML = Object.keys(MODES).map((k) =>
    `<button type="button" role="tab" class="${k === mode ? 'on' : ''}" data-mode="${k}">${esc(t('by.' + k))}</button>`).join('');
  const M = MODES[mode];
  const count = (k) => TEMPLATES.filter((tp) => M.of(tp).includes(k)).length;
  $('#filterChips').innerHTML = [`<button type="button" class="chip ${filter === 'all' ? 'on' : ''}" data-filter="all">${esc(t('all'))} <small>${TEMPLATES.length}</small></button>`]
    .concat(M.keys.filter((k) => count(k)).map((k) =>
      `<button type="button" class="chip ${filter === k ? 'on' : ''}" data-filter="${k}">${esc(L(M.labels[k]))} <small>${count(k)}</small></button>`)).join('');
}

function renderLib() {
  const M = MODES[mode];
  const keys = filter === 'all' ? M.keys : [filter];
  $('#lib').innerHTML = keys.map((k) => {
    const list = TEMPLATES.filter((tp) => M.of(tp).includes(k));
    if (!list.length) return '';
    return `<section class="lib-sec"><h2>${esc(L(M.labels[k]))}<small>${list.length}</small></h2><div class="tpl-grid">${list.map(card).join('')}</div></section>`;
  }).join('');
  document.querySelectorAll('#lib img[data-id]').forEach((img) => {
    if (io) io.observe(img);
    else fillImg(img);
  });
}

function render() {
  applyI18n();
  renderControls();
  renderLib();
  try {
    const u = new URL(location.href);
    u.searchParams.set('by', mode);
    if (filter === 'all') u.searchParams.delete('f'); else u.searchParams.set('f', filter);
    history.replaceState(null, '', u);
  } catch {}
}

/* ---------- detail dialog ---------- */
let current = null;
function openDetail(id) {
  const tp = templateById(id);
  if (!tp) return;
  current = tp;
  const d = cloneDesign(tp);
  const m = bouquetMeaning(d, getLang());
  imageFor(tp).then((u) => { $('#tdImg').src = u; });
  $('#tdImg').alt = L(tp.name);
  $('#tdName').textContent = L(tp.name);
  $('#tdDesc').textContent = L(tp.desc);
  $('#tdTags').innerHTML = tp.occasions.map((o) => `<i>${esc(L(OCCASIONS[o]))}</i>`).join('') +
    `<i>${esc(L(THEMES[tp.theme]))}</i><i class="lang">${esc(L(LANGUAGES[m.cat]))}</i>`;
  $('#tdMeaning').textContent = m.text;
  $('#tdClose').textContent = m.closing;
  $('#tdFlowers').innerHTML = d.groups.map((g) => {
    const f = FLOWERS[g.type], c = colorOf(g.type, g.color);
    const sub = [L(GRADES[g.grade].name), f.stages ? L(STAGES[g.stage].name) : null].filter(Boolean).join(' · ');
    return `<li class="mini"><span class="mini-art">${renderFlowerPreview(g.type, g.color, g.grade, g.stage, 'td' + g.type + g.color + g.grade + g.stage)}</span><span class="mini-name">${esc(nm(c, f))}<small>${esc(sub)}</small></span><b class="mini-n">×${g.count}</b></li>`;
  }).join('');
  $('#tdWrap').textContent = `${t('size')}: ${L(SIZES[d.size].name)} · ${t('paper')}: ${L(WRAPS[d.wrap].name)} · ${t('ribbon')}: ${L(RIBBONS[d.ribbon].name)}`;
  $('#tdUse').href = `./?t=${tp.id}`;
  $('#tdSend').href = `./?t=${tp.id}&tab=card`;
  if (!$('#tplDlg').open) $('#tplDlg').showModal();
}

document.addEventListener('click', (e) => {
  const sb = e.target.closest('[data-style]');
  if (sb) {
    style = sb.dataset.style;
    try { localStorage.setItem(STYLE_PREF, style); } catch {}
    render();
    return;
  }
  const md = e.target.closest('[data-mode]');
  if (md) { mode = md.dataset.mode; filter = 'all'; render(); return; }
  const fl = e.target.closest('[data-filter]');
  if (fl) { filter = fl.dataset.filter; render(); return; }
  const cd = e.target.closest('.tpl-card');
  if (cd) { openDetail(cd.dataset.id); return; }
  if (e.target.closest('[data-close]') || e.target === $('#tplDlg')) $('#tplDlg').close();
});

$('#langBtn').addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
onLang(() => { render(); if ($('#tplDlg').open && current) openDetail(current.id); });
render();
loadManifest().then(() => { if (assetCount()) { clearFlowerCache(); renderStyleSeg(); } });
