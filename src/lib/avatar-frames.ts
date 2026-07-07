import type { Profile } from "@/lib/profile-storage";
import { profileHasFullAccess } from "@/lib/profile-roles";

/** Quantidade de molduras gratuitas (ordenadas alfabeticamente) */
export const FREE_AVATAR_FRAME_COUNT = 50;

/** Escala da moldura em relação ao diâmetro do avatar — encaixa na borda */
export const AVATAR_FRAME_SCALE = 1.22;

export type AvatarFrame = {
  id: string;
  name: string;
  /** Nome original do arquivo em assets/molduras */
  file: string;
  /** Nome seguro servido em public/molduras (ex: 0138.png) */
  asset: string;
  url: string;
  index: number;
};

import catalog from "@/generated/avatar-frames.catalog.json";

export const AVATAR_FRAMES: AvatarFrame[] = catalog as AvatarFrame[];

const frameById = new Map(AVATAR_FRAMES.map((f) => [f.id, f]));

export function getAvatarFrameById(id: string | null | undefined): AvatarFrame | null {
  if (!id) return null;
  return frameById.get(id) ?? null;
}

export function getAvatarFrameUrl(id: string | null | undefined): string | null {
  return getAvatarFrameById(id)?.url ?? null;
}

export function isAvatarFrameLocked(
  frame: AvatarFrame,
  profileOrPremium: boolean | Pick<Profile, "is_premium" | "roles">,
): boolean {
  const hasAccess =
    typeof profileOrPremium === "boolean"
      ? profileOrPremium
      : profileHasFullAccess(profileOrPremium);
  return frame.index >= FREE_AVATAR_FRAME_COUNT && !hasAccess;
}

export function canUseAvatarFrame(
  frameId: string | null | undefined,
  profileOrPremium: boolean | Pick<Profile, "is_premium" | "roles">,
): boolean {
  if (!frameId) return true;
  const frame = getAvatarFrameById(frameId);
  if (!frame) return false;
  return !isAvatarFrameLocked(frame, profileOrPremium);
}
