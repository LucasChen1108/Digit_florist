import { t, getLang, setLang, onLang, applyI18n, hasSavedLang } from './i18n.js';
import { renderBouquet } from './core/bouquet.js';
import { colorOf, FLOWERS } from './core/catalog.js';
import { decodeGift } from './share.js';
import { downloadPng } from './export.js';
import { petalPath, shades } from './core/util.js';

const $ = (s) => document.querySelector(s);
let gift = null;
let opened = false;

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function fillText() {
  if (!gift) return;
  const { card } = gift;
  $('#envFrom').textContent = t('giftFrom', { name: card.from || t('someone') });
  $('#noteTo').textContent = card.to ? t('dear', { name: card.to }) : t('hello');
  $('#noteMsg').textContent = card.msg || '';
  $('#noteFrom').textContent = card.from ? '— ' + card.from : '';
  $('#note').hidden = !card.msg && !card.to && !card.from;
  document.title = `${t('giftFor')} · ${t('brand')}`;
}

function petalRain() {
  const box = $('#petals');
  box.innerHTML = '';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const blooms = gift.design.groups.filter((g) => FLOWERS[g.type].kind === 'bloom');
  const hexes = (blooms.length ? blooms : gift.design.groups).map((g) => colorOf(g.type, g.color).hex);
  const d = petalPath(20, 13, { tip: 'round', widest: 0.62 });
  for (let i = 0; i < 16; i++) {
    const hex = hexes[i % hexes.length] || '#e8a0aa';
    const s = shades(hex);
    const el = document.createElement('span');
    el.className = 'petal';
    el.style.cssText = `left:${Math.random() * 100}%;--dur:${9 + Math.random() * 8}s;--delay:${-Math.random() * 14}s;--sway:${30 + Math.random() * 60}px;--rot:${Math.random() * 360}deg;--sc:${0.6 + Math.random() * 0.7}`;
    el.innerHTML = `<svg viewBox="-14 -22 28 24"><defs><linearGradient id="pg${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${s.dark}"/><stop offset="1" stop-color="${s.light}"/></linearGradient></defs><path d="${d}" fill="url(#pg${i})"/></svg>`;
    box.append(el);
  }
}

function showBouquet() {
  const stage = $('#giftStage');
  stage.innerHTML = renderBouquet(gift.design, { prefix: 'gf', animate: true }).svg;
}

function open() {
  if (opened) return;
  opened = true;
  $('#envelope').classList.add('opening');
  setTimeout(() => {
    $('#envelope').hidden = true;
    $('#reveal').hidden = false;
    showBouquet();
    requestAnimationFrame(() => $('#reveal').classList.add('in'));
    petalRain();
  }, 1100);
}

async function boot() {
  applyI18n();
  const code = location.hash.slice(1);
  try {
    if (!code) throw new Error('empty');
    gift = await decodeGift(code);
  } catch {
    $('#envelope').hidden = true;
    $('#invalid').hidden = false;
    return;
  }
  if (!hasSavedLang()) setLang(gift.lang, false);
  fillText();
  $('#envArt').innerHTML = renderBouquet(gift.design, { prefix: 'ev', background: false }).svg;
  $('#openBtn').addEventListener('click', open);
  $('#replayBtn').addEventListener('click', () => { showBouquet(); $('#note').classList.remove('in'); void $('#note').offsetWidth; $('#note').classList.add('in'); });
  $('#saveBtn').addEventListener('click', async () => {
    toast(t('saving'));
    const { svg } = renderBouquet(gift.design, { prefix: 'ex', width: 1400 });
    const c = gift.card;
    await downloadPng(svg, { card: { to: c.to ? t('dear', { name: c.to }) : '', msg: c.msg, from: c.from ? c.from : '' } });
  });
  $('#note').classList.add('in');
}

$('#langBtn').addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
onLang(fillText);
window.addEventListener('hashchange', () => location.reload());
boot();
