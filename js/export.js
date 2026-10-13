// Turn the bouquet SVG (plus an optional card) into a PNG download.

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function wrapLines(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    // works for both space-separated and CJK text
    const tokens = para.match(/[　-鿿＀-￯]|[^\s　-鿿＀-￯]+\s*|\s+/g) || [''];
    let line = '';
    for (const tk of tokens) {
      if (ctx.measureText(line + tk).width > maxW && line) { out.push(line.trimEnd()); line = tk.trimStart(); }
      else line += tk;
    }
    out.push(line.trimEnd());
  }
  return out;
}

export async function downloadPng(svg, { card, filename = 'bouquet.png', width = 1400 } = {}) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await loadImage(url);
    const ratio = (img.naturalHeight || 1) / (img.naturalWidth || 1);
    const bh = Math.round(width * ratio);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const serif = '"Cormorant Garamond", "Noto Serif SC", "Songti SC", "STSong", Georgia, serif';
    const hand = '"Ma Shan Zheng", "Kaiti SC", "STKaiti", "KaiTi", "Cormorant Garamond", Georgia, serif';
    let lines = [];
    const pad = 90, cardW = width - pad * 2;
    if (card && (card.msg || card.to || card.from)) {
      ctx.font = `44px ${hand}`;
      lines = wrapLines(ctx, card.msg || '', cardW - 120).slice(0, 10);
    }
    const cardH = lines.length || card?.to || card?.from ? 140 + lines.length * 66 + 70 + (card.meaning ? 60 : 0) : 0;
    canvas.width = width;
    canvas.height = bh + (cardH ? cardH + 40 : 0);
    ctx.fillStyle = '#f4ebe1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, width, bh);
    if (cardH) {
      const y0 = bh - 40;
      ctx.save();
      ctx.shadowColor = 'rgba(70,40,30,.18)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#fffaf3';
      ctx.beginPath(); ctx.roundRect(pad, y0, cardW, cardH, 18); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(168,50,74,.25)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(pad + 16, y0 + 16, cardW - 32, cardH - 32, 12); ctx.stroke();
      ctx.fillStyle = '#2d2226';
      ctx.font = `italic 46px ${serif}`;
      let y = y0 + 96;
      if (card.to) { ctx.fillText(card.to, pad + 60, y); }
      y += 70;
      ctx.font = `44px ${hand}`;
      for (const ln of lines) { ctx.fillText(ln, pad + 60, y); y += 66; }
      if (card.from) {
        ctx.font = `italic 40px ${serif}`;
        const s = '— ' + card.from;
        ctx.fillText(s, pad + cardW - 60 - ctx.measureText(s).width, y + 10);
      }
      if (card.meaning) {
        ctx.font = `30px ${serif}`;
        ctx.fillStyle = '#a8324a';
        ctx.fillText(card.meaning, pad + 60, y + 72);
      }
    }
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  } finally {
    URL.revokeObjectURL(url);
  }
}
