import {
  DEFAULT_CARD_LAYOUT,
  logProfileLinkClick,
  type Profile,
} from "@/lib/profile-storage";
import { ProfileCard } from "@/components/ProfileCard";
import { DiscordPresenceCard } from "@/components/DiscordPresenceCard";
import { HotelProfileCard } from "@/components/HotelProfileCard";
import { ProfileCommentsSection } from "@/components/ProfileCommentsSection";
import { ProfileBlocksSection } from "@/components/blocks/ProfileBlocksSection";
import { MusicPlayerCard } from "@/components/MusicPlayerCard";
import { splitBlocksByPlacement, type ProfileBlock } from "@/lib/profile-blocks";
import { getDiscordRevealDelay, normalizeCardRevealEffect } from "@/lib/card-reveal";
import { getMusicCardWidthPct } from "@/lib/profile-music";
import {
  getHotelCardLayoutFromProfile,
  getHotelBesideColumnDimensions,
  getMainCardDimensions,
  HOTEL_BESIDE_GAP_PX,
  HOTEL_BELOW_GAP_PX,
  listHotelConnections,
} from "@/lib/hotel";
import { SOCIAL_MAP, resolveSocialUrl } from "@/lib/socials";
import { FaGlobe } from "react-icons/fa";
import { motion } from "motion/react";
import type { CSSProperties } from "react";

type Props = {
  profile: Profile;
  blocks?: ProfileBlock[];
  /** Dispara animação de entrada do card */
  animate?: boolean;
  animKey?: number;
  /** Preview do dashboard — layout fiel à página pública em área reduzida */
  isEditor?: boolean;
};

