/** Domínio canônico de produção (com www). */
export const SITE_DOMAIN = "www.byosy.bio";

/** Origem HTTPS do site em produção. */
export const SITE_ORIGIN = `https://${SITE_DOMAIN}`;

/** Prefixo exibido nos inputs de username (sem https). */
export const SITE_PROFILE_PREFIX = "byosy.bio/";

export function getSiteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return SITE_ORIGIN;
}

export function profilePublicUrl(username: string): string {
  return `${getSiteOrigin()}/${username}`;
}

export function profileDisplayPath(username: string): string {
  return `${SITE_PROFILE_PREFIX}${username}`;
}
