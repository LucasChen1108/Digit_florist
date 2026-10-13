import { t, L, getLang, setLang, onLang, applyI18n } from './i18n.js';
import {
  FLOWERS, DISPLAY_KEYS, GRADES, STAGES, DISTS, distsFor, SIZES, SIZE_KEYS, SHAPES, SHAPE_KEYS,
  GREENERY, WRAPS, WRAP_KEYS, RIBBONS, RIBBON_KEYS, TEMPLATES, colorOf, meaningOf,
} from './core/catalog.js';
import { renderBouquet, renderFlowerPreview, stemCount, clearFlowerCache, STYLE_KEYS } from './core/bouquet.js';
import { loadManifest, onAssetsReady, assetCount, inlineAssets, preloadDesign } from './core/assets.js';
import { syncPlacement, groupKeys } from './core/placement.js';
import { bouquetMeaning } from './core/meaning.js';
import { esc } from './core/util.js';
import { templateById, cloneDesign, TEMPLATES as BOUQUETS } from './core/templates.js';
import { encodeGift, giftUrl } from './share.js';
import { downloadPng } from './export.js';

const STORE = 'digit-florist-draft-v2';
const OLD_STORE = 'digit-florist-draft-v1';
const STYLE_PREF = 'digit-florist-style';
const prefStyle = () => { try { const v = localStorage.getItem(STYLE_PREF); return STYLE_KEYS.includes(v) ? v : 'illustrated'; } catch { return 'illustrated'; } };
const HERO = { lily: 'pink', hydrangea: 'blue', daisy: 'white' };
const $ = (s, r = document) => r.querySelector(s);
const nm = (c, f) => (getLang() === 'zh' ? `${L(c.name)}${L(f.name)}` : `${L(c.name)} ${L(f.name)}`);

const starter = () => {
  const d = cloneDesign(templateById('french-romance'));
  return { ...d, card: { to: '', from: '', msg: '' }, nextId: d.groups.length + 1 };
};

function load() {
  let s = null;
  try {
    const raw = localStorage.getItem(STORE) || localStorage.getItem(OLD_STORE);
    if (raw) s = JSON.parse(raw);
  } catch {}
  const st = s && Array.isArray(s.groups) ? { ...starter(), ...s } : starter();
  delete st.overrides;
  if (!STYLE_KEYS.includes(st.style)) st.style = prefStyle();
  if (!st.place || typeof st.place !== 'object') st.place = {};
  st.groups.forEach(groupKeys);
  syncPlacement(st);
  return st;
}

let state = load();
let tab = 'flowers';
let pendingToast = '';

/* open a template from the library: ./?t=<id>[&tab=card] */
(() => {
  let u;
  try { u = new URL(location.href); } catch { return; }
  const tp = templateById(u.searchParams.get('t') || '');
  if (tp) {
    const d = cloneDesign(tp);
    const card = { ...state.card };
    if (!card.msg || state.fromTpl) card.msg = tp.msg[getLang()] || tp.msg.en;
    state = { ...state, ...d, card, nextId: d.groups.length + 1, fromTpl: tp.id, style: prefStyle() };
    state.groups.forEach(groupKeys);
    syncPlacement(state);
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {}
    pendingToast = t('tplLoaded', { name: L(tp.name) });
  }
  if (['flowers', 'arrange', 'wrap', 'card'].includes(u.searchParams.get('tab'))) tab = u.searchParams.get('tab');
  if (u.search) history.replaceState(null, '', u.pathname + u.hash);
})();
const picker = { type: 'rose', color: 'red', grade: 1, stage: 2, qty: 3 };
let last = null; // last render result
let selected = null; // selected stem id

function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {}
}

/* ---------------- toast ---------------- */
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------------- stems helpers ---------------- */
const parseId = (id) => { const [g, k] = id.split('.'); return { gid: +g, k: +k }; };
const groupOf = (id) => state.groups.find((g) => g.id === parseId(id).gid);
const hasManual = () => Object.values(state.place).some((p) => p.m);

