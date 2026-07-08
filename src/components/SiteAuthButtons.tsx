import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  /** header = nav da landing; cta = botão grande de call-to-action */
  variant?: "header" | "cta";
  className?: string;
};

const gradientBtn =
  "glow-pink flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white";
const gradientStyle = {
  background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))",
};

export function SiteAuthButtons({ variant = "header", className }: Props) {
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useAuthSession();
  const { t } = useI18n();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) {
    return <div className={cn("h-10 w-28", className)} aria-hidden />;
  }

  if (isLoggedIn) {
    if (variant === "cta") {
      return (
        <Link
          to="/dashboard"
          className={cn(gradientBtn, "inline-flex px-6 py-3", className)}
          style={gradientStyle}
        >
          {t("nav.goToDashboard")} <ArrowRight className="h-4 w-4" />
        </Link>
      );
    }

    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Link
          to="/dashboard"
          className="text-sm text-white/80 transition hover:text-white"
        >
          {t("nav.dashboard")}
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </button>
      </div>
    );
  }

  if (variant === "cta") {
    return (
      <Link
        to="/auth"
        search={{ mode: "signup" as const }}
        className={cn(gradientBtn, "inline-flex px-6 py-3", className)}
        style={gradientStyle}
      >
        {t("nav.createProfileFree")} <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Link to="/auth" className="hidden text-sm text-white/80 transition hover:text-white sm:block">
        {t("nav.signIn")}
      </Link>
      <Link
        to="/auth"
        search={{ mode: "signup" as const }}
        className={gradientBtn}
        style={gradientStyle}
      >
        {t("nav.createProfile")} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
