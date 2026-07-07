import { buildHabbletAvatarUrl } from "@/lib/hotel/avatar";
import type { HotelFetchResult, HotelProfileData } from "@/lib/hotel/types";

type HabbletApiUser = {
  username?: string;
  figure?: string;
  motto?: string;
  achievementPoints?: number;
};

export async function fetchHabbletProfile(username: string): Promise<HotelFetchResult> {
  const name = username.trim();
  if (!name) {
    return { ok: false, error: "invalid_username", message: "Nome inválido" };
  }

  const url = `https://api.habblet.city/player/${encodeURIComponent(name)}?_cb=${Date.now()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store",
        Pragma: "no-cache",
      },
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    return {
      ok: false,
      error: "service_unavailable",
      message: "Não foi possível contactar o Habblet",
    };
  }

  if (response.status === 404) {
    return { ok: false, error: "user_not_found", message: "Jogador não encontrado" };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: "service_unavailable",
      message: `Habblet retornou erro (${response.status})`,
    };
  }

  let user: HabbletApiUser;
  try {
    user = await response.json();
  } catch {
    return { ok: false, error: "service_unavailable", message: "Resposta inválida do Habblet" };
  }

  if (!user?.username || !user.figure) {
    return { ok: false, error: "user_not_found", message: "Jogador não encontrado" };
  }

  const data: HotelProfileData = {
    platform: "habblet",
    username: user.username,
    figure: user.figure,
    motto: user.motto ?? "",
    level: null,
    achievementPoints:
      typeof user.achievementPoints === "number" ? user.achievementPoints : null,
    avatar: buildHabbletAvatarUrl(user.figure),
    hotelDomain: null,
  };

  return { ok: true, data };
}
