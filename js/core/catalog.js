// Everything a customer can choose. Order of TYPE_KEYS / colour lists is part of the
// share-link format: only ever APPEND new entries so old links keep working.

const c = (id, hex, en, zh, extra = {}) => ({ id, hex, name: { en, zh }, ...extra });

export const FLOWERS = {
  rose: {
    kind: 'bloom', size: 1, stages: true,
    name: { en: 'Rose', zh: '玫瑰' },
    meaning: { en: 'Love, passion and devotion', zh: '热烈的爱与忠贞' },
    colors: [
      c('red', '#c8102e', 'Velvet Red', '丝绒红'),
      c('burgundy', '#7b1730', 'Burgundy', '勃艮第酒红'),
      c('pink', '#ef86a3', 'Sweetheart Pink', '甜心粉'),
      c('blush', '#f6c4bf', 'Blush', '奶油腮红'),
      c('white', '#f7f2ea', 'Snow White', '雪山白'),
      c('champagne', '#eecfa2', 'Champagne', '香槟'),
      c('yellow', '#f5cb3f', 'Golden Yellow', '暖阳黄'),
      c('coral', '#f27a5a', 'Coral', '珊瑚橙'),
      c('lilac', '#b49ad6', 'Lilac Mist', '紫雾'),
      c('blue', '#3a5fb8', 'Blue Enchantress', '蓝色妖姬'),
      c('black', '#3d1422', 'Black Magic', '黑魔术'),
    ],
  },
  tulip: {
    kind: 'bloom', size: 1.02, stages: true, upright: true,
    name: { en: 'Tulip', zh: '郁金香' },
    meaning: { en: 'Perfect, graceful love', zh: '完美的爱与优雅' },
    colors: [
      c('red', '#d4243b', 'Ruby', '宝石红'),
      c('pink', '#f39ab3', 'Pink', '芭比粉'),
      c('yellow', '#f6cf45', 'Butter Yellow', '奶油黄'),
      c('white', '#f6f1e6', 'Ivory', '象牙白'),
      c('purple', '#7d4ea3', 'Royal Purple', '皇家紫'),
      c('orange', '#f2873a', 'Apricot', '杏橙'),
    ],
  },
  peony: {
    kind: 'bloom', size: 1.2, stages: true,
    name: { en: 'Peony', zh: '芍药' },
    meaning: { en: 'Romance and a happy life', zh: '美满、圆满与浪漫' },
    colors: [
      c('blush', '#f6c4cc', 'Sarah Blush', '粉玉奴'),
      c('coral', '#f3866e', 'Coral Charm', '珊瑚魅力'),
      c('magenta', '#c63a7a', 'Magenta', '洋红'),
      c('white', '#f8f1ec', 'Duchess White', '公爵白'),
      c('burgundy', '#8e1f3c', 'Red Charm', '红魅'),
    ],
  },
  sunflower: {
    kind: 'bloom', size: 1.15, stages: true,
    name: { en: 'Sunflower', zh: '向日葵' },
    meaning: { en: 'Loyalty and warm admiration', zh: '忠诚与阳光般的爱慕' },
    colors: [
      c('golden', '#f5b51a', 'Golden', '金黄'),
      c('lemon', '#f6d84a', 'Lemon', '柠檬黄'),
      c('bronze', '#b8502a', 'Autumn Bronze', '秋日铜'),
    ],
  },
  lily: {
    kind: 'bloom', size: 1.12, stages: true,
    name: { en: 'Lily', zh: '百合' },
    meaning: { en: 'Purity and lasting harmony', zh: '纯洁与百年好合' },
    colors: [
      c('white', '#fbf8f2', 'Casa Blanca', '卡萨布兰卡'),
      c('pink', '#e6658f', 'Stargazer', '香水百合', { spots: true }),
      c('orange', '#f08a2c', 'Tiger Orange', '虎皮橙', { spots: true }),
      c('yellow', '#f6cf3e', 'Sunny Yellow', '明黄'),
    ],
  },
  carnation: {
    kind: 'bloom', size: 0.86, stages: true,
    name: { en: 'Carnation', zh: '康乃馨' },
    meaning: { en: 'Gratitude and a mother’s love', zh: '感恩与温馨的母爱' },
    colors: [
      c('red', '#cf2140', 'Red', '正红'),
      c('pink', '#f4a3b5', 'Soft Pink', '柔粉'),
      c('white', '#f8f3ec', 'White', '纯白'),
      c('peach', '#f7b48e', 'Peach', '蜜桃'),
      c('purple', '#9a5fb3', 'Moonlight Purple', '月光紫'),
    ],
  },
  daisy: {
    kind: 'bloom', size: 0.78, stages: true,
    name: { en: 'Daisy', zh: '雏菊' },
    meaning: { en: 'Innocence, joy and hope', zh: '天真、快乐与希望' },
    colors: [
      c('white', '#fbfaf6', 'White', '白'),
      c('pink', '#f4a9c1', 'Pink', '粉'),
      c('yellow', '#f7d64a', 'Yellow', '黄'),
    ],
  },
  hydrangea: {
    kind: 'bloom', size: 1.3, stages: true,
    name: { en: 'Hydrangea', zh: '绣球' },
    meaning: { en: 'Heartfelt gratitude and togetherness', zh: '希望、团聚与美满' },
    colors: [
      c('blue', '#7ea6dc', 'Sky Blue', '天空蓝'),
      c('purple', '#9b84c9', 'Violet', '紫罗兰'),
      c('pink', '#efa7c3', 'Rose Pink', '蔷薇粉'),
      c('white', '#f1f0e6', 'Cloud White', '云朵白'),
      c('green', '#c5d79f', 'Lime Green', '青柠绿'),
    ],
  },
  lavender: {
    kind: 'sprig',
    name: { en: 'Lavender', zh: '薰衣草' },
    meaning: { en: 'Devotion and calm', zh: '等待爱情与宁静' },
    colors: [c('purple', '#8b6fc0', 'Provence', '普罗旺斯紫'), c('white', '#e8e4f0', 'White', '白')],
  },
  eucalyptus: {
    kind: 'sprig',
    name: { en: 'Eucalyptus', zh: '尤加利叶' },
    meaning: { en: 'Protection and healing', zh: '恩赐与守护' },
    colors: [c('silver', '#8fa89a', 'Silver Dollar', '银叶'), c('sage', '#a7b59a', 'Sage', '鼠尾草绿')],
  },
  babysbreath: {
    kind: 'filler',
    name: { en: 'Baby’s breath', zh: '满天星' },
    meaning: { en: 'Everlasting love', zh: '思念与甘做配角的爱' },
    colors: [c('white', '#ffffff', 'White', '白'), c('pink', '#f6c3d3', 'Pink', '粉'), c('blue', '#a9c6ec', 'Blue', '蓝')],
  },
};

