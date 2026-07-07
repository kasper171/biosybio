/** Registro de hotéis Habbo — adicione novos itens aqui */
export type HabboHotel = {
  id: string;
  label: string;
  domain: string;
};

export const HABBO_HOTELS: HabboHotel[] = [
  { id: "com", label: "Habbo.com (INT)", domain: "com" },
  { id: "com.br", label: "Habbo Brasil", domain: "com.br" },
  { id: "es", label: "Habbo España", domain: "es" },
  { id: "fr", label: "Habbo France", domain: "fr" },
  { id: "de", label: "Habbo Deutschland", domain: "de" },
  { id: "fi", label: "Habbo Suomi", domain: "fi" },
  { id: "it", label: "Habbo Italia", domain: "it" },
  { id: "nl", label: "Habbo Nederland", domain: "nl" },
  { id: "com.tr", label: "Habbo Türkiye", domain: "com.tr" },
];

export function getHabboHotel(domain: string): HabboHotel | undefined {
  return HABBO_HOTELS.find((h) => h.domain === domain);
}

export function normalizeHabboHotelDomain(domain: unknown): string {
  const d = String(domain ?? "").trim();
  return getHabboHotel(d)?.domain ?? HABBO_HOTELS[0].domain;
}

/** Rótulo discreto do hotel exibido no card (ex: habbo.com.br, habblet.city) */
export function getHotelPlatformLabel(data: {
  platform: "habbo" | "habblet";
  hotelDomain?: string | null;
}): string {
  if (data.platform === "habblet") return "habblet.city";
  const domain = normalizeHabboHotelDomain(data.hotelDomain ?? "com.br");
  return `habbo.${domain}`;
}
