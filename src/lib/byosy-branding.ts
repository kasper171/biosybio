import type { Profile } from "@/lib/profile-storage";
import { profileHasFullAccess } from "@/lib/profile-roles";

/** Marca "by Byosy" visível por padrão; Premium pode ocultar. */
export function shouldShowByosyBranding(
  profile: Pick<Profile, "hide_byosy_branding"> & Parameters<typeof profileHasFullAccess>[0],
): boolean {
  if (profileHasFullAccess(profile) && profile.hide_byosy_branding === true) {
    return false;
  }
  return true;
}

export function canToggleByosyBranding(
  profile: Parameters<typeof profileHasFullAccess>[0],
): boolean {
  return profileHasFullAccess(profile);
}
