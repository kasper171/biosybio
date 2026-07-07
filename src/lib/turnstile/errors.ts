export type TurnstileVerifyErrorCode =
  | "missing_secret"
  | "invalid_token"
  | "hostname_mismatch"
  | "timeout_or_duplicate"
  | "network"
  | "unknown";

const CLOUDFLARE_ERROR_MAP: Record<string, TurnstileVerifyErrorCode> = {
  "missing-input-secret": "missing_secret",
  "invalid-input-secret": "missing_secret",
  "missing-input-response": "invalid_token",
  "invalid-input-response": "invalid_token",
  "bad-request": "invalid_token",
  "timeout-or-duplicate": "timeout_or_duplicate",
  "hostname-mismatch": "hostname_mismatch",
  "internal-error": "network",
};

export function mapCloudflareTurnstileError(
  codes: string[] | undefined,
): TurnstileVerifyErrorCode {
  if (!codes?.length) return "unknown";
  for (const code of codes) {
    const mapped = CLOUDFLARE_ERROR_MAP[code];
    if (mapped) return mapped;
  }
  return "unknown";
}

export function getTurnstileUserMessage(code: TurnstileVerifyErrorCode): string {
  switch (code) {
    case "missing_secret":
      return "Verificação de segurança indisponível no servidor. Tente novamente mais tarde.";
    case "hostname_mismatch":
      return "Este domínio não está autorizado no Cloudflare Turnstile. Avise o suporte do site.";
    case "timeout_or_duplicate":
      return "A verificação expirou ou já foi usada. Marque o check de segurança novamente.";
    case "invalid_token":
      return "Verificação inválida (comum no Brave). Desative os Shields do site ou use o Chrome.";
    case "network":
      return "Não foi possível contactar o Cloudflare. Verifique sua internet e tente de novo.";
    default:
      return "Verificação falhou. No Brave, desative os Shields para byosy.bio e recarregue. Ou use o Chrome.";
  }
}
