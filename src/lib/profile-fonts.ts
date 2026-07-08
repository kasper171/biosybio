export type FontCategory =
  | "sistema"
  | "sans"
  | "fina"
  | "serif"
  | "display"
  | "gotica"
  | "cartoon"
  | "halloween"
  | "script"
  | "mono"
  | "retro";

export type ProfileFontOption = {
  id: string;
  label: string;
  category: FontCategory;
  googleFamily: string | null;
  stack: string;
};

export const DEFAULT_PAGE_FONT_STACK =
  "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif";

export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  sistema: "System",
  sans: "Sans",
  fina: "Thin",
  serif: "Serif",
  display: "Display",
  gotica: "Gothic",
  cartoon: "Cartoon",
  halloween: "Halloween",
  script: "Script",
  mono: "Mono",
  retro: "Retro",
};

const FALLBACK = "ui-sans-serif, system-ui, sans-serif";

function font(
  id: string,
  label: string,
  category: FontCategory,
  googleFamily: string | null,
  primary: string,
): ProfileFontOption {
  return {
    id,
    label,
    category,
    googleFamily,
    stack: googleFamily ? `${primary}, ${FALLBACK}` : DEFAULT_PAGE_FONT_STACK,
  };
}

export const PROFILE_FONTS: ProfileFontOption[] = [
  font("system", "System (default)", "sistema", null, ""),

  font("inter", "Inter", "sans", "Inter", "Inter"),
  font("poppins", "Poppins", "sans", "Poppins", "Poppins"),
  font("montserrat", "Montserrat", "sans", "Montserrat", "Montserrat"),
  font("roboto", "Roboto", "sans", "Roboto", "Roboto"),
  font("open-sans", "Open Sans", "sans", "Open Sans", "Open Sans"),
  font("nunito", "Nunito", "sans", "Nunito", "Nunito"),
  font("rubik", "Rubik", "sans", "Rubik", "Rubik"),
  font("dm-sans", "DM Sans", "sans", "DM Sans", "DM Sans"),
  font("outfit", "Outfit", "sans", "Outfit", "Outfit"),
  font("manrope", "Manrope", "sans", "Manrope", "Manrope"),
  font("plus-jakarta", "Plus Jakarta Sans", "sans", "Plus Jakarta Sans", "Plus Jakarta Sans"),
  font("sora", "Sora", "sans", "Sora", "Sora"),

  font("raleway", "Raleway", "fina", "Raleway", "Raleway"),
  font("josefin", "Josefin Sans", "fina", "Josefin Sans", "Josefin Sans"),
  font("quicksand", "Quicksand", "fina", "Quicksand", "Quicksand"),
  font("comfortaa", "Comfortaa", "fina", "Comfortaa", "Comfortaa"),
  font("jost", "Jost", "fina", "Jost", "Jost"),
  font("exo2", "Exo 2", "fina", "Exo 2", "Exo 2"),
  font("tenor", "Tenor Sans", "fina", "Tenor Sans", "Tenor Sans"),

  font("playfair", "Playfair Display", "serif", "Playfair Display", "Playfair Display"),
  font("merriweather", "Merriweather", "serif", "Merriweather", "Merriweather"),
  font("lora", "Lora", "serif", "Lora", "Lora"),
  font("crimson", "Crimson Pro", "serif", "Crimson Pro", "Crimson Pro"),
  font("libre-baskerville", "Libre Baskerville", "serif", "Libre Baskerville", "Libre Baskerville"),
  font("cormorant", "Cormorant Garamond", "serif", "Cormorant Garamond", "Cormorant Garamond"),

  font("bebas", "Bebas Neue", "display", "Bebas Neue", "Bebas Neue"),
  font("oswald", "Oswald", "display", "Oswald", "Oswald"),
  font("anton", "Anton", "display", "Anton", "Anton"),
  font("archivo-black", "Archivo Black", "display", "Archivo Black", "Archivo Black"),
  font("black-ops", "Black Ops One", "display", "Black Ops One", "Black Ops One"),

  font("unifraktur", "UnifrakturMaguntia", "gotica", "UnifrakturMaguntia", "UnifrakturMaguntia"),
  font("pirata", "Pirata One", "gotica", "Pirata One", "Pirata One"),
  font("medieval", "MedievalSharp", "gotica", "MedievalSharp", "MedievalSharp"),
  font("cinzel-deco", "Cinzel Decorative", "gotica", "Cinzel Decorative", "Cinzel Decorative"),
  font("new-rocker", "New Rocker", "gotica", "New Rocker", "New Rocker"),

  font("bangers", "Bangers", "cartoon", "Bangers", "Bangers"),
  font("fredoka", "Fredoka", "cartoon", "Fredoka", "Fredoka"),
  font("comic-neue", "Comic Neue", "cartoon", "Comic Neue", "Comic Neue"),
  font("bubblegum", "Bubblegum Sans", "cartoon", "Bubblegum Sans", "Bubblegum Sans"),
  font("chewy", "Chewy", "cartoon", "Chewy", "Chewy"),
  font("luckiest", "Luckiest Guy", "cartoon", "Luckiest Guy", "Luckiest Guy"),

  font("creepster", "Creepster", "halloween", "Creepster", "Creepster"),
  font("nosifer", "Nosifer", "halloween", "Nosifer", "Nosifer"),
  font("eater", "Eater", "halloween", "Eater", "Eater"),
  font("butcherman", "Butcherman", "halloween", "Butcherman", "Butcherman"),
  font("metal-mania", "Metal Mania", "halloween", "Metal Mania", "Metal Mania"),

  font("pacifico", "Pacifico", "script", "Pacifico", "Pacifico"),
  font("dancing", "Dancing Script", "script", "Dancing Script", "Dancing Script"),
  font("great-vibes", "Great Vibes", "script", "Great Vibes", "Great Vibes"),
  font("sacramento", "Sacramento", "script", "Sacramento", "Sacramento"),
  font("caveat", "Caveat", "script", "Caveat", "Caveat"),
  font("satisfy", "Satisfy", "script", "Satisfy", "Satisfy"),

  font("jetbrains", "JetBrains Mono", "mono", "JetBrains Mono", "JetBrains Mono"),
  font("fira-code", "Fira Code", "mono", "Fira Code", "Fira Code"),
  font("space-mono", "Space Mono", "mono", "Space Mono", "Space Mono"),

  font("press-start", "Press Start 2P", "retro", "Press Start 2P", "Press Start 2P"),
  font("orbitron", "Orbitron", "retro", "Orbitron", "Orbitron"),
  font("audiowide", "Audiowide", "retro", "Audiowide", "Audiowide"),
  font("vt323", "VT323", "retro", "VT323", "VT323"),
];

