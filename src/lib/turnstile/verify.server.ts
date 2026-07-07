type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  action?: string;
  hostname?: string;
};

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    console.error("[Turnstile] TURNSTILE_SECRET_KEY não configurada no servidor.");
    return false;
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    console.error("[Turnstile] siteverify HTTP", res.status);
    return false;
  }

  const data = (await res.json()) as TurnstileVerifyResponse;
  if (!data.success) {
    console.warn("[Turnstile] verificação falhou:", data["error-codes"]?.join(", ") ?? "unknown");
  }
  return data.success === true;
}
