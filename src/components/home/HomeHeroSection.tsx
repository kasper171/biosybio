import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { toast } from "sonner";
import { HomeHeroEntrance } from "@/components/home/HomeHeroEntrance";
import { HomeHeroVisual } from "@/components/home/HomeHeroVisual";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useI18n } from "@/i18n/LocaleProvider";
import { profileDisplayPath, SITE_PROFILE_PREFIX } from "@/lib/site";
import {
  cleanUsername,
  MAX_USERNAME_LENGTH,
  usernameLengthError,
} from "@/lib/username";
import { isUsernameTaken } from "@/lib/username-availability";

type Parallax = { x: number; y: number };

function useHeroParallax() {
  const [offset, setOffset] = useState<Parallax>({ x: 0, y: 0 });

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({ x, y });
  }, []);

  const onPointerLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return { offset, onPointerMove, onPointerLeave };
}

export function HomeHeroSection() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isLoggedIn } = useAuthSession();
  const { offset, onPointerMove, onPointerLeave } = useHeroParallax();
  const [reserveUsername, setReserveUsername] = useState("");
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveLoading, setReserveLoading] = useState(false);

  const textParallax = {
    transform: `translate3d(${offset.x * -10}px, ${offset.y * -6}px, 0)`,
  };

  const handleReserve = async () => {
    setReserveError(null);
    const cleanUser = cleanUsername(reserveUsername);
    const lengthError = usernameLengthError(cleanUser);
    if (lengthError) {
      setReserveError(lengthError);
      toast.error(t("auth.invalidUsername"), { description: lengthError });
      return;
    }

    setReserveLoading(true);
    try {
      const { taken } = await isUsernameTaken(cleanUser);
      if (taken) {
        const message = t("auth.usernameTakenChoose");
        setReserveError(message);
        toast.error(t("auth.usernameTaken"), {
          description: t("auth.usernameTakenDesc", { path: profileDisplayPath(cleanUser) }),
        });
        return;
      }
      navigate({ to: "/auth", search: { mode: "signup", username: cleanUser } });
    } catch {
      setReserveError(t("auth.couldNotVerifyUsername"));
      toast.error(t("auth.verifyingUsername"));
    } finally {
      setReserveLoading(false);
    }
  };

  return (
    <section
      id="inicio"
      className="home-hero relative mx-auto flex max-w-7xl flex-col justify-center px-6 pt-10 pb-20 sm:pt-14 sm:pb-24 lg:min-h-[calc(100vh-5.5rem)] lg:pt-20 lg:pb-28"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="home-hero__noise" aria-hidden />

      <div className="relative z-[1] grid items-center gap-10 lg:grid-cols-[1.05fr_1.15fr] lg:gap-14">
        <MotionConfig reducedMotion="never">
          <div className="home-hero__copy lg:pt-4" style={textParallax}>
            <h1 className="text-[2.75rem] font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-[5.25rem] lg:leading-[0.9] xl:text-[5.75rem]">
              <HomeHeroEntrance as="span" delay={0} duration={1000} variant="left" className="block">
                {t("home.heroLine1")}
                <br />
              </HomeHeroEntrance>
              <HomeHeroEntrance as="span" delay={120} duration={1000} variant="left" className="block">
                <span
                  className="text-glow bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))",
                  }}
                >
                  {t("home.heroLine2")}
                </span>
                <br />
              </HomeHeroEntrance>
              <HomeHeroEntrance as="span" delay={240} duration={1000} variant="left" className="block">
                {t("home.heroLine3")}
              </HomeHeroEntrance>
            </h1>

            <HomeHeroEntrance delay={360} duration={1000}>
              <p className="mt-7 max-w-lg text-base text-white/60 sm:text-lg lg:mt-8">
                {t("home.heroSubtitle")}
              </p>
            </HomeHeroEntrance>

            <HomeHeroEntrance delay={500} duration={1000} variant="scale">
              <div className="mt-8 max-w-lg lg:mt-10">
                {isLoggedIn ? (
                  <Link to="/dashboard" className="home-hero-cta group">
                    <span className="home-hero-cta__shine" aria-hidden />
                    {t("nav.goToDashboard")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleReserve();
                    }}
                    className="home-hero-claim"
                  >
                    <span className="home-hero-claim__prefix">{SITE_PROFILE_PREFIX}</span>
                    <input
                      type="text"
                      value={reserveUsername}
                      onChange={(e) => {
                        setReserveUsername(cleanUsername(e.target.value));
                        setReserveError(null);
                      }}
                      placeholder={t("auth.usernamePlaceholder")}
                      maxLength={MAX_USERNAME_LENGTH}
                      className="home-hero-claim__input"
                      aria-label={t("auth.username")}
                    />
                    <button type="submit" disabled={reserveLoading} className="home-hero-claim__btn">
                      {reserveLoading ? t("home.checking") : t("home.claimCta")}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </HomeHeroEntrance>

            {!isLoggedIn ? (
              <HomeHeroEntrance delay={620} duration={900}>
                {reserveError ? (
                  <p className="mt-2.5 pl-1 text-xs text-red-400" role="alert">
                    {reserveError}
                  </p>
                ) : (
                  <p className="mt-2.5 pl-1 text-xs text-white/40">
                    Claim your unique link before someone else does.
                  </p>
                )}
              </HomeHeroEntrance>
            ) : null}
          </div>
        </MotionConfig>

        <div className="home-hero__visual-wrap">
          <div className="home-hero__visual">
            <HomeHeroVisual parallax={offset} />
          </div>
        </div>
      </div>
    </section>
  );
}
