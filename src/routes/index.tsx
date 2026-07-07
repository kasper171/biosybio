import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Instagram, Youtube, Music2, Twitter, Twitch, ArrowRight,
  Link2, Image as ImageIcon, Sparkles,
} from "lucide-react";

import ctaBanner from "@/assets/cta-banner.png";
import { LanyardCard } from "@/components/LanyardCard";
import { HomeStatsSection } from "@/components/home/HomeStatsSection";
import { HomeCreatorsCarousel } from "@/components/home/HomeCreatorsCarousel";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteLogo } from "@/components/SiteLogo";
import { SiteAuthButtons } from "@/components/SiteAuthButtons";

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

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <SiteNavbar>
        <a href="#inicio" className="hover:text-white">Home</a>
        <a href="#recursos" className="hover:text-white">Features</a>
        <a href="#creators" className="hover:text-white">Creators</a>
        <Link to="/planos" className="hover:text-white">Plans</Link>
      </SiteNavbar>

      <HomeHeroSection />

      {/* INTEGRATIONS BAR */}
      <section className="mx-auto max-w-7xl px-6 pt-4 pb-6 lg:pt-8 lg:pb-10">
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
      <section id="recursos" className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:pt-12">
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
            <div className="flex flex-col gap-5">
              <HomeScrollReveal variant="up">
                <h2 className="text-4xl font-black leading-tight">
                  <span className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(90deg, oklch(0.75 0.25 0), oklch(0.6 0.27 10))" }}>
                    Ready to create<br/>your amazing profile?
                  </span>
                </h2>
              </HomeScrollReveal>
              <HomeScrollReveal variant="up" delay={80}>
                <p className="max-w-md text-sm text-white/70">Join thousands of creators and show your world to the world.</p>
              </HomeScrollReveal>
              <HomeScrollReveal variant="up" delay={160}>
                <SiteAuthButtons variant="cta" />
              </HomeScrollReveal>
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
            <SiteLogo linked={false} />
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
