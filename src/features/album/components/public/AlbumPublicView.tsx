import type { AlbumPublicPayload } from "@/features/album/services/albumPublicService.server";
import { AlbumGrid } from "@/features/album/components/editor/AlbumGrid";
import { AlbumStudioLayout } from "@/features/album/components/public/AlbumProfileSidebar";
import { albumPageStyle } from "@/features/album/lib/effects/album-profile-colors";

type Props = {
  payload: AlbumPublicPayload;
};

export function AlbumPublicView({ payload }: Props) {
  const { profile, layout, theme, connections } = payload;
  const pageStyle = albumPageStyle(theme);

  return (
    <div className="album-public-view" style={pageStyle}>
      <div className="album-public-view__inner">
        <AlbumStudioLayout profile={profile} theme={theme}>
          <AlbumGrid
            blocks={layout}
            theme={theme}
            mode="public"
            userId={profile.id}
            connections={connections}
          />
        </AlbumStudioLayout>
      </div>
    </div>
  );
}
