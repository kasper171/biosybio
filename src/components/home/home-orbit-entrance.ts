/** Cards orbitais “explodem” do centro do celular após este delay (ms). */
export const ORBIT_WIDGET_EXPLODE_DELAY_MS = 1200;

export const ORBIT_WIDGET_EXPLODE_DURATION_S = 0.88;

export const ORBIT_PHONE_ENTRANCE_DURATION_S = 1.05;

/** Atraso escalonado por card na explosão (ms). */
export const ORBIT_EXPLODE_STAGGER_MS: Record<string, number> = {
  spotify: 0,
  discord: 45,
  badges: 70,
  social: 55,
  "badges-gems": 90,
  theme: 110,
  layout: 130,
  views: 40,
  effects: 25,
  premium: 150,
};

export const ORBIT_EXPLODE_ORIGIN = { left: "50%", top: "46%" };
