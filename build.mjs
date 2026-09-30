// Statik site üreticisi: site.config.json + src/icerik.mjs → dist/
// Kullanım: node build.mjs   ·   Kontrol: node tools/kontrol.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { KATEGORILER, NEDEN, SUREC, SSS_GENEL, REHBER, PARCALAR, TAKVIM, ILCELER, KOMSU_ILLER } from "./src/icerik.mjs";

const c = JSON.parse(readFileSync("site.config.json", "utf8"));
const FOTO = JSON.parse(readFileSync("src/fotolar.json", "utf8"));
const ILANLAR = existsSync("src/ilanlar.json") ? JSON.parse(readFileSync("src/ilanlar.json", "utf8")) : [];
const OUT = "dist";
const BUGUN = new Date().toISOString().slice(0, 10);
const CSS = readFileSync("src/font.css", "utf8") + readFileSync("src/style.css", "utf8");
const JS = readFileSync("src/main.js", "utf8");

const surum = {};
const v = (yol) => (surum[yol] ??= existsSync("public" + yol) ? `${yol}?v=${createHash("md5").update(readFileSync("public" + yol)).digest("hex").slice(0, 8)}` : yol);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const duz = (s) => String(s).replace(/<[^>]+>/g, "");
const url = (yol) => c.alanAdi + yol;
const waLink = (metin = "Merhaba, traktör ve tarım makineleri hakkında bilgi almak istiyorum.") => `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(metin)}`;
const yolTarifi = c.googleHaritaLinki || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.markaUzun} ${c.il}`)}`;
const katYol = (k) => `/urunler/${k.slug}/`;
const rehberYol = (r) => `/rehber/${r.slug}/`;
const bulKat = (slug) => KATEGORILER.find((k) => k.slug === slug);
const dis = 'target="_blank" rel="noopener"';

// ---------------------------------------------------------------- fotoğraf (webp, çoklu boyut)
const fotoSrcset = (ad) => FOTO[ad].genislikler.map((w) => `/foto/${ad}-${w}.webp ${w}w`).join(", ");
const foto = (ad, { sinif = "", sizes = "100vw", alt = "", oncelik = false } = {}) => {
  const f = FOTO[ad], kucuk = Math.min(...f.genislikler);
  return `<img class="${sinif}" src="/foto/${ad}-${kucuk}.webp" srcset="${fotoSrcset(ad)}" sizes="${sizes}" alt="${esc(alt)}" width="${f.w}" height="${f.h}" ${oncelik ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
};

// ---------------------------------------------------------------- ikonlar (24px çizgi)
const IK = {
  traktor: '<circle cx="16.5" cy="16" r="4.5"/><circle cx="16.5" cy="16" r="1.4"/><circle cx="5.5" cy="18" r="2.5"/><path d="M3 15.5V12h7.5l1.5-6h6.5l1 6.2"/><path d="M12 6v6M8 18h4M7.5 12V8.5"/>',
  balya: '<rect x="2.5" y="8" width="13" height="10" rx="1.5"/><path d="M6.5 8v10M11.5 8v10"/><circle cx="18.5" cy="14.5" r="3.5"/><circle cx="18.5" cy="14.5" r="1"/><path d="M2.5 5h7"/>',
  pulluk: '<path d="M3 5h10l3 3"/><path d="M8 5v5M13 5v5"/><path d="M8 10c-2 0-3 1.8-3 4h6c0-2.2-1-4-3-4zM13 10c-2 0-3 1.8-3 4"/><path d="M2 20c3-1.4 6-1.4 9 0s6 1.4 11 0"/>',
  romork: '<path d="M2 7h14v8H2z"/><path d="M16 12h5l1.5 1"/><circle cx="6" cy="17.5" r="2.3"/><circle cx="12" cy="17.5" r="2.3"/><path d="M6 7v8M11 7v8"/>',
  mibzer: '<path d="M4 4h16l-2 6H6z"/><path d="M7 10v4M12 10v4M17 10v4"/><path d="M7 17.5v.01M12 17.5v.01M17 17.5v.01M9.5 20v.01M14.5 20v.01"/>',
  kalkan: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  etiket: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  goz: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  el: '<path d="M8 12.5 11 15.5l6-6"/><path d="M2.5 12a9.5 9.5 0 1 0 19 0 9.5 9.5 0 0 0-19 0z"/>',
  tel: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  posta: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6.5 9 6.5 9-6.5"/>',
  saat: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.2 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  ok: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  dis: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  tik: '<path d="M20 6 9 17l-5-5"/>',
  liste: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/>',
  kar: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2"/>',
  kitap: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  bilgi: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5h.01"/>',
  vitrin: '<path d="M3 9.5 4.5 4h15L21 9.5"/><path d="M3 9.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5"/><path d="M4.5 12v8.5h15V12M9.5 20.5v-5h5v5"/>',
  arti: '<path d="M12 5v14M5 12h14"/>',
  yol: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  kapat: '<path d="M18 6 6 18M6 6l12 12"/>',
};
const ikon = (ad, cls = "") => `<svg class="ik${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[ad]}</svg>`;
const WA_SVG = '<svg class="ik" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.46-.72-1.7-.8-.22-.08-.39-.12-.55.13-.17.24-.63.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43l-.75-1.8c-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.7 2.7 0 0 0-.85 2.02 4.7 4.7 0 0 0 1 2.5 10.8 10.8 0 0 0 4.14 3.66c1.54.66 2.14.72 2.9.6.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.15-1.18-.07-.1-.23-.16-.48-.28z"/></svg>';

// ---------------------------------------------------------------- logo: lastik tırnaklarıyla çevrili dünya (tarım + dünya)
const f1 = (n) => +n.toFixed(2);
const tirnaklar = (cx, cy, r1, r2, n, egim) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2, b = a + egim;
  return `M${f1(cx + r1 * Math.cos(a))} ${f1(cy + r1 * Math.sin(a))}L${f1(cx + r2 * Math.cos(b))} ${f1(cy + r2 * Math.sin(b))}`;
}).join("");
const LOGO_IC = `<rect width="48" height="48" rx="12" fill="#0d1310"/><circle cx="24" cy="24" r="12.2" fill="none" stroke="#d9a441" stroke-width="1.8"/><ellipse cx="24" cy="24" rx="5.4" ry="12.2" fill="none" stroke="#d9a441" stroke-width="1.4"/><path d="M12.6 20.2c7.2 2.4 15.6 2.4 22.8 0M12.6 27.8c7.2-2.4 15.6-2.4 22.8 0" fill="none" stroke="#f0cf86" stroke-width="1.4" stroke-linecap="round"/><path d="${tirnaklar(24, 24, 15.2, 19.6, 20, 0.16)}" stroke="#d9a441" stroke-width="2.4" stroke-linecap="round"/>`;
const LOGO_ISARET = `<svg class="logo-isaret" viewBox="0 0 48 48" aria-hidden="true">${LOGO_IC}</svg>`;
const logo = () => `<a class="logo" href="/" aria-label="${esc(c.marka)} ana sayfa">${LOGO_ISARET}<span class="logo-yazi"><b>${esc(c.marka)}</b><small>Traktör Galerisi · ${esc(c.il)}</small></span></a>`;

