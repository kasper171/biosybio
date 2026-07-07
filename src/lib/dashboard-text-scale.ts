export type DashboardTextScale = "sm" | "md" | "lg";

export const DASHBOARD_TEXT_SCALE_DEFAULT: DashboardTextScale = "lg";

const STORAGE_KEY = "biosy-dash-text-scale";

export function getDashboardTextScale(): DashboardTextScale {
  if (typeof window === "undefined") return DASHBOARD_TEXT_SCALE_DEFAULT;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "sm" || stored === "md" || stored === "lg") return stored;
  return DASHBOARD_TEXT_SCALE_DEFAULT;
}

export function setDashboardTextScale(scale: DashboardTextScale) {
  localStorage.setItem(STORAGE_KEY, scale);
}

export const DASHBOARD_TEXT_SCALE_LABELS: Record<DashboardTextScale, string> = {
  sm: "Pequeno",
  md: "Normal",
  lg: "Grande",
};
