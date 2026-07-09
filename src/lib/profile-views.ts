const VISITOR_ID_KEY = "biosy_visitor_id";
const VIEW_FLAG_PREFIX = "biosy_view_";

let ephemeralVisitorId: string | null = null;

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function createVisitorId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "00000000-0000-4000-8000-000000000000".replace(/0/g, () =>
    Math.floor(Math.random() * 16).toString(16),
  );
}

/** ID persistente do visitante (equivalente a cookie de visitante). */
export function getOrCreateVisitorId(): string {
  if (!canUseStorage()) {
    if (!ephemeralVisitorId) ephemeralVisitorId = createVisitorId();
    return ephemeralVisitorId;
  }
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = createVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

/** Já contou visualização deste perfil neste navegador? */
export function hasCountedProfileView(profileId: string): boolean {
  if (!canUseStorage()) return false;
  return localStorage.getItem(`${VIEW_FLAG_PREFIX}${profileId}`) === "1";
}

/** Marca que este visitante já viu o perfil (F5 não conta de novo). */
export function markProfileViewCounted(profileId: string): void {
  if (!canUseStorage()) return;
  localStorage.setItem(`${VIEW_FLAG_PREFIX}${profileId}`, "1");
}
