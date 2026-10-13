// Curated bouquet templates for the library. Each design loads straight into the studio.
// g(type, color, count, extra) builds a flower group; ids are assigned in order.

const g = (type, color, count, extra = {}) => ({ type, color, count, grade: 1, stage: 2, dist: 'scatter', clusters: 2, ...extra });

export const OCCASIONS = {
  love: { en: 'Confession & love', zh: '表白 · 爱情' },
  anniversary: { en: 'Anniversary', zh: '纪念日' },
  birthday: { en: 'Birthday', zh: '生日' },
  wedding: { en: 'Proposal & wedding', zh: '求婚 · 婚礼' },
  mother: { en: 'For mum & family', zh: '母亲 · 长辈' },
  thanks: { en: 'Thank you & teachers', zh: '感谢 · 谢师' },
  graduation: { en: 'Graduation & congrats', zh: '毕业 · 祝贺' },
  friendship: { en: 'Friendship', zh: '友情' },
  getwell: { en: 'Get well & comfort', zh: '探望 · 慰问' },
  apology: { en: 'Apology', zh: '道歉 · 和好' },
};
export const OCCASION_KEYS = Object.keys(OCCASIONS);

export const THEMES = {
  romantic: { en: 'Romantic & bold', zh: '浪漫热烈' },
  pastel: { en: 'Soft pastel', zh: '温柔奶油' },
  sunny: { en: 'Bright & cheerful', zh: '明亮活力' },
  elegant: { en: 'Minimal & elegant', zh: '简约高级' },
  garden: { en: 'Garden & natural', zh: '田园自然' },
  luxe: { en: 'Grand & luxurious', zh: '奢华盛大' },
};
export const THEME_KEYS = Object.keys(THEMES);

export const LANGUAGES = {
  love: { en: 'Love', zh: '爱意' },
  thanks: { en: 'Gratitude', zh: '感恩' },
  joy: { en: 'Joy', zh: '快乐' },
  hope: { en: 'Hope', zh: '希望' },
  bless: { en: 'Blessing', zh: '祝福' },
};
export const LANGUAGE_KEYS = Object.keys(LANGUAGES);

const T = (id, zh, en, descZh, descEn, occasions, theme, design, msg) => ({
  id, name: { zh, en }, desc: { zh: descZh, en: descEn }, occasions, theme,
  design: {
    size: 'M', shape: 'round', wrap: 'kraft', ribbon: 'ivory', greenery: 2, seed: 1, ...design,
    groups: design.groups.map((x, i) => ({ id: i + 1, ...x })),
  },
  msg,
});

