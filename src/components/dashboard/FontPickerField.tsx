import { useEffect, useMemo, useState } from "react";
import { Check, Search, Type } from "lucide-react";
import {
  DEFAULT_PAGE_FONT_STACK,
  FONT_CATEGORY_LABELS,
  PROFILE_FONTS,
  findFontByStack,
  loadGoogleFont,
  preloadGoogleFonts,
  type FontCategory,
  type ProfileFontOption,
} from "@/lib/profile-fonts";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";

type Props = {
  label: string;
  value: string;
  onChange: (stack: string) => void;
  /** Mostra opção "Herdar da página" */
  allowInherit?: boolean;
};

const ALL_CATEGORIES: (FontCategory | "all")[] = [
  "all",
  "sans",
  "fina",
  "serif",
  "display",
  "gotica",
  "cartoon",
  "halloween",
  "script",
  "mono",
  "retro",
  "sistema",
];

const PREVIEW_SAMPLE = "Aa Bb Cc";

export function FontPickerField({ label, value, onChange, allowInherit = false }: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FontCategory | "all">("all");

  const selected = useMemo(() => {
    if (allowInherit && value === "inherit") return null;
    return findFontByStack(value) ?? PROFILE_FONTS[0];
  }, [value, allowInherit]);

  useEffect(() => {
    const families = PROFILE_FONTS.map((f) => f.googleFamily).filter(Boolean) as string[];
    preloadGoogleFonts(families);
  }, []);

  useEffect(() => {
    if (selected?.googleFamily) loadGoogleFont(selected.googleFamily);
  }, [selected?.googleFamily]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROFILE_FONTS.filter((f) => {
      if (allowInherit && f.id === "system") return false;
      if (category !== "all" && f.category !== category) return false;
      if (!q) return true;
      return (
        f.label.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        FONT_CATEGORY_LABELS[f.category].toLowerCase().includes(q)
      );
    });
  }, [query, category, allowInherit]);

  const isInherit = allowInherit && value === "inherit";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-white/55">{label}</label>
        {(selected || isInherit) && (
          <span className="truncate text-[10px] text-pink-300/80">
            {isInherit ? t("dashboard.colors.fonts.inheritFromPage") : selected?.label}
          </span>
        )}
      </div>

      {allowInherit && (
        <button
          type="button"
          onClick={() => onChange("inherit")}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition",
            isInherit
              ? "border-pink-500/50 bg-pink-500/10 text-white"
              : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-white/15 hover:bg-white/[0.05]",
          )}
        >
          <Type className="h-4 w-4 shrink-0 text-pink-400/80" />
          <span className="font-medium">{t("dashboard.colors.fonts.inheritFromPage")}</span>
          {isInherit && <Check className="ml-auto h-4 w-4 text-pink-400" />}
        </button>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("dashboard.colors.fonts.searchPlaceholder")}
          className="w-full rounded-xl border border-white/[0.08] bg-black/35 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-pink-500/40 focus:bg-black/45"
        />
      </div>

      <div className="biosy-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition",
              category === cat
                ? "border-pink-500/45 bg-pink-500/15 text-pink-200"
                : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.06] hover:text-white/70",
            )}
          >
            {cat === "all" ? t("dashboard.colors.fonts.categoryAll") : FONT_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="biosy-scrollbar max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/25 p-1.5">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-white/40">
            {t("dashboard.colors.fonts.noFontsFound")}
          </p>
        ) : (
          filtered.map((font) => (
            <FontRow
              key={font.id}
              font={font}
              active={!isInherit && (selected?.id === font.id || value === font.stack)}
              onSelect={() => onChange(font.stack)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FontRow({
  font,
  active,
  onSelect,
}: {
  font: ProfileFontOption;
  active: boolean;
  onSelect: () => void;
}) {
  useEffect(() => {
    if (font.googleFamily) loadGoogleFont(font.googleFamily);
  }, [font.googleFamily]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition",
        active
          ? "border-pink-500/50 bg-gradient-to-r from-pink-500/15 to-rose-500/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-transparent bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-white/90">{font.label}</span>
          <span className="shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/40">
            {FONT_CATEGORY_LABELS[font.category]}
          </span>
        </div>
        <p
          className="mt-1 truncate text-lg leading-none text-white/85"
          style={{ fontFamily: font.stack }}
        >
          {PREVIEW_SAMPLE}
        </p>
      </div>
      {active ? (
        <Check className="h-4 w-4 shrink-0 text-pink-400" />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full border border-white/15 group-hover:border-white/25" />
      )}
    </button>
  );
}

export { DEFAULT_PAGE_FONT_STACK };
