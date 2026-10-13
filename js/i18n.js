// Tiny bilingual layer. UI strings live here; flower data carries its own {en, zh} names.

const DICT = {
  en: {
    brand: 'Digit Florist',
    tagline: 'Hand-tie a bouquet. Send it as a message.',
    'tab.flowers': 'Flowers', 'tab.arrange': 'Arrange', 'tab.wrap': 'Wrap', 'tab.card': 'Card',
    chooseFlower: 'Choose a flower',
    color: 'Colour', grade: 'Quality', stage: 'Bloom', qty: 'Stems',
    addN: 'Add {n} to bouquet',
    meaning: 'Flower language',
    added: '{name} ×{n} added',
    full: 'Your bouquet is full — pick a larger size under Wrap.',
    stems: '{n} / {cap} stems',
    inBouquet: 'In your bouquet',
    empty: 'Your bouquet is empty — pick a few flowers to begin.',
    shape: 'Bouquet shape', greenery: 'Greenery', placement: 'Placement', clusters: 'Clusters',
    shuffle: 'Shuffle', resetPos: 'Undo manual tweaks', clearAll: 'Clear all',
    faceHint: 'Drag the red dot to set which way it faces — pull it to the edge to tilt more, to the centre to face you.',
    faceHintSprig: 'Drag the red dot to point the stem in any direction.',
    faceFront: 'Face forward', faceAuto: 'Auto direction', deleteStem: 'Remove this stem',
    selectHint: 'Click a flower on the bouquet to select it: drag to move, use the red dot to turn it, or press Delete to remove it.',
    bouquetMeaning: 'Your bouquet says',
    dragHint: 'Tip: click a flower to select it — drag to move, drag the red dot to turn it, Delete to remove.',
    size: 'Bouquet size', paper: 'Wrapping paper', ribbon: 'Ribbon', upTo: 'up to {n} stems',
    cardTitle: 'Write a card',
    to: 'To', from: 'From', message: 'Message',
    toPh: 'Their name', fromPh: 'Your name', msgPh: 'Write something from the heart…',
    templates: 'Need inspiration?',
    send: 'Wrap it up & send',
    shareTitle: 'Your bouquet is ready',
    shareDesc: 'Send this link — they’ll unwrap it right in their browser.',
    copy: 'Copy link', copied: 'Link copied', shareBtn: 'Share…', preview: 'Preview as recipient',
    download: 'Save as image', close: 'Close', saving: 'Preparing image…',
    needFlowers: 'Add at least one flower first.',
    roseMeaning: '{n} roses — “{m}”',
    remove: 'Remove', next: 'Next',
    giftFor: 'A bouquet for you', giftFrom: 'from {name}', tapOpen: 'Tap to open',
    replay: 'Replay', makeOwn: 'Make your own bouquet',
    invalid: 'This bouquet link looks incomplete. Ask the sender to copy it again?',
    someone: 'someone special', dear: 'Dear {name},',
    footer: 'Every flower is drawn live in your browser. Your bouquet lives only inside the link you send.',
    hello: 'For you',
    langLabel: '中文',
    navStudio: 'Studio', navLibrary: 'Templates',
    styleLabel: 'Style', 'style.illustrated': 'Illustrated', 'style.watercolor': 'Watercolour', 'style.photo': 'Photo',
    libTitle: 'Bouquet library', libSub: 'Hand-picked bouquets for every moment. Open one, then change anything you like.',
    'by.occasion': 'By occasion', 'by.theme': 'By style', 'by.language': 'By flower language', all: 'All',
    stemsN: '{n} stems', useTpl: 'Use & customise', sendTpl: 'Write a card & send',
    tplLoaded: 'Template “{name}” loaded — make it yours!',
    browseTpl: 'Start from a template', browseTplSub: '{n} ready-made bouquets by occasion, style and flower language',
  },
  zh: {
    brand: '数字花坊',
    tagline: '亲手扎一束花，化作一条消息送出。',
    'tab.flowers': '选花', 'tab.arrange': '排列', 'tab.wrap': '包装', 'tab.card': '贺卡',
    chooseFlower: '挑选花材',
    color: '颜色', grade: '品质', stage: '开放程度', qty: '枝数',
    addN: '加入花束（{n} 枝）',
    meaning: '花语',
    added: '已加入 {name} ×{n}',
    full: '花束已满，可以在「包装」里换更大的尺寸。',
    stems: '{n} / {cap} 枝',
    inBouquet: '花束里的花',
    empty: '花束还是空的，先去挑几枝花吧。',
    shape: '花束形状', greenery: '配叶', placement: '分布方式', clusters: '簇数',
    shuffle: '重新排布', resetPos: '撤销手动调整', clearAll: '清空',
    faceHint: '拖动红点调整花的朝向：拉向外圈倾斜更多，拉回中心则正对着你。',
    faceHintSprig: '拖动红点，让这一枝指向任意方向。',
    faceFront: '正对前方', faceAuto: '自动朝向', deleteStem: '删除这一枝',
    selectHint: '点击花束上的任意一朵花即可选中：拖动可移动，拖红点可调整朝向，按 Delete 键可删除。',
    bouquetMeaning: '这束花的花语',
    dragHint: '小提示：点击花束上的花即可选中——拖动移动位置，拖红点调整朝向，按 Delete 删除。',
    size: '花束大小', paper: '包装纸', ribbon: '丝带', upTo: '最多 {n} 枝',
    cardTitle: '写一张贺卡',
    to: '送给', from: '来自', message: '想说的话',
    toPh: 'TA 的名字', fromPh: '你的名字', msgPh: '写下想对 TA 说的话……',
    templates: '找找灵感',
    send: '包好并送出',
    shareTitle: '花束已包好',
    shareDesc: '把这个链接发给 TA，打开就能亲手拆开这束花。',
    copy: '复制链接', copied: '链接已复制', shareBtn: '分享…', preview: '以收花人视角预览',
    download: '保存为图片', close: '关闭', saving: '正在生成图片……',
    needFlowers: '请先加入至少一枝花。',
    roseMeaning: '{n} 枝玫瑰 ——「{m}」',
    remove: '移除', next: '下一步',
    giftFor: '有一束花送给你', giftFrom: '来自 {name}', tapOpen: '点击拆开',
    replay: '再看一次', makeOwn: '我也要扎一束',
    invalid: '这个花束链接好像不完整，请让对方重新复制一次。',
    someone: '一个特别的人', dear: '亲爱的 {name}：',
    footer: '每一朵花都在你的浏览器里实时绘制，花束只存在于你发送的链接中。',
    hello: '送给你',
    langLabel: 'EN',
    navStudio: '扎花工作台', navLibrary: '模板库',
    styleLabel: '画风', 'style.illustrated': '插画', 'style.watercolor': '水彩', 'style.photo': '照片',
    libTitle: '花束模板库', libSub: '为每个重要时刻精选的花束。挑一束喜欢的，再随心修改。',
    'by.occasion': '按用途', 'by.theme': '按风格', 'by.language': '按花语', all: '全部',
    stemsN: '{n} 枝', useTpl: '使用并修改', sendTpl: '直接写贺卡送出',
    tplLoaded: '已载入模板「{name}」，随意修改吧！',
    browseTpl: '从模板开始', browseTplSub: '{n} 款现成花束，按用途、风格和花语分类',
  },
};

const KEY = 'digit-florist-lang';
let lang = (() => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {}
  return (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
})();

const listeners = new Set();
export const getLang = () => lang;
export const hasSavedLang = () => { try { return !!localStorage.getItem(KEY); } catch { return false; } };
export function setLang(l, persist = true) {
  lang = l === 'zh' ? 'zh' : 'en';
  if (persist) { try { localStorage.setItem(KEY, lang); } catch {} }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  applyI18n();
  listeners.forEach((f) => f(lang));
}
export const onLang = (f) => listeners.add(f);

export function t(key, vars = {}) {
  let s = DICT[lang][key] ?? DICT.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
/** Pick the current language from an {en, zh} object. */
export const L = (obj) => (obj ? obj[lang] ?? obj.en : '');

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}
