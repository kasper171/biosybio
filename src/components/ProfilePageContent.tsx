import {
  DEFAULT_CARD_LAYOUT,
  type Profile,
} from "@/lib/profile-storage";
import { incrementProfileLinkClickFn } from "@/lib/profile/profile-link-click.functions";
import { getOrCreateVisitorId } from "@/lib/profile-views";
import { ProfileCard } from "@/components/ProfileCard";
import { DiscordPresenceCard } from "@/components/DiscordPresenceCard";
import { HotelProfileCard } from "@/components/HotelProfileCard";
import { ProfileCommentsSection } from "@/components/ProfileCommentsSection";
import { ProfileBlocksSection } from "@/components/blocks/ProfileBlocksSection";
import { MusicPlayerCard } from "@/components/MusicPlayerCard";
import { splitBlocksByPlacement, type ProfileBlock } from "@/lib/profile-blocks";
import { normalizeCardRevealEffect } from "@/lib/card-reveal";
import { getMusicCardWidthPct } from "@/lib/profile-music";
import {
  getHotelCardLayoutFromProfile,
  getHotelBesideColumnDimensions,
  getHotelBesideSlotHeight,
  getMainCardDimensions,
  HOTEL_BESIDE_GAP_PX,
  HOTEL_BELOW_GAP_PX,
  listHotelConnections,
  resolveHotelLayoutForViewport,
} from "@/lib/hotel";
import { useProfileCompactLayout } from "@/hooks/use-profile-compact-layout";
import { SOCIAL_MAP, resolveSocialUrl } from "@/lib/socials";
import { ProfileSocialIconLink } from "@/components/ProfileSocialIconLink";
import { FaGlobe } from "react-icons/fa";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { ProfileWallpaperLayer } from "@/components/ProfileWallpaperLayer";
import { cardGlassNeedsStableStacking } from "@/lib/card-glass";

type Props = {
  profile: Profile;
  blocks?: ProfileBlock[];
  /** Dispara animação de entrada do card */
  animate?: boolean;
  animKey?: number;
  /** Preview do dashboard — layout fiel à página pública em área reduzida */
  isEditor?: boolean;
  /** Wallpaper visível (false = só cor de fundo até o delay pós-reveal) */
  wallpaperVisible?: boolean;
};

