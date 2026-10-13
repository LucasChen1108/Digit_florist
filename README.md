# Digit Florist · 数字花坊

Hand-tie a digital bouquet and send it as a link. 亲手扎一束电子花束，以链接的形式送出。

- **Bilingual** – English / 简体中文, switchable at any time (remembers your choice).
- **11 flowers** – rose, tulip, peony, sunflower, lily, carnation, daisy, hydrangea, lavender, eucalyptus, baby's breath — each with several colours, three quality grades (Classic / Premium / Luxe) and three bloom stages (bud / blooming / full bloom).
- **Arrangement** – per flower type choose *spread evenly*, *cluster* (1–3 clusters), *centerpiece* or *outer ring*; pick a round, wide-fan or heart-shaped head; or simply drag any flower on the bouquet.
- **Wrapping** – 4 sizes (11 / 33 / 66 / 99 stems), 7 papers, 7 satin ribbons, adjustable greenery.
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
css/style.css       all styles
js/studio.js        studio UI, drag-to-move, share dialog
js/gift.js          recipient page
js/i18n.js          English / Chinese strings
js/share.js         link encoding (deflate + base64url in the URL hash)
js/export.js        PNG export with the card
js/core/catalog.js  flowers, colours, sizes, papers, ribbons, templates
js/core/flowers.js  procedural SVG flower renderers
js/core/layout.js   placement algorithm (scatter / cluster / center / edge, shapes)
js/core/bouquet.js  composes paper, greenery, stems, flowers and ribbon
js/core/util.js     seeded RNG, colour maths, spline paths, SVG gradients
```

### Adding a flower or colour

Add it to `js/core/catalog.js` and (for a new type) a renderer in `js/core/flowers.js`.
**Only append** to `TYPE_KEYS` and to each colour list — their order is part of the share-link format, so reordering would change old links.

## Notes

- Fonts load from Google Fonts without blocking; where that is unreachable (e.g. mainland China) the page falls back to system fonts such as Songti / Kaiti.
- Drafts are kept in your browser's localStorage only.
