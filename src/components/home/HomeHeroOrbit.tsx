import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  CircleDot,
  Code2,
  Crown,
  Eye,
  FileText,
  Image,
  Images,
  LayoutGrid,
  LayoutTemplate,
  Link2,
  MessageCircle,
  MousePointer2,
  Music2,
  Palette,
  Sparkles,
  Type,
  Unplug,
  UserCircle,
  Zap,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import profilePreview from "@/assets/home-profile-preview-2.png?asset=20260706-2";

type OrbitTier = "mobile" | "tablet" | "desktop";
type FloatVariant = "a" | "b" | "c" | "d" | "e" | "f";
type DriftVariant = "a" | "b" | "c" | "d";

type OrbitFeature = {
  id: string;
  label: string;
  icon: LucideIcon;
  x: number;
  y: number;
  z: number;
  scale?: number;
  opacity?: number;
  blur?: number;
  rotate?: number;
  float: FloatVariant;
  drift: DriftVariant;
  tier: OrbitTier;
};

const ORBIT_FEATURES: OrbitFeature[] = [
  { id: "discord", label: "Discord", icon: MessageCircle, x: 3, y: 10, z: 22, float: "a", drift: "a", tier: "mobile" },
  { id: "spotify", label: "Spotify", icon: Music2, x: 84, y: 6, z: 20, float: "b", drift: "b", tier: "mobile" },
  { id: "badges", label: "Badges", icon: Award, x: 8, y: 72, z: 24, float: "c", drift: "c", tier: "mobile" },
  { id: "social", label: "Social Links", icon: Link2, x: 80, y: 76, z: 23, float: "d", drift: "d", tier: "mobile" },
  { id: "themes", label: "Themes", icon: Palette, x: 1, y: 38, z: 8, opacity: 0.72, blur: 1, rotate: -4, float: "e", drift: "a", tier: "tablet" },
  { id: "layouts", label: "Layouts", icon: LayoutGrid, x: 76, y: 44, z: 10, float: "f", drift: "b", tier: "tablet" },
  { id: "templates", label: "Templates", icon: LayoutTemplate, x: 88, y: 54, z: 7, opacity: 0.75, blur: 1.5, rotate: 3, float: "a", drift: "c", tier: "tablet" },
  { id: "music", label: "Music", icon: Music2, x: 4, y: 84, z: 11, float: "b", drift: "d", tier: "tablet" },
  { id: "fonts", label: "Fonts", icon: Type, x: 70, y: 14, z: 9, rotate: 2, float: "c", drift: "a", tier: "tablet" },
  { id: "effects", label: "Effects", icon: Sparkles, x: 14, y: 2, z: 14, float: "d", drift: "b", tier: "tablet" },
  { id: "views", label: "Views", icon: Eye, x: 34, y: 4, z: 13, opacity: 0.85, float: "e", drift: "c", tier: "tablet" },
  { id: "connections", label: "Connections", icon: Unplug, x: 28, y: 12, z: 12, float: "f", drift: "d", tier: "tablet" },
  { id: "cards", label: "Profile Cards", icon: CreditCard, x: 86, y: 34, z: 15, rotate: -3, float: "a", drift: "a", tier: "desktop" },
  { id: "avatar", label: "Avatar", icon: UserCircle, x: 56, y: 86, z: 17, float: "b", drift: "b", tier: "desktop" },
  { id: "background", label: "Background", icon: Image, x: 0, y: 54, z: 5, opacity: 0.65, blur: 2, rotate: -2, float: "c", drift: "c", tier: "desktop" },
  { id: "portfolio", label: "Portfolio", icon: Briefcase, x: 91, y: 86, z: 4, opacity: 0.6, blur: 2.5, rotate: 4, float: "d", drift: "d", tier: "desktop" },
  { id: "gallery", label: "Gallery", icon: Images, x: 46, y: 0, z: 16, float: "e", drift: "a", tier: "desktop" },
  { id: "cursor", label: "Custom Cursor", icon: MousePointer2, x: 24, y: 90, z: 14, opacity: 0.8, float: "f", drift: "b", tier: "desktop" },
  { id: "animations", label: "Animations", icon: Zap, x: 60, y: 2, z: 18, float: "a", drift: "c", tier: "desktop" },
  { id: "css", label: "Custom CSS", icon: Code2, x: 6, y: 24, z: 11, opacity: 0.78, blur: 0.5, float: "b", drift: "d", tier: "desktop" },
  { id: "widgets", label: "Widgets", icon: LayoutGrid, x: 92, y: 24, z: 6, opacity: 0.7, blur: 1, float: "c", drift: "a", tier: "desktop" },
  { id: "status", label: "Status", icon: CircleDot, x: 38, y: 92, z: 13, float: "d", drift: "b", tier: "desktop" },
  { id: "bio", label: "Bio", icon: FileText, x: 66, y: 90, z: 19, float: "e", drift: "c", tier: "desktop" },
  { id: "premium", label: "Premium", icon: Crown, x: 62, y: 88, z: 26, scale: 1.04, float: "f", drift: "d", tier: "desktop" },
];

function OrbitFeatureCard({ feature }: { feature: OrbitFeature }) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "home-orbit-card",
        `home-orbit-card--float-${feature.float}`,
        `home-orbit-card--drift-${feature.drift}`,
        feature.z <= 8 && "home-orbit-card--back",
        feature.z >= 20 && "home-orbit-card--front",
      )}
      data-tier={feature.tier}
      style={
        {
          "--orbit-x": `${feature.x}%`,
          "--orbit-y": `${feature.y}%`,
          "--orbit-z": feature.z,
          "--orbit-scale": feature.scale ?? 1,
          "--orbit-opacity": feature.opacity ?? 1,
          "--orbit-blur": feature.blur ? `${feature.blur}px` : "0px",
          "--orbit-rotate": `${feature.rotate ?? 0}deg`,
        } as CSSProperties
      }
    >
      <div className="home-orbit-card__inner">
        <Icon className="home-orbit-card__icon" aria-hidden />
        <span className="home-orbit-card__label">{feature.label}</span>
      </div>
    </div>
  );
}

export function HomeHeroOrbit() {
  return (
    <div className="home-orbit">
      <div className="home-orbit__ambient" aria-hidden>
        <div className="home-orbit__glow home-orbit__glow--main" />
        <div className="home-orbit__glow home-orbit__glow--secondary" />
        <div className="home-orbit__particle home-orbit__particle--1" />
        <div className="home-orbit__particle home-orbit__particle--2" />
        <div className="home-orbit__particle home-orbit__particle--3" />
        <div className="home-orbit__particle home-orbit__particle--4" />
        <div className="home-orbit__particle home-orbit__particle--5" />
        <div className="home-orbit__line home-orbit__line--1" />
        <div className="home-orbit__line home-orbit__line--2" />
      </div>

      <div className="home-orbit__field">
        {ORBIT_FEATURES.map((feature) => (
          <OrbitFeatureCard key={feature.id} feature={feature} />
        ))}

        <div className="home-orbit__phone-wrap">
          <div className="home-orbit__phone-glow" aria-hidden />
          <div className="home-orbit__phone">
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
  );
}
