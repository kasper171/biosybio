import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Instagram, Youtube, Music2, Twitter, Twitch, ArrowRight,
  Link2, Image as ImageIcon, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import logoUrl from "@/assets/logo.png";
import ctaBanner from "@/assets/cta-banner.png";
import { LanyardCard } from "@/components/LanyardCard";
import { HomeStatsSection } from "@/components/home/HomeStatsSection";
import { HomeCreatorsCarousel } from "@/components/home/HomeCreatorsCarousel";
import { HomeSocialProof } from "@/components/home/HomeSocialProof";
import { HomeHeroVisual } from "@/components/home/HomeHeroVisual";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { SiteAuthButtons } from "@/components/SiteAuthButtons";
import { useAuthSession } from "@/hooks/useAuthSession";
import { profileDisplayPath, SITE_PROFILE_PREFIX } from "@/lib/site";
import {
  cleanUsername,
  isUsernameTaken,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  usernameLengthError,
} from "@/lib/username";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biosy — Your world. Your profile. Your way." },
      { name: "description", content: "Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place." },
      { property: "og:title", content: "Biosy — Your world. Your profile. Your way." },
      { property: "og:description", content: "Join thousands of creators and show your world to the world." },
    ],
  }),
  component: Index,
});

function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logoUrl}
        alt="Biosy"
        width={size}
        height={size}
        style={{ filter: "drop-shadow(0 0 12px oklch(0.65 0.28 0 / 0.55))" }}
      />
      <span className="text-xl font-bold tracking-tight">Biosy</span>
    </div>
  );
}

