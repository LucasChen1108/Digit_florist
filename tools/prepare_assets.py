#!/usr/bin/env python3
"""
Turn raw flower photos / AI renders into the web assets used by the "Photo" style.

    pip install pillow numpy            # required
    pip install "rembg[cpu]"            # optional, best background removal

    python3 tools/prepare_assets.py raw/                    # → assets/flowers/*.webp + manifest.json
    python3 tools/prepare_assets.py raw/ --bg white         # images shot/generated on pure white
    python3 tools/prepare_assets.py raw/ --bg green         # images on a green screen (#00ff00)
    python3 tools/prepare_assets.py raw/ --bg rembg         # AI background removal (needs rembg)

Input layout (see tools/ASSET_GUIDE.md):

    raw/<flower>/<colour>-<stage>[-<n>].png|jpg|webp
        flower  = rose, peony, ranunculus, … (same keys as js/core/catalog.js)
        colour  = a colour id from the catalog (e.g. red, blush) or "neutral"
                  ("neutral" = a white/cream flower the site may tint to any colour)
        stage   = bud | half | full
        n       = optional variant number (1, 2, 3 …) for variety
    raw/_foliage/leaf-<n>.png            greenery cut-outs (stem at the bottom)

Images that already have transparency are used as-is.
"""
import argparse
import json
import re
import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    sys.exit("Please `pip install pillow numpy` first.")

SPRIGS = {"lavender", "eucalyptus", "craspedia"}
STAGES = {"bud": 0, "half": 1, "full": 2, "0": 0, "1": 1, "2": 2}
NAME_RE = re.compile(r"^(?P<color>[a-z0-9]+)-(?P<stage>bud|half|full|[012])(?:-(?P<n>\d+))?$")
LEAF_RE = re.compile(r"^leaf(?:-(?P<n>\d+))?$")


def has_alpha(im):
    if im.mode != "RGBA":
        return False
    a = np.asarray(im)[:, :, 3]
    return (a < 250).mean() > 0.01


def remove_flood(im, mode):
    """Remove a uniform background connected to the image border (white or green)."""
    rgb = np.asarray(im.convert("RGB")).astype(np.int16)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    if mode == "green":
        cand = (g > 120) & (g - np.maximum(r, b) > 60)
    else:
        mn, mx = rgb.min(axis=2), rgb.max(axis=2)
        cand = (mn > 236) & (mx - mn < 18)
    mask = Image.fromarray((cand * 255).astype(np.uint8), "L").copy()  # copy: fromarray may be read-only
    w, h = mask.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if mask.getpixel(xy) == 255:
            ImageDraw.floodfill(mask, xy, 128)
    bg = np.asarray(mask) == 128
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    alpha_im = Image.fromarray(alpha, "L").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(alpha_im)
    if mode == "green":  # pull green spill out of the edges
        arr = np.asarray(out).astype(np.int16)
        spill = np.clip(arr[..., 1] - np.maximum(arr[..., 0], arr[..., 2]), 0, 255)
        arr[..., 1] -= (spill * 0.85).astype(np.int16)
        out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    return out


def remove_rembg(im):
    try:
        from rembg import remove
    except ImportError:
        sys.exit("--bg rembg needs `pip install \"rembg[cpu]\"`")
    return remove(im.convert("RGBA"))


def process(path, kind, size, bg):
    im = Image.open(path)
    im.load()
    if not has_alpha(im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im):
        if bg == "rembg":
            im = remove_rembg(im)
        else:
            im = remove_flood(im, bg)
    im = im.convert("RGBA")
    a = np.asarray(im)[:, :, 3]
    ys, xs = np.nonzero(a > 10)
    if not len(xs):
        raise ValueError("image is empty after background removal")
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    pad = int(max(x1 - x0, y1 - y0) * 0.03) + 2
    im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
    scale = min(1.0, size / max(im.size))
    if scale < 1:
        im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    a = np.asarray(im)[:, :, 3].astype(np.float64) / 255.0
    w, h = im.size
    ys, xs = np.nonzero(a > 0.5)
    if kind in ("sprig", "foliage"):
        # anchor at the stem base: centre of the lowest opaque rows
        bottom = ys.max()
        low = xs[ys >= bottom - max(2, h * 0.02)]
        ax, ay = float(low.mean()) / w, float(bottom) / h
        r = (bottom - ys.min()) / w  # stem length relative to width
    else:
        tot = a.sum()
        cy, cx = (np.indices(a.shape) * a).reshape(2, -1).sum(axis=1) / tot
        ax, ay = cx / w, cy / h
        r = float(np.sqrt((a > 0.5).sum() / np.pi)) * 1.04 / w
    return im, {"w": w, "h": h, "ax": round(ax, 4), "ay": round(ay, 4), "r": round(float(r), 4)}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("raw", type=Path, help="folder with raw images")
    ap.add_argument("--out", type=Path, default=Path(__file__).resolve().parent.parent / "assets" / "flowers")
    ap.add_argument("--size", type=int, default=512, help="longest side in pixels (default 512)")
    ap.add_argument("--quality", type=int, default=82, help="WebP quality (default 82)")
    ap.add_argument("--bg", choices=["white", "green", "rembg"], default="white", help="how to remove opaque backgrounds")
    args = ap.parse_args()

    manifest = {"version": 1, "assets": {}}
    total = 0
    for folder in sorted(p for p in args.raw.iterdir() if p.is_dir()):
        ftype = folder.name
        for f in sorted(folder.iterdir()):
            if f.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
                continue
            stem = f.stem.lower()
            if ftype == "_foliage":
                m = LEAF_RE.match(stem)
                kind, meta = "foliage", {}
            else:
                m = NAME_RE.match(stem)
                kind = "sprig" if ftype in SPRIGS else "bloom"
                meta = {} if not m else {
                    "color": m["color"] if m["color"] != "neutral" else "white",
                    "stage": STAGES[m["stage"]],
                    "recolor": m["color"] in ("neutral", "white"),
                }
            if not m:
                print(f"  skip {f.relative_to(args.raw)} (name should be like red-full-1.png)")
                continue
            try:
                im, geo = process(f, kind, args.size, args.bg)
            except Exception as e:  # noqa: BLE001
                print(f"  ✗ {f.relative_to(args.raw)}: {e}")
                continue
            rel = f"{ftype}/{stem}.webp"
            dest = args.out / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            im.save(dest, "WEBP", quality=args.quality, method=6)
            manifest["assets"].setdefault(ftype, []).append({"file": rel, **meta, **geo})
            total += 1
            print(f"  ✓ {rel}  {geo['w']}×{geo['h']}  {dest.stat().st_size // 1024} KB")

    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "manifest.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    print(f"\n{total} assets → {args.out / 'manifest.json'}")


if __name__ == "__main__":
    main()