// ---------------------------------------------------------------- traktörün teknik çizimi ("Makineyi tanıyın")
function traktorCizimi() {
  const RW = [468, 292], FW = [170, 324];
  const lug = (cx, cy, r1, r2, n) => tirnaklar(cx, cy, r1, r2, n, 0.09);
  return `<svg class="traktor" viewBox="0 0 680 450" aria-hidden="true">
<defs>
  <linearGradient id="trCam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0cf86" stop-opacity=".22"/><stop offset=".6" stop-color="#d9a441" stop-opacity=".06"/><stop offset="1" stop-color="#d9a441" stop-opacity=".14"/></linearGradient>
  <linearGradient id="trGovde" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a441" stop-opacity=".16"/><stop offset="1" stop-color="#d9a441" stop-opacity=".03"/></linearGradient>
  <pattern id="trIzgara" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="#d9a441" stroke-opacity=".07"/></pattern>
</defs>
<rect width="680" height="450" fill="url(#trIzgara)"/>
<g class="tr-cizgi" fill="none" stroke="#d9a441" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
  <path class="tr-dolgu" d="M118 214 342 200q10 0 10 10v52l-226 8q-10 0-10-10z" fill="url(#trGovde)"/>
  <path d="M104 208h16v66h-16z"/><path d="M107 218h10M107 228h10M107 238h10M107 248h10M107 258h10"/>
  <path d="M92 272h34v20H92z"/>
  <path d="M150 232h150M150 246h150" stroke-opacity=".45"/>
  <path d="M318 200V122M312 122h12l-2-12h-8z"/>
  <path d="M346 78h172l8 12H340z" fill="url(#trGovde)"/>
  <path d="M358 90 350 206M512 90l8 110"/>
  <path class="tr-dolgu" d="M362 97h144l6 98-156 8z" fill="url(#trCam)"/>
  <path d="M438 97v102" stroke-opacity=".6"/>
  <path d="M392 164l22-12M404 158v24" stroke-opacity=".7"/>
  <path d="M366 264a104 104 0 0 1 204-6" stroke-width="7" stroke-opacity=".85"/>
  <path d="M126 272h250"/>
  <path d="M384 302h28M388 286v16"/>
  <path d="M566 262l40 34M566 300l42 4M606 296v10M548 236l22 26"/>
  <circle cx="${RW[0]}" cy="${RW[1]}" r="92"/><circle cx="${RW[0]}" cy="${RW[1]}" r="72"/>
  <circle cx="${RW[0]}" cy="${RW[1]}" r="50" stroke-opacity=".8"/><circle cx="${RW[0]}" cy="${RW[1]}" r="16"/>
  <path d="${lug(RW[0], RW[1], 74, 91, 30)}" stroke-width="3"/>
  <path d="${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `M${f1(RW[0] + 18 * Math.cos(a))} ${f1(RW[1] + 18 * Math.sin(a))}L${f1(RW[0] + 48 * Math.cos(a))} ${f1(RW[1] + 48 * Math.sin(a))}`; }).join("")}" stroke-opacity=".5"/>
  <circle cx="${FW[0]}" cy="${FW[1]}" r="58"/><circle cx="${FW[0]}" cy="${FW[1]}" r="44"/>
  <circle cx="${FW[0]}" cy="${FW[1]}" r="30" stroke-opacity=".8"/><circle cx="${FW[0]}" cy="${FW[1]}" r="9"/>
  <path d="${lug(FW[0], FW[1], 46, 57, 22)}" stroke-width="2.6"/>
</g>
<path d="M40 384H640" stroke="#d9a441" stroke-opacity=".35" stroke-dasharray="2 6"/>
<g class="tr-olcu" fill="none" stroke="#f0cf86" stroke-opacity=".6">
  <path d="M${FW[0]} 400v26M${RW[0]} 400v26M${FW[0]} 414H${RW[0]}"/>
  <path d="M${FW[0] + 8} 409l-8 5 8 5M${RW[0] - 8} 409l8 5-8 5"/>
</g>
<text class="tr-yazi" x="${(FW[0] + RW[0]) / 2}" y="440" text-anchor="middle">DİNGİL MESAFESİ</text>
</svg>`;
}

const makineyiTaniyin = () => `
<section class="bolum koyu tanit" id="makineyi-taniyin"><div class="kap">
  <div class="bolum-bas satir"><div><p class="ust-baslik">Makineyi tanıyın</p><h2>İkinci el alırken <em>nereye bakılır?</em></h2></div><p class="bolum-yan acik">Çizimdeki noktalara dokunun: her parçada neyi kontrol etmeniz gerektiğini görün. Galeriye geldiğinizde bu listeyi birlikte kontrol edelim.</p></div>
  <div class="tanit-duzen">
    <div class="tanit-cizim">
      ${traktorCizimi()}
      ${PARCALAR.map((p, i) => `<button type="button" class="nokta-d" style="left:${f1(p.x / 6.8)}%;top:${f1(p.y / 4.5)}%" data-parca="${i}" aria-controls="parca-${i}" aria-label="${esc(p.ad)}"><span>${i + 1}</span></button>`).join("")}
    </div>
    <div class="tanit-panel">
      <div class="parca-sekme" role="tablist" aria-label="Parçalar">${PARCALAR.map((p, i) => `<button type="button" role="tab" class="ps" data-parca="${i}" aria-selected="${i === 0}" aria-controls="parca-${i}"><span>${i + 1}</span>${esc(p.ad)}</button>`).join("")}</div>
      ${PARCALAR.map((p, i) => `<div class="parca" id="parca-${i}" role="tabpanel"${i ? " data-gizli" : ""}><p class="parca-no">0${i + 1} / 0${PARCALAR.length}</p><h3>${esc(p.ad)}</h3><p>${p.metin}</p><ul class="tikli">${p.liste.map((x) => `<li>${ikon("tik")}<span>${x}</span></li>`).join("")}</ul></div>`).join("")}
      <a class="metin-link acik" href="/rehber/ikinci-el-traktor-alirken-kontrol-listesi/">15 maddelik kontrol listesinin tamamı${ikon("ok")}</a>
    </div>
  </div>
</div></section>`;

// ---------------------------------------------------------------- ortak parçalar
const NAV = [["/urunler/", "Ürünler"], ["/talep/", "Traktör Bul"], ["/rehber/", "Rehber"], ["/iletisim/", "İletişim"]];

const ustKisim = (aktif) => `
<a class="atla" href="#icerik">İçeriğe geç</a>
<header class="ust" id="ust">
  <div class="kap ust-ic">
    ${logo()}
    <nav class="nav" id="nav" aria-label="Ana menü">
      <ul>${NAV.map(([h, a]) => `<li><a href="${h}"${aktif === h ? ' aria-current="page"' : ""}>${a}</a></li>`).join("")}<li><a href="${esc(c.sahibinden)}" ${dis} class="nav-dis">Güncel İlanlar${ikon("dis")}</a></li></ul>
      <div class="nav-mobil">
        <a class="btn btn-altin btn-blok" href="tel:${c.telefon}" data-track="call">${ikon("tel")}${c.telefonGorunen}</a>
        <a class="btn btn-wa btn-blok" href="${waLink()}" ${dis} data-track="whatsapp">${WA_SVG}WhatsApp'tan yazın</a>
      </div>
    </nav>
    <div class="ust-sag">
      <a class="ust-tel" href="tel:${c.telefon}" data-track="call">${ikon("tel")}<span>${c.telefonGorunen}</span></a>
      <a class="btn btn-altin btn-kucuk ust-cta" href="${waLink()}" ${dis} data-track="whatsapp">${WA_SVG}WhatsApp</a>
      <button class="menu-dugme" id="menuDugme" aria-label="Menüyü aç" aria-expanded="false" aria-controls="nav">${ikon("menu", "ac")}${ikon("kapat", "kapa")}</button>
    </div>
  </div>
</header>`;

