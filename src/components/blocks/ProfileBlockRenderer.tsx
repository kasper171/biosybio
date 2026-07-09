import { ExternalLink, Play, Users } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import type { Profile } from "@/lib/profile-storage";
import type { ProfileBlock, ProfileBlockSize } from "@/lib/profile-blocks";
import type { BlockShape } from "@/lib/block-frame";
import {
  blockShowsCard,
  getBlockSizeTokens,
  getSpotifyEmbedUrl,
  getSpotifyNativeEmbedHeight,
  getYoutubeEmbedUrl,
  resolveBlockDisplayShape,
  resolveBlockDisplaySize,
  youtubeEmbedFitsFrame,
} from "@/lib/profile-blocks";
import { formatDiscordMemberLabel } from "@/lib/discord-invite";
import {
  BlockFrame,
  OutsideBlockShell,
  ScaledEmbed,
} from "@/components/blocks/BlockFrame";
import {
  getDiscordMutedStyle,
  getDiscordTitleStyle,
  hexToRgba,
} from "@/lib/profile-colors";
import { useI18n } from "@/i18n/LocaleProvider";

type Props = {
  block: ProfileBlock;
  profile: Profile;
  variant: "inside" | "outside";
  sharedInRow?: boolean;
  onLinkClick?: () => void;
};

function useBlockSize(block: ProfileBlock, variant: "inside" | "outside"): ProfileBlockSize {
  return resolveBlockDisplaySize(block, variant);
}

function contentShell(extra = ""): string {
  return `h-full w-full overflow-hidden ${extra}`.trim();
}

function SpotifyBlock({ block }: { block: ProfileBlock }) {
  const embedUrl = getSpotifyEmbedUrl(block);
  if (!embedUrl) {
    return (
      <div className="grid h-full w-full place-items-center text-[10px] text-white/40">
        Spotify
      </div>
    );
  }
  const nativeH = getSpotifyNativeEmbedHeight(block);
  return (
    <ScaledEmbed
      src={embedUrl}
      title={block.title || "Spotify"}
      nativeHeight={nativeH}
    />
  );
}

function YoutubeBlock({
  block,
  showCard,
}: {
  block: ProfileBlock;
  showCard: boolean;
}) {
  const embedUrl = getYoutubeEmbedUrl(block);
  const thumb =
    block.image_url ??
    (block.config.youtube_id
      ? `https://img.youtube.com/vi/${block.config.youtube_id}/hqdefault.jpg`
      : null);

  if (embedUrl && youtubeEmbedFitsFrame(block)) {
    return (
      <ScaledEmbed
        src={embedUrl}
        title={block.title || "YouTube"}
        nativeHeight={200}
      />
    );
  }

  const href = block.url || "#";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`relative block h-full w-full overflow-hidden ${showCard ? "" : ""}`}
    >
      {thumb && (
        <img src={thumb} alt="" className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 grid place-items-center bg-black/30">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white">
          <Play className="h-3.5 w-3.5 fill-current" />
        </div>
      </div>
    </a>
  );
}