function addStems(g, n) {
  groupKeys(g);
  for (let i = 0; i < n; i++) g.keys.push(g.nextK++);
  g.count = g.keys.length;
}
function removeStem(id) {
  const g = groupOf(id);
  if (!g) return;
  const { k } = parseId(id);
  g.keys = groupKeys(g).filter((x) => x !== k);
  g.count = g.keys.length;
  if (!g.count) state.groups = state.groups.filter((x) => x !== g);
  delete state.place[id];
  if (selected === id) selected = null;
}
function removeLast(g) {
  const keys = groupKeys(g);
  if (keys.length) removeStem(`${g.id}.${keys[keys.length - 1]}`);
}

/* ---------------- stage ---------------- */
let raf = 0;
function scheduleStage() {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = 0; renderStage(); });
}

function renderStage() {
  if (selected && !state.place[selected]) selected = null;
  last = renderBouquet(state, { prefix: 'st', interactive: true, background: false, selected, soft: !(drag && drag.moved) });
  $('#stage').innerHTML = last.svg;
  const n = stemCount(state), cap = SIZES[state.size].cap;
  const pill = $('#countPill');
  pill.textContent = t('stems', { n, cap });
  pill.classList.toggle('warn', n >= cap);
  const mean = bouquetMeaning(state, getLang());
  const note = $('#roseNote');
  note.textContent = mean ? '✿ ' + mean.closing : '';
  note.title = mean ? mean.text : '';
  $('#stage').classList.toggle('empty', n === 0);
  if (n === 0) $('#stage').insertAdjacentHTML('beforeend', `<p class="empty-msg">${esc(t('empty'))}</p>`);
  renderSelbar();
}

function renderStyleSeg() {
  const avail = STYLE_KEYS.filter((k) => k !== 'photo' || assetCount() > 0 || state.style === 'photo');
  $('#styleSeg').innerHTML = avail.map((k) =>
    `<button type="button" role="radio" aria-checked="${state.style === k}" class="${state.style === k ? 'on' : ''}" data-act="style" data-v="${k}">${esc(t('style.' + k))}</button>`).join('');
  $('#styleSeg').title = t('styleLabel');
}

function renderSelbar() {
  const bar = $('#selbar');
  if (!selected || !last?.pos.get(selected)) { bar.hidden = true; return; }
  const g = groupOf(selected);
  const f = FLOWERS[g.type], c = colorOf(g.type, g.color);
  const p = state.place[selected];
  const canFace = f.kind !== 'filler';
  bar.innerHTML = `
    <div class="selbar-head"><strong>${esc(nm(c, f))}</strong>
      <button type="button" class="x-btn" data-act="desel" aria-label="${esc(t('close'))}">×</button></div>
    ${canFace ? `<p class="selbar-hint">${esc(t(f.kind === 'sprig' ? 'faceHintSprig' : 'faceHint'))}</p>` : ''}
    <div class="selbar-actions">
      ${canFace && f.kind === 'bloom' ? `<button type="button" class="chip" data-act="facefront">${esc(t('faceFront'))}</button>` : ''}
      ${p?.m ? `<button type="button" class="chip" data-act="faceauto">${esc(t('faceAuto'))}</button>` : ''}
      <button type="button" class="chip danger" data-act="delstem">${esc(t('deleteStem'))}</button>
    </div>`;
  bar.hidden = false;
  // place the bar next to the selected flower
  const ring = $('#stage .sel-ui circle');
  const col = $('.stage-col').getBoundingClientRect();
  const stg = $('#stage').getBoundingClientRect();
  if (!ring) return;
  const r = ring.getBoundingClientRect();
  const bw = bar.offsetWidth, bh = bar.offsetHeight;
  let x = r.right + 12 - col.left;
  if (x + bw > stg.right - col.left - 8) x = r.left - 12 - bw - col.left;
  x = Math.max(stg.left - col.left + 8, Math.min(x, stg.right - col.left - bw - 8));
  let y = r.top + r.height / 2 - bh / 2 - col.top;
  y = Math.max(stg.top - col.top + 8, Math.min(y, stg.bottom - col.top - bh - 8));
  bar.style.left = x + 'px';
  bar.style.top = y + 'px';
}

