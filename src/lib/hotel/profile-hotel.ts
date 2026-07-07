import type { Profile } from "@/lib/profile-storage";
import { buildHotelAvatarUrl } from "@/lib/hotel/avatar";
import type { HotelPlatform, HotelProfileData } from "@/lib/hotel/types";

function legacyHabboFromProfile(profile: Profile) {
  if (profile.habbo_username && profile.habbo_figure) return null;
  if (profile.hotel_platform !== "habbo" || !profile.hotel_username || !profile.hotel_figure) {
    return null;
  }
  return {
    username: profile.hotel_username,
    domain: profile.hotel_domain,
    figure: profile.hotel_figure,
    motto: profile.hotel_motto,
    level: profile.hotel_level,
  };
}

function legacyHabbletFromProfile(profile: Profile) {
  if (profile.habblet_username && profile.habblet_figure) return null;
  if (profile.hotel_platform !== "habblet" || !profile.hotel_username || !profile.hotel_figure) {
    return null;
  }
  return {
    username: profile.hotel_username,
    figure: profile.hotel_figure,
    motto: profile.hotel_motto,
    achievementPoints: profile.hotel_achievement_points,
  };
}

export function profileToHabboData(profile: Profile): HotelProfileData | null {
  const legacy = legacyHabboFromProfile(profile);
  const username = profile.habbo_username ?? legacy?.username;
  const figure = profile.habbo_figure ?? legacy?.figure;
  if (!username || !figure) return null;

  const domain = profile.habbo_domain ?? legacy?.domain ?? "com.br";

  return {
    platform: "habbo",
    username,
    figure,
    motto: profile.habbo_motto ?? legacy?.motto ?? "",
    level: profile.habbo_level ?? legacy?.level ?? null,
    achievementPoints: null,
    avatar: buildHotelAvatarUrl("habbo", figure, domain),
    hotelDomain: domain,
  };
}

export function profileToHabbletData(profile: Profile): HotelProfileData | null {
  const legacy = legacyHabbletFromProfile(profile);
  const username = profile.habblet_username ?? legacy?.username;
  const figure = profile.habblet_figure ?? legacy?.figure;
  if (!username || !figure) return null;

  return {
    platform: "habblet",
    username,
    figure,
    motto: profile.habblet_motto ?? legacy?.motto ?? "",
    level: null,
    achievementPoints:
      profile.habblet_achievement_points ?? legacy?.achievementPoints ?? null,
    avatar: buildHotelAvatarUrl("habblet", figure),
    hotelDomain: null,
  };
}

export function listHotelConnections(profile: Profile): HotelProfileData[] {
  const list: HotelProfileData[] = [];
  const habbo = profileToHabboData(profile);
  const habblet = profileToHabbletData(profile);
  if (habbo) list.push(habbo);
  if (habblet) list.push(habblet);
  return list;
}

/** @deprecated use listHotelConnections */
export function profileToHotelData(profile: Profile): HotelProfileData | null {
  return listHotelConnections(profile)[0] ?? null;
}

export function habboDataToProfilePatch(data: HotelProfileData): Partial<Profile> {
  return {
    habbo_username: data.username,
    habbo_domain: data.hotelDomain,
    habbo_figure: data.figure,
    habbo_motto: data.motto,
    habbo_level: data.level,
  };
}

export function habbletDataToProfilePatch(data: HotelProfileData): Partial<Profile> {
  return {
    habblet_username: data.username,
    habblet_figure: data.figure,
    habblet_motto: data.motto,
    habblet_achievement_points: data.achievementPoints,
  };
}

export function hotelDataToProfilePatch(data: HotelProfileData): Partial<Profile> {
  return data.platform === "habbo"
    ? habboDataToProfilePatch(data)
    : habbletDataToProfilePatch(data);
}

export function clearHabboProfilePatch(): Partial<Profile> {
  return {
    habbo_username: null,
    habbo_domain: null,
    habbo_figure: null,
    habbo_motto: null,
    habbo_level: null,
    habbo_synced_at: null,
  };
}

export function clearHabbletProfilePatch(): Partial<Profile> {
  return {
    habblet_username: null,
    habblet_figure: null,
    habblet_motto: null,
    habblet_achievement_points: null,
    habblet_synced_at: null,
  };
}

export function clearHotelProfilePatch(platform: HotelPlatform): Partial<Profile> {
  return platform === "habbo" ? clearHabboProfilePatch() : clearHabbletProfilePatch();
}

export function isHabboConnected(profile: Profile): boolean {
  return profileToHabboData(profile) !== null;
}

export function isHabbletConnected(profile: Profile): boolean {
  return profileToHabbletData(profile) !== null;
}

export function isHotelConnected(profile: Profile): boolean {
  return isHabboConnected(profile) || isHabbletConnected(profile);
}