const altCubuk = () => `
<div class="alt-cubuk" aria-label="Hızlı iletişim">
  <a href="tel:${c.telefon}" data-track="call">${ikon("tel")}<span>Ara</span></a>
  <a href="${waLink()}" ${dis} data-track="whatsapp" class="ac-wa">${WA_SVG}<span>WhatsApp</span></a>
  <a href="/talep/">${ikon("traktor")}<span>Traktör bul</span></a>
</div>`;

const altBilgi = () => `
<footer class="alt">
  <div class="kap alt-ust">
    <div class="alt-marka">
      ${logo()}
      <p>${esc(c.ildeki)} traktör galerisi: ikinci el traktör, tarım makineleri ve ekipmanları. Uygun fiyat, güvenilir alışveriş.</p>
      <ul class="alt-bilgi">
        <li><a href="tel:${c.telefon}" data-track="call">${ikon("tel")}${c.telefonGorunen}</a></li>
        <li><a href="${waLink()}" ${dis} data-track="whatsapp">${WA_SVG}WhatsApp'tan yazın</a></li>
        <li><a href="mailto:${c.eposta}">${ikon("posta")}${c.eposta}</a></li>
        <li>${ikon("pin")}${esc(c.adres ? `${c.adres}, ${c.il}` : `${c.il} Merkez`)}</li>
        <li>${ikon("saat")}${esc(c.calismaSaatleri)}</li>
      </ul>
    </div>
    <div><h2>Ürünler</h2><ul>${KATEGORILER.map((k) => `<li><a href="${katYol(k)}">${k.uzunAd}</a></li>`).join("")}<li><a href="${esc(c.sahibinden)}" ${dis}>Güncel ilanlar (sahibinden)</a></li></ul></div>
    <div><h2>Rehber</h2><ul>${REHBER.map((r) => `<li><a href="${rehberYol(r)}">${r.h1}</a></li>`).join("")}</ul></div>
    <div><h2>Galeri</h2><ul><li><a href="/talep/">Aradığınız traktörü bulalım</a></li><li><a href="/talep/?mod=sat">Traktörünüzü satın</a></li><li><a href="/iletisim/">İletişim</a></li></ul></div>
  </div>
  <div class="kap alt-alt">
    <span>© ${new Date().getFullYear()} ${esc(c.markaUzun)} · ${esc(c.sahip)}</span>
    <span>Fotoğraflar temsilîdir (Unsplash). Talep formu yalnızca WhatsApp mesajınızı hazırlar; bu sitede kişisel veri saklanmaz.</span>
  </div>
</footer>`;

const kirinti = (yollar) => `<nav class="kirinti" aria-label="Sayfa yolu"><ol>${yollar.map(([h, a], i) => i === yollar.length - 1 ? `<li aria-current="page">${a}</li>` : `<li><a href="${h}">${a}</a></li>`).join("")}</ol></nav>`;
const kirintiSema = (yollar) => ({ "@type": "BreadcrumbList", itemListElement: yollar.map(([h, a], i) => ({ "@type": "ListItem", position: i + 1, name: duz(a), item: url(h) })) });

const ctaDugmeler = (mesaj) => `<div class="cta-dugmeler">
  <a class="btn btn-altin btn-buyuk" href="${waLink(mesaj)}" ${dis} data-track="whatsapp">${WA_SVG}WhatsApp'tan yazın</a>
  <a class="btn btn-cizgi btn-buyuk" href="tel:${c.telefon}" data-track="call">${ikon("tel")}${c.telefonGorunen}</a>
</div>`;

const ctaBant = (baslik = "Aradığınız makineyi <em>birlikte bulalım</em>") => `
<section class="cta-bant">
  ${foto("ot", { sinif: "arka-foto", alt: "" })}
  <div class="kap cta-bant-ic">
    <div><p class="ust-baslik">Okan Edizer · ${esc(c.marka)}</p><h2>${baslik}</h2><p>Ne iş yapacağınızı, bütçenizi ve beklentinizi yazın; uygun seçenekleri fotoğraf ve videoyla gönderelim. ${esc(c.calismaSaatleri)}.</p></div>
    ${ctaDugmeler()}
  </div>
</section>`;

// src/ilanlar.json doldurulursa (baslik, yil, saat, cekis, fiyat, gorsel, link) vitrinde kart olarak çıkar
const ilanKart = (i) => `<a class="ilan" href="${esc(i.link || c.sahibinden)}" ${dis}>${i.gorsel ? `<img src="${esc(i.gorsel)}" alt="${esc(i.baslik)}" loading="lazy" width="400" height="300">` : ""}<span class="ilan-ic"><b>${esc(i.baslik)}</b><small>${[i.yil, i.saat && `${i.saat} saat`, i.cekis].filter(Boolean).map(esc).join(" · ")}</small>${i.fiyat ? `<em>${esc(i.fiyat)}</em>` : ""}</span></a>`;

const sahibindenKart = () => `
<div class="vitrin-kart">
  ${foto("balya", { sinif: "arka-foto", sizes: "(max-width:1240px) 100vw, 1200px" })}
  <div class="vitrin-metin">
    <p class="ust-baslik">${ikon("vitrin")}Güncel stok</p>
    <h2>İlanlarımız <em>sahibinden.com</em> mağazamızda</h2>
    <p>Stoğumuz sık değişiyor. Satıştaki traktör ve makinelerin güncel fotoğraf, fiyat ve bilgileri sahibinden.com'daki mağazamızda. Beğendiğiniz ilanı WhatsApp'tan sorun, ayrıntıları ve videosunu gönderelim.</p>
    <div class="cta-dugmeler">
      <a class="btn btn-altin btn-buyuk" href="${esc(c.sahibinden)}" ${dis} data-track="sahibinden">Tüm ilanları görün${ikon("dis")}</a>
      <a class="btn btn-cizgi btn-buyuk" href="${waLink("Merhaba, sahibinden.com'daki ilanınız hakkında bilgi almak istiyorum.")}" ${dis} data-track="whatsapp">${WA_SVG}İlanı sorun</a>
    </div>
  </div>
  ${ILANLAR.length ? `<div class="ilanlar">${ILANLAR.slice(0, 6).map(ilanKart).join("")}</div>` : ""}
</div>`;