/* move & orient flowers directly on the bouquet */
let drag = null;
function svgPoint(e) {
  const svg = $('#stage svg');
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function initDrag() {
  const stage = $('#stage');
  stage.addEventListener('pointerdown', (e) => {
    if (!last || e.button > 0) return;
    const knob = e.target.closest('[data-knob]');
    const el = e.target.closest('[data-stem]');
    const s = svgPoint(e);
    if (knob) {
      drag = { mode: 'face', id: knob.dataset.knob, moved: false };
    } else if (el) {
      const id = el.dataset.stem;
      const p = last.pos.get(id);
      if (!p) return;
      const changed = selected !== id;
      selected = id;
      drag = { mode: 'move', id, ox: p.x - s.x, oy: p.y - s.y, sx: e.clientX, sy: e.clientY, moved: false };
      if (changed) renderStage();
    } else {
      if (selected) { selected = null; renderStage(); }
      return;
    }
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('dragging');
    e.preventDefault();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const s = svgPoint(e);
    const D = last.D, Rp = last.Rp;
    const p = state.place[drag.id];
    if (!p) return;
    if (drag.mode === 'move') {
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
      const x = Math.max(-1.25 * D, Math.min(1.25 * D, s.x + drag.ox));
      const y = Math.max(-1.2 * D, Math.min(1.0 * D, s.y + drag.oy));
      p.x = x / Rp; p.y = y / Rp; p.m = 1;
      if (FLOWERS[groupOf(drag.id).type].kind === 'sprig' && !p.f) p.th = Math.atan2(x, -y);
    } else {
      const c = last.pos.get(drag.id);
      const dx = s.x - c.x, dy = s.y - c.y;
      const ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
      const amt = Math.min(1, Math.hypot(dx, dy) / Math.max(1, c.ring));
      p.f = [ang, amt < 0.14 ? 0 : amt];
      p.m = 1;
    }
    drag.moved = true;
    scheduleStage();
  });
  const end = () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    stage.classList.remove('dragging');
    if (moved) { save(); renderStage(); if (tab === 'arrange') renderPanel(); }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => renderSelbar());
  document.addEventListener('keydown', (e) => {
    if (!selected || /input|textarea/i.test(document.activeElement?.tagName || '')) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); ACTIONS.delstem(); }
    else if (e.key === 'Escape') { selected = null; renderStage(); }
  });
}

/* ---------------- panel ---------------- */
const seg = (act, options, current, extra = '') =>
  `<div class="seg" role="radiogroup">${options.map(([v, label]) =>
    `<button type="button" role="radio" aria-checked="${v === current}" class="${v === current ? 'on' : ''}" data-act="${act}" data-v="${v}" ${extra}>${esc(label)}</button>`).join('')}</div>`;

const stepper = (g) => `<div class="stepper sm">
    <button type="button" data-act="gqty" data-gid="${g.id}" data-v="-1" aria-label="−">−</button>
    <output>${g.count}</output>
    <button type="button" data-act="gqty" data-gid="${g.id}" data-v="1" aria-label="+">+</button>
  </div>
  <button type="button" class="x-btn" data-act="gdel" data-gid="${g.id}" title="${esc(t('remove'))}" aria-label="${esc(t('remove'))}">×</button>`;

const thumb = (g, pfx) => renderFlowerPreview(g.type, g.color, g.grade, g.stage, pfx + g.type + g.color + g.grade + g.stage);

function meaningCard() {
  const m = bouquetMeaning(state, getLang());
  if (!m) return '';
  return `<div class="meaning-card"><span class="mc-label">${esc(t('bouquetMeaning'))}</span><p>${esc(m.text)}</p><p class="mc-close">${esc(m.closing)}</p></div>`;
}

