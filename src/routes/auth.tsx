import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAuthNotice } from "@/lib/auth-errors";
import { signUpFn } from "@/lib/auth/auth.functions";
import { PASSWORD_RULES } from "@/lib/auth/password-policy";
import { profileDisplayPath, SITE_NAME, SITE_PROFILE_PREFIX } from "@/lib/site";
import {
  cleanUsername,
  isUsernameTaken,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  usernameLengthError,
} from "@/lib/username";
import { toast } from "sonner";
import { z } from "zod";
import { Check, X } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  username: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: `Sign in — ${SITE_NAME}` },
      { name: "description", content: `Sign in or create your ${SITE_NAME} account.` },
    ],
  }),
  component: AuthPage,
});

async function trySignIn(email: string, password: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  return !error;
}

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
  const submittingRef = useRef(false);
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
    passedCount <= 2 ? "weak" : passedCount === 3 || passedCount === 4 ? "medium" : "strong";
  const strengthColor =
    strength === "weak"
      ? "oklch(0.65 0.25 25)"
      : strength === "medium"
        ? "oklch(0.75 0.18 85)"
        : "oklch(0.72 0.20 145)";
  const strengthPct = (passedCount / PASSWORD_RULES.length) * 100;

  const notify = (
    notice: { title: string; description?: string },
    type: "error" | "success" = "error",
  ) => {
    setFormNotice({ ...notice, type });
    if (type === "error") {
      toast.error(notice.title, notice.description ? { description: notice.description } : undefined);
    } else {
      toast.success(notice.title, notice.description ? { description: notice.description } : undefined);
    }
  };

  const switchMode = (next: "signin" | "signup") => {
    setFormNotice(null);
    setMode(next);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setFormNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const cleanUser = cleanUsername(username);
        const lengthError = usernameLengthError(cleanUser);
        if (lengthError) {
          notify({ title: "Invalid username", description: lengthError });
          return;
        }
        if (passedCount < PASSWORD_RULES.length) {
          notify({
            title: "Incomplete password",
            description: "Your password must meet all the requirements below.",
          });
          return;
        }

        const { taken } = await isUsernameTaken(cleanUser);
        if (taken) {
          if (await trySignIn(email, password)) {
            notify(
              { title: "Account found!", description: "Signing in with this email and password..." },
              "success",
            );
            navigate({ to: "/dashboard" });
            return;
          }
          notify({
            title: "Username already taken",
            description: `${profileDisplayPath(cleanUser)} is already in use. If you just tried to sign up, use Sign in.`,
          });
          return;
        }

        const result = await signUpFn({
          data: { email, password, username: cleanUser },
        });

        if (!result.ok) {
          if ("tryLogin" in result && result.tryLogin && (await trySignIn(email, password))) {
            notify(
              { title: "Account found!", description: "Signing in with this email and password..." },
              "success",
            );
            navigate({ to: "/dashboard" });
            return;
          }
          notify({ title: "Could not create account", description: result.error });
          return;
        }

        const signedIn = await trySignIn(email, password);
        if (signedIn) {
          notify({ title: "Account created!", description: "Redirecting to dashboard..." }, "success");
          navigate({ to: "/dashboard" });
          return;
        }

        notify(
          {
            title: "Account created",
            description: "Use Sign in with this email and password to access the dashboard.",
          },
          "success",
        );
        setMode("signin");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      notify({ title: "Signed in!", description: "Redirecting..." }, "success");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const notice = getAuthNotice(err);
      notify(notice);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      mode={mode}
      title={mode === "signin" ? "Welcome back" : "Create your account"}
      subtitle={
        mode === "signin"
          ? "Sign in to manage your profile"
          : "Start building your profile in seconds"
      }
      onModeChange={switchMode}
      footer={
        <p className="auth-page__switch">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="auth-page__switch-btn"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      }
    >
      <form onSubmit={handleEmail} className="space-y-0">
        {mode === "signup" && (
          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="auth-username">
              Username
            </label>
            <div className="auth-page__username">
              <span className="auth-page__username-prefix">{SITE_PROFILE_PREFIX}</span>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(cleanUsername(e.target.value))}
                placeholder="yourname"
                required
                minLength={MIN_USERNAME_LENGTH}
                maxLength={MAX_USERNAME_LENGTH}
                autoComplete="username"
                className="auth-page__username-input"
              />
            </div>
          </div>
        )}

        <div className="auth-page__field">
          <label className="auth-page__label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@email.com"
            className="auth-page__input"
          />
        </div>

        <div className="auth-page__field">
          <label className="auth-page__label" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "signup" ? 8 : 6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="••••••••"
            className="auth-page__input"
          />
          {mode === "signup" && password.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${strengthPct}%`, background: strengthColor }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Password strength</span>
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
                    {c.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span className={c.ok ? "line-through opacity-80" : ""}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="auth-page__submit">
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        {formNotice && (
          <div
            role="alert"
            className={`auth-page__notice ${
              formNotice.type === "success" ? "auth-page__notice--success" : "auth-page__notice--error"
            }`}
          >
            <p className="font-medium">{formNotice.title}</p>
            {formNotice.description && (
              <p className="mt-0.5 text-xs text-white/70">{formNotice.description}</p>
            )}
          </div>
        )}
      </form>
    </AuthPageShell>
  );
}
