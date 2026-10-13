# 照片花材素材指南 · Photo asset guide

「照片」画风会用真实花材的透明背景图片来拼花束。素材准备好后，「照片」选项会自动出现在工作台和模板库里。还没有素材的花，会自动用插画版本顶上，所以可以一种一种慢慢加。

## 1. 需要准备多少张？

不需要做满 15 × 5 × 3 张，因为网站可以给中性色的花「重新上色」：

| 优先级 | 准备什么 | 张数 |
|---|---|---|
| **最少可用** | 每种花一张**白色/奶油色、盛放**的图，文件名用 `neutral-full-1` | 15 |
| **推荐** | 再给每种花加一张 `neutral-bud`、一张 `neutral-half` | ~40 |
| **更逼真** | 颜色特别的花加专属图，例如 `red-full-1`（红玫瑰）、`panda-full-1`（熊猫银莲花），以及 `_foliage/leaf-1…6` 叶材 | 按需 |
| **更有变化** | 同一种再加 `-2`、`-3` 变体，花束里会随机交替使用 | 按需 |

挑选规则：先用颜色完全匹配的图；没有的话，就用 `neutral` 图染成目标颜色；同一朵花优先用相同开放程度的图。

## 2. 目录与命名

```
raw/
  rose/
    neutral-full-1.png      ← 白玫瑰，盛放（会被染成任意颜色）
    neutral-bud-1.png
    red-full-1.png          ← 专属红玫瑰（比染色更真实）
  anemone/
    panda-full-1.png
  lavender/
    purple-full-1.png       ← 枝条类：竖直、花枝底部朝下
  _foliage/
    leaf-1.png … leaf-6.png ← 叶材：竖直、叶柄朝下
```

- 花的文件夹名：`rose peony ranunculus lisianthus tulip anemone sunflower lily carnation daisy hydrangea babysbreath eucalyptus lavender craspedia`
- 颜色 ID 见 `js/core/catalog.js`（如 `red`、`blush`、`champagne`）；`neutral` 表示可染色。
- 开放程度：`bud`（含苞）、`half`（初绽）、`full`（盛放）。

## 3. 拍摄 / 生成要求

- **视角**：花头类（玫瑰、芍药、洋牡丹……）用**正上方俯拍**，花心在画面中央；郁金香用**侧面**；薰衣草、尤加利、金槌花和叶材**竖直摆放，底部朝下**。
- **背景**：纯色背景，越干净越好。白色花请用**绿幕（#00FF00）或灰色背景**，因为白花放在白底上没法自动抠图。
- **光线**：所有图统一用柔和的左上方光，不要有硬阴影；花束拼起来才自然。
- **尺寸**：原图 1024px 以上，花占画面 70–85%，四周留一点空。
- **不要**：花茎（会自动画）、花瓶、手、水印、文字。

## 4. AI 生成提示词（Midjourney / DALL·E / Stable Diffusion 等）

把 `{flower}` 换成花名，`{bg}` 换成背景描述：

```
A single fresh {flower} flower head, viewed from directly above, centered,
fully open, petals crisp and natural, studio product photograph, soft diffused
light from the top left, no stem, no leaves, isolated on a plain {bg} background,
sharp focus, photorealistic, high detail --ar 1:1
```

- 白色或可染色的花：`{flower}` 写 "white rose"，`{bg}` 写 "solid pure green (#00FF00) chroma key"。
- 彩色专属花：例如 "deep red velvet rose"，`{bg}` 写 "pure white"。
- 含苞：把 "fully open" 改成 "tight closed bud, top view"；初绽：改成 "half open"。
- 枝条或叶材：把 "flower head, viewed from directly above" 改成 "single stem of {flower} lying vertically, stem end at the bottom of the frame"。

**同一批生成时，固定提示词的风格部分，并固定 seed 或同一个风格参考图**，这样所有花的光线和质感才一致。

## 5. 素材来源与版权

| 来源 | 能否用于本网站 | 注意 |
|---|---|---|
| **自己拍摄** | ✅ 完全可以 | 最好的选择 |
| **AI 生成** | ✅ 通常可以 | 以你所用工具的服务条款为准（如 Midjourney 付费账户可商用） |
| **Unsplash / Pexels** | ✅ 可以免费使用和修改 | 不能把原图单独拿去转卖；需要自己抠图 |
| **Wikimedia Commons** | ⚠️ 看每张图的许可 | CC BY / CC BY-SA 需要在网站上注明作者和许可 |
| **pngimg、各类「免费PNG」站** | ❌ 不建议 | 很多是 CC BY-NC（禁止商用）或来源不明 |
| **搜索引擎随便下载的图** | ❌ 不要用 | 有侵权风险 |

如果用了需要署名的图，请在 `README.md` 里加一个 Credits 小节。

## 6. 处理成网页素材

```bash
pip install pillow numpy
pip install "rembg[cpu]"     # 可选：AI 抠图，效果最好（第一次运行会下载模型）

python3 tools/prepare_assets.py raw/ --bg green    # 绿幕素材
python3 tools/prepare_assets.py raw/ --bg white    # 纯白底素材（白色花不要用这个）
python3 tools/prepare_assets.py raw/ --bg rembg    # 任何背景，AI 自动抠图
```

脚本会自动：抠图 → 裁掉多余透明边 → 找到花心（枝条则找底部）→ 缩放到 512px → 输出 WebP（每张约 15–40 KB）→ 生成 `assets/flowers/manifest.json`。已经是透明 PNG 的图会直接使用。

**体积估算**：推荐的约 40 张 ≈ 1–1.5 MB。网页只会加载当前花束用到的那几张，所以打开速度不受影响。

处理完后，把 `assets/flowers/` 一起提交到 GitHub 即可，`raw/` 原图不需要提交（已在 `.gitignore` 里）。

## 7. 本地检查

```bash
python3 -m http.server 8000
```

打开 http://localhost:8000，花束下方的「画风」里会出现「照片」。如果某张图位置或大小不对，多半是原图里花没有居中，或者背景没抠干净；修好原图后重新运行脚本即可。