const blokHtml = (icerik) => {
  if (Array.isArray(icerik)) return icerik.map((p) => `<p>${p}</p>`).join("");
  if (icerik.tablo) return `<div class="tablo-kap"><table class="tablo"><thead><tr>${icerik.tablo.baslik.map((b) => `<th scope="col">${b}</th>`).join("")}</tr></thead><tbody>${icerik.tablo.satirlar.map(([ilk, ...r]) => `<tr><th scope="row">${ilk}</th>${r.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  if (icerik.liste) return `<ul class="tikli">${icerik.liste.map((x) => `<li>${ikon("tik")}<span>${x}</span></li>`).join("")}</ul>`;
  if (icerik.sirali) return `<ol class="sirali">${icerik.sirali.map((x) => `<li><span>${x}</span></li>`).join("")}</ol>`;
  return "";
};
const bolumlerHtml = (bolumler) => bolumler.map(([h, b]) => `<h2>${h}</h2>${blokHtml(b)}`).join("");
const sssHtml = (liste, baslik = "Sık sorulan sorular") => `<div class="sss"><h2>${baslik}</h2>${liste.map(([s, cv], i) => `<details${i === 0 ? " open" : ""}><summary>${s}<i aria-hidden="true"></i></summary><div><p>${cv}</p></div></details>`).join("")}</div>`;
const sssSema = (liste) => ({ "@type": "FAQPage", mainEntity: liste.map(([s, cv]) => ({ "@type": "Question", name: duz(s), acceptedAnswer: { "@type": "Answer", text: duz(cv) } })) });

const katKart = (k) => {
  const i = KATEGORILER.indexOf(k);
  return `<a class="foto-kart fk-${i}" href="${katYol(k)}">${foto(k.foto, { sinif: "fk-foto", sizes: i === 0 ? "(max-width:700px) 100vw, 800px" : "(max-width:700px) 100vw, 600px", alt: k.uzunAd })}<span class="fk-ust"><span class="fk-no">0${i + 1}</span><span class="fk-ikon">${ikon(k.ikon)}</span></span><span class="fk-alt"><h3>${k.uzunAd}</h3><p>${k.kisa}</p><span class="kart-ok">İncele${ikon("ok")}</span></span></a>`;
};
const rehberKart = (r) => `<a class="kart rehber-kart" href="${rehberYol(r)}"><span class="rk-foto">${foto(r.foto, { sizes: "(max-width:700px) 100vw, 420px", alt: "" })}<span class="rk-ikon">${ikon(r.ikon)}</span></span><span class="rk-ic"><span class="rk-etiket">${ikon("kitap")}Çiftçi rehberi</span><h3>${r.h1}</h3><p>${r.kisaCevap.split(/(?<=\.)\s/)[0]}</p><span class="kart-ok">Okuyun${ikon("ok")}</span></span></a>`;
const trTarih = (t) => new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

// ---------------------------------------------------------------- talep formu: al / sat → WhatsApp mesajı (veri saklamaz)
const secimler = (ad, liste, tip = "radio", secili = 0) => `<div class="secimler">${liste.map((s, i) => `<label><input type="${tip}" name="${ad}" value="${s}"${tip === "radio" && i === secili ? " checked" : ""}><span>${s}</span></label>`).join("")}</div>`;
const TURLER = ["Traktör", ...KATEGORILER.slice(1).map((k) => k.uzunAd), "Diğer"];
const talepFormu = () => `
<form class="talep" id="talep" novalidate>
  <div class="mod" role="tablist" aria-label="Talep türü">
    <button type="button" role="tab" class="mod-dugme" data-mod="al" aria-selected="true">${ikon("traktor")}Almak istiyorum</button>
    <button type="button" role="tab" class="mod-dugme" data-mod="sat" aria-selected="false">${ikon("etiket")}Satmak istiyorum</button>
  </div>
  <fieldset class="t-adim"><legend><span>1</span><b data-al>Ne arıyorsunuz?</b><b data-sat hidden>Ne satıyorsunuz?</b></legend>
    ${secimler("tur", TURLER)}
  </fieldset>
  <fieldset class="t-adim"><legend><span>2</span>Ayrıntılar</legend>
    <div class="t-izgara">
      <label class="t-alan"><span>Marka / model</span><input type="text" name="marka" maxlength="60" placeholder="Örn. New Holland, Massey Ferguson…" list="markalar"></label>
      <datalist id="markalar">${["New Holland", "Massey Ferguson", "Türk Fiat", "Tümosan", "Başak", "John Deere", "Erkunt", "Hattat", "Landini", "Same", "Deutz-Fahr", "Kubota", "Case IH", "Valtra"].map((m) => `<option value="${m}">`).join("")}</datalist>
      <label class="t-alan"><span data-al>En eski model yılı</span><span data-sat hidden>Model yılı</span><input type="number" name="yil" inputmode="numeric" min="1960" max="2026" placeholder="Örn. 2012"></label>
      <label class="t-alan" data-al><span>Güç</span><select name="guc"><option>Fark etmez</option><option>50 beygir altı</option><option>50–75 beygir</option><option>75–100 beygir</option><option>100 beygir üstü</option></select></label>
      <label class="t-alan" data-sat hidden><span>Çalışma saati</span><input type="number" name="saat" inputmode="numeric" min="0" placeholder="Örn. 4500"></label>
      <label class="t-alan"><span>Çekiş</span><select name="cekis"><option>Fark etmez</option><option>4WD (çift çeker)</option><option>2WD (tek çeker)</option></select></label>
      <label class="t-alan"><span data-al>Bütçe</span><span data-sat hidden>Beklediğiniz fiyat</span><input type="text" name="butce" maxlength="40" placeholder="Örn. 900.000 TL"></label>
    </div>
  </fieldset>
  <fieldset class="t-adim"><legend><span>3</span>Size nasıl ulaşalım?</legend>
    <div class="t-izgara">
      <label class="t-alan"><span>Adınız</span><input type="text" name="ad" autocomplete="name" maxlength="60" placeholder="Örn. Ahmet Yılmaz"></label>
      <label class="t-alan"><span>İlçe / köy <small>(isteğe bağlı)</small></span><input type="text" name="yer" maxlength="60" placeholder="Örn. Sarıkamış"></label>
    </div>
    <label class="t-alan"><span>Not <small>(isteğe bağlı)</small></span><textarea name="not" rows="2" maxlength="400" placeholder="Hangi işlerde kullanacaksınız? Kabin, lastik, ekipman beklentiniz…"></textarea></label>
    <p class="t-ipucu" data-sat hidden>${ikon("bilgi")}Mesaj açıldıktan sonra makinenin fotoğraflarını aynı sohbete ekleyin; değerlendirmemiz hızlanır.</p>
  </fieldset>
  <div class="t-ozet" id="tOzet" aria-live="polite"></div>
  <button type="submit" class="btn btn-wa btn-blok btn-gonder">${WA_SVG}<span data-al>Talebimi WhatsApp'tan gönder</span><span data-sat hidden>Makinemi WhatsApp'tan gönder</span></button>
  <p class="form-not">${ikon("kalkan")}Bu form yalnızca WhatsApp mesajınızı hazırlar; bilgileriniz bu sitede saklanmaz.</p>
</form>`;


// ---------------------------------------------------------------- bölge: Kars'ın ilçeleri ve komşu iller
const bolgeBolumu = () => `
<section class="bolum bolge-bolum" id="bolge"><div class="kap bolge-duzen">
  <div class="bolge-metin">
    <p class="ust-baslik">${ikon("pin")}Kars ve ilçeleri</p>
    <h2>Kars'ın her ilçesinden <em>bize ulaşın</em></h2>
    <p>Galerimiz ${esc(c.il)} merkezde. İlçelerden ya da komşu illerden gelecekseniz önceden arayın; konumu gönderelim, baktığınız makineyi hazır edelim. Uzaktaysanız fotoğraf ve videoları WhatsApp'tan iletiriz.</p>
    <div class="cta-dugmeler"><a class="btn btn-altin" href="${waLink("Merhaba, konum ve makineler hakkında bilgi almak istiyorum.")}" ${dis} data-track="whatsapp">${WA_SVG}Konum isteyin</a><a class="btn btn-cizgi-acik" href="tel:${c.telefon}" data-track="call">${ikon("tel")}${c.telefonGorunen}</a></div>
  </div>
  <div class="bolge-harita">
    <p class="bolge-bas">Kars ilçeleri</p>
    <ul class="ilceler">${ILCELER.map((x) => `<li${x === "Merkez" ? ' class="merkez"' : ""}>${ikon("pin")}${x === "Merkez" ? `${esc(c.il)} Merkez<small>Galerimiz burada</small>` : x}</li>`).join("")}</ul>
    <p class="bolge-bas">Komşu iller</p>
    <ul class="ilceler komsu">${KOMSU_ILLER.map((x) => `<li>${ikon("yol")}${x}</li>`).join("")}</ul>
  </div>
</div></section>`;

// ---------------------------------------------------------------- sayfa başı (fotoğraflı)
const sayfaBas = ({ kir, ust, h1, giris = "", ek = "", fotoAd, ikonAd }) => `
<section class="sayfa-bas${fotoAd ? " fotolu" : ""}">
  ${fotoAd ? foto(fotoAd, { sinif: "arka-foto", oncelik: true, alt: "" }) : ""}
  <div class="kap sayfa-bas-duzen">
    <div>${kirinti(kir)}<p class="ust-baslik">${ust}</p><h1>${h1}</h1>${giris ? `<p class="giris">${giris}</p>` : ""}${ek}</div>
    ${ikonAd ? `<span class="sayfa-ikon" aria-hidden="true">${ikon(ikonAd)}</span>` : ""}
  </div>
</section>`;

// ---------------------------------------------------------------- sayfa kabuğu
const ISLETME_ID = url("/#isletme");
const isletmeSema = () => ({
  "@type": "Store",
  "@id": ISLETME_ID,
  name: c.markaUzun,
  alternateName: [c.marka, `${c.marka} ${c.il}`, `${c.marka} Traktör`, `${c.il} ${c.marka} Traktör Galerisi`],
  description: `${c.ildeki} traktör galerisi: ikinci el traktör, tarım makineleri ve ekipmanları.`,
  url: url("/"),
  telephone: c.telefon,
  email: c.eposta,
  image: url(v("/og.png")),
  logo: url(v("/icon-512.png")),
  founder: { "@type": "Person", name: c.sahip },
  address: { "@type": "PostalAddress", ...(c.adres ? { streetAddress: c.adres } : {}), addressLocality: c.il, addressRegion: c.il, addressCountry: "TR" },
  areaServed: [{ "@type": "AdministrativeArea", name: c.il }, ...ILCELER.filter((x) => x !== "Merkez").map((x) => ({ "@type": "City", name: `${x}, ${c.il}` })), ...KOMSU_ILLER.map((x) => ({ "@type": "AdministrativeArea", name: x }))],
  ...(c.yirmiDortSaat ? { openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }] } : {}),
  knowsAbout: KATEGORILER.map((k) => k.uzunAd),
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Traktör ve tarım makineleri", itemListElement: KATEGORILER.map((k) => ({ "@type": "OfferCatalog", name: k.uzunAd, url: url(katYol(k)) })) },
  sameAs: [c.sahibinden, c.googleHaritaLinki, c.instagram && `https://instagram.com/${c.instagram}`].filter(Boolean),
});

