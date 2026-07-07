import {
  mapCloudflareTurnstileError,
  type TurnstileVerifyErrorCode,
} from "@/lib/turnstile/errors";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  action?: string;
  hostname?: string;
};

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; code: TurnstileVerifyErrorCode };

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    console.error("[Turnstile] TURNSTILE_SECRET_KEY não configurada no servidor.");
    return { ok: false, code: "missing_secret" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  let res: Response;
  try {
    res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    console.error("[Turnstile] siteverify network error:", err);
    return { ok: false, code: "network" };
  }

  if (!res.ok) {
    console.error("[Turnstile] siteverify HTTP", res.status);
    return { ok: false, code: "network" };
  }

  let data: TurnstileVerifyResponse;
  try {
    data = (await res.json()) as TurnstileVerifyResponse;
  } catch {
    return { ok: false, code: "network" };
  }

  if (data.success) return { ok: true };

  const code = mapCloudflareTurnstileError(data["error-codes"]);
  console.warn(
    "[Turnstile] verificação falhou:",
    data["error-codes"]?.join(", ") ?? "unknown",
    data.hostname ? `hostname=${data.hostname}` : "",
  );
  return { ok: false, code };
}
