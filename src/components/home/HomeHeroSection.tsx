import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { HomeHeroEntrance } from "@/components/home/HomeHeroEntrance";
import { HomeHeroVisual } from "@/components/home/HomeHeroVisual";
import { HomeSocialProof } from "@/components/home/HomeSocialProof";
import { useAuthSession } from "@/hooks/useAuthSession";
import { profileDisplayPath, SITE_PROFILE_PREFIX } from "@/lib/site";
import {
  cleanUsername,
  isUsernameTaken,
  MAX_USERNAME_LENGTH,
  usernameLengthError,
} from "@/lib/username";

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
  const { isLoggedIn } = useAuthSession();
  const { offset, onPointerMove, onPointerLeave } = useHeroParallax();
  const [reserveUsername, setReserveUsername] = useState("");
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveLoading, setReserveLoading] = useState(false);

  const textParallax = {
    transform: `translate3d(${offset.x * -10}px, ${offset.y * -6}px, 0)`,
  };
  const phoneParallax = {
    transform: `translate3d(${offset.x * 16}px, ${offset.y * 10}px, 0)`,
  };

  const handleReserve = async () => {
    setReserveError(null);
    const cleanUser = cleanUsername(reserveUsername);
    const lengthError = usernameLengthError(cleanUser);
    if (lengthError) {
      setReserveError(lengthError);
      toast.error("Invalid username", { description: lengthError });
      return;
    }

    setReserveLoading(true);
    try {
      const { taken } = await isUsernameTaken(cleanUser);
      if (taken) {
        const message = "Username already taken. Choose another name.";
        setReserveError(message);
        toast.error("Username already taken", {
          description: `${profileDisplayPath(cleanUser)} is already in use.`,
        });
        return;
      }
      navigate({ to: "/auth", search: { mode: "signup", username: cleanUser } });
    } catch {
      setReserveError("Could not verify username. Please try again.");
      toast.error("Error verifying username");
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
        <div className="home-hero__copy lg:pt-4" style={textParallax}>
          <HomeHeroEntrance delay={0}>
            <h1 className="text-[2.75rem] font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-[5.25rem] lg:leading-[0.9] xl:text-[5.75rem]">
              Your world.
              <br />
              <span
                className="text-glow bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))",
                }}
              >
                Your profile.
              </span>
              <br />
              Your way.
            </h1>
          </HomeHeroEntrance>

          <HomeHeroEntrance delay={120}>
            <p className="mt-7 max-w-lg text-base text-white/60 sm:text-lg lg:mt-8">
              Create a unique profile with links, music, albums, cards, social media, and more.
              Everything in one place.
            </p>
          </HomeHeroEntrance>

          <HomeHeroEntrance delay={220}>
            <div className="mt-8 max-w-lg lg:mt-10">
              {isLoggedIn ? (
                <Link to="/dashboard" className="home-hero-cta group">
                  <span className="home-hero-cta__shine" aria-hidden />
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
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
                        setReserveUsername(
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                        );
                        setReserveError(null);
                      }}
                      placeholder="yourname"
                      maxLength={MAX_USERNAME_LENGTH}
                      className="home-hero-claim__input"
                      aria-label="Username"
                    />
                    <button type="submit" disabled={reserveLoading} className="home-hero-claim__btn">
                      {reserveLoading ? "Checking..." : "Claim"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                  {reserveError ? (
                    <p className="mt-2.5 pl-1 text-xs text-red-400" role="alert">
                      {reserveError}
                    </p>
                  ) : (
                    <p className="mt-2.5 pl-1 text-xs text-white/40">
                      Claim your unique link before someone else does.
                    </p>
                  )}
                </>
              )}
            </div>
          </HomeHeroEntrance>

          <HomeHeroEntrance delay={320}>
            <HomeSocialProof />
          </HomeHeroEntrance>
        </div>

        <HomeHeroEntrance delay={180} className="home-hero__visual-wrap" duration={1000}>
          <div className="home-hero__visual" style={phoneParallax}>
            <HomeHeroVisual />
          </div>
        </HomeHeroEntrance>
      </div>
    </section>
  );
}
