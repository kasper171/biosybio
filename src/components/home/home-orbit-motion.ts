/** Suspensão vertical — ritmo próprio, assimétrico */
export const ORBIT_PHONE_FLOAT = {
  y: [0, -6, -9, -3, -7, -4, 0],
  x: [0, 0.8, -0.6, 0.5, -0.4, 0.3, 0],
  transition: {
    duration: 11.5,
    repeat: Infinity,
    ease: [0.42, 0, 0.58, 1] as const,
    times: [0, 0.15, 0.32, 0.48, 0.62, 0.78, 1],
  },
};

/** Giro lateral — nuvem lenta, nunca repete o mesmo ciclo com pitch/roll */
export const ORBIT_PHONE_YAW = {
  rotateY: [0, 5, -3.5, 4.5, -4, 2.5, -1.5, 3, 0],
  transition: {
    duration: 19,
    repeat: Infinity,
    ease: "easeInOut" as const,
    times: [0, 0.11, 0.24, 0.38, 0.52, 0.65, 0.79, 0.91, 1],
  },
};

/** Inclinação topo/base equilibrada — amplitude baixa, pivô no centro-alto */
export const ORBIT_PHONE_PITCH = {
  rotateX: [0, 2.5, -2.8, 1.8, -2, 2.2, -1, 1.4, 0],
  transition: {
    duration: 14,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay: 1.2,
    times: [0, 0.13, 0.27, 0.4, 0.54, 0.67, 0.8, 0.92, 1],
  },
};

/** Roll + profundidade mínima — sem puxar a base */
export const ORBIT_PHONE_ROLL_DEPTH = {
  rotateZ: [0, 0.7, -1, 0.4, -0.5, 0.8, 0],
  z: [0, 5, -3, 4, -2, 3, 0],
  transition: {
    duration: 23,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay: 2.5,
    times: [0, 0.16, 0.3, 0.46, 0.6, 0.82, 1],
  },
};

export const ORBIT_PHONE_SHADOW = {
  scaleX: [0.94, 1.03, 0.93, 1.02, 0.96, 0.99, 0.94],
  scaleY: [0.96, 1.02, 0.95, 1.01, 0.97, 0.98, 0.96],
  opacity: [0.4, 0.5, 0.36, 0.46, 0.38, 0.44, 0.4],
};

export const ORBIT_PHONE_SHADOW_TRANSITION = {
  duration: 23,
  repeat: Infinity,
  ease: "easeInOut" as const,
  times: [0, 0.14, 0.3, 0.47, 0.63, 0.8, 1],
};

export const ORBIT_PHONE_SPECULAR = {
  opacity: [0.5, 0.72, 0.44, 0.65, 0.48, 0.6, 0.5],
  x: ["-1%", "2%", "-1.5%", "1%", "-0.5%", "1.5%", "-1%"],
};

export const ORBIT_PHONE_SPECULAR_TRANSITION = {
  duration: 14,
  repeat: Infinity,
  ease: "easeInOut" as const,
  delay: 0.8,
  times: [0, 0.18, 0.34, 0.5, 0.66, 0.84, 1],
};

type OrbitDrift = {
  x: number[];
  y: number[];
  rotate: number[];
  rotateX?: number[];
  rotateY?: number[];
  z?: number[];
  duration: number;
  delay?: number;
};

type OrbitDepth = {
  scale: number[];
  opacity: number[];
  duration: number;
  delay?: number;
};

