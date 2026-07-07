import { buildHabboAvatarUrl } from "@/lib/hotel/avatar";
import { getHabboHotel, normalizeHabboHotelDomain } from "@/lib/hotel/hotels";
import type { HotelFetchResult, HotelProfileData } from "@/lib/hotel/types";

type HabboApiUser = {
  name?: string;
  figureString?: string;
  motto?: string;
  currentLevel?: number;
};

export async function fetchHabboProfile(
  username: string,
  hotelDomain: string,
): Promise<HotelFetchResult> {
  const name = username.trim();
  if (!name) {
    return { ok: false, error: "invalid_username", message: "Nome inválido" };
  }

  const domain = normalizeHabboHotelDomain(hotelDomain);
  if (!getHabboHotel(domain)) {
    return { ok: false, error: "invalid_hotel", message: "Hotel inválido" };
  }

  const url = `https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(name)}&_cb=${Date.now()}`;

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
      message: "Não foi possível contactar o Habbo Hotel",
    };
  }

  if (response.status === 404) {
    return { ok: false, error: "user_not_found", message: "Jogador não encontrado" };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: "service_unavailable",
      message: `Habbo retornou erro (${response.status})`,
    };
  }

  let payload: HabboApiUser | HabboApiUser[];
  try {
    payload = await response.json();
  } catch {
    return { ok: false, error: "service_unavailable", message: "Resposta inválida do Habbo" };
  }

  const user = Array.isArray(payload) ? payload[0] : payload;
  if (!user?.name || !user.figureString) {
    return { ok: false, error: "user_not_found", message: "Jogador não encontrado" };
  }

  const data: HotelProfileData = {
    platform: "habbo",
    username: user.name,
    figure: user.figureString,
    motto: user.motto ?? "",
    level: typeof user.currentLevel === "number" ? user.currentLevel : null,
    achievementPoints: null,
    avatar: buildHabboAvatarUrl(user.figureString, domain),
    hotelDomain: domain,
  };

  return { ok: true, data };
}
