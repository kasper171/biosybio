import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAuthNotice, isExistingEmailSignup } from "@/lib/auth-errors";
import { signUpWithTurnstileFn } from "@/lib/auth/auth.functions";
import { profileDisplayPath, SITE_PROFILE_PREFIX } from "@/lib/site";
import { cleanUsername, isUsernameTaken, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, usernameLengthError } from "@/lib/username";
import { toast } from "sonner";
import { z } from "zod";
import { Check, X } from "lucide-react";
import { TurnstileWidget, resetTurnstileWidget, type TurnstileWidgetHandle } from "@/components/TurnstileWidget";
import { isTurnstileEnabled } from "@/lib/turnstile/config";

type Rule = { label: string; test: (p: string) => boolean };
const PASSWORD_RULES: Rule[] = [
  { label: "Pelo menos 8 caracteres", test: (p) => p.length >= 8 },
  { label: "Uma letra maiúscula (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Uma letra minúscula (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "Um número (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "Um caractere especial (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  username: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Entrar — Biosy" },
      { name: "description", content: "Entre ou crie sua conta na Biosy." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode, username: initialUsername } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(() =>
    initialUsername ? cleanUsername(initialUsername) : "",
  );
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [formNotice, setFormNotice] = useState<{
    type: "error" | "success";
    title: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
    if (initialUsername) {
      const clean = cleanUsername(initialUsername);
      if (clean) setUsername(clean);
    }
  }, [initialMode, initialUsername]);

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(password) })),
    [password],
  );
  const passedCount = passwordChecks.filter((c) => c.ok).length;
  const strength =
    passedCount <= 2 ? "fraca" : passedCount === 3 || passedCount === 4 ? "média" : "forte";
  const strengthColor =
    strength === "fraca"
      ? "oklch(0.65 0.25 25)"
      : strength === "média"
      ? "oklch(0.75 0.18 85)"
      : "oklch(0.72 0.20 145)";
  const strengthPct = (passedCount / PASSWORD_RULES.length) * 100;

  const notify = (notice: { title: string; description?: string }, type: "error" | "success" = "error") => {
    setFormNotice({ ...notice, type });
    if (type === "error") {
      toast.error(notice.title, notice.description ? { description: notice.description } : undefined);
    } else {
      toast.success(notice.title, notice.description ? { description: notice.description } : undefined);
    }
  };

  const handleTurnstileExpire = useCallback(() => {
    // token expirado — novo token é pedido ao enviar o formulário
  }, []);

  const handleTurnstileError = useCallback(() => {
    notify({
      title: "Verificação do Cloudflare falhou",
      description:
        "Recarregue a página e tente novamente. Se persistir, teste outro navegador ou rede.",
    });
  }, []);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const cleanUser = cleanUsername(username);
        const lengthError = usernameLengthError(cleanUser);
        if (lengthError) {
          notify({ title: "Nome de usuário inválido", description: lengthError });
          return;
        }
        if (passedCount < PASSWORD_RULES.length) {
          notify({ title: "Senha incompleta", description: "Sua senha precisa atender a todos os requisitos abaixo." });
          return;
        }

        const { taken } = await isUsernameTaken(cleanUser);
        if (taken) {
          notify({
            title: "Usuário já existente",
            description: `${profileDisplayPath(cleanUser)} já está em uso. Escolha outro.`,
          });
          return;
        }

        if (isTurnstileEnabled()) {
          let turnstileToken: string | undefined;
          try {
            turnstileToken = await turnstileRef.current?.requestToken();
          } catch (err) {
            notify({
              title: "Verificação necessária",
              description:
                err instanceof Error
                  ? err.message
                  : "Marque o check de segurança antes de criar a conta.",
            });
            return;
          }

          if (!turnstileToken) {
            notify({
              title: "Verificação necessária",
              description: "Marque o check de segurança antes de criar a conta.",
            });
            return;
          }

          const result = await signUpWithTurnstileFn({
            data: {
              email,
              password,
              username: cleanUser,
              turnstileToken,
            },
          });

          if (!result.ok) {
            notify({ title: "Não foi possível criar a conta", description: result.error });
            return;
          }

          if (result.needsEmailConfirmation) {
            notify(
              {
                title: "Conta criada!",
                description: `Enviamos um link de confirmação para ${email}. Confira sua caixa de entrada.`,
              },
              "success",
            );
            return;
          }

          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          notify({ title: "Conta criada!", description: "Redirecionando para o painel..." }, "success");
          navigate({ to: "/dashboard" });
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { username: cleanUser, display_name: cleanUser },
          },
        });
        if (error) throw error;

        if (isExistingEmailSignup(data.user)) {
          notify({
            title: "Este email já está cadastrado",
            description: "Tente entrar com sua senha ou use outro email.",
          });
          setMode("signin");
          return;
        }

        if (!data.session) {
          notify(
            {
              title: "Conta criada!",
              description: `Enviamos um link de confirmação para ${email}. Confira sua caixa de entrada.`,
            },
            "success",
          );
          return;
        }

        notify({ title: "Conta criada!", description: "Redirecionando para o painel..." }, "success");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        notify({ title: "Login realizado!", description: "Redirecionando..." }, "success");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      resetTurnstileWidget();
      const notice = getAuthNotice(err);
      notify(notice);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold">Biosy</Link>
          <h1 className="mt-6 text-2xl font-bold">
            {mode === "signin" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {mode === "signin" ? "Entre para gerenciar seu perfil" : "Comece a criar seu perfil em segundos"}
          </p>
        </div>

        <div className="card-surface rounded-2xl p-6">
          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-xs text-white/60">Nome de usuário</label>
                <div className="flex items-center rounded-lg border border-white/15 bg-white/5 px-3">
                  <span className="text-sm text-white/40">{SITE_PROFILE_PREFIX}</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(cleanUsername(e.target.value))}
                    placeholder="seunome"
                    required
                    minLength={MIN_USERNAME_LENGTH}
                    maxLength={MAX_USERNAME_LENGTH}
                    className="w-full bg-transparent py-2.5 text-sm outline-none"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs text-white/60">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-pink-hot/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 8 : 6}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-pink-hot/60"
              />
              {mode === "signup" && password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${strengthPct}%`, background: strengthColor }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Força da senha</span>
                    <span className="font-semibold capitalize" style={{ color: strengthColor }}>
                      {strength}
                    </span>
                  </div>
                  <ul className="space-y-1 pt-1">
                    {passwordChecks.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center gap-2 text-xs transition-colors"
                        style={{ color: c.ok ? "oklch(0.72 0.20 145)" : "rgba(255,255,255,0.45)" }}
                      >
                        {c.ok ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        <span className={c.ok ? "line-through opacity-80" : ""}>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {mode === "signup" && isTurnstileEnabled() && (
              <div className="flex justify-center py-1">
                <TurnstileWidget
                  ref={turnstileRef}
                  action="signup"
                  onExpire={handleTurnstileExpire}
                  onError={handleTurnstileError}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="glow-pink w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}
            >
              {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
            </button>

            {formNotice && (
              <div
                role="alert"
                className="rounded-lg border px-3 py-2.5 text-sm"
                style={{
                  borderColor:
                    formNotice.type === "success"
                      ? "oklch(0.72 0.20 145 / 0.45)"
                      : "oklch(0.65 0.25 25 / 0.45)",
                  background:
                    formNotice.type === "success"
                      ? "oklch(0.72 0.20 145 / 0.12)"
                      : "oklch(0.65 0.25 25 / 0.12)",
                }}
              >
                <p className="font-medium">{formNotice.title}</p>
                {formNotice.description && (
                  <p className="mt-0.5 text-xs text-white/70">{formNotice.description}</p>
                )}
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            {mode === "signin" ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={() => {
                setFormNotice(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="font-semibold text-pink-hot hover:underline"
              style={{ color: "oklch(0.65 0.28 0)" }}
            >
              {mode === "signin" ? "Cadastre-se" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
