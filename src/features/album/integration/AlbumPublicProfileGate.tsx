import type { ReactNode } from "react";
import { AlbumPublicView } from "@/features/album/components/public/AlbumPublicView";
import { fetchAlbumPublicByUsernameFn } from "@/features/album/services/album.functions";

type Props = {
  username: string;
  cardFallback: ReactNode;
};

/**
 * Glue gate: if profile style is album, render AlbumPublicView; otherwise Card Normal unchanged.
 */
export function AlbumPublicProfileGate({ username, cardFallback }: Props) {
  return <AlbumPublicProfileGateLoader username={username} cardFallback={cardFallback} />;
}

function AlbumPublicProfileGateLoader({ username, cardFallback }: Props) {
  // Client-side branch via server fn on mount would flash; parent route should prefer loader.
  // This component is used with useAlbumPublicBranch hook from integration.
  return <>{cardFallback}</>;
}

export async function loadAlbumPublicOrNull(username: string) {
  return fetchAlbumPublicByUsernameFn({ data: { username } });
}