function LinkRow({
  block,
  profile,
  size,
  showCard,
  sharedInRow,
  onLinkClick,
}: {
  block: ProfileBlock;
  profile: Profile;
  size: ProfileBlockSize;
  showCard: boolean;
  sharedInRow?: boolean;
  onLinkClick?: () => void;
}) {
  const t = getBlockSizeTokens(size);
  const titleStyle = getDiscordTitleStyle(profile);
  const mutedStyle = getDiscordMutedStyle(profile);
  const href = block.url || "#";
  const shell = contentShell(
    `flex flex-col items-center justify-center gap-1 p-2 text-center ${sharedInRow ? "" : `sm:flex-row sm:text-left ${t.gap} ${t.pad}`}`,
  );
  const hover = showCard ? "transition hover:brightness-110" : "";

  const content = (
    <>
      {block.image_url ? (
        <img
          src={block.image_url}
          alt=""
          className={`shrink-0 rounded-lg object-cover ${sharedInRow ? "h-8 w-8" : t.img}`}
        />
      ) : (
        <div className={`grid shrink-0 place-items-center rounded-lg bg-white/10 ${sharedInRow ? "h-8 w-8" : t.img}`}>
          <ExternalLink className="h-3.5 w-3.5 opacity-50" style={mutedStyle} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`line-clamp-2 font-semibold leading-tight ${sharedInRow ? "text-[10px]" : t.title}`} style={titleStyle}>
          {block.title || "Link"}
        </p>
        {block.subtitle && (
          <p className={`line-clamp-1 ${sharedInRow ? "text-[9px]" : t.sub}`} style={mutedStyle}>
            {block.subtitle}
          </p>
        )}
      </div>
      {!sharedInRow && (
        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-40" style={mutedStyle} aria-hidden />
      )}
    </>
  );

  if (!block.url) return <div className={shell}>{content}</div>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        if (onLinkClick) {
          e.preventDefault();
          onLinkClick();
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
      className={`${shell} ${hover}`}
    >
      {content}
    </a>
  );
}

function ButtonBlock({
  block,
  profile,
  size,
  showCard,
  sharedInRow,
  onLinkClick,
}: {
  block: ProfileBlock;
  profile: Profile;
  size: ProfileBlockSize;
  showCard: boolean;
  sharedInRow?: boolean;
  onLinkClick?: () => void;
}) {
  const tokens = getBlockSizeTokens(size);
  const { t: tr } = useI18n();
  const href = block.url || "#";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        if (onLinkClick) {
          e.preventDefault();
          onLinkClick();
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
      className={`flex h-full w-full items-center justify-center px-2 py-2 text-center font-semibold transition hover:brightness-110 ${tokens.btn}`}
      style={{
        background: hexToRgba(profile.card_border_color, 0.18),
        color: profile.title_text_color ?? "#ffffff",
      }}
    >
      {block.title || tr("profile.openLink")}
    </a>
  );
}

function DiscordInviteBlock({
  block,
  profile,
  shape,
  showCard,
  onLinkClick,
}: {
  block: ProfileBlock;
  profile: Profile;
  shape: BlockShape;
  showCard: boolean;
  onLinkClick?: () => void;
}) {
  const titleStyle = getDiscordTitleStyle(profile);
  const mutedStyle = getDiscordMutedStyle(profile);
  const href =
    block.url ||
    (block.config.discord_invite_code
      ? `https://discord.gg/${block.config.discord_invite_code}`
      : "#");
  const members =
    block.subtitle ||
    formatDiscordMemberLabel(
      block.config.member_count ?? 0,
      block.config.online_count,
    );

  const horizontal = shape === "rectangle";
  const fillBg = showCard ? "bg-[#5865F2]/25" : "";

  const iconEl = block.image_url ? (
    <img
      src={block.image_url}
      alt=""
      className={
        horizontal
          ? "h-full w-full object-cover"
          : "h-full max-h-full w-full max-w-[7.5rem] rounded-2xl object-cover"
      }
    />
  ) : (
    <div
      className={`grid h-full w-full place-items-center bg-[#5865F2]/30 ${
        horizontal ? "" : "max-w-[7.5rem] rounded-2xl"
      }`}
    >
      <FaDiscord className="h-12 w-12 text-[#5865F2]" />
    </div>
  );

  const textBlock = (
    <div className="flex min-w-0 flex-col justify-center gap-1.5">
      <div className="flex items-center gap-1.5">
        <FaDiscord className="h-3.5 w-3.5 shrink-0 text-[#5865F2]" aria-hidden />
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#5865F2]/90">
          Discord
        </span>
      </div>
      <p className="text-base font-semibold leading-tight" style={titleStyle}>
        {block.title || "Discord"}
      </p>
      {members && (
        <p className="flex items-center gap-1.5 text-sm opacity-85" style={mutedStyle}>
          <Users className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
          <span className={horizontal ? "line-clamp-2" : "line-clamp-3"}>{members}</span>
        </p>
      )}
    </div>
  );

  const cta = (
    <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#5865F2] px-5 py-2.5 text-sm font-semibold text-white">
      Entrar no servidor
    </span>
  );

  const inner = horizontal ? (
    <div className="flex h-full w-full items-stretch">
      <div className="h-full w-[38%] shrink-0 overflow-hidden">{iconEl}</div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-4 py-3">
        {textBlock}
        {cta}
      </div>
    </div>
  ) : (
    <div className="flex h-full w-full flex-col">
      <div className="flex min-h-0 flex-[2] items-center justify-center p-4 pb-2">{iconEl}</div>
      <div className="flex min-h-0 flex-[3] flex-col justify-center px-4 text-center">{textBlock}</div>
      <div className="shrink-0 p-4 pt-2">
        <span className="flex w-full items-center justify-center rounded-lg bg-[#5865F2] py-3 text-sm font-semibold text-white">
          Entrar no servidor
        </span>
      </div>
    </div>
  );

  const className = contentShell(`h-full w-full overflow-hidden ${fillBg}`);

  if (!href || href === "#") return <div className={className}>{inner}</div>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        if (onLinkClick) {
          e.preventDefault();
          onLinkClick();
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
      className={`${className} transition hover:brightness-110`}
    >
      {inner}
    </a>
  );
}

export function ProfileBlockRenderer({ block, profile, variant, sharedInRow, onLinkClick }: Props) {
  const size = useBlockSize(block, variant);
  const shape = resolveBlockDisplayShape(block);
  const showCard = blockShowsCard(block);
  const isDiscord = block.block_type === "discord_invite";

  const content = (() => {
    switch (block.block_type) {
      case "button":
        return (
          <ButtonBlock
            block={block}
            profile={profile}
            size={size}
            showCard={showCard}
            sharedInRow={sharedInRow}
            onLinkClick={onLinkClick}
          />
        );
      case "spotify":
        return <SpotifyBlock block={block} />;
      case "youtube":
        return <YoutubeBlock block={block} showCard={showCard} />;
      case "discord_invite":
        return (
          <DiscordInviteBlock
            block={block}
            profile={profile}
            shape={shape}
            showCard={showCard}
            onLinkClick={onLinkClick}
          />
        );
      case "link":
      default:
        return (
          <LinkRow
            block={block}
            profile={profile}
            size={size}
            showCard={showCard}
            sharedInRow={sharedInRow}
            onLinkClick={onLinkClick}
          />
        );
    }
  })();

  if (variant === "outside" && showCard) {
    return (
      <OutsideBlockShell
        profile={profile}
        sharedInRow={sharedInRow}
        shape={shape}
        size={size}
        flush={isDiscord}
      >
        {content}
      </OutsideBlockShell>
    );
  }

  return (
    <div className={`w-full min-w-0 ${sharedInRow ? "h-full" : ""}`}>
      <BlockFrame
        block={block}
        size={size}
        shape={shape}
        showCard={showCard}
        sharedInRow={sharedInRow}
        variant={variant}
        profile={profile}
        flush={isDiscord && showCard}
      >
        {content}
      </BlockFrame>
    </div>
  );
}