export const TYPE_KEYS = ['rose', 'tulip', 'peony', 'sunflower', 'lily', 'carnation', 'daisy', 'hydrangea', 'lavender', 'eucalyptus', 'babysbreath'];

export const GRADES = [
  { name: { en: 'Classic', zh: '经典' }, desc: { en: 'Simple, fresh blooms', zh: '简约清新' }, f: 0.9 },
  { name: { en: 'Premium', zh: '精选' }, desc: { en: 'Fuller petals, larger heads', zh: '花瓣更饱满，花头更大' }, f: 1 },
  { name: { en: 'Luxe', zh: '臻品' }, desc: { en: 'Extra petal layers & morning dew', zh: '额外花瓣层次，带晨露' }, f: 1.1 },
];

export const STAGES = [
  { name: { en: 'Bud', zh: '含苞' }, f: 0.62 },
  { name: { en: 'Blooming', zh: '初绽' }, f: 0.84 },
  { name: { en: 'Full bloom', zh: '盛放' }, f: 1 },
];

export const DISTS = {
  scatter: { en: 'Spread evenly', zh: '均匀分散' },
  cluster: { en: 'Cluster', zh: '集中成簇' },
  center: { en: 'Centerpiece', zh: '居中' },
  edge: { en: 'Outer ring', zh: '外圈环绕' },
};
export const DIST_KEYS = ['scatter', 'cluster', 'center', 'edge'];
export const distsFor = (kind) => (kind === 'bloom' ? DIST_KEYS : ['scatter', 'cluster']);

export const SIZES = {
  S: { cap: 11, D: 190, name: { en: 'Petite', zh: '小巧' }, note: { en: 'A sweet hand-tied posy', zh: '一心一意的小花束' } },
  M: { cap: 33, D: 250, name: { en: 'Classic', zh: '经典' }, note: { en: 'The everyday favourite', zh: '最受欢迎的尺寸' } },
  L: { cap: 66, D: 310, name: { en: 'Grand', zh: '华丽' }, note: { en: 'Generous and lush', zh: '丰盈饱满' } },
  XL: { cap: 99, D: 365, name: { en: 'Majestic', zh: '盛典' }, note: { en: 'Room for 99 — forever', zh: '容纳 99 枝，天长地久' } },
};
export const SIZE_KEYS = ['S', 'M', 'L', 'XL'];

