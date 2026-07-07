import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
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
          className={cn(gradientBtn, "px-6 py-3", className)}
          style={gradientStyle}
        >
          Ir para o Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      );
    }

    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Link
          to="/dashboard"
          className="text-sm text-white/80 transition hover:text-white"
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    );
  }

  if (variant === "cta") {
    return (
      <Link
        to="/auth"
        search={{ mode: "signup" as const }}
        className={cn(gradientBtn, "px-6 py-3", className)}
        style={gradientStyle}
      >
        Criar meu perfil grátis <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Link to="/auth" className="hidden text-sm text-white/80 transition hover:text-white sm:block">
        Entrar
      </Link>
      <Link
        to="/auth"
        search={{ mode: "signup" as const }}
        className={gradientBtn}
        style={gradientStyle}
      >
        Criar meu perfil <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
