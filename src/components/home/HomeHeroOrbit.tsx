import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import profilePreview from "@/assets/home-profile-preview-2.png?asset=20260706-2";
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
  content: ReactNode;
};

/** Intensidade do parallax por card (0–1) — perfil usa 1.0 (~8px) */
const PHONE_PARALLAX = 1;
const PARALLAX_PX = 8;

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
    z: 14,
    zDepth: 12,
    tiltX: -4,
    tiltY: 10,
    opacity: 0.88,
    blur: 0.5,
    parallax: 0.32,
    content: <OrbitViewsWidget />,
  },
  {
    id: "effects",
    tier: "desktop",
    x: 2,
    y: 28,
    z: 8,
    zDepth: -20,
    tiltX: 14,
    tiltY: 8,
    opacity: 0.72,
    blur: 1.5,
    parallax: 0.26,
    content: <OrbitEffectsWidget />,
  },
  {
    id: "premium",
    tier: "desktop",
    x: 58,
    y: 90,
    z: 30,
    zDepth: 52,
    tiltX: 6,
    tiltY: -6,
    scale: 1.04,
    parallax: 0.62,
    content: <OrbitPremiumWidget />,
  },
];

type ParallaxOffset = { x: number; y: number };

function OrbitWidgetSlot({
  slot,
  parallax,
}: {
  slot: OrbitSlot;
  parallax: ParallaxOffset;
}) {
  return (
    <div
      className={cn(
        "home-orbit-widget",
        slot.z <= 10 && "home-orbit-widget--back",
        slot.z >= 24 && "home-orbit-widget--front",
      )}
      data-tier={slot.tier}
      style={
        {
          "--orbit-x": `${slot.x}%`,
          "--orbit-y": `${slot.y}%`,
          "--orbit-z": slot.z,
          "--orbit-z-depth": `${slot.zDepth}px`,
          "--orbit-tilt-x": `${slot.tiltX}deg`,
          "--orbit-tilt-y": `${slot.tiltY}deg`,
          "--orbit-scale": slot.scale ?? 1,
          "--orbit-opacity": slot.opacity ?? 1,
          "--orbit-blur": slot.blur ? `${slot.blur}px` : "0px",
          "--orbit-rotate": `${slot.rotate ?? 0}deg`,
          "--orbit-parallax-x": `${parallax.x * slot.parallax * PARALLAX_PX}px`,
          "--orbit-parallax-y": `${parallax.y * slot.parallax * PARALLAX_PX}px`,
        } as CSSProperties
      }
    >
      <div className="home-orbit-widget__pose">
        <div className={cn("home-orbit-widget__live", `home-orbit-widget__live--${slot.id}`)}>
          <div className={cn("home-orbit-widget__depth", `home-orbit-widget__depth--${slot.id}`)}>
            {slot.content}
          </div>
        </div>
      </div>
    </div>
  );
}

type HomeHeroOrbitProps = {
  parallax?: ParallaxOffset;
};

export function HomeHeroOrbit({ parallax = { x: 0, y: 0 } }: HomeHeroOrbitProps) {
  const phonePx = parallax.x * PHONE_PARALLAX * PARALLAX_PX;
  const phonePy = parallax.y * PHONE_PARALLAX * PARALLAX_PX;

  return (
    <div className="home-orbit">
      <div className="home-orbit__scene">
        <div className="home-orbit__ambient" aria-hidden>
          <div className="home-orbit__glow home-orbit__glow--main" />
          <div className="home-orbit__glow home-orbit__glow--secondary" />
          <div className="home-orbit__particle home-orbit__particle--1" />
          <div className="home-orbit__particle home-orbit__particle--2" />
          <div className="home-orbit__particle home-orbit__particle--3" />
          <div className="home-orbit__particle home-orbit__particle--4" />
          <div className="home-orbit__particle home-orbit__particle--5" />
        </div>

        <div className="home-orbit__cloud-scene" aria-hidden>
          <div className="home-orbit__cloud-core" />
          <div className="home-orbit__cloud-band home-orbit__cloud-band--1" />
          <div className="home-orbit__cloud-band home-orbit__cloud-band--2" />
          <div className="home-orbit__cloud-band home-orbit__cloud-band--3" />
          <div className="home-orbit__cloud-wisp home-orbit__cloud-wisp--1" />
          <div className="home-orbit__cloud-wisp home-orbit__cloud-wisp--2" />
          <div className="home-orbit__cloud-wisp home-orbit__cloud-wisp--3" />
        </div>

        <div className="home-orbit__field">
          {ORBIT_SLOTS.map((slot) => (
            <OrbitWidgetSlot key={slot.id} slot={slot} parallax={parallax} />
          ))}

          <div
            className="home-orbit__phone-wrap"
            style={
              {
                "--orbit-phone-px": `${phonePx}px`,
                "--orbit-phone-py": `${phonePy}px`,
              } as CSSProperties
            }
          >
            <div className="home-orbit__phone-glow" aria-hidden />
            <div className="home-orbit__phone-orbit">
              <div className="home-orbit__phone-float">
                <div className="home-orbit__phone">
                  <div className="home-orbit__phone-glass">
                    <div className="home-phone-card-3d home-orbit__phone-card">
                      <div className="home-phone-card-clip">
                        <div className="home-phone-top-border home-phone-neon-bright" />
                        <div className="home-phone-shot-wrap">
                          <img
                            src={profilePreview}
                            alt="Biosy profile preview"
                            className="home-phone-shot"
                            draggable={false}
                          />
                        </div>
                      </div>
                      <div aria-hidden className="home-phone-cut-seal" />
                      <div aria-hidden className="home-phone-cut-feather" />
                      <div aria-hidden className="home-phone-cut-blur" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