export function ProfilePageContent({
  profile,
  blocks = [],
  animate = true,
  animKey = 0,
  isEditor = false,
  wallpaperVisible = true,
}: Props) {
  const entries = Object.entries(profile.socials || {}).filter(([, v]) => v);
  const useBrand = profile.social_original_colors !== false;
  const showSocialTitles = profile.show_social_titles === true;
  const socialBloom = profile.social_icon_bloom === true;
  const discordMode = profile.discord_card_mode ?? "inside";
  const bgBlur = profile.background_blur ?? 0;
  const bgBrightness = profile.background_brightness ?? 100;
  const revealEffect = normalizeCardRevealEffect(profile.card_reveal_effect);
  const cardInitial =
    revealEffect === "scale"
      ? { scale: 0.86 }
      : revealEffect === "slide_up"
        ? { y: 28 }
        : { y: 10, scale: 0.985 };
  const cardAnimate =
    revealEffect === "scale"
      ? { scale: 1 }
      : revealEffect === "slide_up"
        ? { y: 0 }
        : { y: 0, scale: 1 };
  const cardTransition =
    revealEffect === "scale"
      ? {
          scale: { type: "spring", visualDuration: 0.78, bounce: 0.24 },
        }
      : revealEffect === "slide_up"
        ? {
            y: { type: "spring", visualDuration: 0.72, bounce: 0.14 },
          }
        : {
            y: { type: "spring", visualDuration: 0.62, bounce: 0.1 },
            scale: { type: "spring", visualDuration: 0.62, bounce: 0.08 },
          };
  /**
   * Cards com backdrop-filter (Discord, música, hotel, blocos) não podem animar opacity no
   * wrapper pai — o blur e a borda só “aparecem” quando opacity chega a 1. Usamos o mesmo
   * reveal do card principal (só transform) e delay 0 para tudo entrar junto.
   */
  const sharedRevealInitial = cardInitial;
  const sharedRevealAnimate = cardAnimate;
  const sharedRevealTransition = cardTransition;
  const sharedRevealDelaySec = 0;
  const glassStable = cardGlassNeedsStableStacking(profile);
  const useRevealMotion = animate && !glassStable;

  const cardLayout = profile.card_layout ?? DEFAULT_CARD_LAYOUT;
  const { inside: insideBlocks, outside: outsideBlocks } = splitBlocksByPlacement(blocks);
  const compactLayout = useProfileCompactLayout();
  const useCompactHotelLayout = compactLayout && !isEditor;

  const hotelLayout = resolveHotelLayoutForViewport(
    getHotelCardLayoutFromProfile(profile),
    useCompactHotelLayout,
  );
  const hotelConnections = listHotelConnections(profile);
  const mainCardDims = getMainCardDimensions(profile);
  const hasHotel = hotelConnections.length > 0;
  const hotelInside = hasHotel && hotelLayout.placement === "inside";
  const hotelOutside = hasHotel && hotelLayout.placement === "outside";
  const hotelOutsideBeside = hotelOutside && hotelLayout.row === "same_row";
  const hotelOutsideBelow = hotelOutside && hotelLayout.row === "separate_row";
  const besideColumnDims = hotelOutsideBeside
    ? getHotelBesideColumnDimensions(
        mainCardDims.width,
        mainCardDims.height,
        hotelLayout.shape,
        hotelLayout.size,
        hotelConnections.length > 1 ? 2 : 1,
        HOTEL_BESIDE_GAP_PX,
      )
    : { width: 0, height: 0 };
  /** Ao lado dentro do card: Habbo e Habblet lado a lado quando os dois existem */
  const hotelInsideBeside =
    hotelInside && hotelLayout.row === "same_row" && hotelConnections.length > 1;

  const hotelCardsInside = hotelInside
    ? hotelConnections.map((data) => (
        <div
          key={data.platform}
          className={hotelInsideBeside ? "min-w-0 flex-1" : "w-full"}
        >
          <HotelProfileCard
            data={data}
            profile={profile}
            layout={hotelLayout}
            variant="inside"
          />
        </div>
      ))
    : null;

  const hotelCardsOutside = hotelOutside
    ? hotelConnections.map((data, index) => (
        <HotelProfileCard
          key={data.platform}
          data={data}
          profile={profile}
          layout={hotelLayout}
          variant="outside"
          className="h-full w-full"
          besideSlot={
            hotelOutsideBeside
              ? {
                  mainCardHeight: besideColumnDims.height,
                  mainCardWidth: besideColumnDims.width,
                  slotIndex: index,
                  slotCount: hotelConnections.length > 1 ? 2 : 1,
                  gapPx: HOTEL_BESIDE_GAP_PX,
                }
              : undefined
          }
          belowSlot={
            hotelOutsideBelow
              ? {
                  mainCardWidth: mainCardDims.width,
                  slotIndex: index,
                  slotCount: hotelConnections.length > 1 ? 2 : 1,
                  gapPx: HOTEL_BELOW_GAP_PX,
                }
              : undefined
          }
        />
      ))
    : null;

  const discordInsideFooter =
    profile.discord_user_id && discordMode === "inside" ? (
      <DiscordPresenceCard
        userId={profile.discord_user_id}
        variant="inside"
        profileTheme={profile}
        showBadges={profile.discord_show_badges !== false}
        scale={profile.discord_inside_scale ?? 100}
        stackActivity={useCompactHotelLayout}
      />
    ) : null;

  const cardFooter =
    discordInsideFooter || hotelCardsInside ? (
      <div className="space-y-3">
        {discordInsideFooter}
        {hotelCardsInside && (
          <div
            className={
              hotelInsideBeside && !useCompactHotelLayout
                ? "flex flex-col gap-3 sm:flex-row sm:items-stretch"
                : "space-y-3"
            }
          >
            {hotelCardsInside}
          </div>
        )}
      </div>
    ) : undefined;

  const mainCard = (
    <ProfileCard
      profile={profile}
      enforceCardHeight
      animateNameText={animate && profile.text_typing_name_effect !== false}
      animateBioText={animate && profile.text_typing_bio_effect !== false}
      animationSeed={animKey}
      footer={cardFooter}
      socialIcons={
        entries.length > 0
          ? entries.map(([key, val]) => {
              const def = SOCIAL_MAP[key];
              const Icon = def?.icon ?? FaGlobe;
              const url = resolveSocialUrl(key, val as string);
              if (!url) return null;
              const iconColor = useBrand
                ? (def?.brandColor ?? profile.social_icon_color ?? "#ffffff")
                : (profile.social_icon_color ?? "#ffffff");
              const compact = cardLayout === "aligned";
              return (
                <ProfileSocialIconLink
                  key={key}
                  profile={profile}
                  icon={Icon}
                  iconColor={iconColor}
                  compact={compact}
                  bloom={socialBloom}
                  showTitle={showSocialTitles}
                  title={def?.label ?? key}
                  href={url}
                  onNavigate={(e) => {
                    e.preventDefault();
                    void incrementProfileLinkClickFn({
                      data: {
                        profileId: profile.id,
                        socialKey: key,
                        visitorId: getOrCreateVisitorId(),
                      },
                    }).finally(() => {
                      window.open(url, "_blank", "noopener,noreferrer");
                    });
                  }}
                />
              );
            })
          : undefined
      }
    >
      {insideBlocks.length > 0 && (
        <ProfileBlocksSection
          blocks={insideBlocks}
          profile={profile}
          placement="inside"
        />
      )}
    </ProfileCard>
  );

  const mainCardBesideClass = hotelOutsideBeside ? "w-full min-w-0 shrink-0" : "w-full";
  const mainCardBesideStyle = hotelOutsideBeside
    ? { maxWidth: mainCardDims.width }
    : undefined;

  const mainCardWidth = mainCardDims.width;
  const mainSlotStyle: CSSProperties = {
    width: mainCardWidth,
    maxWidth: "100%",
    minWidth: 0,
  };
  const mainProfileColumnStyle: CSSProperties = {
    width: mainCardWidth,
    maxWidth: "100%",
    minWidth: 0,
    flexShrink: 0,
  };

  const showMusicCard = Boolean(profile.music_url) && profile.music_card_enabled !== false;
  const musicCardWidthPct = getMusicCardWidthPct(profile.music_card_width_pct);

  const musicCardInner = showMusicCard ? (
    <div className="mt-4 flex w-full justify-center">
      <div className="w-full" style={{ maxWidth: `${musicCardWidthPct}%` }}>
        <div className="relative mx-auto w-full">
          <MusicPlayerCard profile={profile} />
        </div>
      </div>
    </div>
  ) : null;

  const outsideDiscordInner =
    profile.discord_user_id && discordMode === "outside" ? (
      <div className="mt-4 w-full min-w-0 max-w-full">
        <DiscordPresenceCard
          userId={profile.discord_user_id}
          variant="outside"
          profileTheme={profile}
          showBadges={profile.discord_show_badges !== false}
          stackActivity={useCompactHotelLayout}
        />
      </div>
    ) : null;

  const mainColumnBody = (
    <>
      <div className={mainCardBesideClass} style={mainCardBesideStyle}>
        {mainCard}
      </div>
      {musicCardInner}
      {outsideDiscordInner}
    </>
  );

  const mainColumnAnimated = useRevealMotion ? (
    <motion.div
      key={`main-col-${animKey}`}
      initial={sharedRevealInitial}
      animate={sharedRevealAnimate}
      transition={{ ...sharedRevealTransition, delay: sharedRevealDelaySec }}
      className="flex min-w-0 shrink-0 flex-col"
      style={{ ...mainProfileColumnStyle, willChange: "transform" }}
    >
      {mainColumnBody}
    </motion.div>
  ) : (
    <div className="flex min-w-0 shrink-0 flex-col" style={mainProfileColumnStyle}>
      {mainColumnBody}
    </div>
  );

  const hotelBesideSlotBase = hotelOutsideBeside
    ? {
        mainCardHeight: mainCardDims.height,
        mainCardWidth: besideColumnDims.width,
        slotCount: (hotelConnections.length > 1 ? 2 : 1) as 1 | 2,
        gapPx: HOTEL_BESIDE_GAP_PX,
      }
    : null;

  const hotelBesideColumn =
    hotelOutsideBeside && hotelCardsOutside ? (
      <div
        className={`flex shrink-0 flex-col ${isEditor ? "" : "w-full lg:w-auto"}`}
        style={{
          width: besideColumnDims.width,
          maxWidth: besideColumnDims.width,
          minWidth: besideColumnDims.width,
          height: besideColumnDims.height,
          gap: HOTEL_BESIDE_GAP_PX,
        }}
      >
        {useRevealMotion
          ? hotelCardsOutside.map((card, index) => (
              <motion.div
                key={`hotel-beside-${animKey}-${index}`}
                initial={sharedRevealInitial}
                animate={sharedRevealAnimate}
                transition={{ ...sharedRevealTransition, delay: sharedRevealDelaySec }}
                className="relative flex min-h-0 w-full flex-1 flex-col"
                style={{
                  willChange: "transform",
                  minHeight: hotelBesideSlotBase
                    ? getHotelBesideSlotHeight({
                        ...hotelBesideSlotBase,
                        slotIndex: index,
                      })
                    : undefined,
                }}
              >
                {card}
              </motion.div>
            ))
          : hotelCardsOutside.map((card, index) => (
              <div
                key={`hotel-beside-static-${index}`}
                className="relative flex min-h-0 w-full flex-1 flex-col"
                style={{
                  minHeight: hotelBesideSlotBase
                    ? getHotelBesideSlotHeight({
                        ...hotelBesideSlotBase,
                        slotIndex: index,
                      })
                    : undefined,
                }}
              >
                {card}
              </div>
            ))}
      </div>
    ) : null;

  /** Coluna principal: card + música + Discord — largura fixa; hotel ao lado só acompanha a altura do card */
  const profileContent = hotelOutsideBeside ? (
    <div
      className={
        isEditor
          ? "flex w-full flex-row flex-nowrap items-start justify-center gap-4"
          : "flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:justify-center"
      }
    >
      {mainColumnAnimated}
      {hotelBesideColumn}
    </div>
  ) : (
    <div className="mx-auto w-full" style={mainSlotStyle}>
      {mainColumnAnimated}
    </div>
  );

  return (
    <div
      className="relative min-h-screen w-full overflow-x-auto overflow-y-visible"
      style={{ backgroundColor: profile.background_color }}
    >
      <div
        className="fixed inset-0 z-0 transition-opacity duration-700 ease-out"
        style={{ opacity: wallpaperVisible ? 1 : 0 }}
        aria-hidden={!wallpaperVisible}
      >
        <ProfileWallpaperLayer
          url={profile.background_url}
          fallbackColor={profile.background_color}
          posX={profile.background_pos_x ?? 50}
          posY={profile.background_pos_y ?? 50}
          blur={bgBlur}
          brightness={bgBrightness}
        />
      </div>
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center bg-black/40 px-4 py-10">
        <div
          className={`w-full ${hotelOutsideBeside ? "max-w-[min(100%,920px)]" : ""}`}
          style={{
            maxWidth: hotelOutsideBeside ? undefined : mainCardDims.width + "px",
            ...(isEditor && hotelOutsideBeside
              ? { minWidth: mainCardDims.width + besideColumnDims.width + 16 }
              : {}),
            ...(isEditor && hotelOutsideBelow ? { minWidth: mainCardDims.width } : {}),
          }}
        >
          {profileContent}

          {hotelOutsideBelow && hotelCardsOutside && (
            <div
              className="mt-4 flex w-full"
              style={{
                maxWidth: mainCardDims.width,
                gap: HOTEL_BELOW_GAP_PX,
              }}
            >
              {useRevealMotion
                ? hotelCardsOutside.map((card, index) => (
                    <motion.div
                      key={`hotel-below-${animKey}-${index}`}
                      initial={sharedRevealInitial}
                      animate={sharedRevealAnimate}
                      transition={{ ...sharedRevealTransition, delay: sharedRevealDelaySec }}
                      className="relative min-w-0 flex-1"
                      style={{ willChange: "transform" }}
                    >
                      {card}
                    </motion.div>
                  ))
                : hotelCardsOutside.map((card, index) => (
                    <div key={`hotel-below-static-${index}`} className="relative min-w-0 flex-1">
                      {card}
                    </div>
                  ))}
            </div>
          )}

          {outsideBlocks.length > 0 && (
            <ProfileBlocksSection
              blocks={outsideBlocks}
              profile={profile}
              placement="outside"
              animate={animate}
              animKey={animKey}
              cardInitial={sharedRevealInitial}
              cardAnimate={sharedRevealAnimate}
              cardTransition={sharedRevealTransition}
              revealDelayMs={0}
            />
          )}
          <ProfileCommentsSection
            profileId={profile.id}
            enabled={profile.comments_enabled !== false}
            cardGlassProfile={profile}
          />
        </div>
      </div>
    </div>
  );
}
