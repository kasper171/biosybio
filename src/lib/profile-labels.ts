import { hexToRgba } from "@/lib/profile-colors";

export type ProfileLabelId =
  | "gamer"
  | "developer"
  | "cybersecurity"
  | "fofo"
  | "estressado"
  | "artist"
  | "musician"
  | "streamer"
  | "student"
  | "entrepreneur"
  | "fitness"
  | "photographer"
  | "writer"
  | "designer"
  | "foodie"
  | "traveler"
  | "night_owl"
  | "coffee"
  | "anime"
  | "movies"
  | "sports"
  | "tech"
  | "creative"
  | "chill"
  | "introvert"
  | "extrovert"
  | "pet_lover"
  | "plants"
  | "crypto"
  | "vtuber"
  | "cosplayer"
  | "reader";

export type ProfileLabelDef = {
  id: ProfileLabelId;
  emoji: string;
  defaultColor: string;
};

export type ProfileLabelsState = {
  enabled: ProfileLabelId[];
  colors: Partial<Record<ProfileLabelId, string>>;
  show_emoji: boolean;
};

export const EMPTY_PROFILE_LABELS: ProfileLabelsState = {
  enabled: [],
  colors: {},
  show_emoji: true,
};

export const PROFILE_LABEL_CATALOG: ProfileLabelDef[] = [
  { id: "gamer", emoji: "🎮", defaultColor: "#a855f7" },
  { id: "developer", emoji: "💻", defaultColor: "#3b82f6" },
  { id: "cybersecurity", emoji: "🛡️", defaultColor: "#22c55e" },
  { id: "fofo", emoji: "🐱", defaultColor: "#ec4899" },
  { id: "estressado", emoji: "😤", defaultColor: "#ef4444" },
  { id: "artist", emoji: "🎨", defaultColor: "#f97316" },
  { id: "musician", emoji: "🎵", defaultColor: "#8b5cf6" },
  { id: "streamer", emoji: "📺", defaultColor: "#9146ff" },
  { id: "student", emoji: "📚", defaultColor: "#06b6d4" },
  { id: "entrepreneur", emoji: "💼", defaultColor: "#eab308" },
  { id: "fitness", emoji: "💪", defaultColor: "#10b981" },
  { id: "photographer", emoji: "📷", defaultColor: "#64748b" },
  { id: "writer", emoji: "✍️", defaultColor: "#78716c" },
  { id: "designer", emoji: "✨", defaultColor: "#d946ef" },
  { id: "foodie", emoji: "🍕", defaultColor: "#f59e0b" },
  { id: "traveler", emoji: "✈️", defaultColor: "#0ea5e9" },
  { id: "night_owl", emoji: "🦉", defaultColor: "#6366f1" },
  { id: "coffee", emoji: "☕", defaultColor: "#92400e" },
  { id: "anime", emoji: "🎌", defaultColor: "#f43f5e" },
  { id: "movies", emoji: "🎬", defaultColor: "#dc2626" },
  { id: "sports", emoji: "⚽", defaultColor: "#16a34a" },
  { id: "tech", emoji: "⚡", defaultColor: "#2563eb" },
  { id: "creative", emoji: "🌈", defaultColor: "#e11d48" },
  { id: "chill", emoji: "😎", defaultColor: "#14b8a6" },
  { id: "introvert", emoji: "🌙", defaultColor: "#4f46e5" },
  { id: "extrovert", emoji: "☀️", defaultColor: "#ca8a04" },
  { id: "pet_lover", emoji: "🐾", defaultColor: "#db2777" },
  { id: "plants", emoji: "🌿", defaultColor: "#059669" },
  { id: "crypto", emoji: "₿", defaultColor: "#fbbf24" },
  { id: "vtuber", emoji: "🎭", defaultColor: "#06b6d4" },
  { id: "cosplayer", emoji: "👗", defaultColor: "#c026d3" },
  { id: "reader", emoji: "📖", defaultColor: "#6366f1" },
];

const LABEL_MAP = new Map(PROFILE_LABEL_CATALOG.map((l) => [l.id, l]));
const VALID_IDS = new Set(PROFILE_LABEL_CATALOG.map((l) => l.id));

export function getProfileLabelDef(id: string): ProfileLabelDef | undefined {
  return LABEL_MAP.get(id as ProfileLabelId);
}

export function normalizeProfileLabels(raw: unknown): ProfileLabelsState {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PROFILE_LABELS };
  const obj = raw as Partial<ProfileLabelsState>;
  const enabled = Array.isArray(obj.enabled)
    ? obj.enabled.filter((id): id is ProfileLabelId => VALID_IDS.has(id as ProfileLabelId))
    : [];
  const colors: Partial<Record<ProfileLabelId, string>> = {};
  if (obj.colors && typeof obj.colors === "object") {
    for (const [key, value] of Object.entries(obj.colors)) {
      if (VALID_IDS.has(key) && typeof value === "string" && value.trim()) {
        colors[key as ProfileLabelId] = value.trim();
      }
    }
  }
  return {
    enabled,
    colors,
    show_emoji: obj.show_emoji !== false,
  };
}

export function getProfileLabelColor(id: ProfileLabelId, state: ProfileLabelsState): string {
  return state.colors[id]?.trim() || getProfileLabelDef(id)?.defaultColor || "#ffffff";
}

export function getEnabledProfileLabels(state: ProfileLabelsState): ProfileLabelDef[] {
  return state.enabled
    .map((id) => getProfileLabelDef(id))
    .filter((def): def is ProfileLabelDef => Boolean(def));
}

export function profileLabelChipStyle(color: string, selected = false) {
  return {
    borderColor: hexToRgba(color, selected ? 0.95 : 0.65),
    color,
    backgroundColor: hexToRgba(color, selected ? 0.22 : 0.12),
    boxShadow: selected
      ? `0 0 14px ${hexToRgba(color, 0.55)}, 0 0 4px ${hexToRgba(color, 0.35)}`
      : `0 0 8px ${hexToRgba(color, 0.28)}`,
  } as const;
}