const sayfalar = [];
function sayfa({ yol, baslik, aciklama, govde, sema = [], aktif, noindex = false, tur = "WebPage", sinif = "", onyukle = "" }) {
  const graf = [
    { "@type": "WebSite", "@id": url("/#site"), url: url("/"), name: c.marka, inLanguage: "tr-TR", publisher: { "@id": ISLETME_ID } },
    isletmeSema(),
    { "@type": tur, "@id": url(yol) + "#sayfa", url: url(yol), name: baslik, description: aciklama, inLanguage: "tr-TR", isPartOf: { "@id": url("/#site") }, about: { "@id": ISLETME_ID } },
    ...sema,
  ];
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": graf }).replace(/</g, "\\u003c");
  const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(baslik)}</title>
<meta name="description" content="${esc(aciklama)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url(yol)}">`}
<meta name="theme-color" content="#0d1310">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${esc(c.markaUzun)}">
<meta property="og:title" content="${esc(baslik)}">
<meta property="og:description" content="${esc(aciklama)}">
<meta property="og:url" content="${url(yol)}">
<meta property="og:image" content="${url(v("/og.png"))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${c.googleDogrulama ? `<meta name="google-site-verification" content="${esc(c.googleDogrulama)}">` : ""}
<link rel="icon" href="${v("/favicon.ico")}" sizes="48x48">
<link rel="icon" href="${v("/favicon.svg")}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${v("/apple-touch-icon.png")}">
<link rel="manifest" href="/site.webmanifest">
${onyukle ? `<link rel="preload" as="image" imagesrcset="${fotoSrcset(onyukle)}" imagesizes="100vw" fetchpriority="high">` : ""}
<link rel="preload" href="/font/barlow-c-700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/font/barlow-c-700-latin-ext.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/font/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/font/manrope-latin-ext.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
<script type="application/ld+json">${ld}</script>
${c.ga4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(c.ga4)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${esc(c.ga4)}");</script>` : ""}
</head>
<body${sinif ? ` class="${sinif}"` : ""}>
${ustKisim(aktif)}
<main id="icerik">
${govde}
</main>
${altBilgi()}
${altCubuk()}
<script>window.TD={wa:"${c.whatsapp}"};${JS}</script>
</body>
</html>`;
  const dosya = yol === "/404.html" ? join(OUT, "404.html") : join(OUT, yol, "index.html");
  mkdirSync(dirname(dosya), { recursive: true });
  writeFileSync(dosya, html);
  if (!noindex) sayfalar.push(yol);
}

// ---------------------------------------------------------------- ANA SAYFA
function anaSayfa() {
  const kayanListe = ["Traktör", "Çayır biçme", "Ot tırmığı", "Balya makinesi", "Pulluk", "Kültivatör", "Diskaro", "Römork", "Tanker", "Mibzer", "Gübre serpme"];
  const kayan = kayanListe.map((x) => `<span>${x}</span><i></i>`).join("");
  const hizliSecim = [["Traktör", "traktor"], ["Ot ve Hasat Makineleri", "balya"], ["Toprak İşleme Ekipmanları", "pulluk"], ["Römork ve Taşıma Ekipmanları", "romork"], ["Ekim ve Gübreleme Makineleri", "mibzer"]];
  const govde = `
<section class="kahraman">
  <div class="k-foto-kap" aria-hidden="true">${foto("kahraman", { sinif: "k-foto", oncelik: true })}</div>
  <div class="k-ortu" aria-hidden="true"></div>
  <div class="kap kahraman-ic">
    <div class="k-metin">
      <p class="ust-baslik"><span class="nokta"></span>${esc(c.il)} · Satılık traktör ve tarım makineleri</p>
      <h1><span class="satir-a">Toprağa güç,</span> <em class="satir-a">işinize güven.</em></h1>
      <p class="giris">İkinci el traktör, tarım makineleri ve ekipmanlarında <b>uygun fiyat</b>, <b>güvenilir alışveriş</b> ve müşteri memnuniyeti önceliğimiz.</p>
      <div class="cta-dugmeler">
        <a class="btn btn-altin btn-buyuk" href="${esc(c.sahibinden)}" ${dis} data-track="sahibinden">${ikon("vitrin")}Güncel ilanları görün</a>
        <a class="btn btn-cam btn-buyuk" href="${waLink()}" ${dis} data-track="whatsapp">${WA_SVG}WhatsApp'tan yazın</a>
      </div>
    </div>
    <div class="k-kart">
      <p class="k-kart-bas">${ikon("traktor")}Ne arıyorsunuz?</p>
      <ul>${hizliSecim.map(([t, ik]) => `<li><a href="/talep/?tur=${encodeURIComponent(t)}">${ikon(ik)}<span>${t.replace(/ (Makineleri|Ekipmanları)$/, "").replace(" ve Taşıma", " · Tanker").replace(" ve Gübreleme", " · Gübreleme")}</span>${ikon("ok")}</a></li>`).join("")}</ul>
      <a class="k-kart-sat" href="/talep/?mod=sat">${ikon("etiket")}<span><b>Traktörünüzü mü satıyorsunuz?</b><small>Bilgilerini gönderin, değerlendirelim</small></span></a>
    </div>
  </div>
  <div class="kap"><ul class="k-ozet">
    <li><b>7/24</b><span>telefon ve WhatsApp</span></li>
    <li><b>${KATEGORILER.length}</b><span>ürün grubu</span></li>
    <li><b>Al · Sat</b><span>traktör ve ekipman</span></li>
    <li><b>${esc(c.il)}</b><span>merkezde galeri</span></li>
  </ul></div>
