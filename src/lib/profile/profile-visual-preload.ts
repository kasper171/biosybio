import type { Profile } from "@/lib/profile-storage";

export const PROFILE_VISUAL_PRELOAD_MS = 450;

function preloadImage(url: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timer = window.setTimeout(finish, timeoutMs);

    img.onload = () => {
      window.clearTimeout(timer);
      if (typeof img.decode === "function") {
        void img.decode().then(finish).catch(finish);
        return;
      }
      finish();
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      finish();
    };

    img.src = url;
  });
}

type TapVisualProfile = Pick<
  Profile,
  | "background_url"
  | "avatar_url"
  | "music_url"
  | "tap_to_reveal_enabled"
  | "tap_reveal_mode"
>;

/** Pré-carrega wallpaper/avatar do tap-to-reveal com teto de tempo (não bloqueia indefinidamente). */
export async function warmupProfileTapVisuals(
  profile: TapVisualProfile,
  options?: { timeoutMs?: number },
): Promise<void> {
  const timeoutMs = options?.timeoutMs ?? PROFILE_VISUAL_PRELOAD_MS;
  const tapEnabled = Boolean(profile.music_url) || profile.tap_to_reveal_enabled === true;
  if (!tapEnabled) return;

  const urls: string[] = [];
  const background = profile.background_url?.trim();
  if (background) urls.push(background);

  const showAvatar = (profile.tap_reveal_mode ?? "avatar_text") === "avatar_text";
  const avatar = profile.avatar_url?.trim();
  if (showAvatar && avatar) urls.push(avatar);

  if (urls.length === 0) return;

  await Promise.all(urls.map((url) => preloadImage(url, timeoutMs)));
}