export const ORBIT_WIDGET_DRIFT: Record<string, OrbitDrift> = {
  spotify: {
    x: [0, 5, 8, 3, 0],
    y: [0, -9, -14, -5, 0],
    rotate: [0, 0.8, 2, -0.5, 0],
    rotateX: [0, 2.5, -1.5, 1.2, 0],
    rotateY: [0, -3.5, 2.5, -1, 0],
    z: [0, 8, -5, 5, 0],
    duration: 11,
  },
  discord: {
    x: [0, -4, -6, -2, 0],
    y: [0, 6, 10, 4, 0],
    rotate: [0, -0.4, -0.8, 0.5, 0],
    rotateX: [0, -2, 1.8, -0.8, 0],
    rotateY: [0, 2.8, -2.2, 1, 0],
    z: [0, -4, 6, -2, 0],
    duration: 12,
    delay: 2,
  },
  badges: {
    x: [0, -5, -7, 5, 3, 0],
    y: [0, -4, 5, -6, 3, 0],
    rotate: [0, 0.6, -0.5, 0.7, -0.3, 0],
    rotateX: [0, 1.8, -2.2, 1.5, -0.8, 0],
    rotateY: [0, -2.5, 3, -1.5, 1, 0],
    z: [0, 5, -6, 4, -2, 0],
    duration: 13,
    delay: 4,
  },
  social: {
    x: [0, -4, 5, 0],
    y: [0, -5, -8, 0],
    rotate: [0, 0.5, -0.6, 0],
    rotateX: [0, 1.5, -1.2, 0],
    rotateY: [0, 2, -1.8, 0],
    z: [0, 4, -3, 0],
    duration: 10.5,
    delay: 1,
  },
  "badges-gems": {
    x: [0, -6, 4, -3, 0],
    y: [0, -5, 6, 3, 0],
    rotate: [0, 0.7, -0.5, 0.4, 0],
    rotateX: [0, 2.2, -1.8, 1, 0],
    rotateY: [0, -3, 2.5, -1.2, 0],
    z: [0, 6, -5, 3, 0],
    duration: 15,
    delay: 6,
  },
  theme: {
    x: [0, 2, -2, 0],
    y: [0, -4, -6, 0],
    rotate: [-0.5, 0.6, 1, -0.5],
    rotateX: [0, 1.2, -1.8, 0],
    rotateY: [0, -2.5, 2, 0],
    z: [0, 3, -4, 0],
    duration: 14,
    delay: 3,
  },
  layout: {
    x: [0, -3, 4, -2, 0],
    y: [0, 3, -4, -2, 0],
    rotate: [0, -0.8, 0.7, -0.4, 0],
    rotateX: [0, -1.5, 2, -1, 0],
    rotateY: [0, 2.2, -2.5, 1, 0],
    z: [0, -3, 5, -2, 0],
    duration: 12.5,
    delay: 5,
  },
  views: {
    x: [0, 4, 8, -3, 0],
    y: [0, -1, -2, 1, 0],
    rotate: [0, 0.2, 0.35, -0.2, 0],
    duration: 9,
    delay: 2.5,
  },
  effects: {
    x: [0, -5, 4, -3, 0],
    y: [0, 4, -6, -3, 0],
    rotate: [0, -0.4, 0.5, -0.3, 0],
    rotateX: [0, -2.5, 2, -1.2, 0],
    rotateY: [0, 2, -2.8, 1.2, 0],
    z: [0, -6, 5, -3, 0],
    duration: 18,
    delay: 7,
  },
  premium: {
    x: [0, 6, 9, 0],
    y: [0, -5, -9, 0],
    rotate: [0, 0.5, 0.9, 0],
    rotateX: [0, 2.8, -1.5, 0],
    rotateY: [0, -4, 3.2, 0],
    z: [0, 10, -4, 0],
    duration: 10,
    delay: 1.5,
  },
};

export const ORBIT_WIDGET_DEPTH: Record<string, OrbitDepth> = {
  spotify: { scale: [0.99, 1.03, 0.99], opacity: [0.94, 1, 0.94], duration: 13 },
  discord: { scale: [0.98, 1.02, 0.98], opacity: [0.92, 0.99, 0.92], duration: 14, delay: 2 },
  badges: { scale: [1, 0.98, 1.02, 1], opacity: [0.96, 0.9, 1, 0.96], duration: 15, delay: 1 },
  social: { scale: [0.99, 1.025, 0.99], opacity: [0.93, 1, 0.93], duration: 12, delay: 3 },
  "badges-gems": { scale: [0.97, 1.02, 0.97], opacity: [0.9, 0.98, 0.9], duration: 16, delay: 4 },
  theme: { scale: [1, 1.03, 1], opacity: [0.93, 1, 0.93], duration: 14, delay: 2 },
  layout: { scale: [0.985, 1.015, 0.985], opacity: [0.94, 1, 0.94], duration: 13, delay: 5 },
  views: { scale: [0.97, 1.01, 0.97], opacity: [0.9, 0.97, 0.9], duration: 11, delay: 1 },
  effects: { scale: [0.97, 1, 0.97], opacity: [0.88, 0.94, 0.88], duration: 17, delay: 6 },
  premium: { scale: [1.01, 1.03, 1.01], opacity: [0.96, 1, 0.96], duration: 12, delay: 2 },
};

export const ORBIT_AMBIENT_GLOW = {
  opacity: [0.55, 0.82, 0.55],
};

export const ORBIT_AMBIENT_GLOW_TRANSITION = {
  duration: 16,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

export const ORBIT_CLOUD_CORE = {
  opacity: [0.35, 0.55, 0.35],
};

export const ORBIT_CLOUD_CORE_TRANSITION = {
  duration: 9,
  repeat: Infinity,
  ease: "easeInOut" as const,
};
