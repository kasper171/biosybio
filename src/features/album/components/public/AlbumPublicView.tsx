import type { AlbumPublicPayload } from "@/features/album/services/albumPublicService.server";
import { AlbumGrid } from "@/features/album/components/editor/AlbumGrid";
import { albumPageStyle } from "@/features/album/lib/effects/album-profile-colors";

type Props = {
  payload: AlbumPublicPayload;
};

export function AlbumPublicView({ payload }: Props) {
  const { meta, layout, theme, connections } = payload;
  const pageStyle = albumPageStyle(theme);

  return (
    <div className="album-public-view" style={pageStyle}>
      <div className="album-public-view__inner">
        <header className="album-public-header">
          {meta.avatarUrl ? (
            <img src={meta.avatarUrl} alt="" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-white/10" />
          )}
          <div>
            {meta.showUsername ? (
              <h1
                className="text-xl font-bold"
                style={{ color: theme.titleTextColor ?? "#fff" }}
              >
                {meta.displayName ?? meta.username}
              </h1>
            ) : null}
            {meta.showViewCount ? (
              <p className="text-xs text-white/40">{meta.viewCount.toLocaleString()} views</p>
            ) : null}
          </div>
        </header>

        <AlbumGrid
          blocks={layout}
          theme={theme}
          mode="public"
          userId={meta.userId}
          connections={connections}
        />
      </div>
    </div>
  );
}
