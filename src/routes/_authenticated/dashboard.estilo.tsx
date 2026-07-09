import { createFileRoute } from "@tanstack/react-router";
import { ProfileStylePicker } from "@/features/album/components/style/ProfileStylePicker";
import { DashboardAlbumRouteLayout } from "@/features/album/components/DashboardAlbumRouteLayout";
import "@/features/album/styles/album.css";

export const Route = createFileRoute("/_authenticated/dashboard/estilo")({
  component: EstiloPage,
});

function EstiloPage() {
  return (
    <DashboardAlbumRouteLayout>
      <ProfileStylePicker />
    </DashboardAlbumRouteLayout>
  );
}
