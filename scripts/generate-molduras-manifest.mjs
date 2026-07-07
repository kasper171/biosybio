import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "src", "assets", "molduras");
const publicDir = path.join(root, "public", "molduras");
const outFile = path.join(root, "src", "generated", "avatar-frames.catalog.json");

const EXT = /\.(apng|png|webp)$/i;

function walk(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      entries.push(...walk(full, base));
    } else if (EXT.test(name.name)) {
      const rel = path.relative(base, full).replace(/\\/g, "/");
      entries.push(rel);
    }
  }
  return entries;
}

function fileNameWithoutExt(relPath) {
  const file = relPath.split("/").pop() ?? relPath;
  return file.replace(/\.(apng|png|webp)$/i, "");
}

function safeAssetName(index, relPath) {
  const ext = path.extname(relPath).toLowerCase() || ".png";
  return `${String(index).padStart(4, "0")}${ext}`;
}

function copyFileSafe(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    fs.copyFileSync(src, dest);
  } catch (err) {
    if (err.code !== "EPERM" && err.code !== "EBUSY") throw err;
    // Fallback no Windows quando copyFileSync falha (dev server / antivírus)
    fs.writeFileSync(dest, fs.readFileSync(src));
  }
}

function listPublicAssets() {
  if (!fs.existsSync(publicDir)) return [];
  return fs
    .readdirSync(publicDir)
    .filter((name) => EXT.test(name))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" }));
}

function readCatalogFile() {
  if (!fs.existsSync(outFile)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(outFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Deploy (Vercel): public/ + catalog já versionados, sem src/assets/molduras no clone */
function useVersionedMolduras() {
  const assets = listPublicAssets();
  const catalog = readCatalogFile();
  if (assets.length === 0 || catalog.length === 0) return false;

  const missing = catalog.filter((entry) => !fs.existsSync(path.join(publicDir, entry.asset)));
  if (missing.length > 0) {
    console.warn(
      `[molduras] Fonte ausente e ${missing.length} PNG(s) faltando em public/molduras — rode molduras:sync localmente`,
    );
    process.exitCode = 1;
  }

  console.log(
    `[molduras] Fonte ausente — mantendo ${catalog.length} entradas (public/molduras já versionado)`,
  );
  return true;
}

function rebuildCatalogFromPublic() {
  const assets = listPublicAssets();
  if (assets.length === 0) return false;

  const existingByAsset = new Map(readCatalogFile().map((entry) => [entry.asset, entry]));
  const catalog = assets.map((asset, index) => {
    const kept = existingByAsset.get(asset);
    if (kept) return { ...kept, index };
    const id = fileNameWithoutExt(asset);
    return {
      id,
      name: id,
      file: asset,
      asset,
      url: `/molduras/${asset}`,
      index,
    };
  });

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`[molduras] Catálogo reconstruído a partir de public/molduras (${catalog.length})`);
  return true;
}

function main() {
  if (!fs.existsSync(sourceDir)) {
    if (useVersionedMolduras()) return;
    if (rebuildCatalogFromPublic()) return;

    console.warn("[molduras] Pasta não encontrada:", sourceDir);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, "[]\n");
    return;
  }

  fs.mkdirSync(publicDir, { recursive: true });

  const files = walk(sourceDir).sort((a, b) =>
    fileNameWithoutExt(a).localeCompare(fileNameWithoutExt(b), "pt-BR", { sensitivity: "base" }),
  );

  const catalog = [];
  const validAssets = new Set();

  for (let index = 0; index < files.length; index++) {
    const rel = files[index];
    const id = fileNameWithoutExt(rel);
    const asset = safeAssetName(index, rel);
    const srcPath = path.join(sourceDir, rel);
    const destPath = path.join(publicDir, asset);

    try {
      copyFileSafe(srcPath, destPath);
    } catch (err) {
      console.error(`[molduras] Falha ao copiar ${rel}:`, err.message);
      continue;
    }

    validAssets.add(asset);
    catalog.push({
      id,
      name: id,
      file: rel,
      asset,
      url: `/molduras/${asset}`,
      index: catalog.length,
    });
  }

  // Remove arquivos órfãos (não apaga a pasta inteira — seguro com dev server no Windows)
  if (fs.existsSync(publicDir)) {
    for (const name of fs.readdirSync(publicDir)) {
      if (validAssets.has(name)) continue;
      const orphan = path.join(publicDir, name);
      try {
        if (fs.statSync(orphan).isFile()) fs.unlinkSync(orphan);
      } catch {
        /* arquivo em uso — ignorar */
      }
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(catalog, null, 2)}\n`);

  const missing = catalog.filter((entry) => !fs.existsSync(path.join(publicDir, entry.asset)));
  if (missing.length > 0) {
    console.warn(`[molduras] ${missing.length} arquivos ausentes em public/molduras após sync`);
    process.exitCode = 1;
  }

  console.log(`[molduras] ${catalog.length} molduras → public/molduras + catalog`);
}

main();
