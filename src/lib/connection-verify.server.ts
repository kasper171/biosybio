import { fetchHabboProfile } from "@/lib/hotel/habbo-service";
import { fetchHabbletProfile } from "@/lib/hotel/habblet-service";
import type { HotelProfileData } from "@/lib/hotel/types";
import { isOtpTimingValid, textContainsOtp } from "@/lib/connection-verify";

export type ConnectionVerifyError =
  | "invalid_id"
  | "invalid_username"
  | "invalid_hotel"
  | "profile_not_found"
  | "user_not_found"
  | "not_in_lanyard"
  | "code_not_found"
  | "expired"
  | "waiting"
  | "network";

function extractDiscordBio(payload: unknown): string | null {
  const root = (payload as { data?: unknown })?.data ?? payload;
  const obj = root as {
    user_profile?: { bio?: string | null };
    user?: { bio?: string | null };
  };
  const bio = obj?.user_profile?.bio ?? obj?.user?.bio ?? null;
  return typeof bio === "string" ? bio : null;
}

export async function fetchDiscordBio(userId: string): Promise<string | null> {
  const res = await fetch(`https://dcdn.dstn.to/profile/${userId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return extractDiscordBio(json);
}

export async function checkLanyardUser(userId: string): Promise<boolean> {
  const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: "no-store" });
  if (!res.ok) return false;
  const json = await res.json();
  return Boolean(json?.success && json?.data?.discord_user?.id);
}

export async function verifyDiscordOwnershipServer(
  userId: string,
  otp: string,
  unlockAt: number,
  expiresAt: number,
): Promise<{ ok: true } | { ok: false; error: ConnectionVerifyError }> {
  if (!/^\d{15,22}$/.test(userId)) {
    return { ok: false, error: "invalid_id" };
  }

  const timing = isOtpTimingValid(unlockAt, expiresAt);
  if (timing === "waiting") return { ok: false, error: "waiting" };
  if (timing === "expired") return { ok: false, error: "expired" };

  try {
    const [inLanyard, bio] = await Promise.all([
      checkLanyardUser(userId),
      fetchDiscordBio(userId),
    ]);

    if (!inLanyard) return { ok: false, error: "not_in_lanyard" };
    if (bio === null) return { ok: false, error: "profile_not_found" };
    if (!textContainsOtp(bio, otp)) return { ok: false, error: "code_not_found" };
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function verifyHotelOwnershipServer(
  platform: "habbo" | "habblet",
  username: string,
  hotelDomain: string | null,
  otp: string,
  unlockAt: number,
  expiresAt: number,
): Promise<
  { ok: true; profile: HotelProfileData } | { ok: false; error: ConnectionVerifyError }
> {
  const trimmed = username.trim();
  if (trimmed.length < 2) {
    return { ok: false, error: "invalid_username" };
  }

  const timing = isOtpTimingValid(unlockAt, expiresAt);
  if (timing === "waiting") return { ok: false, error: "waiting" };
  if (timing === "expired") return { ok: false, error: "expired" };

  try {
    const result =
      platform === "habblet"
        ? await fetchHabbletProfile(trimmed, { fresh: true })
        : await fetchHabboProfile(trimmed, hotelDomain ?? "com.br", { fresh: true });

    if (!result.ok) {
      if (result.error === "user_not_found") return { ok: false, error: "user_not_found" };
      if (result.error === "invalid_hotel") return { ok: false, error: "invalid_hotel" };
      return { ok: false, error: "network" };
    }

    const motto = result.data.motto ?? "";
    if (!textContainsOtp(motto, otp)) {
      return { ok: false, error: "code_not_found" };
    }

    return { ok: true, profile: result.data };
  } catch {
    return { ok: false, error: "network" };
  }
}
