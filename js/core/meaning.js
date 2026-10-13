// Reads the whole bouquet and writes its "flower language".
import { FLOWERS, ROSE_COUNTS, colorOf, meaningOf } from './catalog.js';
import { groupKeys } from './placement.js';

const CLOSING = {
  love: { en: 'Every stem says the same thing: I love you.', zh: '整束花只想说一句：我爱你。' },
  thanks: { en: 'Thank you — for everything you are to me.', zh: '谢谢你，一直以来的温柔与陪伴。' },
  joy: { en: 'May your days shine as brightly as this bouquet.', zh: '愿你的每一天都像这束花一样明亮。' },
  hope: { en: 'Be gentle with yourself — brighter days are coming.', zh: '愿你被温柔以待，一切都会慢慢变好。' },
  bless: { en: 'With the purest and most heartfelt wishes.', zh: '献上最真挚、最纯洁的祝福。' },
};

const plural = (s, n) => {
  if (n < 2 || /breath|eucalyptus|lavender/.test(s)) return s;
  return /[^aeiou]y$/.test(s) ? s.slice(0, -1) + 'ies' : s + 's';
};

const nameOf = (g, lang) => {
  const f = FLOWERS[g.type], c = colorOf(g.type, g.color);
  return lang === 'zh' ? `${c.name.zh}${f.name.zh}` : `${c.name.en} ${f.name.en.toLowerCase()}`;
};

/** @returns {{ text: string, closing: string } | null} */
export function bouquetMeaning(design, lang = 'en') {
  const groups = design.groups.filter((g) => groupKeys(g).length > 0);
  if (!groups.length) return null;
  const blooms = groups.filter((g) => FLOWERS[g.type].kind === 'bloom').sort((a, b) => b.count - a.count);
  const accents = groups.filter((g) => FLOWERS[g.type].kind !== 'bloom');
  const weight = {};
  for (const g of groups) {
    const m = meaningOf(g.type, g.color);
    weight[m.cat] = (weight[m.cat] || 0) + g.count * (FLOWERS[g.type].kind === 'bloom' ? 1 : 0.4);
  }
  const top = Object.entries(weight).sort((a, b) => b[1] - a[1])[0][0];
  const roses = groups.filter((g) => g.type === 'rose').reduce((a, g) => a + g.count, 0);
  const rc = ROSE_COUNTS[roses];
  const zh = lang === 'zh';
  const parts = [];
  const lead = blooms[0] || accents[0];
  const lm = meaningOf(lead.type, lead.color)[zh ? 'zh' : 'en'];
  parts.push(zh
    ? `以 ${lead.count} 枝${nameOf(lead, 'zh')}的「${lm}」为主调`
    : `${lead.count} ${plural(nameOf(lead, 'en'), lead.count)} ${lead.count > 1 ? 'lead' : 'leads'} with ${lm}`);
  const rest = blooms.filter((g) => g !== lead).slice(0, 3);
  if (rest.length) {
    const list = rest.map((g) => zh ? `${nameOf(g, 'zh')}（${meaningOf(g.type, g.color).zh}）` : `${nameOf(g, 'en')} for ${meaningOf(g.type, g.color).en}`);
    parts.push(zh ? `配以${list.join('、')}` : `joined by ${list.join(', ')}`);
  }
  const acc = accents.filter((g) => g !== lead);
  if (acc.length) {
    const names = acc.map((g) => zh ? FLOWERS[g.type].name.zh : FLOWERS[g.type].name.en.toLowerCase());
    const ms = acc.map((g) => meaningOf(g.type, g.color)[zh ? 'zh' : 'en']);
    parts.push(zh ? `${names.join('、')}点缀其间，寓意${ms.join('、')}` : `with ${names.join(' and ')} woven through for ${ms.join(' and ')}`);
  }
  let text = zh ? parts.join('，') + '。' : parts.join('; ') + '.';
  if (!zh) text = text[0].toUpperCase() + text.slice(1);
  if (rc) text += zh ? `${roses} 枝玫瑰，寓意「${rc.zh}」。` : ` ${roses} roses mean “${rc.en}”.`;
  return { text, closing: CLOSING[top][zh ? 'zh' : 'en'], cat: top };
}