</section>

<div class="kayan" aria-hidden="true"><div class="kayan-ic">${kayan}${kayan}</div></div>

<section class="bolum" id="urunler"><div class="kap">
  <div class="bolum-bas satir"><div><p class="ust-baslik">Ürün grupları</p><h2>Tarlada, ahırda, yolda: <em>işinize uygun makine</em></h2></div><p class="bolum-yan">Traktörden balya makinesine, pulluktan römorka. Her ürün grubunda neye dikkat etmeniz gerektiğini de anlattık.</p></div>
  <div class="bento">${KATEGORILER.map(katKart).join("")}</div>
</div></section>

<section class="bolum koyu-ince" id="vitrin"><div class="kap">${sahibindenKart()}</div></section>

<section class="bolum" id="neden"><div class="kap neden-duzen">
  <figure class="neden-foto">
    ${foto("gunbatimi", { sizes: "(max-width:900px) 100vw, 560px", alt: "Gün batımında tarlada çalışan traktör" })}
    <figcaption><span class="tirnak" aria-hidden="true">“</span>Siz de ihtiyaçlarınıza uygun tarım makinelerini güvenle bizden temin edebilirsiniz.<b>${esc(c.sahip)}</b></figcaption>
  </figure>
  <div class="neden-metin">
    <p class="ust-baslik">Neden ${esc(c.marka)}?</p>
    <h2>Kaliteli ve <em>güvenilir</em> hizmet</h2>
    <p>Tarım ve traktör sektöründe kaliteli, güvenilir hizmet sunuyoruz. Makinenin durumunu açıkça konuşur, işinize uygun olanı birlikte seçeriz.</p>
    <ul class="neden-liste">${NEDEN.map(([ik, b, m]) => `<li><span class="neden-ikon">${ikon(ik)}</span><span><h3>${b}</h3><p>${m}</p></span></li>`).join("")}</ul>
    <div class="sahip-kart">
      <span class="sahip-harf" aria-hidden="true">${esc(c.sahip.split(" ").map((s) => s[0]).join(""))}</span>
      <span><b>${esc(c.sahip)}</b><small>Galeri sahibi · ${esc(c.markaUzun)}</small></span>
      <a class="sahip-tel" href="tel:${c.telefon}" data-track="call" aria-label="${esc(c.sahip)}'i arayın">${ikon("tel")}</a>
    </div>
  </div>
</div></section>

${makineyiTaniyin()}

<section class="takvim-bolum" id="takvim">
  <div class="takvim-foto" aria-hidden="true">${foto("mera", { sinif: "arka-foto" })}</div>
  <div class="kap">
    <div class="bolum-bas"><p class="ust-baslik">Kars'ta tarım yılı</p><h2>Her mevsimin <em>makinesi</em> ayrı</h2><p class="bolum-yan acik">Kars'ın kısa yazı ve uzun kışında işler takvime sıkışır. Makinenizi sezon başlamadan hazır edin.</p></div>
    <ol class="takvim">${TAKVIM.map((t, i) => `<li><span class="tk-ay">${t.ay}</span><span class="tk-nokta" aria-hidden="true"></span><h3>${t.baslik}</h3><p>${t.metin}</p><a href="${t.link[0]}">${t.link[1]}${ikon("ok")}</a></li>`).join("")}</ol>
  </div>
</section>

<section class="bolum krem" id="surec"><div class="kap">
  <div class="bolum-bas orta"><p class="ust-baslik">Nasıl çalışıyoruz?</p><h2>Talepten <em>teslime</em> dört adım</h2></div>
  <ol class="surec">${SUREC.map(([b, m], i) => `<li><span class="surec-no">0${i + 1}</span><h3>${b}</h3><p>${m}</p></li>`).join("")}</ol>
</div></section>

<section class="bolum" id="traktor-bul"><div class="kap talep-duzen">
  <div class="talep-metin">
    <p class="ust-baslik">Traktör bul · Traktör sat</p>
    <h2>Aradığınızı yazın, <em>biz bulalım</em></h2>
    <p>Almak ya da satmak istediğiniz makinenin bilgilerini seçin. Mesajınız WhatsApp'ta hazır açılır; gönderin, size dönelim.</p>
    <ul class="tikli">
      <li>${ikon("tik")}<span>Uygun seçenekleri fotoğraf ve videoyla gönderiyoruz.</span></li>
      <li>${ikon("tik")}<span>Satmak istediğiniz makineyi değerlendirip size dönüyoruz.</span></li>
      <li>${ikon("tik")}<span>Aramayı tercih ederseniz: <a href="tel:${c.telefon}" data-track="call">${c.telefonGorunen}</a></span></li>
    </ul>
  </div>
  ${talepFormu()}
</div></section>

<section class="bolum krem" id="rehber"><div class="kap">
  <div class="bolum-bas satir"><div><p class="ust-baslik">Çiftçi rehberi</p><h2>Almadan önce <em>okuyun</em></h2></div><a class="metin-link" href="/rehber/">Tüm yazılar${ikon("ok")}</a></div>
  <div class="izgara-3">${REHBER.slice(0, 3).map(rehberKart).join("")}</div>
</div></section>

${bolgeBolumu()}
<section class="bolum"><div class="kap dar">${sssHtml(SSS_GENEL)}</div></section>
${ctaBant()}`;
  sayfa({
    yol: "/", aktif: "/", sinif: "ana", onyukle: "kahraman",
    baslik: `Kars Satılık Traktör ve Traktör Galerisi | ${c.marka}`,
    aciklama: `${c.ildeki} traktör galerisi ${c.marka}: satılık ikinci el traktör, çayır biçme, balya makinesi, pulluk, römork. Uygun fiyat, güvenilir alışveriş.`,
    govde, sema: [sssSema(SSS_GENEL)],
  });
}

// ---------------------------------------------------------------- ÜRÜN SAYFALARI
function urunSayfalari() {
  const kir = [["/", "Ana sayfa"], ["/urunler/", "Ürünler"]];
  sayfa({
    yol: "/urunler/", aktif: "/urunler/", onyukle: "traktor",
    baslik: `Satılık Traktör ve Tarım Makineleri Kars | ${c.marka}`,
    aciklama: `${c.ilde} satılık ikinci el traktör, çayır biçme ve balya makinesi, pulluk, kültivatör, römork, tanker, mibzer. Ürün grupları ve güncel ilanlar.`,
    sema: [kirintiSema(kir)],
    govde: `
