const OTP_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** Tempo de espera antes de liberar o botão Validar */
export const DISCORD_OTP_WAIT_MS = 50_000;
/** Janela para validar após a espera */
export const DISCORD_OTP_VALIDATE_WINDOW_MS = 120_000;
export const LANYARD_INVITE_URL = "https://discord.gg/lanyard";

export type DiscordVerifyError =
  | "invalid_id"
  | "profile_not_found"
  | "not_in_lanyard"
  | "code_not_found"
  | "expired"
  | "waiting"
  | "network";

export const DISCORD_VERIFY_MESSAGES: Record<DiscordVerifyError, string> = {
  invalid_id: "ID do Discord inválido.",
  profile_not_found: "Não foi possível encontrar este perfil do Discord.",
  not_in_lanyard: "Você não está no servidor Lanyard.",
  code_not_found: "O código não foi encontrado na descrição do seu perfil.",
  expired: "O código expirou. Gere um novo código e tente novamente.",
  waiting: "Aguarde 50 segundos antes de validar.",
  network: "Falha ao validar. Tente novamente em instantes.",
};

export function generateDiscordOtp(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += OTP_CHARS[Math.floor(Math.random() * OTP_CHARS.length)];
  }
  return code;
}

function extractBio(payload: unknown): string | null {
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
  return extractBio(json);
}

export async function checkLanyardUser(userId: string): Promise<boolean> {
  const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: "no-store" });
  if (!res.ok) return false;
  const json = await res.json();
  return Boolean(json?.success && json?.data?.discord_user?.id);
}

export function bioContainsOtp(bio: string, otp: string): boolean {
  return bio.toUpperCase().includes(otp.toUpperCase());
}

export async function verifyDiscordOwnership(
  userId: string,
  otp: string,
  unlockAt: number,
  expiresAt: number,
): Promise<{ ok: true } | { ok: false; error: DiscordVerifyError }> {
  if (!/^\d{15,22}$/.test(userId)) {
    return { ok: false, error: "invalid_id" };
  }
  const now = Date.now();
  if (now < unlockAt) {
    return { ok: false, error: "waiting" };
  }
  if (now > expiresAt) {
    return { ok: false, error: "expired" };
  }

  try {
    const [inLanyard, bio] = await Promise.all([
      checkLanyardUser(userId),
      fetchDiscordBio(userId),
    ]);

    if (!inLanyard) {
      return { ok: false, error: "not_in_lanyard" };
    }
    if (bio === null) {
      return { ok: false, error: "profile_not_found" };
    }
    if (!bioContainsOtp(bio, otp)) {
      return { ok: false, error: "code_not_found" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}