export const SHAPES = {
  round: { en: 'Round', zh: '圆形' },
  wide: { en: 'Wide fan', zh: '宽扇形' },
  heart: { en: 'Heart', zh: '心形' },
};
export const SHAPE_KEYS = ['round', 'wide', 'heart'];

export const GREENERY = [
  { en: 'None', zh: '无' },
  { en: 'Light', zh: '少量' },
  { en: 'Lush', zh: '丰盈' },
];

export const WRAPS = {
  kraft: { outer: '#c49a70', inner: '#efe2cf', name: { en: 'Kraft', zh: '牛皮纸' } },
  pearl: { outer: '#f3ede6', inner: '#e5d3c8', name: { en: 'Pearl', zh: '珍珠白' } },
  blush: { outer: '#efbcc3', inner: '#fbeef0', name: { en: 'Blush', zh: '樱花粉' } },
  midnight: { outer: '#2b2933', inner: '#d8c6a4', name: { en: 'Midnight', zh: '曜石黑' } },
  sage: { outer: '#a9b89c', inner: '#f2efe4', name: { en: 'Sage', zh: '鼠尾草绿' } },
  lilac: { outer: '#c9b9e0', inner: '#f6f2fb', name: { en: 'Lilac', zh: '丁香紫' } },
  mist: { outer: '#b3c5d6', inner: '#f2f5f8', name: { en: 'Mist Blue', zh: '雾霾蓝' } },
};
export const WRAP_KEYS = ['kraft', 'pearl', 'blush', 'midnight', 'sage', 'lilac', 'mist'];

export const RIBBONS = {
  ivory: { hex: '#efe4cf', name: { en: 'Ivory satin', zh: '象牙缎带' } },
  blush: { hex: '#e7a2ae', name: { en: 'Blush', zh: '藕粉' } },
  burgundy: { hex: '#7d1f35', name: { en: 'Burgundy', zh: '酒红' } },
  gold: { hex: '#c9a24a', name: { en: 'Gold', zh: '香槟金' } },
  black: { hex: '#1f1d22', name: { en: 'Black', zh: '黑色' } },
  sage: { hex: '#7f9572', name: { en: 'Sage', zh: '橄榄绿' } },
  sky: { hex: '#7aa0c8', name: { en: 'Sky', zh: '天蓝' } },
};
export const RIBBON_KEYS = ['ivory', 'blush', 'burgundy', 'gold', 'black', 'sage', 'sky'];

export const ROSE_COUNTS = {
  1: { en: 'you are my one and only', zh: '你是我的唯一' },
  3: { en: 'I love you', zh: '我爱你' },
  9: { en: 'forever and ever', zh: '长长久久' },
  11: { en: 'wholehearted devotion', zh: '一心一意' },
  21: { en: 'my dearest love', zh: '最爱' },
  33: { en: 'three lifetimes together', zh: '三生三世' },
  99: { en: 'love that lasts forever', zh: '天长地久' },
};

export const TEMPLATES = [
  { tag: { en: 'Love', zh: '爱意' }, en: 'Every petal here is a small way of saying I love you.', zh: '这束花的每一片花瓣，都是我想对你说的「我爱你」。' },
  { tag: { en: 'Birthday', zh: '生日' }, en: 'Happy birthday! May your year bloom as brightly as these flowers.', zh: '生日快乐！愿你新的一岁像这束花一样灿烂绽放。' },
  { tag: { en: 'Thank you', zh: '感谢' }, en: 'Thank you for everything — these are for you.', zh: '谢谢你为我做的一切，这束花送给你。' },
  { tag: { en: 'Congrats', zh: '祝贺' }, en: 'Congratulations! You deserve every bit of this.', zh: '恭喜你！这一切都是你应得的。' },
  { tag: { en: 'Get well', zh: '慰问' }, en: 'Thinking of you, and wishing you a speedy recovery.', zh: '一直惦记着你，愿你早日康复。' },
  { tag: { en: 'Just because', zh: '想你' }, en: 'No reason at all — I just thought of you.', zh: '没有特别的理由，只是想你了。' },
];

export const colorOf = (type, colorId) => {
  const f = FLOWERS[type];
  return f.colors.find((x) => x.id === colorId) || f.colors[0];
};
