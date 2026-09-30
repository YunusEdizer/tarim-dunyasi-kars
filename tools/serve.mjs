import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
const KOK = fileURLToPath(new URL("../dist/", import.meta.url));
const T = { ".html":"text/html; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".webp":"image/webp", ".woff2":"font/woff2", ".ico":"image/x-icon", ".json":"application/json", ".xml":"application/xml", ".txt":"text/plain", ".webmanifest":"application/manifest+json" };
createServer(async (req, res) => {
  let p = join(KOK, decodeURIComponent(req.url.split("?")[0]));
  try { if ((await stat(p)).isDirectory()) p = join(p, "index.html"); } catch { if (!extname(p)) p = join(p, "index.html"); }
  try { const b = await readFile(p); res.writeHead(200, { "content-type": T[extname(p)] || "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404, { "content-type": T[".html"] }); res.end(await readFile(join(KOK, "404.html"))); }
}).listen(4177, () => console.log("http://localhost:4177"));
