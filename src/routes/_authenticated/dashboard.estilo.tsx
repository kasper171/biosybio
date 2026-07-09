import { createFileRoute } from "@tanstack/react-router";
import { ProfileStylePicker } from "@/features/album/components/style/ProfileStylePicker";
import "@/features/album/styles/album.css";

export const Route = createFileRoute("/_authenticated/dashboard/estilo")({
  component: EstiloPage,
});

function EstiloPage() {
  return <ProfileStylePicker />;
}
