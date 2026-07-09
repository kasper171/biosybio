import { createFileRoute } from "@tanstack/react-router";
import { AlbumStudio } from "@/features/album/components/editor/AlbumStudio";
import { DashboardAlbumRouteLayout } from "@/features/album/components/DashboardAlbumRouteLayout";
import "@/features/album/styles/album.css";

export const Route = createFileRoute("/_authenticated/dashboard/album")({
  component: AlbumStudioPage,
});

function AlbumStudioPage() {
  return (
    <DashboardAlbumRouteLayout>
      <AlbumStudio />
    </DashboardAlbumRouteLayout>
  );
}