${sayfaBas({ kir, ust: `${KATEGORILER.length} ürün grubu`, h1: "Traktör ve <em>tarım makineleri</em>", giris: "Hangi işi yapacaksanız ona uygun makine. Her ürün grubunda türleri ve alırken nelere bakmanız gerektiğini bulacaksınız.", fotoAd: "traktor" })}
<section class="bolum"><div class="kap"><div class="bento">${KATEGORILER.map(katKart).join("")}</div></div></section>
<section class="bolum koyu-ince"><div class="kap">${sahibindenKart()}</div></section>
${makineyiTaniyin()}
${ctaBant()}`,
  });

  for (const [i, k] of KATEGORILER.entries()) {
    const kk = [...kir, [katYol(k), k.uzunAd]];
    const rehberler = REHBER.filter((r) => r.kategori === k.slug);
    const talepTur = k.slug === "ikinci-el-traktor" ? "Traktör" : k.uzunAd;
    sayfa({
      yol: katYol(k), aktif: "/urunler/", baslik: k.baslik, aciklama: k.aciklama, onyukle: k.foto,
      sema: [kirintiSema(kk), sssSema(k.sss), { "@type": "OfferCatalog", "@id": url(katYol(k)) + "#katalog", name: k.uzunAd, url: url(katYol(k)), itemListElement: k.turler.map(([t]) => ({ "@type": "Offer", itemOffered: { "@type": "Product", name: duz(t) }, seller: { "@id": ISLETME_ID } })) }],
      govde: `
${sayfaBas({ kir: kk, ust: `Ürün grubu 0${i + 1}`, h1: k.h1, giris: k.giris, ek: ctaDugmeler(`Merhaba, ${k.uzunAd.toLocaleLowerCase("tr")} hakkında bilgi almak istiyorum.`), fotoAd: k.foto })}
<div class="kap icerik-duzen">
  <article class="yazi">
    <h2>Türler</h2>
    <div class="tur-izgara">${k.turler.map(([t, m], j) => `<div class="tur"><span class="tur-no">0${j + 1}</span><h3>${t}</h3><p>${m}</p></div>`).join("")}</div>
    <h2>Alırken nelere bakılır?</h2>
    <ul class="tikli">${k.kontrol.map((x) => `<li>${ikon("tik")}<span>${x}</span></li>`).join("")}</ul>
    <div class="not-kutu">${ikon("vitrin")}<p>Stok sık değişiyor. Bu gruptaki güncel ilanlar için <a href="${esc(c.sahibinden)}" ${dis}>sahibinden.com mağazamıza</a> bakın ya da WhatsApp'tan sorun.</p></div>
    ${sssHtml(k.sss)}
    ${rehberler.length ? `<div class="ilgili"><p class="ust-baslik">İlgili rehber</p>${rehberler.map((r) => `<a href="${rehberYol(r)}">${ikon("kitap")}<span>${r.h1}</span>${ikon("ok")}</a>`).join("")}</div>` : ""}
  </article>
  <aside class="yan"><div class="yan-kart">
    <span class="yan-ikon">${ikon(k.ikon)}</span>
    <p class="yan-baslik">${k.uzunAd}</p>
    <p class="yan-metin">Aradığınızı yazın; uygun seçenekleri fotoğraf ve videoyla gönderelim.</p>
    <a class="btn btn-altin btn-blok" href="/talep/?tur=${encodeURIComponent(talepTur)}">${ikon("traktor")}Talep oluşturun</a>
    <a class="btn btn-wa btn-blok" href="${waLink(`Merhaba, ${k.uzunAd.toLocaleLowerCase("tr")} hakkında bilgi almak istiyorum.`)}" ${dis} data-track="whatsapp">${WA_SVG}WhatsApp</a>
    <a class="yan-tel" href="tel:${c.telefon}" data-track="call">${ikon("tel")}${c.telefonGorunen}</a>
  </div></aside>
</div>
${i === 0 ? makineyiTaniyin() : ""}
<section class="bolum krem"><div class="kap"><div class="bolum-bas"><p class="ust-baslik">Diğer ürün grupları</p><h2>Bunlara da <em>göz atın</em></h2></div><div class="izgara-4">${KATEGORILER.filter((x) => x !== k).map(katKart).join("")}</div></div></section>
${ctaBant(`${k.uzunAd} için <em>bize yazın</em>`)}`,
    });
  }
}

// ---------------------------------------------------------------- REHBER
function rehberSayfalari() {
  const kir = [["/", "Ana sayfa"], ["/rehber/", "Rehber"]];
  sayfa({
    yol: "/rehber/", aktif: "/rehber/", onyukle: "mera",
    baslik: `Çiftçi Rehberi: Traktör Seçimi ve Bakımı | ${c.marka}`,
    aciklama: `İkinci el traktör kontrol listesi, Kars için 2WD mi 4WD mi, traktörün kış bakımı ve ot sezonu öncesi makine hazırlığı. Almadan önce okuyun.`,
    sema: [kirintiSema(kir), { "@type": "ItemList", itemListElement: REHBER.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: url(rehberYol(r)), name: r.h1 })) }],
    govde: `
${sayfaBas({ kir, ust: `${REHBER.length} yazı`, h1: "Çiftçi <em>rehberi</em>", giris: "Traktör ve tarım makinesi alırken, bakımını yaparken işinize yarayacak kısa ve uygulanabilir yazılar.", fotoAd: "mera" })}
<section class="bolum"><div class="kap"><div class="izgara-2">${REHBER.map(rehberKart).join("")}</div></div></section>
${ctaBant()}`,
  });

  for (const r of REHBER) {
    const k = [...kir, [rehberYol(r), r.h1]];
    const kat = bulKat(r.kategori);
    const digerleri = REHBER.filter((x) => x !== r).slice(0, 3);
    sayfa({
      yol: rehberYol(r), aktif: "/rehber/", baslik: r.baslik, aciklama: r.aciklama, onyukle: r.foto,
      sema: [kirintiSema(k), { "@type": "Article", "@id": url(rehberYol(r)) + "#yazi", headline: r.h1, description: r.aciklama, datePublished: r.tarih, dateModified: r.tarih, inLanguage: "tr-TR", author: { "@type": "Person", name: c.sahip }, publisher: { "@id": ISLETME_ID }, image: url(`/foto/${r.foto}-1600.webp`), mainEntityOfPage: url(rehberYol(r)) }],
      govde: `
${sayfaBas({ kir: k, ust: `Çiftçi rehberi · ${trTarih(r.tarih)}`, h1: r.h1, fotoAd: r.foto })}
<div class="kap icerik-duzen">
  <article class="yazi">
    <div class="kisa-cevap"><p class="ust-baslik">Kısa cevap</p><p>${r.kisaCevap}</p></div>
    ${bolumlerHtml(r.bolumler)}
    ${kat ? `<div class="ilgili"><p class="ust-baslik">İlgili ürün grubu</p><a href="${katYol(kat)}">${ikon(kat.ikon)}<span>${kat.uzunAd}</span>${ikon("ok")}</a></div>` : ""}
  </article>
  <aside class="yan"><div class="yan-kart">
    <span class="yan-ikon">${ikon("traktor")}</span>
    <p class="yan-baslik">Emin değil misiniz?</p>
    <p class="yan-metin">Hangi makinenin işinize uygun olduğunu WhatsApp'tan sorun; birlikte karar verelim.</p>
    <a class="btn btn-wa btn-blok" href="${waLink(`Merhaba, "${r.h1}" yazısını okudum, bilgi almak istiyorum.`)}" ${dis} data-track="whatsapp">${WA_SVG}WhatsApp'tan sorun</a>
    <a class="btn btn-cizgi btn-blok" href="/talep/">${ikon("traktor")}Talep oluşturun</a>
    <a class="yan-tel" href="tel:${c.telefon}" data-track="call">${ikon("tel")}${c.telefonGorunen}</a>
  </div></aside>
