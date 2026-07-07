import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "src", "assets", "badges");
const publicDir = path.join(root, "public", "badges");
const manifestFile = path.join(root, "src", "generated", "badges.manifest.json");

const BADGE_BASES = ["staffdev", "staff", "premium", "donator", "gifter"];
const EXT_ORDER = [".png", ".webp", ".svg"];

function findInDir(dir, base) {
  for (const ext of EXT_ORDER) {
    const full = path.join(dir, `${base}${ext}`);
    if (fs.existsSync(full)) return { path: full, ext };
  }
  return null;
}

function main() {
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });

  const manifest = {};
  let resolved = 0;

  for (const base of BADGE_BASES) {
    // Prioridade: public/badges (onde o usuário coloca) → src/assets/badges
    const inPublic = findInDir(publicDir, base);
    const inAssets = findInDir(sourceDir, base);
    const hit = inPublic ?? inAssets;

    if (!hit) {
      console.warn(`[badges] Falta ${base}.png em public/badges ou src/assets/badges`);
      continue;
    }

    const fileName = `${base}${hit.ext}`;
    const dest = path.join(publicDir, fileName);

    // Se veio de assets, copia para public; se já está em public, mantém
    if (!inPublic || hit.path !== dest) {
      fs.copyFileSync(hit.path, dest);
      console.log(`[badges] ${fileName} → public/badges/${fileName}`);
    } else {
      console.log(`[badges] ${fileName} já em public/badges/`);
    }

    // Remove SVG/WEBP antigo se existir PNG
    if (hit.ext === ".png") {
      for (const oldExt of [".svg", ".webp"]) {
        const orphan = path.join(publicDir, `${base}${oldExt}`);
        if (fs.existsSync(orphan)) {
          fs.unlinkSync(orphan);
          console.log(`[badges] removido placeholder ${base}${oldExt}`);
        }
      }
    }

    const stat = fs.statSync(dest);
    manifest[base] = {
      file: fileName,
      v: Math.floor(stat.mtimeMs).toString(36),
    };
    resolved++;
  }

  fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

  if (resolved === 0) {
    console.error("[badges] Nenhum badge encontrado.");
    process.exit(1);
  }

  console.log(`[badges] ${resolved}/${BADGE_BASES.length} badges → manifest atualizado (PNG priorizado)`);
}

main();
