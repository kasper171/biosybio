import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion, MotionConfig } from "motion/react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site";
import profilePreview from "@/assets/home-profile-preview-orbit-byosy.png";
import {
  ORBIT_EXPLODE_ORIGIN,
  ORBIT_EXPLODE_STAGGER_MS,
  ORBIT_PHONE_ENTRANCE_DURATION_S,
  ORBIT_WIDGET_EXPLODE_DELAY_MS,
  ORBIT_WIDGET_EXPLODE_DURATION_S,
} from "@/components/home/home-orbit-entrance";
import {
  ORBIT_PHONE_FLOAT,
  ORBIT_PHONE_PITCH,
  ORBIT_PHONE_ROLL_DEPTH,
  ORBIT_PHONE_YAW,
  ORBIT_WIDGET_DRIFT,
} from "@/components/home/home-orbit-motion";
import {
  OrbitBadgesGemsWidget,
  OrbitBadgesWidget,
  OrbitDiscordWidget,
  OrbitEffectsWidget,
  OrbitLayoutWidget,
  OrbitMusicWidget,
  OrbitPremiumWidget,
  OrbitSocialWidget,
  OrbitThemeWidget,
  OrbitViewsWidget,
} from "@/components/home/HomeHeroOrbitWidgets";

type OrbitTier = "mobile" | "tablet" | "desktop";

type OrbitSlot = {
  id: string;
  tier: OrbitTier;
  x: number;
  y: number;
  z: number;
  zDepth: number;
  tiltX: number;
  tiltY: number;
  rotate?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
  parallax: number;
  behindPhone?: boolean;
  content: ReactNode;
};

/** Intensidade do parallax por card (0–1) — perfil usa 1.0 (~8px) */
const PHONE_PARALLAX = 1;
const PARALLAX_PX = 8;

const BACK_SLOT_IDS = new Set(["effects"]);
const ABOVE_PHONE_SLOT_IDS = new Set(["views"]);

const ORBIT_SLOTS: OrbitSlot[] = [
  {
    id: "spotify",
    tier: "mobile",
    x: 6,
    y: 42,
    z: 28,
    zDepth: 48,
    tiltX: 8,
    tiltY: -14,
    rotate: -2,
    parallax: 0.58,
    content: <OrbitMusicWidget />,
  },
  {
    id: "discord",
    tier: "mobile",
    x: 4,
    y: 72,
    z: 26,
    zDepth: 36,
    tiltX: 10,
    tiltY: -10,
    rotate: 1,
    parallax: 0.48,
    content: <OrbitDiscordWidget />,
  },
  {
    id: "badges",
    tier: "mobile",
    x: 14,
    y: 10,
    z: 24,
    zDepth: 32,
    tiltX: -6,
    tiltY: 12,
    rotate: -3,
    parallax: 0.44,
    content: <OrbitBadgesWidget />,
  },
  {
    id: "social",
    tier: "mobile",
    x: 18,
    y: 84,
    z: 22,
    zDepth: 28,
    tiltX: 12,
    tiltY: -8,
    parallax: 0.36,
    content: <OrbitSocialWidget />,
  },
  {
    id: "badges-gems",
    tier: "tablet",
    x: 88,
    y: 8,
    z: 20,
    zDepth: 24,
    tiltX: -8,
    tiltY: -16,
    rotate: 4,
    opacity: 0.92,
    parallax: 0.42,
    content: <OrbitBadgesGemsWidget />,
  },
  {
    id: "theme",
    tier: "tablet",
    x: 92,
    y: 38,
    z: 18,
    zDepth: 20,
    tiltX: -10,
    tiltY: -18,
    rotate: 2,
    parallax: 0.5,
    content: <OrbitThemeWidget />,
  },
  {
    id: "layout",
    tier: "tablet",
    x: 84,
    y: 78,
    z: 16,
    zDepth: 16,
    tiltX: -12,
    tiltY: -12,
    rotate: -2,
    parallax: 0.4,
    content: <OrbitLayoutWidget />,
  },
  {
    id: "views",
    tier: "desktop",
    x: 72,
    y: 6,
    z: 42,
    zDepth: 0,
    tiltX: 0,
    tiltY: 0,
    opacity: 1,
    parallax: 0.32,
    content: <OrbitViewsWidget />,
  },
  {
    id: "effects",
    tier: "desktop",
    x: 2,
    y: 28,
    z: 8,
    zDepth: 0,
    tiltX: 0,
    tiltY: 0,
    opacity: 1,
    parallax: 0.26,
    behindPhone: true,
    content: <OrbitEffectsWidget />,
  },
  {
    id: "premium",
    tier: "desktop",
    x: 58,
    y: 90,
    z: 38,
    zDepth: 0,
    tiltX: 0,
    tiltY: 0,
    scale: 1.04,
    opacity: 1,
    parallax: 0.62,
    content: <OrbitPremiumWidget />,
  },
];