export const TEMPLATES = [
  T('eleven-red', '一心一意', 'Wholehearted', '11 枝丝绒红玫瑰，经典的告白花束。', 'Eleven velvet-red roses — the classic confession.',
    ['love', 'anniversary'], 'romantic',
    { wrap: 'midnight', ribbon: 'gold', greenery: 1, seed: 11, groups: [g('rose', 'red', 11), g('babysbreath', 'white', 4), g('eucalyptus', 'silver', 2)] },
    { zh: '一心一意，只想把最好的都给你。', en: 'Wholeheartedly, always — only you.' }),
  T('ninety-nine', '天长地久', 'Forever & Always', '99 枝红玫瑰扎成心形，最隆重的心意。', 'Ninety-nine red roses in a heart — the grandest gesture.',
    ['love', 'wedding'], 'luxe',
    { size: 'XL', shape: 'heart', wrap: 'pearl', ribbon: 'burgundy', greenery: 1, seed: 99, groups: [g('rose', 'red', 99)] },
    { zh: '九十九枝玫瑰，愿我们天长地久。', en: 'Ninety-nine roses, for a love that lasts forever.' }),
  T('marry-me', '嫁给我', 'Marry Me', '21 枝玫瑰心形花束，配满天星，适合求婚。', 'A heart of 21 roses with baby’s breath — made for a proposal.',
    ['wedding', 'love'], 'romantic',
    { shape: 'heart', wrap: 'blush', ribbon: 'burgundy', seed: 21, groups: [g('rose', 'red', 21, { grade: 2 }), g('babysbreath', 'white', 6)] },
    { zh: '往后余生，想和你一起慢慢变老。嫁给我好吗？', en: 'I want every tomorrow to be with you. Will you marry me?' }),
  T('first-crush', '初次心动', 'First Crush', '奶油腮红玫瑰与粉郁金香，羞涩又甜。', 'Blush roses and pink tulips — shy and sweet.',
    ['love', 'friendship'], 'pastel',
    { wrap: 'blush', ribbon: 'ivory', seed: 7, groups: [g('rose', 'blush', 7), g('tulip', 'pink', 3, { stage: 1 }), g('babysbreath', 'white', 4)] },
    { zh: '从见到你的那天起，心里就开满了花。', en: 'Ever since I met you, my heart has been in bloom.' }),
  T('only-you', '只钟情你', 'Only You', '香槟玫瑰配白芍药，温柔而克制。', 'Champagne roses with white peonies — tender and refined.',
    ['anniversary', 'love'], 'elegant',
    { wrap: 'pearl', ribbon: 'gold', seed: 9, groups: [g('rose', 'champagne', 9), g('peony', 'white', 2, { dist: 'center' }), g('eucalyptus', 'silver', 3)] },
    { zh: '世界那么大，我只钟情你一人。', en: 'Of everyone in the world, it is only you.' }),
  T('blue-enchant', '蓝色妖姬', 'Blue Enchantress', '臻品蓝玫瑰配满天星，像一片星空。', 'Luxe blue roses under a sky of baby’s breath.',
    ['love', 'anniversary'], 'luxe',
    { wrap: 'midnight', ribbon: 'gold', greenery: 1, seed: 33, groups: [g('rose', 'blue', 9, { grade: 2 }), g('babysbreath', 'white', 6)] },
    { zh: '你是我生命里独一无二的奇迹。', en: 'You are the rarest miracle in my life.' }),
  T('midnight-letter', '暗夜情书', 'Midnight Letter', '黑魔术与勃艮第玫瑰，深沉的浪漫。', 'Black Magic and burgundy roses — a deep, dark romance.',
    ['love', 'anniversary'], 'elegant',
    { wrap: 'midnight', ribbon: 'burgundy', greenery: 1, seed: 13, groups: [g('rose', 'black', 7), g('rose', 'burgundy', 4, { dist: 'cluster', clusters: 1 }), g('eucalyptus', 'silver', 3)] },
    { zh: '有些爱不必说出口，就像夜色一样深。', en: 'Some love needs no words — it runs as deep as the night.' }),
  T('our-anniversary', '圆满纪念', 'Our Anniversary', '粉玉奴芍药与粉玫瑰，纪念走过的每一天。', 'Blush peonies and pink roses for every day together.',
    ['anniversary', 'wedding'], 'romantic',
    { wrap: 'blush', ribbon: 'burgundy', seed: 365, groups: [g('peony', 'blush', 5, { dist: 'cluster', clusters: 2 }), g('rose', 'pink', 7), g('babysbreath', 'white', 3), g('eucalyptus', 'silver', 3)] },
    { zh: '纪念日快乐，谢谢你一直在我身边。', en: 'Happy anniversary — thank you for every single day.' }),
  T('sunny-birthday', '阳光生日', 'Sunshine Birthday', '向日葵、黄玫瑰与雏菊，热闹又明亮。', 'Sunflowers, yellow roses and daisies — a burst of sunshine.',
    ['birthday', 'friendship'], 'sunny',
    { wrap: 'kraft', ribbon: 'ivory', seed: 1021, groups: [g('sunflower', 'golden', 3, { dist: 'center' }), g('rose', 'yellow', 5), g('daisy', 'white', 4), g('babysbreath', 'white', 3)] },
    { zh: '生日快乐！愿你的新一岁像阳光一样灿烂。', en: 'Happy birthday! May your year be full of sunshine.' }),
  T('peach-party', '蜜桃派对', 'Peach Party', '珊瑚芍药、蜜桃康乃馨和香槟玫瑰，甜美温柔。', 'Coral peonies, peach carnations and champagne roses.',
    ['birthday', 'friendship'], 'pastel',
    { wrap: 'blush', ribbon: 'gold', seed: 520, groups: [g('peony', 'coral', 4), g('carnation', 'peach', 5), g('rose', 'champagne', 4), g('eucalyptus', 'silver', 3)] },
    { zh: '又长大一岁啦，愿你永远甜甜的。', en: 'Another year sweeter — happy birthday!' }),
  T('mothers-love', '温馨母爱', 'A Mother’s Love', '粉康乃馨配白百合，献给最爱的妈妈。', 'Pink carnations and white lilies for the dearest mum.',
    ['mother', 'thanks'], 'pastel',
    { wrap: 'pearl', ribbon: 'blush', seed: 510, groups: [g('carnation', 'pink', 9), g('lily', 'white', 3, { dist: 'center' }), g('babysbreath', 'white', 4)] },
    { zh: '妈妈，谢谢您的爱，愿您永远健康快乐。', en: 'Mum, thank you for your love. Wishing you health and happiness always.' }),
  T('mums-garden', '妈妈的花园', 'Mum’s Garden', '珊瑚芍药、蜜桃康乃馨与黄百合，像家里的小花园。', 'Coral peonies, peach carnations and yellow lilies, like a home garden.',
    ['mother', 'birthday'], 'garden',
    { wrap: 'sage', ribbon: 'blush', seed: 88, groups: [g('peony', 'coral', 3), g('carnation', 'peach', 5), g('lily', 'yellow', 2), g('eucalyptus', 'sage', 3)] },
    { zh: '把春天带给您，就像您一直温暖着我。', en: 'Bringing you spring, the way you have always warmed me.' }),
  T('for-teacher', '桃李满园', 'For My Teacher', '香水百合与粉康乃馨，敬爱与感谢。', 'Stargazer lilies and pink carnations — respect and gratitude.',
    ['thanks', 'graduation'], 'elegant',
    { wrap: 'sage', ribbon: 'ivory', seed: 910, groups: [g('lily', 'pink', 3), g('carnation', 'pink', 7), g('babysbreath', 'white', 3), g('eucalyptus', 'silver', 2)] },
    { zh: '老师，谢谢您的教导与陪伴，您辛苦了！', en: 'Thank you for teaching me, guiding me and believing in me.' }),
  T('grateful-heart', '感恩的心', 'Grateful Heart', '红康乃馨、向日葵与黄百合，饱满真诚的谢意。', 'Red carnations, sunflowers and yellow lilies — heartfelt thanks.',
    ['thanks', 'mother'], 'garden',
    { wrap: 'kraft', ribbon: 'burgundy', seed: 1125, groups: [g('sunflower', 'golden', 2), g('carnation', 'red', 6), g('lily', 'yellow', 2), g('eucalyptus', 'silver', 3)] },
    { zh: '谢谢你，在我需要的时候总是在。', en: 'Thank you for always being there when I needed you.' }),
  T('little-thanks', '小小谢意', 'A Little Thank-You', '蜜桃康乃馨、黄郁金香与雏菊的小花束，轻巧可爱。', 'A petite posy of peach carnations, yellow tulips and daisies.',
    ['thanks', 'friendship'], 'sunny',
    { size: 'S', wrap: 'kraft', ribbon: 'sage', seed: 3, groups: [g('carnation', 'peach', 4), g('tulip', 'yellow', 3), g('daisy', 'white', 2)] },
    { zh: '一点小心意，谢谢你！', en: 'A little something to say thank you!' }),
  T('bright-future', '前程似锦', 'Bright Future', '向日葵、橙百合与黄郁金香，祝贺毕业与新起点。', 'Sunflowers, orange lilies and yellow tulips for a new chapter.',
    ['graduation', 'birthday'], 'sunny',
    { wrap: 'kraft', ribbon: 'gold', seed: 2026, groups: [g('sunflower', 'golden', 3, { dist: 'cluster', clusters: 1 }), g('lily', 'orange', 2), g('tulip', 'yellow', 5), g('eucalyptus', 'silver', 3)] },
    { zh: '毕业快乐！愿你前程似锦，一路繁花。', en: 'Congratulations, graduate! May your path be lined with flowers.' }),
  T('grand-congrats', '鲜花满堂', 'Grand Congratulations', '绣球、白玫瑰、百合与康乃馨，盛大的祝贺。', 'Hydrangea, white roses, lilies and carnations — a grand celebration.',
    ['graduation', 'wedding'], 'luxe',
    { size: 'L', shape: 'wide', wrap: 'pearl', ribbon: 'blush', seed: 66, groups: [g('hydrangea', 'blue', 3, { dist: 'center' }), g('rose', 'white', 10, { grade: 2, dist: 'cluster', clusters: 2 }), g('lily', 'pink', 5, { dist: 'edge' }), g('carnation', 'peach', 8), g('lavender', 'purple', 4, { dist: 'cluster', clusters: 2 })] },
    { zh: '恭喜你！所有的努力都开出了花。', en: 'Congratulations — all your hard work has blossomed.' }),
  T('white-vows', '纯白誓言', 'White Vows', '白芍药、白玫瑰与卡萨布兰卡，纯白婚礼手捧花。', 'White peonies, roses and Casa Blanca lilies — a bridal bouquet.',
    ['wedding'], 'elegant',
    { wrap: 'pearl', ribbon: 'ivory', seed: 1314, groups: [g('peony', 'white', 4, { dist: 'center' }), g('rose', 'white', 8), g('lily', 'white', 3), g('babysbreath', 'white', 5), g('eucalyptus', 'silver', 3)] },
    { zh: '新婚快乐，愿你们百年好合，白头偕老。', en: 'Wishing you a lifetime of love and happiness together.' }),
  T('golden-gala', '金色盛典', 'Golden Gala', '30 枝香槟玫瑰配白芍药与绣球，隆重而闪耀。', 'Thirty champagne roses with white peonies and hydrangea.',
    ['anniversary', 'wedding', 'graduation'], 'luxe',
    { size: 'XL', wrap: 'midnight', ribbon: 'gold', seed: 777, groups: [g('rose', 'champagne', 30, { grade: 2 }), g('peony', 'white', 6, { dist: 'cluster', clusters: 3 }), g('hydrangea', 'white', 3, { dist: 'center' }), g('babysbreath', 'white', 6), g('eucalyptus', 'silver', 5)] },
    { zh: '值得被隆重庆祝的你，闪闪发光。', en: 'For someone who deserves to be celebrated in style.' }),
  T('get-well', '早日康复', 'Get Well Soon', '柠檬向日葵、青柠绣球与雏菊，清新有活力。', 'Lemon sunflowers, lime hydrangea and daisies — fresh and uplifting.',
    ['getwell', 'friendship'], 'garden',
    { wrap: 'sage', ribbon: 'ivory', seed: 120, groups: [g('sunflower', 'lemon', 3), g('hydrangea', 'green', 2, { dist: 'center' }), g('daisy', 'white', 4), g('eucalyptus', 'silver', 3)] },
    { zh: '好好休息，早日康复，我们都在等你。', en: 'Rest well and get better soon — we are all thinking of you.' }),
  T('calm-hope', '宁静希望', 'Calm & Hope', '蓝绣球、白康乃馨与白薰衣草，安静的陪伴。', 'Blue hydrangea, white carnations and white lavender — quiet comfort.',
    ['getwell', 'apology'], 'elegant',
    { wrap: 'mist', ribbon: 'sky', seed: 404, groups: [g('hydrangea', 'blue', 3, { dist: 'center' }), g('carnation', 'white', 4), g('lavender', 'white', 4), g('eucalyptus', 'silver', 2)] },
    { zh: '不管发生什么，我都会陪着你，一切都会好起来。', en: 'Whatever happens, I am here — and things will get better.' }),
  T('im-sorry', '对不起', 'I’m Sorry', '白郁金香与腮红玫瑰，真诚地请求原谅。', 'White tulips and blush roses — a sincere apology.',
    ['apology', 'love'], 'pastel',
    { wrap: 'pearl', ribbon: 'blush', seed: 1717, groups: [g('tulip', 'white', 7), g('rose', 'blush', 4, { dist: 'center' }), g('babysbreath', 'white', 4), g('eucalyptus', 'silver', 2)] },
    { zh: '对不起，是我不好。原谅我好吗？', en: 'I’m sorry. Can you forgive me?' }),
  T('best-friends', '闺蜜时光', 'Best Friends', '黄玫瑰、粉雏菊与杏橙郁金香，快乐的友谊。', 'Yellow roses, pink daisies and apricot tulips — friendship in bloom.',
    ['friendship', 'birthday'], 'sunny',
    { wrap: 'lilac', ribbon: 'sky', seed: 222, groups: [g('rose', 'yellow', 6), g('daisy', 'pink', 5), g('tulip', 'orange', 3), g('babysbreath', 'pink', 3)] },
    { zh: '有你真好，一起把日子过成花。', en: 'So lucky to have you — here’s to more days like this.' }),
  T('lavender-dream', '薰衣草之梦', 'Lavender Dream', '紫雾玫瑰、紫绣球与薰衣草，梦幻又温柔。', 'Lilac roses, violet hydrangea and lavender — dreamy and soft.',
    ['love', 'friendship'], 'pastel',
    { wrap: 'lilac', ribbon: 'ivory', seed: 616, groups: [g('hydrangea', 'purple', 1, { dist: 'center' }), g('rose', 'lilac', 7), g('lavender', 'purple', 6), g('babysbreath', 'white', 3)] },
    { zh: '在等待的日子里，愿你也被温柔包围。', en: 'May you be wrapped in gentleness, always.' }),
  T('wildflower-walk', '田园野趣', 'Wildflower Walk', '白雏菊、黄雏菊、粉郁金香与薰衣草，像一次郊游。', 'Daisies, pink tulips and lavender — a walk in the meadow.',
    ['friendship', 'getwell'], 'garden',
    { shape: 'wide', wrap: 'kraft', ribbon: 'sage', seed: 4, groups: [g('daisy', 'white', 6), g('daisy', 'yellow', 4), g('tulip', 'pink', 3), g('lavender', 'purple', 3), g('eucalyptus', 'sage', 3)] },
    { zh: '把一整片田野的阳光都送给你。', en: 'A whole meadow of sunshine, just for you.' }),
  T('tulip-confession', '郁金香告白', 'Tulip Confession', '宝石红郁金香，热烈直接的爱的宣言。', 'Ruby tulips — a bold declaration of love.',
    ['love'], 'garden',
    { wrap: 'pearl', ribbon: 'burgundy', seed: 214, groups: [g('tulip', 'red', 9), g('tulip', 'pink', 3, { stage: 1 }), g('eucalyptus', 'silver', 3)] },
    { zh: '我喜欢你，是认真的。', en: 'I like you — and I mean it.' }),
];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id);

/** A fresh, independent copy of a template's design (safe to mutate). */
export function cloneDesign(tpl) {
  const d = JSON.parse(JSON.stringify(tpl.design));
  d.place = {};
  return d;
}
