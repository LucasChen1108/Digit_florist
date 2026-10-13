# Digit Florist · 数字花坊

Hand-tie a digital bouquet and send it as a link. 亲手扎一束电子花束，以链接的形式送出。

- **Bilingual** – English / 简体中文, switchable at any time (remembers your choice).
- **15 flowers** – rose, peony, ranunculus, lisianthus, tulip, anemone, sunflower, lily, carnation, daisy, hydrangea, baby's breath, eucalyptus, lavender, billy buttons — each with several colours, three quality grades (Classic / Premium / Luxe) and three bloom stages (bud / blooming / full bloom).
- **Arrangement** – per flower type choose *spread evenly*, *cluster* (1–3 clusters), *centerpiece* or *outer ring*; pick a round, wide-fan or heart-shaped head; or simply drag any flower on the bouquet.
- **Wrapping** – 4 sizes (11 / 33 / 66 / 99 stems), 7 papers, 7 satin ribbons, adjustable greenery.
- **Template library** – 42 ready-made bouquets (`library.html`) browsable by occasion, style or flower language; open one in the studio and change anything.
- **Flower language** – every colour has its own meaning, and the whole bouquet gets a generated reading.
- **Art styles** – switch between *Illustrated*, *Watercolour* and *Photo*. Photo uses real flower cut-outs from `assets/flowers/` (see [`tools/ASSET_GUIDE.md`](tools/ASSET_GUIDE.md)); flowers without a photo fall back to the illustration, and neutral white photos can be tinted to any colour.
- **Gifting** – write a card, get a share link. The recipient opens an envelope, the bouquet blooms in, petals drift down, and they can save it as an image.

Every flower is drawn procedurally as SVG in the browser — no image assets, no backend. The whole bouquet (layout seed, flowers, dragged positions and card) is compressed into the URL hash of `gift.html`, so links work anywhere the site is hosted.

## Run locally

ES modules need a local server (opening `index.html` directly from disk won't work):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy on GitHub Pages

1. Push this folder to a GitHub repository.
2. **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`.
3. Your site will be at `https://<user>.github.io/<repo>/`; gift links are generated relative to it automatically.

## Project structure

```
index.html          studio (build the bouquet)
gift.html           recipient view (envelope → bloom → card)
library.html        template library
css/style.css       all styles
js/studio.js        studio UI, drag-to-move, share dialog
js/gift.js          recipient page
js/library.js       template library page
js/i18n.js          English / Chinese strings
js/share.js         link encoding (deflate + base64url in the URL hash)
js/export.js        PNG export with the card
js/core/catalog.js  flowers, colours, sizes, papers, ribbons, templates
js/core/flowers.js  procedural SVG flower renderers
js/core/layout.js   placement algorithm (scatter / cluster / center / edge, shapes)
js/core/placement.js stable per-stem positions & facing (new flowers fill gaps)
js/core/meaning.js  bouquet flower-language reading
js/core/templates.js template library data (occasion / style tags)
js/core/bouquet.js  composes paper, greenery, stems, flowers and ribbon
js/core/util.js     seeded RNG, colour maths, spline paths, SVG gradients
js/core/assets.js   photo-asset manifest, loading, recolouring, export inlining
assets/flowers/     photo cut-outs + manifest.json (generated)
tools/prepare_assets.py  turns raw photos / AI renders into web assets
tools/ASSET_GUIDE.md     how to shoot / generate / license the photos
```

### Adding a flower or colour

Add it to `js/core/catalog.js` and (for a new type) a renderer in `js/core/flowers.js`.
**Only append** to `TYPE_KEYS` and to each colour list — their order is part of the share-link format, so reordering would change old links.

## Notes

- Fonts load from Google Fonts without blocking; where that is unreachable (e.g. mainland China) the page falls back to system fonts such as Songti / Kaiti.
- Drafts are kept in your browser's localStorage only.

### Adding a template

Append an entry to `TEMPLATES` in `js/core/templates.js` with its occasions, style and design. Its flower-language category is worked out automatically from the flowers you choose.

## Photo credits

The photo cut-outs in `assets/flowers/` come from Wikimedia Commons (public domain, CC0, CC BY and CC BY-SA). Authors and licences are listed in [CREDITS.md](CREDITS.md).