function flowersTab() {
  const f = FLOWERS[picker.type];
  const cdef = colorOf(picker.type, picker.color);
  const cm = meaningOf(picker.type, picker.color);
  const grid = DISPLAY_KEYS.map((k) => {
    const def = FLOWERS[k];
    const hero = HERO[k] || def.colors[0].id;
    return `<button type="button" class="ftype ${k === picker.type ? 'on' : ''}" data-act="type" data-v="${k}">
      <span class="ftype-art">${renderFlowerPreview(k, hero, 1, 2, 'pv' + k)}</span>
      <span class="ftype-name">${esc(L(def.name))}</span></button>`;
  }).join('');
  const colors = f.colors.map((c) =>
    `<button type="button" class="swatch ${c.id === picker.color ? 'on' : ''}" style="--c:${c.hex}" data-act="color" data-v="${c.id}" title="${esc(L(c.name))}" aria-label="${esc(L(c.name))}"></button>`).join('');
  const cap = SIZES[state.size].cap, used = stemCount(state);
  const mini = state.groups.map((g) => {
    const ff = FLOWERS[g.type], c = colorOf(g.type, g.color);
    return `<li class="mini"><span class="mini-art">${thumb(g, 'mn')}</span><span class="mini-name">${esc(nm(c, ff))}</span>${stepper(g)}</li>`;
  }).join('');
  return `
    <a class="tpl-banner" href="library.html"><span class="tpl-banner-ico">✿</span><span><strong>${esc(t('browseTpl'))}</strong><small>${esc(t('browseTplSub', { n: BOUQUETS.length }))}</small></span><span class="tpl-banner-go">→</span></a>
    <h3 class="sec-title">${esc(t('chooseFlower'))}</h3>
    <div class="ftype-grid">${grid}</div>
    <div class="config">
      <div class="config-art">${renderFlowerPreview(picker.type, picker.color, picker.grade, picker.stage, 'pk' + picker.type + picker.color + picker.grade + picker.stage)}</div>
      <div class="config-body">
        <div class="config-head">
          <h4>${esc(nm(cdef, f))}</h4>
          <p class="meaning"><span>${esc(t('meaning'))}</span>${esc(L(cm))}</p>
        </div>
        <label class="field-label">${esc(t('color'))} · <em>${esc(L(cdef.name))}</em></label>
        <div class="swatches">${colors}</div>
        <label class="field-label">${esc(t('grade'))} · <em>${esc(L(GRADES[picker.grade].desc))}</em></label>
        ${seg('grade', GRADES.map((g, i) => [i, L(g.name)]), picker.grade)}
        ${f.stages ? `<label class="field-label">${esc(t('stage'))}</label>${seg('stage', STAGES.map((s, i) => [i, L(s.name)]), picker.stage)}` : ''}
        <div class="add-row">
          <div class="stepper">
            <button type="button" data-act="qty" data-v="-1" aria-label="−">−</button>
            <output>${picker.qty}</output>
            <button type="button" data-act="qty" data-v="1" aria-label="+">+</button>
          </div>
          <button type="button" class="btn primary fill" data-act="add" ${used >= cap ? 'disabled' : ''}>${esc(t('addN', { n: Math.min(picker.qty, Math.max(0, cap - used)) || picker.qty }))}</button>
        </div>
      </div>
    </div>
    ${state.groups.length ? `<div class="sec-row"><h3 class="sec-title">${esc(t('inBouquet'))}</h3><button type="button" class="link-btn" data-act="clear">${esc(t('clearAll'))}</button></div>
    <ul class="mini-list">${mini}</ul><p class="muted small">${esc(t('selectHint'))}</p>` : ''}`;
}