export function ProfilePageContent({
  profile,
  blocks = [],
  animate = true,
  animKey = 0,
  isEditor = false,
}: Props) {
  const entries = Object.entries(profile.socials || {}).filter(([, v]) => v);
  const useBrand = profile.social_original_colors !== false;
  const discordMode = profile.discord_card_mode ?? "inside";
  const socialIconStyle = profile.social_icon_style ?? "boxed";
  const bgBlur = profile.background_blur ?? 0;
  const bgBrightness = profile.background_brightness ?? 100;
  const revealEffect = normalizeCardRevealEffect(profile.card_reveal_effect);
  const discordOutside = Boolean(profile.discord_user_id && discordMode === "outside");
  const discordDelay = getDiscordRevealDelay(revealEffect);
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

  const cardLayout = profile.card_layout ?? DEFAULT_CARD_LAYOUT;
  const { inside: insideBlocks, outside: outsideBlocks } = splitBlocksByPlacement(blocks);
  const outsideBlockDelay = discordOutside ? discordDelay + 80 : discordDelay;

  const hotelLayout = getHotelCardLayoutFromProfile(profile);
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
      />
    ) : null;

  const cardFooter =
    discordInsideFooter || hotelCardsInside ? (
      <div className="space-y-3">
        {discordInsideFooter}
        {hotelCardsInside && (
          <div
            className={
              hotelInsideBeside
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
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  title={def?.label ?? key}
                  onClick={(e) => {
                    e.preventDefault();
                    void logProfileLinkClick(profile.id, key).finally(() => {
                      window.open(url, "_blank", "noopener,noreferrer");
                    });
                  }}
                  className={`grid place-items-center transition hover:scale-110 ${
                    socialIconStyle === "logo"
                      ? compact
                        ? "h-10 w-10 rounded-full bg-transparent"
                        : "h-9 w-9 rounded-full bg-transparent"
                      : compact
                        ? "h-11 w-11 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                        : "h-11 w-11 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={
                      socialIconStyle === "logo"
                        ? compact
                          ? "h-6 w-6"
                          : "h-6 w-6"
                        : compact
                          ? "h-5 w-5"
                          : "h-5 w-5"
                    }
                    style={{ color: iconColor }}
                  />
                </a>
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
    ? { maxWidth: mainCardDims.width, willChange: "transform" as const }
    : { willChange: "transform" as const };

  const mainCardWrapped = animate ? (
    <motion.div
      key={`main-${animKey}`}
      initial={cardInitial}
      animate={cardAnimate}
      transition={cardTransition}
      className={`relative ${mainCardBesideClass}`}
      style={mainCardBesideStyle}
    >
      {mainCard}
    </motion.div>
  ) : (
    <div
      className={mainCardBesideClass}
      style={hotelOutsideBeside ? { maxWidth: mainCardDims.width } : undefined}
    >
      {mainCard}
    </div>
  );

  const hotelDelay = discordOutside ? discordDelay + 60 : discordDelay;
  const showMusicCard = Boolean(profile.music_url) && profile.music_card_enabled !== false;
  const musicCardDelay = hotelDelay + (hotelOutsideBelow ? 80 : 0) + (discordOutside ? 40 : 0);
  const musicCardWidthPct = getMusicCardWidthPct(profile.music_card_width_pct);

  const musicCardInner = showMusicCard ? (
    <div className="mt-4 flex w-full justify-center">
      <div className="w-full" style={{ maxWidth: `${musicCardWidthPct}%` }}>
        {animate ? (
          <motion.div
            key={`music-card-${animKey}`}
            initial={cardInitial}
            animate={cardAnimate}
            transition={{ ...cardTransition, delay: musicCardDelay / 1000 }}
            className="relative mx-auto w-full"
            style={{ willChange: "transform" }}
          >
            <MusicPlayerCard profile={profile} />
          </motion.div>
        ) : (
          <div className="mx-auto w-full">
            <MusicPlayerCard profile={profile} />
          </div>
        )}
      </div>
    </div>
  ) : null;

  const mainCardWidth = mainCardDims.width;
  const mainSlotStyle: CSSProperties = {
    width: mainCardWidth,
    maxWidth: "100%",
    minWidth: 0,
  };
  const mainCardBesideSlotStyle: CSSProperties = {
    width: mainCardWidth,
    maxWidth: "100%",
    minWidth: 0,
    flexShrink: 0,
  };

  const outsideDiscordInner =
    profile.discord_user_id && discordMode === "outside" ? (
      <DiscordPresenceCard
        userId={profile.discord_user_id}
        variant="outside"
        profileTheme={profile}
        showBadges={profile.discord_show_badges !== false}
      />
    ) : null;

  const outsideDiscordWrapped = outsideDiscordInner ? (
    <div className="mt-4 w-full min-w-0 max-w-full">
      {animate && discordOutside ? (
        <motion.div
          key={`discord-${animKey}`}
          initial={cardInitial}
          animate={cardAnimate}
          transition={{ ...cardTransition, delay: discordDelay / 1000 }}
          className="relative w-full min-w-0 max-w-full"
          style={{ willChange: "transform" }}
        >
          {outsideDiscordInner}
        </motion.div>
      ) : (
        <div className="w-full min-w-0 max-w-full">{outsideDiscordInner}</div>
      )}
    </div>
  ) : null;

  /** Coluna do card principal — largura fixa; música e Discord separado ficam aqui */
  const mainProfileColumn = (
    <div
      className="flex min-w-0 shrink-0 flex-col"
      style={hotelOutsideBeside ? mainCardBesideSlotStyle : mainSlotStyle}
    >
      {mainCardWrapped}
      {musicCardInner}
      {outsideDiscordWrapped}
    </div>
  );

  const hotelBesideColumn =
    hotelOutsideBeside && hotelCardsOutside ? (
      <div
        className={`flex shrink-0 flex-col ${isEditor ? "shrink-0" : "w-full shrink-0"}`}
        style={{
          width: besideColumnDims.width,
          maxWidth: besideColumnDims.width,
          minWidth: besideColumnDims.width,
          height: besideColumnDims.height,
          gap: HOTEL_BESIDE_GAP_PX,
        }}
      >
        {animate
          ? hotelCardsOutside.map((card, index) => (
              <motion.div
                key={`hotel-beside-${animKey}-${index}`}
                initial={cardInitial}
                animate={cardAnimate}
                transition={{ ...cardTransition, delay: (hotelDelay + index * 60) / 1000 }}
                className="relative min-h-0 w-full flex-1"
                style={{ willChange: "transform" }}
              >
                {card}
              </motion.div>
            ))
          : hotelCardsOutside.map((card, index) => (
              <div key={`hotel-beside-static-${index}`} className="relative min-h-0 w-full flex-1">
                {card}
              </div>
            ))}
      </div>
    ) : null;

  const profileContent = hotelOutsideBeside ? (
    <div
      className={
        isEditor
          ? "flex w-full flex-row flex-nowrap items-start justify-center gap-4"
          : "flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:justify-center"
      }
    >
      {mainProfileColumn}
      {hotelBesideColumn}
    </div>
  ) : (
    <div className="mx-auto w-full">{mainProfileColumn}</div>
  );

  return (
    <div
      className={`relative min-h-screen w-full ${isEditor ? "overflow-x-auto overflow-y-visible" : "overflow-hidden"}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none z-0 ${isEditor ? "absolute inset-0" : "fixed inset-0"}`}
        style={{
          background: profile.background_url
            ? `url(${profile.background_url}) center/cover no-repeat`
            : profile.background_color,
          filter: `blur(${bgBlur}px) brightness(${bgBrightness}%)`,
          transform: bgBlur > 0 ? "scale(1.08)" : undefined,
        }}
      />
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
              {animate
                ? hotelCardsOutside.map((card, index) => (
                    <motion.div
                      key={`hotel-below-${animKey}-${index}`}
                      initial={cardInitial}
                      animate={cardAnimate}
                      transition={{ ...cardTransition, delay: (hotelDelay + index * 60) / 1000 }}
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
              cardInitial={cardInitial}
              cardAnimate={cardAnimate}
              cardTransition={cardTransition}
              revealDelayMs={outsideBlockDelay}
            />
          )}
          <ProfileCommentsSection
            profileId={profile.id}
            enabled={profile.comments_enabled !== false}
          />
        </div>
      </div>
    </div>
  );
}
