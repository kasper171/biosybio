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
type FloatVariant = "a" | "b" | "c" | "d" | "e" | "f";
type DriftVariant = "a" | "b" | "c" | "d";

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
  float: FloatVariant;
  drift: DriftVariant;
  content: ReactNode;
};

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
    float: "b",
    drift: "b",
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
    float: "a",
    drift: "a",
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
    float: "c",
    drift: "c",
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
    float: "d",
    drift: "d",
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
    float: "e",
    drift: "a",
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
    float: "f",
    drift: "b",
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
    float: "a",
    drift: "c",
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
    float: "b",
    drift: "d",
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
    float: "c",
    drift: "a",
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
    float: "d",
    drift: "b",
    content: <OrbitPremiumWidget />,
  },
];

function OrbitWidgetSlot({ slot }: { slot: OrbitSlot }) {
  return (
    <div
      className={cn(
        "home-orbit-widget",
        `home-orbit-widget--float-${slot.float}`,
        `home-orbit-widget--drift-${slot.drift}`,
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
        } as CSSProperties
      }
    >
      <div className="home-orbit-widget__motion">{slot.content}</div>
    </div>
  );
}

export function HomeHeroOrbit() {
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
            <OrbitWidgetSlot key={slot.id} slot={slot} />
          ))}

          <div className="home-orbit__phone-wrap">
            <div className="home-orbit__phone-glow" aria-hidden />
            <div className="home-orbit__phone-orbit">
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
  );
}