function arrangeTab() {
  const shapeIcons = {
    round: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
    wide: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="13" rx="10" ry="6.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10C19.5 15.4 12 20 12 20Z"/></svg>',
  };
  const shapes = SHAPE_KEYS.map((k) =>
    `<button type="button" class="chip ${state.shape === k ? 'on' : ''}" data-act="shape" data-v="${k}">${shapeIcons[k]}${esc(L(SHAPES[k]))}</button>`).join('');
  const groups = state.groups.map((g) => {
    const f = FLOWERS[g.type], c = colorOf(g.type, g.color);
    const sub = [L(GRADES[g.grade].name), f.stages ? L(STAGES[g.stage].name) : null].filter(Boolean).join(' · ');
    const dists = distsFor(f.kind).map((d) => [d, L(DISTS[d])]);
    return `<li class="grp">
      <span class="grp-art">${thumb(g, 'gl')}</span>
      <div class="grp-main">
        <div class="grp-top">
          <div><strong>${esc(nm(c, f))}</strong><small>${esc(sub)}</small></div>
          ${stepper(g)}
        </div>
        <div class="grp-dist">${seg('gdist', dists, g.dist, `data-gid="${g.id}"`)}
        ${g.dist === 'cluster' ? `<div class="cl"><span>${esc(t('clusters'))}</span>${seg('gcl', [[1, '1'], [2, '2'], [3, '3']], g.clusters || 2, `data-gid="${g.id}"`)}</div>` : ''}</div>
      </div></li>`;
  }).join('');
  return `
    ${meaningCard()}
    <h3 class="sec-title">${esc(t('shape'))}</h3>
    <div class="chips">${shapes}</div>
    <h3 class="sec-title">${esc(t('greenery'))}</h3>
    ${seg('greenery', GREENERY.map((g, i) => [i, L(g)]), state.greenery)}
    <div class="sec-row"><h3 class="sec-title">${esc(t('inBouquet'))}</h3>
      <div class="row-actions">
        ${hasManual() ? `<button type="button" class="link-btn" data-act="resetpos">${esc(t('resetPos'))}</button>` : ''}
        ${state.groups.length ? `<button type="button" class="link-btn" data-act="clear">${esc(t('clearAll'))}</button>` : ''}
      </div></div>
    ${state.groups.length ? `<ul class="grp-list">${groups}</ul>` : `<p class="muted empty-note">${esc(t('empty'))}</p>`}
    <p class="muted small">${esc(t('selectHint'))}</p>`;
}

function wrapTab() {
  const sizes = SIZE_KEYS.map((k) => {
    const s = SIZES[k];
    return `<button type="button" class="size-card ${state.size === k ? 'on' : ''}" data-act="size" data-v="${k}">
      <span class="size-ico" style="--s:${0.55 + SIZE_KEYS.indexOf(k) * 0.15}"><i></i></span>
      <strong>${esc(L(s.name))}</strong><small>${esc(t('upTo', { n: s.cap }))}</small><em>${esc(L(s.note))}</em></button>`;
  }).join('');
  const papers = WRAP_KEYS.map((k) => {
    const w = WRAPS[k];
    return `<button type="button" class="paper ${state.wrap === k ? 'on' : ''}" data-act="wrap" data-v="${k}" style="--o:${w.outer};--i:${w.inner}"><span></span>${esc(L(w.name))}</button>`;
  }).join('');
  const ribbons = RIBBON_KEYS.map((k) => {
    const r = RIBBONS[k];
    return `<button type="button" class="swatch ribbon ${state.ribbon === k ? 'on' : ''}" style="--c:${r.hex}" data-act="ribbon" data-v="${k}" title="${esc(L(r.name))}" aria-label="${esc(L(r.name))}"></button>`;
  }).join('');
  return `
    <h3 class="sec-title">${esc(t('size'))}</h3>
    <div class="size-grid">${sizes}</div>
    <h3 class="sec-title">${esc(t('paper'))}</h3>
    <div class="paper-grid">${papers}</div>
    <h3 class="sec-title">${esc(t('ribbon'))} · <em class="thin">${esc(L(RIBBONS[state.ribbon].name))}</em></h3>
    <div class="swatches">${ribbons}</div>`;
}

function cardTab() {
  const c = state.card;
  const tmpls = TEMPLATES.map((tp, i) => `<button type="button" class="chip" data-act="tmpl" data-v="${i}">${esc(L(tp.tag))}</button>`).join('');
  return `
    <h3 class="sec-title">${esc(t('cardTitle'))}</h3>
    <div class="card-form">
      <label><span>${esc(t('to'))}</span><input id="cTo" maxlength="40" value="${esc(c.to)}" placeholder="${esc(t('toPh'))}" /></label>
      <label><span>${esc(t('message'))}</span><textarea id="cMsg" maxlength="300" rows="5" placeholder="${esc(t('msgPh'))}">${esc(c.msg)}</textarea></label>
      <label><span>${esc(t('from'))}</span><input id="cFrom" maxlength="40" value="${esc(c.from)}" placeholder="${esc(t('fromPh'))}" /></label>
    </div>
    <p class="field-label">${esc(t('templates'))}</p>
    <div class="chips">${tmpls}</div>
    ${meaningCard()}
    <button type="button" class="btn primary big" data-act="send">${esc(t('send'))}
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14m-5-5 5 5-5 5"/></svg></button>`;
}