type ParallaxOffset = { x: number; y: number };

function OrbitWidgetSlot({
  slot,
  parallax,
  orbitRevealed,
}: {
  slot: OrbitSlot;
  parallax: ParallaxOffset;
  orbitRevealed: boolean;
}) {
  const parallaxX = parallax.x * slot.parallax * PARALLAX_PX;
  const parallaxY = parallax.y * slot.parallax * PARALLAX_PX;
  const stagger = (ORBIT_EXPLODE_STAGGER_MS[slot.id] ?? 0) / 1000;
  const drift = ORBIT_WIDGET_DRIFT[slot.id];

  return (
    <motion.div
      className={cn(
        "home-orbit-widget home-orbit-widget--motion-pos",
        slot.z <= 10 && "home-orbit-widget--back",
        slot.z >= 24 && "home-orbit-widget--front",
        slot.behindPhone && "home-orbit-widget--behind-phone",
      )}
      data-tier={slot.tier}
      initial={{
        left: ORBIT_EXPLODE_ORIGIN.left,
        top: ORBIT_EXPLODE_ORIGIN.top,
        x: "-50%",
        y: "-50%",
        scale: 0.26,
        opacity: 0,
      }}
      animate={
        orbitRevealed
          ? {
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              x: `calc(-50% + ${parallaxX}px)`,
              y: `calc(-50% + ${parallaxY}px)`,
              scale: slot.scale ?? 1,
              opacity: slot.opacity ?? 1,
            }
          : {
              left: ORBIT_EXPLODE_ORIGIN.left,
              top: ORBIT_EXPLODE_ORIGIN.top,
              x: "-50%",
              y: "-50%",
              scale: 0.26,
              opacity: 0,
            }
      }
      transition={{
        left: {
          duration: ORBIT_WIDGET_EXPLODE_DURATION_S,
          delay: orbitRevealed ? stagger : 0,
          ease: [0.22, 1.28, 0.36, 1],
        },
        top: {
          duration: ORBIT_WIDGET_EXPLODE_DURATION_S,
          delay: orbitRevealed ? stagger : 0,
          ease: [0.22, 1.28, 0.36, 1],
        },
        scale: {
          duration: ORBIT_WIDGET_EXPLODE_DURATION_S,
          delay: orbitRevealed ? stagger : 0,
          ease: [0.22, 1.28, 0.36, 1],
        },
        opacity: {
          duration: ORBIT_WIDGET_EXPLODE_DURATION_S * 0.65,
          delay: orbitRevealed ? stagger : 0,
          ease: "easeOut",
        },
        x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
      }}
      style={
        {
          zIndex: slot.z,
          "--orbit-rotate": `${slot.rotate ?? 0}deg`,
          filter: slot.blur ? `blur(${slot.blur}px)` : undefined,
        } as CSSProperties
      }
    >
      <div className="home-orbit-widget__pose">
        {orbitRevealed ? (
          <motion.div
            className="home-orbit-widget__live"
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{
              x: drift?.x ?? [0],
              y: drift?.y ?? [0],
              rotate: drift?.rotate ?? [0],
            }}
            transition={{
              duration: drift?.duration ?? 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (drift?.delay ?? 0) + ORBIT_WIDGET_EXPLODE_DURATION_S + stagger,
            }}
          >
            {slot.content}
          </motion.div>
        ) : (
          <div className="home-orbit-widget__live">{slot.content}</div>
        )}
      </div>
    </motion.div>
  );
}

type HomeHeroOrbitProps = {
  parallax?: ParallaxOffset;
};