</div>
${r.slug.startsWith("ikinci-el") ? makineyiTaniyin() : ""}
<section class="bolum krem"><div class="kap"><div class="bolum-bas"><p class="ust-baslik">Okumaya devam edin</p><h2>Diğer <em>yazılar</em></h2></div><div class="izgara-3">${digerleri.map(rehberKart).join("")}</div></div></section>`,
    });
  }
}

// ---------------------------------------------------------------- TALEP, İLETİŞİM, 404
function digerSayfalar() {
  const kirT = [["/", "Ana sayfa"], ["/talep/", "Traktör bul"]];
  sayfa({
    yol: "/talep/", aktif: "/talep/", onyukle: "gunbatimi",
    baslik: `Traktör Bul, Traktörünü Sat Kars | ${c.marka}`,
    aciklama: `Aradığınız traktör ya da tarım makinesini yazın, uygun seçenekleri gönderelim. Satmak istediğiniz makineyi de değerlendirelim. WhatsApp: ${c.telefonGorunen}`,
    sema: [kirintiSema(kirT)], tur: "ContactPage",
    govde: `
${sayfaBas({ kir: kirT, ust: "Traktör bul · Traktör sat", h1: "Aradığınızı <em>söyleyin</em>", giris: "Üç adımda seçiminizi yapın; mesajınız WhatsApp'ta hazır açılır. Gönderdiğinizde size dönüyoruz.", fotoAd: "gunbatimi" })}
<section class="bolum krem"><div class="kap talep-duzen tersine">
  ${talepFormu()}
  <div class="talep-metin">
    <h2>Talep öncesi <em>küçük notlar</em></h2>
    <ul class="tikli">
      <li>${ikon("tik")}<span>Makineyi hangi işlerde kullanacağınızı yazmanız, doğru gücü ve ekipmanı seçmemizi kolaylaştırır.</span></li>
      <li>${ikon("tik")}<span>Elinizdeki ekipmanla uyum önemliyse onların marka ve modelini de yazın.</span></li>
      <li>${ikon("tik")}<span>Satacağınız makinenin önden, yandan, arkadan, motor ve lastik fotoğraflarını gönderin.</span></li>
      <li>${ikon("tik")}<span>Güncel stoğu görmek için <a href="${esc(c.sahibinden)}" ${dis}>sahibinden.com mağazamıza</a> bakın.</span></li>
    </ul>
    <a class="il-kutu" href="tel:${c.telefon}" data-track="call">${ikon("tel")}<span><small>Aramayı tercih ederseniz</small><b>${c.telefonGorunen}</b></span></a>
  </div>
</div></section>`,
  });

  const kir = [["/", "Ana sayfa"], ["/iletisim/", "İletişim"]];
  sayfa({
    yol: "/iletisim/", aktif: "/iletisim/", onyukle: "kahraman",
    baslik: `İletişim ${c.telefonGorunen} | ${c.markaUzun}`.slice(0, 60),
    aciklama: `${c.markaUzun} iletişim: ${c.telefonGorunen} numarasından arayın ya da WhatsApp'tan yazın. ${c.il} merkezde; 7 gün 24 saat ulaşabilirsiniz.`,
    sema: [kirintiSema(kir)], tur: "ContactPage",
    govde: `
${sayfaBas({ kir, ust: "İletişim", h1: "Bize <em>ulaşın</em>", giris: `Traktör, ekipman, fiyat ya da ilanlarımızla ilgili her soru için arayın veya WhatsApp'tan yazın. Galeri sahibi: <b>${esc(c.sahip)}</b>.`, fotoAd: "kahraman" })}
<section class="bolum"><div class="kap iletisim-kartlar">
  <a class="kart il-kart" href="tel:${c.telefon}" data-track="call">${ikon("tel")}<span><small>Telefon</small><b>${c.telefonGorunen}</b></span></a>
  <a class="kart il-kart" href="${waLink()}" ${dis} data-track="whatsapp">${WA_SVG}<span><small>WhatsApp</small><b>Mesaj gönderin</b></span></a>
  <a class="kart il-kart" href="mailto:${c.eposta}">${ikon("posta")}<span><small>E-posta</small><b>${c.eposta}</b></span></a>
  <a class="kart il-kart" href="${esc(c.sahibinden)}" ${dis} data-track="sahibinden">${ikon("vitrin")}<span><small>sahibinden.com</small><b>Güncel ilanlar</b></span></a>
  <a class="kart il-kart" href="${esc(yolTarifi)}" ${dis}>${ikon("pin")}<span><small>Konum</small><b>${esc(c.adres || `${c.il} Merkez`)}</b></span></a>
  <div class="kart il-kart duz">${ikon("saat")}<span><small>Ulaşım</small><b>${esc(c.calismaSaatleri)}</b></span></div>
</div></section>
${bolgeBolumu()}
${ctaBant()}`,
  });

  sayfa({
    yol: "/404.html", noindex: true,
    baslik: `Sayfa bulunamadı | ${c.marka}`,
    aciklama: `Aradığınız sayfa bulunamadı. Traktör ve ekipman için WhatsApp'tan yazın ya da arayın: ${c.telefonGorunen}`,
    govde: `<section class="sayfa-bas fotolu bos">${foto("kahraman", { sinif: "arka-foto", oncelik: true })}<div class="kap dar"><p class="ust-baslik">404</p><h1>Bu sayfa <em>bulunamadı</em></h1><p class="giris">Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.</p>${ctaDugmeler()}<p><a class="metin-link acik" href="/">Ana sayfaya dönün${ikon("ok")}</a></p></div></section>`,
  });
}

// ---------------------------------------------------------------- derleme
writeFileSync("public/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${LOGO_IC}</svg>\n`);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync("public", OUT, { recursive: true });

anaSayfa();
urunSayfalari();
rehberSayfalari();
digerSayfalar();

writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sayfalar.map((y) => `  <url><loc>${url(y)}</loc><lastmod>${BUGUN}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${url("/sitemap.xml")}\n`);
writeFileSync(join(OUT, "llms.txt"), `# ${c.markaUzun}

> ${c.ildeki} traktör galerisi (Kars merkez; ilçeler: ${ILCELER.filter((x) => x !== "Merkez").join(", ")}). Sahibi: ${c.sahip}. İkinci el traktör, tarım makineleri ve ekipmanları alım-satımı. Telefon ve WhatsApp: ${c.telefonGorunen}. E-posta: ${c.eposta}. Güncel ilanlar: ${c.sahibinden}

## Ürün grupları
${KATEGORILER.map((k) => `- [${k.uzunAd}](${url(katYol(k))}): ${k.kisa}`).join("\n")}

## Rehber
${REHBER.map((r) => `- [${r.h1}](${url(rehberYol(r))}): ${r.kisaCevap.split(/(?<=\.)\s/)[0]}`).join("\n")}

## İletişim
- [Traktör bul / sat](${url("/talep/")})
- [İletişim](${url("/iletisim/")})
`);
writeFileSync(join(OUT, "site.webmanifest"), JSON.stringify({
  name: c.markaUzun, short_name: c.marka, lang: "tr", start_url: "/", display: "standalone",
  background_color: "#0d1310", theme_color: "#0d1310",
  icons: [{ src: "/favicon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
}));
console.log(`${sayfalar.length} sayfa + 404 → ${OUT}/`);