function renderPanel() {
  const body = $('#panelBody');
  const html = { flowers: flowersTab, arrange: arrangeTab, wrap: wrapTab, card: cardTab }[tab]();
  body.innerHTML = html;
  document.querySelectorAll('.tabs [data-tab]').forEach((b) => {
    b.classList.toggle('on', b.dataset.tab === tab);
    b.setAttribute('aria-selected', b.dataset.tab === tab);
  });
  if (tab === 'card') {
    const bind = (id, key) => $(id).addEventListener('input', (e) => { state.card[key] = e.target.value; save(); });
    bind('#cTo', 'to'); bind('#cFrom', 'from'); bind('#cMsg', 'msg');
  }
}

function update({ panel = true, stage = true } = {}) {
  syncPlacement(state);
  save();
  if (stage) renderStage();
  if (panel) renderPanel();
}

/** Re-arrange automatically placed stems (hand-placed ones stay put). */
function relayout() {
  syncPlacement(state, { full: true });
}

/* ---------------- actions ---------------- */
function addFlowers() {
  const cap = SIZES[state.size].cap, used = stemCount(state);
  const room = cap - used;
  if (room <= 0) { toast(t('full')); return; }
  const n = Math.min(picker.qty, room);
  const f = FLOWERS[picker.type];
  const stage = f.stages ? picker.stage : 2;
  let g = state.groups.find((x) => x.type === picker.type && x.color === picker.color && x.grade === picker.grade && x.stage === stage);
  if (!g) {
    g = { id: state.nextId++, type: picker.type, color: picker.color, grade: picker.grade, stage, keys: [], nextK: 0, count: 0, dist: 'scatter', clusters: 2 };
    state.groups.push(g);
  }
  addStems(g, n);
  toast(t('added', { name: nm(colorOf(picker.type, picker.color), f), n }) + (n < picker.qty ? ' · ' + t('full') : ''));
  update(); // new stems are fitted into gaps; existing flowers stay where they are
}

const findG = (el) => state.groups.find((x) => x.id === +el.dataset.gid);

const ACTIONS = {
  type: (v) => { picker.type = v; picker.color = (HERO[v] && FLOWERS[v].colors.some((c) => c.id === HERO[v])) ? HERO[v] : FLOWERS[v].colors[0].id; update({ stage: false }); },
  color: (v) => { picker.color = v; update({ stage: false }); },
  grade: (v) => { picker.grade = +v; update({ stage: false }); },
  stage: (v) => { picker.stage = +v; update({ stage: false }); },
  qty: (v) => { picker.qty = Math.max(1, Math.min(99, picker.qty + +v)); update({ stage: false }); },
  add: () => addFlowers(),
  shape: (v) => { state.shape = v; state.place = {}; selected = null; update(); },
  greenery: (v) => { state.greenery = +v; update(); },
  size: (v) => {
    if (stemCount(state) > SIZES[v].cap) { toast(t('full')); return; }
    state.size = v; update();
  },
  wrap: (v) => { state.wrap = v; update(); },
  ribbon: (v) => { state.ribbon = v; update(); },
  gqty: (v, el) => {
    const g = findG(el);
    if (!g) return;
    if (+v > 0) {
      if (stemCount(state) >= SIZES[state.size].cap) { toast(t('full')); return; }
      addStems(g, 1);
    } else removeLast(g);
    update();
  },
  gdel: (_, el) => {
    const g = findG(el);
    if (!g) return;
    for (const k of groupKeys(g)) delete state.place[`${g.id}.${k}`];
    state.groups = state.groups.filter((x) => x !== g);
    update();
  },
  gdist: (v, el) => { const g = findG(el); if (g) { g.dist = v; relayout(); update(); } },
  gcl: (v, el) => { const g = findG(el); if (g) { g.clusters = +v; relayout(); update(); } },
  shuffle: () => { state.seed = Math.floor(Math.random() * 1e9); state.place = {}; selected = null; update({ panel: tab === 'arrange' }); },
  resetpos: () => {
    for (const p of Object.values(state.place)) { delete p.m; delete p.f; }
    relayout(); update();
  },
  clear: () => { state.groups = []; state.place = {}; selected = null; update(); },
  tmpl: (v) => { state.card.msg = TEMPLATES[+v][getLang()]; save(); const m = $('#cMsg'); if (m) m.value = state.card.msg; },
  send: () => openShare(),
  style: (v) => {
    if (!STYLE_KEYS.includes(v)) return;
    state.style = v;
    try { localStorage.setItem(STYLE_PREF, v); } catch {}
    renderStyleSeg();
    update({ panel: false });
  },
  desel: () => { selected = null; renderStage(); },
  delstem: () => { if (!selected) return; removeStem(selected); update(); },
  facefront: () => { const p = state.place[selected]; if (p) { p.f = [p.f?.[0] ?? 0, 0]; p.m = 1; update({ panel: tab === 'arrange' }); } },
  faceauto: () => {
    const p = state.place[selected];
    if (!p) return;
    delete p.f;
    if (FLOWERS[groupOf(selected).type].kind === 'sprig') p.th = Math.atan2(p.x, -p.y);
    update({ panel: tab === 'arrange' });
  },
};

