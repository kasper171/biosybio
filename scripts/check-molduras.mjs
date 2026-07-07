/**
 * Verifica molduras com problemas (arquivo ausente, PNG inválido, URL 404).
 *
 * Uso:
 *   npm run molduras:check          — só arquivos locais
 *   npm run molduras:check -- --http — testa URLs no dev server (localhost:8080)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "src/generated/avatar-frames.catalog.json");
const sourceDir = path.join(root, "src/assets/molduras");
const publicDir = path.join(root, "public/molduras");
const reportPath = path.join(root, "src/generated/avatar-frames.issues.json");

const withHttp = process.argv.includes("--http");
const baseUrl = process.env.MOLDURAS_CHECK_URL ?? "http://localhost:8080";

if (!fs.existsSync(catalogPath)) {
  console.error("Catálogo não encontrado. Rode: npm run molduras:sync");
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const issues = [];

function exists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function validatePng(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 33) return "truncated";
  if (buf.readUInt32BE(0) !== 0x89504e47) return "not_png";
  const ihdrType = buf.toString("ascii", 12, 16);
  if (ihdrType !== "IHDR") return "no_ihdr";
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (w === 0 || h === 0) return "zero_dimensions";
  return null;
}

for (const f of catalog) {
  const src = path.join(sourceDir, f.file);
  const pub = path.join(publicDir, f.asset ?? path.basename(f.url));

  if (!exists(src)) {
    issues.push({ id: f.id, name: f.name, reason: "missing_in_assets", file: f.file });
    continue;
  }
  if (!exists(pub)) {
    issues.push({ id: f.id, name: f.name, reason: "missing_in_public", asset: f.asset, url: f.url });
    continue;
  }

  const pngErr = validatePng(pub);
  if (pngErr) {
    issues.push({ id: f.id, name: f.name, reason: pngErr, asset: f.asset });
  }
}

if (withHttp) {
  console.log(`Testando ${catalog.length} URLs em ${baseUrl}...`);
  for (const f of catalog) {
    try {
      const res = await fetch(`${baseUrl}${f.url}`, { method: "HEAD" });
      if (!res.ok) {
        issues.push({
          id: f.id,
          name: f.name,
          reason: "http_error",
          status: res.status,
          url: f.url,
          file: f.file,
        });
      }
    } catch (e) {
      issues.push({
        id: f.id,
        name: f.name,
        reason: "http_fetch_failed",
        url: f.url,
        error: String(e),
      });
    }
  }
}

const unique = new Map();
for (const i of issues) unique.set(`${i.id}:${i.reason}`, i);
const list = [...unique.values()];

fs.writeFileSync(
  reportPath,
  JSON.stringify({ checkedAt: new Date().toISOString(), total: catalog.length, issues: list }, null, 2),
);

console.log(`Total no catálogo: ${catalog.length}`);
console.log(`Problemas encontrados: ${list.length}`);

if (list.length) {
  console.log("\nMolduras com problema:\n");
  for (const i of list) {
    console.log(`  • ${i.name}`);
    console.log(`    Motivo: ${i.reason}${i.status ? ` (HTTP ${i.status})` : ""}`);
    if (i.file) console.log(`    Arquivo: ${i.file}`);
    if (i.url) console.log(`    URL: ${i.url}`);
    console.log("");
  }
  console.log(`Relatório completo: ${reportPath}`);
  process.exit(1);
}

console.log("Todas as molduras OK.");
if (withHttp) console.log("URLs HTTP acessíveis.");
