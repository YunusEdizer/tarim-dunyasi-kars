// Derleme sonrası SEO kontrolü: node tools/kontrol.mjs
// Başlık ≤60, açıklama ≤160, tek h1, geçerli JSON-LD, tekrar eden başlık/açıklama, kırık iç bağlantı.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const KOK = "dist";
const dosyalar = [];
(function gez(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) gez(p);
    else if (f.endsWith(".html")) dosyalar.push(p);
  }
})(KOK);

const coz = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const basliklar = {}, aciklamalar = {}, linkler = new Set();
let sorun = 0;

for (const p of dosyalar.sort()) {
  const h = readFileSync(p, "utf8");
  const ad = "/" + relative(KOK, p).split(sep).join("/").replace(/index\.html$/, "");
  const t = coz(h.match(/<title>([^<]*)/)[1]);
  const d = coz(h.match(/name="description" content="([^"]*)/)[1]);
  let tipler = "GEÇERSİZ";
  try { tipler = JSON.parse(h.match(/application\/ld\+json">(.*?)<\/script>/s)[1])["@graph"].map((x) => [].concat(x["@type"]).join("+")).join(", "); } catch {}
  const tl = [...t].length, dl = [...d].length, h1 = (h.match(/<h1/g) || []).length;
  const hatali = tl > 60 || dl > 160 || h1 !== 1 || tipler === "GEÇERSİZ";
  if (hatali) sorun++;
  if (hatali || process.argv.includes("-v")) console.log(`${hatali ? "✗" : "✓"} ${ad.padEnd(48)} T${tl} D${dl} h1=${h1}  ${tipler}`);
  (basliklar[t] ??= []).push(ad);
  (aciklamalar[d] ??= []).push(ad);
  for (const m of h.matchAll(/href="(\/[^"#?]*)"/g)) linkler.add(m[1]);
}
for (const [k, v] of Object.entries(basliklar)) if (v.length > 1) { console.log("✗ tekrar başlık:", k, v); sorun++; }
for (const [, v] of Object.entries(aciklamalar)) if (v.length > 1) { console.log("✗ tekrar açıklama:", v); sorun++; }
for (const l of linkler) {
  const dosya = l === "/" ? join(KOK, "index.html") : existsSync(KOK + l) && statSync(KOK + l).isFile() ? KOK + l : join(KOK, l, "index.html");
  if (!existsSync(dosya)) { console.log("✗ kırık bağlantı:", l); sorun++; }
}
const sm = (readFileSync(join(KOK, "sitemap.xml"), "utf8").match(/<loc>/g) || []).length;
console.log(`${dosyalar.length} sayfa · ${linkler.size} iç bağlantı · site haritasında ${sm} adres · sorun: ${sorun}`);
process.exit(sorun ? 1 : 0);