function Index() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthSession();
  const [reserveUsername, setReserveUsername] = useState("");
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveLoading, setReserveLoading] = useState(false);

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

      navigate({
        to: "/auth",
        search: { mode: "signup", username: cleanUser },
      });
    } catch {
      const message = "Could not verify username. Please try again.";
      setReserveError(message);
      toast.error("Error verifying username");
    } finally {
      setReserveLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* HEADER */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          <a href="#inicio" className="hover:text-white">Home</a>
          <a href="#recursos" className="hover:text-white">Features</a>
          <a href="#creators" className="hover:text-white">Creators</a>
          <Link to="/planos" className="hover:text-white">Plans</Link>
        </nav>
        <div className="flex items-center gap-3">
          <SiteAuthButtons />
        </div>
      </header>

      {/* HERO */}
      <section id="inicio" className="relative mx-auto max-w-7xl px-6 pt-8 pb-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1.15fr]">
          <div>
            <h1 className="text-6xl font-black leading-[0.95] tracking-tight lg:text-7xl">
              Your world.<br />
              <span
                className="text-glow bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))" }}
              >Your profile.</span><br />
              Your way.
            </h1>
            <p className="mt-6 max-w-md text-white/60">
              Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place.
            </p>
            <div className="mt-7 max-w-md">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="glow-pink inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleReserve();
                    }}
                    className="flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5 p-1.5 backdrop-blur"
                    style={{ boxShadow: "0 0 30px oklch(0.65 0.28 0 / 0.15)" }}
                  >
                    <span className="pl-4 pr-1 text-sm font-semibold text-white/70 select-none">
                      {SITE_PROFILE_PREFIX}
                    </span>
                    <input
                      type="text"
                      value={reserveUsername}
                      onChange={(e) => {
                        setReserveUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                        setReserveError(null);
                      }}
                      placeholder="yourname"
                      maxLength={MAX_USERNAME_LENGTH}
                      className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={reserveLoading}
                      className="glow-pink flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}
                    >
                      {reserveLoading ? "Checking..." : "Claim"} <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                  {reserveError ? (
                    <p className="mt-2 pl-4 text-[11px] text-red-400" role="alert">
                      {reserveError}
                    </p>
                  ) : (
                    <p className="mt-2 pl-4 text-[11px] text-white/40">
                      Claim your unique link before someone else does.
                    </p>
                  )}
                </>
              )}
            </div>
            <HomeSocialProof />
          </div>

          <HomeHeroVisual />
        </div>
      </section>

      {/* INTEGRATIONS BAR */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="card-surface flex flex-wrap items-center justify-between gap-6 rounded-2xl px-8 py-5 text-sm">
          <HomeScrollReveal variant="up">
            <span className="font-semibold">Connect everything that matters</span>
          </HomeScrollReveal>
          <div className="flex flex-wrap items-center gap-8 text-white/70">
            {[
              [Instagram, "Instagram"], [Youtube, "YouTube"], [Music2, "Spotify"],
              [Music2, "TikTok"], [Twitter, "Twitter"], [Twitch, "Twitch"],
            ].map(([Ic, label], i) => (
              <span key={i} className="flex items-center gap-2">
                <Ic className="h-4 w-4 text-pink-hot" /> {label as string}
              </span>
            ))}
            <span className="text-white/50">and more</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_2.4fr]">
          <div>
            <HomeScrollReveal variant="up">
              <h2 className="text-4xl font-black leading-tight">
                Everything you need<br/>
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))" }}>
                  to connect
                </span>
              </h2>
            </HomeScrollReveal>
            <HomeScrollReveal variant="up" delay={80}>
              <p className="mt-4 text-sm text-white/60">Customize your way. No limits.<br/>From your world to the world.</p>
            </HomeScrollReveal>
            <button className="glow-pink mt-6 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}>
              Explore features <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { i: Link2, t: "Unlimited links", d: "Add all your important links." },
              { i: Music2, t: "Music", d: "Integrate your favorite tracks." },
              { i: ImageIcon, t: "Photo albums", d: "Organize your moments in stunning albums." },
              { i: Instagram, t: "Cards", d: "Create custom cards your way." },
              { i: Sparkles, t: "Customization", d: "Themes, colors, fonts, and more." },
            ].map(({ i: Ic, t, d }, k) => (
              <div key={k} className="card-surface rounded-2xl p-5">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-pink-hot/30 bg-pink-hot/10">
                  <Ic className="h-5 w-5 text-pink-hot" />
                </div>
                <h3 className="mt-4 text-sm font-bold">{t}</h3>
                <p className="mt-2 text-xs text-white/55">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeStatsSection />

      <HomeCreatorsCarousel />

      {/* DEVELOPERS — LANYARD */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
          <HomeScrollReveal variant="up">
            <h2 className="text-4xl font-black leading-tight">
              Meet the<br/>
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))" }}>
                Biosy team
              </span>
            </h2>
          </HomeScrollReveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <LanyardCard userId="473259862210379777" role="Developer" />
            <LanyardCard userId="237746461419241473" role="Developer" />
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-pink-hot/30">
          <img src={ctaBanner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, oklch(0.15 0.1 5 / 0.95) 0%, oklch(0.15 0.1 5 / 0.6) 50%, transparent 100%)" }} />
          <div className="relative grid gap-6 p-12 lg:grid-cols-2">
            <div>
              <HomeScrollReveal variant="up">
                <h2 className="text-4xl font-black leading-tight">
                  <span className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(90deg, oklch(0.75 0.25 0), oklch(0.6 0.27 10))" }}>
                    Ready to create<br/>your amazing profile?
                  </span>
                </h2>
              </HomeScrollReveal>
              <HomeScrollReveal variant="up" delay={80}>
                <p className="mt-4 max-w-md text-sm text-white/70">Join thousands of creators and show your world to the world.</p>
              </HomeScrollReveal>
              <SiteAuthButtons variant="cta" />
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="card-surface flex flex-col items-start justify-between gap-6 rounded-3xl p-10 md:flex-row md:items-center">
          <div>
            <HomeScrollReveal variant="up">
              <h2 className="text-3xl font-black md:text-4xl">Choose your plan</h2>
            </HomeScrollReveal>
            <HomeScrollReveal variant="up" delay={80}>
              <p className="mt-3 max-w-lg text-sm text-white/60">
                Free plan to get started or lifetime Premium for €9.99. Exclusive badges also available.
              </p>
            </HomeScrollReveal>
          </div>
          <HomeScrollReveal variant="up" delay={120}>
            <Link
              to="/planos"
              className="glow-pink inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}
            >
              View plans <ArrowRight className="h-4 w-4" />
            </Link>
          </HomeScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-14 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-white/55">Your way.<br />For the world.</p>
          </div>
          <nav aria-label="Site links">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/55">
              {[
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "FAQ", href: "/faq" },
                { label: "Support", href: "/support" },
                { label: "Discord", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-white"
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/5 py-5 text-center text-xs text-white/40">
          © 2024 Biosy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
