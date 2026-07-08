import type { CSSProperties, ReactNode } from "react";
import {
  Eye,
  Gem,
  LayoutGrid,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
  Crown,
} from "lucide-react";
import { FaDiscord, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { SiSpotify } from "react-icons/si";
import { cn } from "@/lib/utils";

function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("home-orbit-widget__glass", className)}>
      <div className="home-orbit-widget__shine" aria-hidden />
      {children}
    </div>
  );
}

function Toggle({ active = true }: { active?: boolean }) {
  return (
    <span
      className={cn(
        "home-orbit-widget__toggle",
        active && "home-orbit-widget__toggle--on",
      )}
      aria-hidden
    >
      <span className="home-orbit-widget__toggle-knob" />
    </span>
  );
}

export function OrbitMusicWidget() {
  return (
    <GlassCard className="home-orbit-widget__music">
      <div className="home-orbit-widget__row home-orbit-widget__row--between">
        <div className="home-orbit-widget__brand">
          <SiSpotify className="home-orbit-widget__brand-icon home-orbit-widget__brand-icon--spotify" />
          <span>Spotify</span>
        </div>
        <Toggle />
      </div>
      <div className="home-orbit-widget__music-body">
        <div className="home-orbit-widget__album-art" aria-hidden>
          <div className="home-orbit-widget__album-gradient" />
        </div>
        <div className="home-orbit-widget__track">
          <p className="home-orbit-widget__track-title">Starboy</p>
          <p className="home-orbit-widget__track-artist">The Weeknd</p>
          <div className="home-orbit-widget__progress" aria-hidden>
            <span className="home-orbit-widget__progress-fill" />
          </div>
          <div className="home-orbit-widget__controls" aria-hidden>
            <SkipBack size={11} />
            <span className="home-orbit-widget__play-btn">
              <Pause size={10} />
            </span>
            <SkipForward size={11} />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function OrbitDiscordWidget() {
  return (
    <GlassCard className="home-orbit-widget__discord">
      <div className="home-orbit-widget__row home-orbit-widget__row--between">
        <div className="home-orbit-widget__brand">
          <FaDiscord className="home-orbit-widget__brand-icon home-orbit-widget__brand-icon--discord" />
          <span>Discord</span>
        </div>
        <Toggle />
      </div>
      <div className="home-orbit-widget__discord-body">
        <div className="home-orbit-widget__avatar" aria-hidden />
        <div>
          <p className="home-orbit-widget__discord-name">ndg</p>
          <div className="home-orbit-widget__badge-row" aria-hidden>
            <span className="home-orbit-widget__mini-badge home-orbit-widget__mini-badge--pink" />
            <span className="home-orbit-widget__mini-badge home-orbit-widget__mini-badge--blue" />
            <span className="home-orbit-widget__mini-badge home-orbit-widget__mini-badge--green" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function OrbitBadgesWidget() {
  return (
    <GlassCard className="home-orbit-widget__badges-label">
      <Gem className="home-orbit-widget__gem-icon" aria-hidden />
      <span>Badges</span>
    </GlassCard>
  );
}

export function OrbitBadgesGemsWidget() {
  const gems = ["#ff4d9d", "#7c5cff", "#4dd9ff", "#ffd54d"] as const;
  return (
    <GlassCard className="home-orbit-widget__badges-gems">
      {gems.map((color) => (
        <span
          key={color}
          className="home-orbit-widget__gem"
          style={{ "--gem-color": color } as CSSProperties}
          aria-hidden
        />
      ))}
    </GlassCard>
  );
}

export function OrbitThemeWidget() {
  const themes = [
    { name: "Midnight", from: "#0f0a18", to: "#2a1545" },
    { name: "Sunset", from: "#2a1020", to: "#ff4d7a" },
    { name: "Dream", from: "#101828", to: "#6366f1" },
  ] as const;

  return (
    <GlassCard className="home-orbit-widget__theme">
      <p className="home-orbit-widget__section-title">Theme</p>
      <div className="home-orbit-widget__theme-grid">
        {themes.map((theme) => (
          <div key={theme.name} className="home-orbit-widget__theme-item">
            <span
              className="home-orbit-widget__theme-swatch"
              style={{
                background: `linear-gradient(145deg, ${theme.from}, ${theme.to})`,
              }}
              aria-hidden
            />
            <span className="home-orbit-widget__theme-name">{theme.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function OrbitLayoutWidget() {
  return (
    <GlassCard className="home-orbit-widget__layout">
      <p className="home-orbit-widget__section-title">Layout</p>
      <div className="home-orbit-widget__layout-grid" aria-hidden>
        <span className="home-orbit-widget__layout-opt home-orbit-widget__layout-opt--active">
          <LayoutGrid size={12} />
        </span>
        <span className="home-orbit-widget__layout-opt">
          <span className="home-orbit-widget__layout-bars" />
        </span>
        <span className="home-orbit-widget__layout-opt">
          <span className="home-orbit-widget__layout-stack" />
        </span>
      </div>
    </GlassCard>
  );
}

export function OrbitSocialWidget() {
  return (
    <GlassCard className="home-orbit-widget__social">
      <FaTiktok aria-hidden />
      <SiSpotify aria-hidden />
      <FaYoutube aria-hidden />
      <FaInstagram aria-hidden />
    </GlassCard>
  );
}

export function OrbitEffectsWidget() {
  return (
    <GlassCard className="home-orbit-widget__effects">
      <Sparkles className="home-orbit-widget__effects-icon" aria-hidden />
      <div>
        <p className="home-orbit-widget__effects-title">Effects</p>
        <p className="home-orbit-widget__effects-sub">Glow · Particles</p>
      </div>
    </GlassCard>
  );
}

export function OrbitViewsWidget() {
  return (
    <GlassCard className="home-orbit-widget__views">
      <Eye className="home-orbit-widget__views-icon" aria-hidden />
      <span className="home-orbit-widget__views-count">23K</span>
      <span className="home-orbit-widget__views-label">views</span>
    </GlassCard>
  );
}

export function OrbitPremiumWidget() {
  return (
    <GlassCard className="home-orbit-widget__premium">
      <Crown className="home-orbit-widget__premium-icon" aria-hidden />
      <span>Premium</span>
    </GlassCard>
  );
}