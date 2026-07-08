import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MotionConfig } from "motion/react";
import { HomeHeroEntrance } from "@/components/home/HomeHeroEntrance";
import { SiteLogo } from "@/components/SiteLogo";
import { useI18n } from "@/i18n/LocaleProvider";

type AuthPageShellProps = {
  mode: "signin" | "signup";
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  onModeChange: (mode: "signin" | "signup") => void;
};

export function AuthPageShell({
  mode,
  title,
  subtitle,
  children,
  footer,
  onModeChange,
}: AuthPageShellProps) {
  const { t } = useI18n();

  return (
    <MotionConfig reducedMotion="never">
      <div className="auth-page">
        <div className="auth-page__bg" aria-hidden>
          <div className="auth-page__glow auth-page__glow--a" />
          <div className="auth-page__glow auth-page__glow--b" />
          <div className="auth-page__glow auth-page__glow--c" />
          <div className="auth-page__grid" />
          <div className="auth-page__noise" />
        </div>

        <HomeHeroEntrance delay={0} duration={800} variant="fade" className="auth-page__back-wrap">
          <Link to="/" className="auth-page__back">
            <ArrowLeft className="h-4 w-4" />
            {t("nav.backToHome")}
          </Link>
        </HomeHeroEntrance>

        <div className="auth-page__content">
          <HomeHeroEntrance delay={60} duration={950} variant="up">
            <div className="auth-page__brand">
              <SiteLogo size={44} className="mx-auto w-fit" />
              <p className="auth-page__tagline">{t("site.tagline")}</p>
            </div>
          </HomeHeroEntrance>

          <HomeHeroEntrance delay={160} duration={900} variant="up">
            <div className="auth-page__heading">
              <h1 className="auth-page__title">{title}</h1>
              <p className="auth-page__subtitle">{subtitle}</p>
            </div>
          </HomeHeroEntrance>

          <HomeHeroEntrance delay={260} duration={1000} variant="scale">
            <div className="auth-page__card">
              <div className="auth-page__card-shine" aria-hidden />
              <div className="auth-page__tabs" role="tablist" aria-label={t("auth.signIn")}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signin"}
                  className="auth-page__tab"
                  data-active={mode === "signin" ? "" : undefined}
                  onClick={() => onModeChange("signin")}
                >
                  {t("auth.signIn")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signup"}
                  className="auth-page__tab"
                  data-active={mode === "signup" ? "" : undefined}
                  onClick={() => onModeChange("signup")}
                >
                  {t("auth.signUp")}
                </button>
              </div>

              <div className="auth-page__card-body">{children}</div>

              <div className="auth-page__card-footer">{footer}</div>
            </div>
          </HomeHeroEntrance>
        </div>
      </div>
    </MotionConfig>
  );
}
