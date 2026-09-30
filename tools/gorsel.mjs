// OG görseli ve ikonlar için HTML şablonları üretir (dist/index.html'deki traktör çizimini kullanır).
// Kullanım: node build.mjs && node tools/gorsel.mjs && sh tools/gorsel.sh && node build.mjs
import { readFileSync, writeFileSync } from "node:fs";
const c = JSON.parse(readFileSync("site.config.json", "utf8"));
const logo = readFileSync("public/favicon.svg", "utf8");
const font = `@font-face{font-family:B;src:url(../public/font/barlow-c-700-latin.woff2)}@font-face{font-family:B;src:url(../public/font/barlow-c-700-latin-ext.woff2);unicode-range:U+0100-02BA}
@font-face{font-family:M;src:url(../public/font/manrope-latin.woff2);font-weight:300 800}@font-face{font-family:M;src:url(../public/font/manrope-latin-ext.woff2);font-weight:300 800;unicode-range:U+0100-02BA}`;

writeFileSync("tools/og.html", `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${font}
html,body{margin:0}body{width:1200px;height:630px;position:relative;overflow:hidden;font-family:M,sans-serif;background:linear-gradient(90deg,rgba(11,17,14,1) 32%,rgba(11,17,14,.5) 55%,rgba(11,17,14,0) 75%),linear-gradient(0deg,rgba(11,17,14,.8),transparent 45%),url(../public/foto/kahraman-1400.webp) right -130px center / 1000px auto no-repeat,#0b110e;color:#b9c3bb}
.l{position:absolute;left:70px;top:56px;display:flex;align-items:center;gap:16px}.l svg{width:64px;height:64px}.l b{display:block;font-family:B;color:#fff;font-size:40px;line-height:1;text-transform:uppercase;letter-spacing:.02em}.l small{display:block;color:#f0cf86;font-size:14px;letter-spacing:.2em;font-weight:700;margin-top:6px;text-transform:uppercase}
h1{position:absolute;left:70px;top:176px;margin:0;font-family:B;color:#fff;font-size:96px;line-height:.92;text-transform:uppercase}h1 em{font-style:normal;color:#e0ad48}
.s{position:absolute;left:72px;top:420px;font-size:22px;color:#c9d1ca;width:520px;line-height:1.45}
.t{position:absolute;left:70px;bottom:56px;display:flex;align-items:center;gap:14px;font-size:30px;font-weight:800;color:#fff}.t i{display:inline-block;padding:10px 22px;border-radius:999px;background:linear-gradient(135deg,#f0cf86,#d9a441 55%,#c38e2c);color:#17120a;font-style:normal;font-size:20px}
.k{position:absolute;right:18px;top:100px;width:610px}
.k .tr-etiket text{font-family:B;font-size:15px;letter-spacing:.14em;fill:#f0cf86}.k .tr-etiket path{fill:none;stroke:#f0cf86;stroke-opacity:.6}.k .tr-etiket circle{fill:#0d1310;stroke:#f0cf86;stroke-width:1.6}
</style></head><body>
<div class="l">${logo}<span><b>${c.marka}</b><small>Traktör Galerisi · ${c.il}</small></span></div>
<h1>Toprağa güç,<br><em>işinize güven.</em></h1>
<div class="s">İkinci el traktör, tarım makineleri ve ekipmanları. Uygun fiyat, güvenilir alışveriş.</div>
<div class="t"><i>${c.il}</i>${c.telefonGorunen}</div>
</body></html>`);

writeFileSync("tools/ikon.html", `<!doctype html><html><head><style>html,body{margin:0;background:transparent}body{width:100vw;height:100vh;display:grid;place-items:center}img{width:100vw;height:100vh}</style></head><body><img src="../public/favicon.svg"></body></html>`);
writeFileSync("tools/ikon-kare.html", `<!doctype html><html><head><style>html,body{margin:0}body{width:100vw;height:100vh;display:grid;place-items:center;background:#0d1310}img{width:100vw;height:100vh}</style></head><body><img src="../public/favicon.svg"></body></html>`);
console.log("tools/og.html, tools/ikon.html, tools/ikon-kare.html yazıldı");
