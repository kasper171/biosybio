const VISITOR_ID_KEY = "biosy_visitor_id";
const VIEW_FLAG_PREFIX = "biosy_view_";

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

/** ID persistente do visitante (equivalente a cookie de visitante). */
export function getOrCreateVisitorId(): string {
  if (!canUseStorage()) return "anonymous";
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
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
