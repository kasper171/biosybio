import type { Profile } from "@/lib/profile-storage";
import type { AlbumTheme } from "@/features/album/types/album.types";
import { ProfileRoleBadges } from "@/components/ProfileRoleBadges";
import { AvatarWithFrame } from "@/components/AvatarWithFrame";
import { normalizeRoleBadgesPlacement } from "@/lib/profile-roles";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  theme: AlbumTheme;
  className?: string;
};

export function AlbumProfileSidebar({ profile, theme, className }: Props) {
  const displayName = profile.display_name || profile.username;
  const showUsername = profile.show_username !== false;
  const showViewCount = profile.show_view_count !== false;
  const showPublicUid = profile.show_public_uid !== false;
  const badgePlacement = normalizeRoleBadgesPlacement(profile.role_badges_placement);
  const titleColor = theme.titleTextColor ?? "#fff";
  const mutedColor = theme.mutedTextColor ?? "rgba(255,255,255,0.45)";
  const avatarSize = profile.avatar_size ?? 88;

  return (
    <aside className={cn("album-profile-sidebar", className)}>
      <div className="album-profile-sidebar__avatar-wrap">
        <AvatarWithFrame size={avatarSize} frameId={profile.avatar_frame_id}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="album-profile-sidebar__avatar"
              style={{ width: avatarSize, height: avatarSize }}
            />
          ) : (
            <div
              className="album-profile-sidebar__avatar album-profile-sidebar__avatar--empty"
              style={{ width: avatarSize, height: avatarSize }}
            />
          )}
        </AvatarWithFrame>
      </div>

      <div className="album-profile-sidebar__identity">
        {badgePlacement === "inline_name" ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {showUsername ? (
              <h1 className="album-profile-sidebar__name" style={{ color: titleColor }}>
                {displayName}
              </h1>
            ) : null}
            <ProfileRoleBadges profile={profile} align="left" className="album-profile-sidebar__badges" />
          </div>
        ) : showUsername ? (
          <h1 className="album-profile-sidebar__name" style={{ color: titleColor }}>
            {displayName}
          </h1>
        ) : null}
        <p className="album-profile-sidebar__username" style={{ color: mutedColor }}>
          @{profile.username}
          {showPublicUid && profile.public_uid != null ? (
            <span className="opacity-60"> · #{profile.public_uid}</span>
          ) : null}
        </p>
      </div>

      {badgePlacement === "below_name" ? (
        <ProfileRoleBadges profile={profile} align="left" className="album-profile-sidebar__badges" />
      ) : null}

      {profile.bio ? (
        <p
          className="album-profile-sidebar__bio"
          style={{ color: theme.bodyTextColor ?? "rgba(255,255,255,0.72)" }}
        >
          {profile.bio}
        </p>
      ) : null}

      {showViewCount ? (
        <p className="album-profile-sidebar__meta" style={{ color: mutedColor }}>
          {(profile.view_count ?? 0).toLocaleString()} views
        </p>
      ) : null}

      {badgePlacement === "below_socials" ? (
        <ProfileRoleBadges profile={profile} align="left" className="album-profile-sidebar__badges" />
      ) : null}
    </aside>
  );
}

export function AlbumStudioLayout({
  profile,
  theme,
  children,
}: {
  profile: Profile;
  theme: AlbumTheme;
  children: React.ReactNode;
}) {
  return (
    <div className="album-studio-layout">
      <AlbumProfileSidebar profile={profile} theme={theme} />
      <div className="album-studio-layout__main">{children}</div>
    </div>
  );
}
