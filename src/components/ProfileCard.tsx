import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Tilt from "react-parallax-tilt";
import { Eye, Hash, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { buildCardBorderChrome, normalizeCardBorderStyle } from "@/lib/card-border";
import { resolveCardHeight } from "@/lib/card-min-height";
import type { ProfileBlock } from "@/lib/profile-blocks";
import {
  getBadgeStyle,
  getBodyBaseStyle,
  getDividerStyle,
  getIconColorStyle,
  getMutedTextStyle,
  getTextGlowStyle,
  getTitleBaseStyle,
  hexToRgba,
} from "@/lib/profile-colors";
import {
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_LAYOUT,
  DEFAULT_CARD_WIDTH,
  type Profile,
} from "@/lib/profile-storage";
import type { TextAnimationId } from "@/lib/text-animations";
import { normalizeTextAnimationId, hasActiveTextAnimation } from "@/lib/text-animations";
import { ProfileAnimatedText } from "@/components/text-animations/ProfileAnimatedText";
import { AvatarWithFrame } from "@/components/AvatarWithFrame";
import { ProfileRoleBadges } from "@/components/ProfileRoleBadges";
import { cn } from "@/lib/utils";

/** Altura visível do banner (% do card) — não depende do tamanho do anel */
const BANNER_VISIBLE_RATIO = 0.34;
/** Quanto o banner sobe atrás do avatar (px fixo) */
const BANNER_BEHIND_AVATAR_PX = 44;

function CardFooter({ dividerStyle, children }: {
  dividerStyle: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className="relative z-[6] shrink-0 border-t px-6 pb-5 pt-3"
      style={dividerStyle}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componentes de layout reutilizáveis
// ---------------------------------------------------------------------------

type LayoutContentProps = {
  profile: Profile;
  layout: "default" | "centered" | "aligned";
  avatarSize: number;
  avatarRingWidth: number;
  avatarRingColor: string;
  hasBanner: boolean;
  bannerStripH: number;
  bannerTotalH: number;
  bannerPosX: number;
  bannerPosY: number;
  typedName: string;
  typedBio: string;
  fullName: string;
  fullBio: string;
  fullUsername: string;
  animateNameText: boolean;
  animateBioText: boolean;
  footer?: ReactNode;
  children?: ReactNode;
  socialIcons?: ReactNode;
  contentBlocks?: ProfileBlock[];
};

function AvatarBlock({
  profile, size, ringWidth, ringColor,
}: { profile: Profile; size: number; ringWidth: number; ringColor: string }) {
  return (
    <AvatarWithFrame size={size} frameId={profile.avatar_frame_id}>
      <Avatar
        className={cn("relative shrink-0 overflow-hidden rounded-full", ringWidth > 0 && "ring-offset-0 ring-offset-transparent")}
        style={{
          width: size,
          height: size,
          ...(ringWidth > 0 ? { boxShadow: `0 0 0 ${ringWidth}px ${ringColor}` } : {}),
        }}
      >
        {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" className="object-cover" /> : null}
        <AvatarFallback
          className="text-white/45"
          style={{ backgroundColor: hexToRgba(profile.card_color, Math.min(profile.card_opacity + 0.15, 1)) }}
        >
          <User strokeWidth={1.25} aria-hidden style={{ width: size * 0.46, height: size * 0.46 }} />
        </AvatarFallback>
      </Avatar>
    </AvatarWithFrame>
  );
}

function NameBlock({
  animate, typedName, fullName, glowStyle, textEffect, accentColor, particleColor,
}: {
  animate: boolean;
  typedName: string;
  fullName: string;
  glowStyle?: CSSProperties;
  textEffect?: TextAnimationId;
  accentColor?: string;
  particleColor?: string;
}) {
  if (textEffect && textEffect !== "none" && fullName) {
    const animStyle = textEffect === "glitch" ? undefined : glowStyle;
    return (
      <ProfileAnimatedText
        text={fullName}
        effect={textEffect}
        className="inline-block max-w-full"
        style={animStyle}
        charStyle={textEffect === "glitch" ? undefined : glowStyle}
        accentColor={accentColor}
        particleColor={particleColor}
      />
    );
  }
  if (!animate) return <span style={glowStyle}>{fullName}</span>;
  return (
    <span className="inline-grid max-w-full">
      <span className="col-start-1 row-start-1 truncate" style={glowStyle}>
        {typedName}
        {fullName.length > 0 && <span className="biosy-type-caret" aria-hidden />}
      </span>
      <span aria-hidden className="invisible col-start-1 row-start-1 select-none">{fullName}</span>
    </span>
  );
}

function BioBlock({
  animate, typedBio, fullBio, textEffect, className, bodyStyle, accentColor, particleColor,
}: {
  animate: boolean;
  typedBio: string;
  fullBio: string;
  textEffect?: TextAnimationId;
  className?: string;
  bodyStyle?: CSSProperties;
  accentColor?: string;
  particleColor?: string;
}) {
  if (!fullBio) return null;
  if (textEffect && textEffect !== "none") {
    const usesOwnColors = textEffect === "glitch";
    return (
      <div
        className={cn(className, "py-2")}
        style={usesOwnColors ? undefined : bodyStyle}
      >
        <ProfileAnimatedText
          text={fullBio}
          effect={textEffect}
          className="inline-block whitespace-pre-wrap"
          style={usesOwnColors ? undefined : bodyStyle}
          charStyle={usesOwnColors ? undefined : bodyStyle}
          accentColor={accentColor}
          particleColor={particleColor}
        />
      </div>
    );
  }
  if (!animate) return <p className={className} style={bodyStyle}>{fullBio}</p>;
  return (
    <p className={className ?? "mt-2 text-sm text-white/80"} style={bodyStyle}>
      <span className="grid whitespace-pre-wrap">
        <span className="col-start-1 row-start-1">
          {typedBio}
          {typedBio.length < fullBio.length && <span className="biosy-type-caret" aria-hidden />}
        </span>
        <span aria-hidden className="invisible col-start-1 row-start-1">{fullBio}</span>
      </span>
    </p>
  );
}

function CardLayoutContent({
  profile, layout, avatarSize, avatarRingWidth, avatarRingColor,
  hasBanner, bannerStripH, bannerTotalH, bannerPosX, bannerPosY,
  typedName, typedBio, fullName, fullBio, fullUsername,
  animateNameText, animateBioText, footer, children, socialIcons,
}: LayoutContentProps) {
  const titleBase = getTitleBaseStyle(profile);
  const titleGlow = getTextGlowStyle(profile, 1, "display_name");
  const bodyBase = getBodyBaseStyle(profile);
  const bodyGlow = getTextGlowStyle(profile, 0.75, "body");
  const mutedStyle = getMutedTextStyle(profile);
  const mutedGlow = getTextGlowStyle(profile, 0.75, "muted");
  const badgeStyle = getBadgeStyle(profile);
  const iconStyle = getIconColorStyle(profile);
  const dividerStyle = getDividerStyle(profile);
  const nameTextEffect = normalizeTextAnimationId(profile.name_text_animation);
  const bioTextEffect = normalizeTextAnimationId(profile.bio_text_animation);
  const hasNameFx = hasActiveTextAnimation(nameTextEffect);
  const hasBioFx = hasActiveTextAnimation(bioTextEffect);
  const titleAccent = profile.text_glow_color ?? profile.effect_glow_color ?? "#ff2d7a";
  const bodyAccent = profile.text_glow_color ?? profile.effect_glow_color ?? "#ff2d7a";
  const nameParticleColor = profile.name_particle_color ?? "#ff2d7a";
  const bioParticleColor = profile.bio_particle_color ?? "#ff2d7a";
  const nameAnimates =
    animateNameText && nameTextEffect === "none";
  const bioAnimates =
    animateBioText && bioTextEffect === "none";

  const roleBadgeAlign = layout === "aligned" ? "left" : "center";

  const overlayBadges = (
    <>
      {profile.show_public_uid !== false && profile.public_uid != null && (
        <div
          className="absolute left-3 top-3 z-[10] flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm"
          title="UID"
          style={badgeStyle}
        >
          <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden style={iconStyle} />
          <span>{profile.public_uid.toLocaleString("pt-BR")}</span>
        </div>
      )}
      {profile.show_view_count !== false && (
        <div
          className="absolute right-3 top-3 z-[10] flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm"
          title="Visualizações"
          style={badgeStyle}
        >
          <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden style={iconStyle} />
          <span>{formatViewCount(profile.view_count ?? 0)}</span>
        </div>
      )}
    </>
  );

  // ── LAYOUT ALINHADO (guns.lol style) ──────────────────────────────────────
  if (layout === "aligned") {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden text-left">
        {overlayBadges}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-start gap-4 px-6 pt-6 pb-3">
            <div
              className="flex shrink-0 flex-col items-center gap-3.5"
              style={{ width: avatarSize, maxWidth: avatarSize }}
            >
              <AvatarBlock
                profile={profile}
                size={avatarSize}
                ringWidth={avatarRingWidth}
                ringColor={avatarRingColor}
              />
              {socialIcons && (
                <div className="flex w-full flex-wrap items-center justify-center gap-2.5">
                  {socialIcons}
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start text-left">
              <h3
                className={cn(
                  "w-full text-left text-xl font-bold leading-tight",
                  hasNameFx ? "py-2" : "truncate",
                )}
                style={titleBase}
              >
                <NameBlock
                  animate={nameAnimates}
                  typedName={typedName}
                  fullName={fullName}
                  glowStyle={titleGlow}
                  textEffect={nameTextEffect}
                  accentColor={titleAccent}
                  particleColor={nameParticleColor}
                />
              </h3>
              <ProfileRoleBadges profile={profile} align={roleBadgeAlign} className="mt-1.5" />
              {profile.show_username !== false && (
                <p className="mt-1 text-left text-xs" style={{ ...mutedStyle, ...mutedGlow }}>
                  {fullUsername}
                </p>
              )}
              <BioBlock
                animate={bioAnimates}
                typedBio={typedBio}
                fullBio={fullBio}
                textEffect={bioTextEffect}
                className={cn("mt-2 text-left text-xs", hasBioFx && "py-2")}
                bodyStyle={{ ...bodyBase, ...bodyGlow }}
                accentColor={bodyAccent}
                particleColor={bioParticleColor}
              />
            </div>
          </div>
          {children && <div className="px-6 pb-3 text-left">{children}</div>}
        </div>
        {footer && (
          <CardFooter dividerStyle={dividerStyle}>
            {footer}
          </CardFooter>
        )}
      </div>
    );
  }

  // ── LAYOUT CENTRALIZADO ────────────────────────────────────────────────────
  if (layout === "centered") {
    const centeredAvatarSize = Math.max(52, Math.round(avatarSize * 1.1));
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {overlayBadges}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-6 py-8 text-center",
          )}
        >
          <AvatarBlock
            profile={profile}
            size={centeredAvatarSize}
            ringWidth={avatarRingWidth}
            ringColor={avatarRingColor}
          />
          <h3
            className={cn(
              "mt-4 w-full max-w-full text-xl font-bold",
              hasNameFx ? "py-2" : "truncate",
            )}
            style={titleBase}
          >
            <NameBlock
              animate={nameAnimates}
              typedName={typedName}
              fullName={fullName}
              glowStyle={titleGlow}
              textEffect={nameTextEffect}
              accentColor={titleAccent}
              particleColor={nameParticleColor}
            />
          </h3>
          <ProfileRoleBadges profile={profile} align={roleBadgeAlign} className="mt-1.5" />
          {profile.show_username !== false && (
            <p className="mt-1 max-w-full truncate text-xs" style={{ ...mutedStyle, ...mutedGlow }}>
              {fullUsername}
            </p>
          )}
          <BioBlock
            animate={bioAnimates}
            typedBio={typedBio}
            fullBio={fullBio}
            textEffect={bioTextEffect}
            className={cn("mt-2 w-full max-w-full text-center text-sm", hasBioFx && "py-2")}
            bodyStyle={{ ...bodyBase, ...bodyGlow }}
            accentColor={bodyAccent}
            particleColor={bioParticleColor}
          />
          {socialIcons && (
            <div className="mt-4 flex w-full max-w-full flex-wrap justify-center gap-2.5">
              {socialIcons}
            </div>
          )}
          {children}
        </div>
        {footer && (
          <CardFooter dividerStyle={dividerStyle}>
            {footer}
          </CardFooter>
        )}
      </div>
    );
  }

  // ── LAYOUT PADRÃO (default) ────────────────────────────────────────────────
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {overlayBadges}
      {hasBanner && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] overflow-hidden" style={{ height: bannerTotalH }}>
          <img src={profile.inner_banner_url!} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${bannerPosX}% ${bannerPosY}%` }} />
        </div>
      )}
      {hasBanner && <div className="relative z-[2] shrink-0" style={{ height: bannerStripH }} aria-hidden />}
      <div
        className="relative z-[3] flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-6"
        style={{ marginTop: hasBanner ? -BANNER_BEHIND_AVATAR_PX : 0, paddingTop: hasBanner ? 20 : 24 }}
      >
        <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", !footer && !hasBanner && "justify-center")}>
          <div className="relative z-[5] mx-auto mb-3 flex shrink-0 justify-center">
            <AvatarBlock
              profile={profile}
              size={avatarSize}
              ringWidth={avatarRingWidth}
              ringColor={avatarRingColor}
            />
          </div>
          <h3
            className={cn("text-center text-lg font-bold", hasNameFx ? "py-2" : "truncate")}
            style={titleBase}
          >
            <NameBlock
              animate={nameAnimates}
              typedName={typedName}
              fullName={fullName}
              glowStyle={titleGlow}
              textEffect={nameTextEffect}
              accentColor={titleAccent}
              particleColor={nameParticleColor}
            />
          </h3>
          <ProfileRoleBadges profile={profile} align={roleBadgeAlign} className="mt-1.5" />
          {profile.show_username !== false && (
            <p className="mt-1 truncate text-center text-xs" style={{ ...mutedStyle, ...mutedGlow }}>
              {fullUsername}
            </p>
          )}
          <BioBlock
            animate={bioAnimates}
            typedBio={typedBio}
            fullBio={fullBio}
            textEffect={bioTextEffect}
            className={cn("mt-2 text-center text-sm", hasBioFx && "py-2")}
            bodyStyle={{ ...bodyBase, ...bodyGlow }}
            accentColor={bodyAccent}
            particleColor={bioParticleColor}
          />
          {socialIcons && <div className="mt-4 flex flex-wrap justify-center gap-2.5">{socialIcons}</div>}
          {children}
        </div>
        {footer && (
          <CardFooter dividerStyle={dividerStyle}>
            {footer}
          </CardFooter>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return count.toLocaleString("pt-BR");
}

type Props = {
  profile: Profile;
  children?: ReactNode;
  /** Ícones de redes sociais — no layout alinhado ficam abaixo do avatar */
  socialIcons?: ReactNode;
  /** Rodapé fixo na base do card (ex.: Discord). */
  footer?: ReactNode;
  /** @deprecated use footer */
  compactFooter?: boolean;
  animateNameText?: boolean;
  animateBioText?: boolean;
  animationSeed?: number;
  /** Altura exata do card (ex.: hotel ao lado) — evita crescer além de card_height */
  enforceCardHeight?: boolean;
  /** Blocos dentro do card — usados para garantir altura mínima sem scroll */
  contentBlocks?: ProfileBlock[];
};

export function ProfileCard({
  profile,
  children,
  socialIcons,
  footer,
  compactFooter: _compactFooter,
  animateNameText = false,
  animateBioText = false,
  animationSeed = 0,
  enforceCardHeight = true,
  contentBlocks,
}: Props) {
  const [hovering, setHovering] = useState(false);
  const fullName = profile.display_name || profile.username;
  const fullUsername = `@${profile.username}`;
  const fullBio = profile.bio ?? "";
  const [typedName, setTypedName] = useState(fullName);
  const [typedBio, setTypedBio] = useState(fullBio);

  useEffect(() => {
    if (!animateNameText) {
      setTypedName(fullName);
      return;
    }

    setTypedName("");
    if (!fullName) return;
    let index = 0;
    let deleting = false;
    let timer: number | null = null;

    const tick = () => {
      setTypedName(fullName.slice(0, index));
      if (!deleting) {
        if (index < fullName.length) {
          index += 1;
          timer = window.setTimeout(tick, 72);
          return;
        }
        deleting = true;
        timer = window.setTimeout(tick, 920);
        return;
      }
      if (index > 0) {
        index -= 1;
        timer = window.setTimeout(tick, 44);
        return;
      }
      deleting = false;
      timer = window.setTimeout(tick, 260);
    };
    timer = window.setTimeout(tick, 240);

    return () => {
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [animateNameText, animationSeed, fullName]);

  useEffect(() => {
    if (!animateBioText) {
      setTypedBio(fullBio);
      return;
    }

    const timers: number[] = [];
    setTypedBio("");
    for (let i = 1; i <= fullBio.length; i += 1) {
      const timer = window.setTimeout(() => {
        setTypedBio(fullBio.slice(0, i));
      }, 520 + i * 32);
      timers.push(timer);
    }
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [animateBioText, animationSeed, fullBio]);

  const borderWidth = profile.card_border_width ?? 0;
  const borderColor = profile.card_border_color;
  const radius = profile.card_border_radius ?? 16;
  const cardH = resolveCardHeight(profile, { blocks: contentBlocks });

  const borderChrome = buildCardBorderChrome({
    borderWidth,
    borderColor,
    borderRadius: radius,
    borderStyle: profile.card_border_style,
    glowEnabled: profile.effect_glow,
    glowColor: profile.effect_glow_color ?? profile.card_border_color,
    glowSize: profile.effect_glow_size ?? 24,
  });
  const useCssBorder =
    borderWidth > 0 && normalizeCardBorderStyle(profile.card_border_style) !== "solid";
  const innerRadius = useCssBorder ? Math.max(0, radius - borderWidth) : radius;

  const avatarRingColor = profile.avatar_border_color ?? profile.card_border_color;
  const avatarRingWidth = profile.avatar_border_width ?? 4;
  const avatarSize = profile.avatar_size ?? 96;
  const bannerPosX = profile.inner_banner_pos_x ?? 50;
  const bannerPosY = profile.inner_banner_pos_y ?? 50;
  const hasBanner = Boolean(profile.inner_banner_url);
  const bannerStripH = Math.round(cardH * BANNER_VISIBLE_RATIO);
  const bannerTotalH = bannerStripH + BANNER_BEHIND_AVATAR_PX;
  const nameTextEffect = normalizeTextAnimationId(profile.name_text_animation);
  const bioTextEffect = normalizeTextAnimationId(profile.bio_text_animation);

  // Blur fica dentro do Tilt para acompanhar tilt + hover lift
  const blurLayerStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background: hexToRgba(profile.card_color, profile.card_opacity),
    backdropFilter: `blur(${profile.card_blur}px)`,
    WebkitBackdropFilter: `blur(${profile.card_blur}px)`,
    borderRadius: innerRadius,
  };

  // Frame: borda CSS (tracejada etc.) fica aqui; conteúdo interno não pode ter a mesma altura fixa
  // senão cobre a borda inferior (box-sizing: border-box).
  const frameStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    ...(enforceCardHeight ? { height: cardH } : {}),
    ...borderChrome.style,
  };

  // Content wrapper: overflow:hidden para clips do banner/conteúdo
  const cardLayout = profile.card_layout ?? DEFAULT_CARD_LAYOUT;
  const contentWrapStyle: CSSProperties = {
    overflow: "hidden",
    borderRadius: innerRadius,
    display: "flex",
    flexDirection: "column",
    textAlign: cardLayout === "aligned" ? "left" : "center",
    width: "100%",
    position: "relative",
    fontFamily: profile.page_font_family,
    ...(useCssBorder
      ? enforceCardHeight
        ? { flex: 1, minHeight: 0 }
        : { minHeight: cardH + "px" }
      : enforceCardHeight
        ? { minHeight: cardH + "px", height: cardH + "px", maxHeight: cardH + "px" }
        : { minHeight: cardH + "px" }),
  };

  return (
    <div
      className="biosy-card-root mx-auto"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: (profile.card_width ?? DEFAULT_CARD_WIDTH) + "px",
        // Hover lift no wrapper externo — o Tilt fica dentro e cuida só do 3D
        transition: "transform 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)",
        transform: profile.effect_hover && hovering ? "translateY(-6px)" : undefined,
      }}
    >
      {/* Tilt: react-parallax-tilt — cuida só da rotação 3D */}
      <Tilt
        tiltEnable={profile.effect_tilt ?? false}
        tiltMaxAngleX={(profile.effect_tilt_strength ?? 5) * 2}
        tiltMaxAngleY={(profile.effect_tilt_strength ?? 5) * 2.4}
        perspective={800}
        transitionEasing="cubic-bezier(0.17, 0.67, 0.35, 1)"
        transitionSpeed={700}
        scale={profile.effect_tilt ? 1 + (profile.effect_tilt_strength ?? 5) * 0.003 : 1}
        glareEnable={false}
        reset={true}
        onEnter={() => setHovering(true)}
        onLeave={() => setHovering(false)}
        style={{ width: "100%", ...(enforceCardHeight ? { height: cardH } : {}) }}
      >
        {/* Frame: border-radius + box-shadow (borda sólida + glow externo) */}
        <div style={frameStyle} className={borderChrome.className}>
          {/* GlowingEffect: efeito de borda animado — só quando effect_border_glow está ativo */}
          {profile.effect_border_glow && borderWidth > 0 && (
            <GlowingEffect
              borderWidth={borderWidth}
              color={profile.effect_glow_color ?? borderColor}
              glow={false}
              disabled={false}
              spread={40}
              inactiveZone={0.5}
            />
          )}

          {/* Conteúdo: overflow:hidden para clips do banner */}
          <div style={contentWrapStyle}>
            {/* Blur acompanha tilt + hover porque está DENTRO do Tilt */}
            <div aria-hidden style={blurLayerStyle} />
            <CardLayoutContent
              profile={profile}
              layout={profile.card_layout ?? DEFAULT_CARD_LAYOUT}
              avatarSize={avatarSize}
              avatarRingWidth={avatarRingWidth}
              avatarRingColor={avatarRingColor}
              hasBanner={hasBanner}
              bannerStripH={bannerStripH}
              bannerTotalH={bannerTotalH}
              bannerPosX={bannerPosX}
              bannerPosY={bannerPosY}
              typedName={typedName}
              typedBio={typedBio}
              fullName={fullName}
              fullBio={fullBio}
              fullUsername={fullUsername}
              animateNameText={animateNameText}
              animateBioText={animateBioText}
              footer={footer}
              socialIcons={socialIcons}
            >
              {children}
            </CardLayoutContent>
          </div>
        </div>
      </Tilt>
    </div>
  );
}