export function HomeHeroOrbit({ parallax = { x: 0, y: 0 } }: HomeHeroOrbitProps) {
  const [phoneEntered, setPhoneEntered] = useState(false);
  const [orbitRevealed, setOrbitRevealed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhoneEntered(true);
      setOrbitRevealed(true);
      return;
    }

    const phoneFrame = window.requestAnimationFrame(() => setPhoneEntered(true));
    const revealTimer = window.setTimeout(
      () => setOrbitRevealed(true),
      ORBIT_WIDGET_EXPLODE_DELAY_MS,
    );

    return () => {
      window.cancelAnimationFrame(phoneFrame);
      window.clearTimeout(revealTimer);
    };
  }, []);

  const phonePx = parallax.x * PHONE_PARALLAX * PARALLAX_PX;
  const phonePy = parallax.y * PHONE_PARALLAX * PARALLAX_PX;
  const phoneTiltX = parallax.y * -4;
  const phoneTiltY = parallax.x * 6;
  const ambientPx = parallax.x * 4;
  const ambientPy = parallax.y * 3;
  const floatDelay = ORBIT_PHONE_ENTRANCE_DURATION_S * 0.82;

  return (
    <MotionConfig reducedMotion="never">
    <div className="home-orbit">
      <div className="home-orbit__scene">
        <div
          className="home-orbit__ambient"
          aria-hidden
          style={{
            transform: `translate3d(${ambientPx}px, ${ambientPy}px, 0)`,
          }}
        />

        <div className="home-orbit__field">
          <div className="home-orbit__widgets-layer home-orbit__widgets-layer--back">
            {ORBIT_SLOTS.filter((s) => BACK_SLOT_IDS.has(s.id)).map((slot) => (
              <OrbitWidgetSlot
                key={slot.id}
                slot={slot}
                parallax={parallax}
                orbitRevealed={orbitRevealed}
              />
            ))}
          </div>

          <div className="home-orbit__phone-stage">
            <motion.div
              className="home-orbit__phone-wrap home-orbit__phone-wrap--motion"
              initial={{
                x: "-50%",
                y: "calc(-50% - 88px)",
                scale: 0.74,
                opacity: 0,
              }}
              animate={
                phoneEntered
                  ? {
                      x: `calc(-50% + ${phonePx}px)`,
                      y: `calc(-50% + ${phonePy}px)`,
                      scale: 1,
                      opacity: 1,
                    }
                  : {
                      x: "-50%",
                      y: "calc(-50% - 88px)",
                      scale: 0.74,
                      opacity: 0,
                    }
              }
              transition={{
                duration: ORBIT_PHONE_ENTRANCE_DURATION_S,
                ease: [0.22, 1, 0.36, 1],
                x: { duration: phoneEntered ? 0.55 : ORBIT_PHONE_ENTRANCE_DURATION_S },
                y: { duration: phoneEntered ? 0.55 : ORBIT_PHONE_ENTRANCE_DURATION_S },
              }}
            >
              <div
                className="home-orbit__phone-parallax"
                style={{
                  transform: `rotateX(${phoneTiltX}deg) rotateY(${phoneTiltY}deg)`,
                }}
              >
                <motion.div
                  className="home-orbit__phone-float"
                  animate={
                    phoneEntered
                      ? { y: ORBIT_PHONE_FLOAT.y, x: ORBIT_PHONE_FLOAT.x }
                      : { y: 0, x: 0 }
                  }
                  transition={{
                    ...ORBIT_PHONE_FLOAT.transition,
                    delay: floatDelay,
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="home-orbit__phone-shadow" aria-hidden />
                  <motion.div
                    className="home-orbit__phone-yaw"
                    animate={phoneEntered ? ORBIT_PHONE_YAW : { rotateY: 0 }}
                    transition={{
                      ...ORBIT_PHONE_YAW.transition,
                      delay: floatDelay + 0.15,
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <motion.div
                      className="home-orbit__phone-pitch"
                      animate={phoneEntered ? ORBIT_PHONE_PITCH : { rotateX: 0 }}
                      transition={{
                        ...ORBIT_PHONE_PITCH.transition,
                        delay: floatDelay + 0.15,
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <motion.div
                        className="home-orbit__phone"
                        animate={phoneEntered ? ORBIT_PHONE_ROLL_DEPTH : { rotateZ: 0, z: 0 }}
                        transition={{
                          ...ORBIT_PHONE_ROLL_DEPTH.transition,
                          delay: floatDelay + 0.15,
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div className="home-orbit__phone-glass">
                          <div className="home-phone-card-3d home-orbit__phone-card">
                            <div className="home-phone-card-clip">
                              <div className="home-phone-top-border home-phone-neon-bright home-orbit__phone-border" />
                              <div className="home-phone-shot-wrap home-orbit__phone-shot-wrap">
                                <img
                                  src={profilePreview}
                                  alt={`${SITE_NAME} profile preview — @byosy`}
                                  className="home-phone-shot home-orbit__phone-shot"
                                  width={393}
                                  height={858}
                                  draggable={false}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="home-orbit__widgets-layer home-orbit__widgets-layer--front">
            {ORBIT_SLOTS.filter(
              (s) => !BACK_SLOT_IDS.has(s.id) && !ABOVE_PHONE_SLOT_IDS.has(s.id),
            ).map((slot) => (
              <OrbitWidgetSlot
                key={slot.id}
                slot={slot}
                parallax={parallax}
                orbitRevealed={orbitRevealed}
              />
            ))}
          </div>

          <div className="home-orbit__widgets-layer home-orbit__widgets-layer--above-phone">
            {ORBIT_SLOTS.filter((s) => ABOVE_PHONE_SLOT_IDS.has(s.id)).map((slot) => (
              <OrbitWidgetSlot
                key={slot.id}
                slot={slot}
                parallax={parallax}
                orbitRevealed={orbitRevealed}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    </MotionConfig>
  );
}
