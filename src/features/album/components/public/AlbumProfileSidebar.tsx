import type { Profile } from "@/lib/profile-storage";
import type { AlbumTheme } from "@/features/album/types/album.types";
import { ProfileRoleBadges } from "@/components/ProfileRoleBadges";
import { AvatarWithFrame } from "@/components/AvatarWithFrame";
import { AVATAR_FRAME_SCALE } from "@/lib/avatar-frames";
import { normalizeRoleBadgesPlacement } from "@/lib/profile-roles";
import { cn } from "@/lib/utils";
import {
  albumSidebarCardStyles,
  albumSidebarSurfaceLayerStyle,
  albumSidebarTitleGlow,
  resolveAlbumSidebarTheme,
} from "@/features/album/lib/effects/album-sidebar-theme";
import { AlbumSidebarConnections } from "@/features/album/components/public/AlbumSidebarConnections";
import type { AlbumConnectionsRow } from "@/features/album/types/album.types";

type Props = {
  profile: Profile;
  theme: AlbumTheme;
  className?: string;
};

function SidebarIdentity({
  profile,
  theme,
  aligned,
}: {
  profile: Profile;
  theme: AlbumTheme;
  aligned: boolean;
}) {
  const displayName = profile.display_name || profile.username;
  const showUsername = profile.show_username !== false;
  const showViewCount = profile.show_view_count !== false;
  const showPublicUid = profile.show_public_uid !== false;
  const badgePlacement = normalizeRoleBadgesPlacement(profile.role_badges_placement);
  const titleColor = theme.titleTextColor ?? "#fff";
  const mutedColor = theme.mutedTextColor ?? "rgba(255,255,255,0.45)";
  const bodyColor = theme.bodyTextColor ?? "rgba(255,255,255,0.72)";
  const titleGlow = albumSidebarTitleGlow(theme);
  const textAlign = aligned ? "left" : "center";

  return (
    <div
      className={cn("album-profile-sidebar__identity min-w-0", aligned ? "text-left" : "text-center")}
      style={{ textAlign }}
    >
      {badgePlacement === "inline_name" ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-2 gap-y-1",
            aligned ? "justify-start" : "justify-center",
          )}
        >
          <h1 className="album-profile-sidebar__name" style={{ color: titleColor, ...titleGlow }}>
            {displayName}
          </h1>
          <ProfileRoleBadges profile={profile} align={aligned ? "left" : "center"} className="album-profile-sidebar__badges" />
        </div>
      ) : (
        <h1 className="album-profile-sidebar__name" style={{ color: titleColor, ...titleGlow }}>
          {displayName}
        </h1>
      )}

      {showUsername ? (
        <p className="album-profile-sidebar__username" style={{ color: mutedColor }}>
          @{profile.username}
          {showPublicUid && profile.public_uid != null ? (
            <span className="opacity-60"> · #{profile.public_uid}</span>
          ) : null}
        </p>
      ) : null}

      {badgePlacement === "below_name" ? (
        <ProfileRoleBadges
          profile={profile}
          align={aligned ? "left" : "center"}
          className="album-profile-sidebar__badges"
        />
      ) : null}

      {profile.bio ? (
        <p className="album-profile-sidebar__bio" style={{ color: bodyColor }}>
          {profile.bio}
        </p>
      ) : null}

      {showViewCount ? (
        <p className="album-profile-sidebar__meta" style={{ color: mutedColor }}>
          {(profile.view_count ?? 0).toLocaleString()} views
        </p>
      ) : null}

      {badgePlacement === "below_socials" ? (
        <ProfileRoleBadges
          profile={profile}
          align={aligned ? "left" : "center"}
          className="album-profile-sidebar__badges"
        />
      ) : null}
    </div>
  );
}

function SidebarAvatar({ profile, size }: { profile: Profile; size: number }) {
  return (
    <AvatarWithFrame size={size} frameId={profile.avatar_frame_id}>
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="album-profile-sidebar__avatar"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="album-profile-sidebar__avatar album-profile-sidebar__avatar--empty"
          style={{ width: size, height: size }}
        />
      )}
    </AvatarWithFrame>
  );
}

export function AlbumProfileSidebar({ profile, theme, className }: Props) {
  const sidebar = resolveAlbumSidebarTheme(theme, profile);
  if (!sidebar.visible) return null;

  const avatarSize = profile.avatar_size ?? 88;
  const { shell, className: chromeClass } = albumSidebarCardStyles(theme, profile);
  const surface = albumSidebarSurfaceLayerStyle(sidebar);
  const aligned = sidebar.layout === "aligned";
  const frameOverflow = profile.avatar_frame_id
    ? Math.ceil(avatarSize * (AVATAR_FRAME_SCALE - 1) / 2)
    : 0;
  const avatarVisualSize = avatarSize + frameOverflow * 2;
  const avatarVisualH = avatarVisualSize;

  return (
    <aside
      className={cn("album-profile-sidebar-card relative overflow-visible", chromeClass, className)}
      style={shell}
    >
      {surface ? (
        <div
          aria-hidden
          className={cn(surface.className, "overflow-hidden")}
          style={surface.style}
        />
      ) : null}
      <div
        className={cn(
          "album-profile-sidebar relative z-[1]",
          aligned ? "album-profile-sidebar--aligned" : "album-profile-sidebar--centered",
        )}
      >
        {aligned ? (
          <div
            className="album-profile-sidebar__aligned-grid"
            style={{ gridTemplateColumns: `${avatarVisualSize}px minmax(0, 1fr)` }}
          >
            <div
              className="album-profile-sidebar__avatar-wrap flex items-center justify-center self-center"
              style={{ minHeight: avatarVisualH, minWidth: avatarVisualSize }}
            >
              <SidebarAvatar profile={profile} size={avatarSize} />
            </div>
            <div className="flex min-w-0 flex-col justify-center self-center" style={{ minHeight: avatarVisualH }}>
              <SidebarIdentity profile={profile} theme={theme} aligned />
            </div>
          </div>
        ) : (
          <>
            <div className="album-profile-sidebar__avatar-wrap flex justify-center" style={{ paddingTop: frameOverflow }}>
              <SidebarAvatar profile={profile} size={avatarSize} />
            </div>
            <SidebarIdentity profile={profile} theme={theme} aligned={false} />
          </>
        )}
      </div>
    </aside>
  );
}

export function AlbumStudioLayout({
  profile,
  theme,
  connections = null,
  children,
}: {
  profile: Profile;
  theme: AlbumTheme;
  connections?: AlbumConnectionsRow | null;
  children: React.ReactNode;
}) {
  const sidebar = resolveAlbumSidebarTheme(theme, profile);

  return (
    <div
      className={cn(
        "album-studio-layout",
        !sidebar.visible && "album-studio-layout--no-sidebar",
        sidebar.visible && !sidebar.showDivider && "album-studio-layout--no-divider",
      )}
    >
      {sidebar.visible ? (
        <div className="album-studio-layout__sidebar-col">
          <AlbumProfileSidebar profile={profile} theme={theme} />
          <AlbumSidebarConnections profile={profile} theme={theme} connections={connections} />
        </div>
      ) : null}
      {sidebar.visible && sidebar.showDivider ? (
        <div
          className="album-studio-layout__divider hidden lg:block"
          style={{ backgroundColor: sidebar.dividerColor }}
          aria-hidden
        />
      ) : null}
      <div className="album-studio-layout__main">{children}</div>
    </div>
  );
}
