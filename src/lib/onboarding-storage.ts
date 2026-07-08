const ONBOARDING_VERSION = 1;
const PENDING_KEY = "byosy-onboarding-pending";

function onboardingKey(userId: string): string {
  return `byosy-onboarding-v${ONBOARDING_VERSION}-${userId}`;
}

/** Marca que o usuário acabou de criar conta e deve ver o onboarding. */
export function markOnboardingPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_KEY, "1");
}

export function isOnboardingPending(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PENDING_KEY) === "1";
}

export function clearOnboardingPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
}

export function isOnboardingComplete(userId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(onboardingKey(userId)) === "1";
}

export function markOnboardingComplete(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(onboardingKey(userId), "1");
  clearOnboardingPending();
}