export function findFontByStack(stack: string | undefined | null): ProfileFontOption | undefined {
  if (!stack || stack === "inherit") return undefined;
  const normalized = stack.trim().toLowerCase();
  const exact = PROFILE_FONTS.find((f) => f.stack.toLowerCase() === normalized);
  if (exact) return exact;
  const primary = normalized.split(",")[0]!.replace(/['"]/g, "").trim();
  return PROFILE_FONTS.find((f) => f.stack.split(",")[0]!.replace(/['"]/g, "").trim().toLowerCase() === primary);
}

const loadedFamilies = new Set<string>();
const loadedBatches = new Set<string>();

export function loadGoogleFont(family: string | null | undefined) {
  if (!family || typeof document === "undefined") return;
  if (loadedFamilies.has(family)) return;
  loadedFamilies.add(family);

  const id = `biosy-gfont-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.crossOrigin = "anonymous";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}&display=swap`;
  document.head.appendChild(link);
}

export function preloadGoogleFonts(families: string[]) {
  if (typeof document === "undefined") return;
  const unique = [...new Set(families.filter(Boolean))];
  const chunkSize = 10;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const batchKey = chunk.slice().sort().join("|");
    if (loadedBatches.has(batchKey)) continue;
    loadedBatches.add(batchKey);
    chunk.forEach((f) => loadedFamilies.add(f));

    const id = `biosy-gfont-batch-${i}`;
    if (document.getElementById(id)) continue;

    const query = chunk.map((f) => `family=${f.replace(/ /g, "+")}`).join("&");
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
    document.head.appendChild(link);
  }
}

export function ensureProfileFontsLoaded(pageStack: string, nameStack: string) {
  const pageFont = findFontByStack(pageStack);
  const nameFont = nameStack === "inherit" ? null : findFontByStack(nameStack);
  loadGoogleFont(pageFont?.googleFamily ?? null);
  if (nameFont?.googleFamily && nameFont.googleFamily !== pageFont?.googleFamily) {
    loadGoogleFont(nameFont.googleFamily);
  }
}