document.addEventListener('click', (e) => {
  const tb = e.target.closest('.tabs [data-tab]');
  if (tb) { tab = tb.dataset.tab; renderPanel(); return; }
  if (e.target.closest('#roseNote')) { tab = 'arrange'; renderPanel(); return; }
  const el = e.target.closest('[data-act]');
  if (el && ACTIONS[el.dataset.act]) ACTIONS[el.dataset.act](el.dataset.v, el);
});

/* ---------------- share dialog ---------------- */
let shareUrl = '';
async function openShare() {
  if (stemCount(state) === 0) { toast(t('needFlowers')); return; }
  const code = await encodeGift(state, state.card, getLang());
  shareUrl = giftUrl(code);
  $('#shareLink').value = shareUrl;
  $('#shareArt').innerHTML = renderBouquet(state, { prefix: 'sh', background: false }).svg;
  $('#nativeShare').hidden = !navigator.share;
  $('#shareDlg').showModal();
}

$('#shareDlg').addEventListener('click', async (e) => {
  if (e.target === $('#shareDlg')) { $('#shareDlg').close(); return; }
  const b = e.target.closest('[data-dlg]');
  if (!b) return;
  const what = b.dataset.dlg;
  if (what === 'copy') {
    try { await navigator.clipboard.writeText(shareUrl); }
    catch { $('#shareLink').select(); document.execCommand('copy'); }
    toast(t('copied'));
  } else if (what === 'share') {
    const from = state.card.from ? state.card.from + ' · ' : '';
    try { await navigator.share({ title: t('giftFor'), text: from + t('giftFor') + ' 💐', url: shareUrl }); } catch {}
  } else if (what === 'preview') {
    window.open(shareUrl, '_blank', 'noopener');
  } else if (what === 'download') {
    toast(t('saving'));
    await preloadDesign(state);
    const svg = await inlineAssets(renderBouquet(state, { prefix: 'ex', width: 1400 }).svg);
    const c = state.card;
    const m = bouquetMeaning(state, getLang());
    await downloadPng(svg, { card: { to: c.to ? t('dear', { name: c.to }) : '', msg: c.msg, from: c.from, meaning: m ? `${t('bouquetMeaning')} · ${m.closing}` : '' } });
  }
});

/* ---------------- boot ---------------- */
$('#langBtn').addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
onLang(() => { renderStyleSeg(); renderStage(); renderPanel(); });
onAssetsReady(() => { clearFlowerCache(); scheduleStage(); });
applyI18n();
initDrag();
renderStyleSeg();
renderStage();
loadManifest().then(() => { renderStyleSeg(); clearFlowerCache(); renderStage(); });
renderPanel();
if (pendingToast) toast(pendingToast);
