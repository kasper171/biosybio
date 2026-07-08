import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Instagram, Youtube, Music2, Twitter, Twitch, ArrowRight,
  Link2, Image as ImageIcon, Sparkles,
} from "lucide-react";
import { MotionConfig } from "motion/react";

import ctaBanner from "@/assets/cta-banner.png";
import { LanyardCard } from "@/components/LanyardCard";
import { HomeStatsSection } from "@/components/home/HomeStatsSection";
import { HomeCreatorsCarousel } from "@/components/home/HomeCreatorsCarousel";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteLogo } from "@/components/SiteLogo";
import { SITE_NAME, SITE_TITLE } from "@/lib/site";
import { SiteAuthButtons } from "@/components/SiteAuthButtons";
import { useI18n } from "@/i18n/LocaleProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: "Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place." },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: "Join thousands of creators and show your world to the world." },
    ],
  }),
  component: Index,
});

const INTEGRATION_KEYS = [
  [Instagram, "Instagram"],
  [Youtube, "YouTube"],
  [Music2, "Spotify"],
  [Music2, "TikTok"],
  [Twitter, "Twitter"],
  [Twitch, "Twitch"],
] as const;

function Index() {
  const { t } = useI18n();
  const FEATURES = [
    { i: Link2, t: t("home.featureLinks"), d: t("home.featureLinksDesc") },
    { i: Music2, t: t("home.featureMusic"), d: t("home.featureMusicDesc") },
    { i: ImageIcon, t: t("home.featureAlbums"), d: t("home.featureAlbumsDesc") },
    { i: Instagram, t: t("home.featureCards"), d: t("home.featureCardsDesc") },
    { i: Sparkles, t: t("home.featureCustom"), d: t("home.featureCustomDesc") },
  ] as const;
  const FOOTER_LINKS = [
    { label: t("nav.terms"), href: "/terms-of-service" },
    { label: t("nav.privacy"), href: "/privacy-policy" },
    { label: t("nav.faq"), href: "/faq" },
    { label: t("nav.support"), href: "/support" },
    { label: t("nav.discord"), href: "#" },
  ];

  return (
    <MotionConfig reducedMotion="never">
      <div className="min-h-screen text-foreground">
        <SiteNavbar>
          <a href="#inicio" className="hover:text-white">{t("nav.home")}</a>
          <a href="#recursos" className="hover:text-white">{t("nav.features")}</a>
          <a href="#creators" className="hover:text-white">{t("nav.creators")}</a>
          <Link to="/planos" className="hover:text-white">{t("nav.plans")}</Link>
        </SiteNavbar>

        <HomeHeroSection />

        {/* INTEGRATIONS BAR */}
        <section className="mx-auto max-w-7xl px-6 pt-4 pb-6 lg:pt-8 lg:pb-10">
          <HomeScrollReveal variant="scale">
            <div className="card-surface flex flex-wrap items-center justify-between gap-6 rounded-2xl px-8 py-5 text-sm">
              <span className="font-semibold">{t("home.integrationsTitle")}</span>
              <div className="flex flex-wrap items-center gap-8 text-white/70">
                {INTEGRATION_KEYS.map(([Ic, label], i) => (
                  <HomeScrollReveal key={label} variant="up" delay={i * 60} as="span" className="inline-flex">
                    <span className="flex items-center gap-2">
                      <Ic className="h-4 w-4 text-pink-hot" /> {label}
                    </span>
                  </HomeScrollReveal>
                ))}
                <HomeScrollReveal variant="fade" delay={INTEGRATION_KEYS.length * 60} as="span" className="inline-flex">
                  <span className="text-white/50">{t("common.andMore")}</span>
                </HomeScrollReveal>
              </div>
            </div>
          </HomeScrollReveal>
        </section>

        {/* FEATURES */}
        <section id="recursos" className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:pt-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_2.4fr]">
            <div>
              <HomeScrollReveal variant="left">
                <h2 className="text-4xl font-black leading-tight">
                  {t("home.featuresTitle1")}<br/>
                  <span className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))" }}>
                    {t("home.featuresTitle2")}
                  </span>
                </h2>
              </HomeScrollReveal>
              <HomeScrollReveal variant="up" delay={100}>
                <p className="mt-4 text-sm text-white/60 whitespace-pre-line">{t("home.featuresSubtitle")}</p>
              </HomeScrollReveal>
              <HomeScrollReveal variant="scale" delay={200}>
                <button className="glow-pink mt-6 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}>
                  {t("nav.exploreFeatures")} <ArrowRight className="h-4 w-4" />
                </button>
              </HomeScrollReveal>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {FEATURES.map(({ i: Ic, t, d }, k) => (
                <HomeScrollReveal key={t} variant="up" delay={k * 80}>
                  <div className="card-surface h-full rounded-2xl p-5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-pink-hot/30 bg-pink-hot/10">
                      <Ic className="h-5 w-5 text-pink-hot" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold">{t}</h3>
                    <p className="mt-2 text-xs text-white/55">{d}</p>
                  </div>
                </HomeScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <HomeStatsSection />

        <HomeCreatorsCarousel />

        {/* DEVELOPERS — LANYARD */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
            <HomeScrollReveal variant="left">
              <h2 className="text-4xl font-black leading-tight">
                {t("home.teamTitle1")}<br/>
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))" }}>
                  {t("home.teamTitle2", { siteName: SITE_NAME })}
                </span>
              </h2>
            </HomeScrollReveal>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <HomeScrollReveal variant="up" delay={0}>
                <LanyardCard userId="473259862210379777" role={t("home.developer")} />
              </HomeScrollReveal>
              <HomeScrollReveal variant="up" delay={100}>
                <LanyardCard userId="237746461419241473" role={t("home.developer")} />
              </HomeScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <HomeScrollReveal variant="scale">
            <div className="relative overflow-hidden rounded-3xl border border-pink-hot/30">
              <img src={ctaBanner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, oklch(0.15 0.1 5 / 0.95) 0%, oklch(0.15 0.1 5 / 0.6) 50%, transparent 100%)" }} />
              <div className="relative grid gap-6 p-12 lg:grid-cols-2">
                <div className="flex flex-col gap-5">
                  <HomeScrollReveal variant="up">
                    <h2 className="text-4xl font-black leading-tight whitespace-pre-line">
                      <span className="bg-clip-text text-transparent"
                        style={{ backgroundImage: "linear-gradient(90deg, oklch(0.75 0.25 0), oklch(0.6 0.27 10))" }}>
                        {t("home.ctaTitle")}
                      </span>
                    </h2>
                  </HomeScrollReveal>
                  <HomeScrollReveal variant="up" delay={100}>
                    <p className="max-w-md text-sm text-white/70">{t("home.ctaSubtitle")}</p>
                  </HomeScrollReveal>
                  <HomeScrollReveal variant="up" delay={200}>
                    <SiteAuthButtons variant="cta" />
                  </HomeScrollReveal>
                </div>
              </div>
            </div>
          </HomeScrollReveal>
        </section>

        {/* PLANOS CTA */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <HomeScrollReveal variant="up">
            <div className="card-surface flex flex-col items-start justify-between gap-6 rounded-3xl p-10 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black md:text-4xl">{t("home.plansCtaTitle")}</h2>
                <HomeScrollReveal variant="up" delay={80} className="mt-3">
                  <p className="max-w-lg text-sm text-white/60">
                    {t("home.plansCtaSubtitle")}
                  </p>
                </HomeScrollReveal>
              </div>
              <HomeScrollReveal variant="scale" delay={160}>
                <Link
                  to="/planos"
                  className="glow-pink inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}
                >
                  {t("nav.viewPlans")} <ArrowRight className="h-4 w-4" />
                </Link>
              </HomeScrollReveal>
            </div>
          </HomeScrollReveal>
        </section>

        {/* FOOTER */}
        <HomeScrollReveal variant="up">
          <footer className="border-t border-white/5">
            <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-14 md:flex-row md:items-start md:justify-between">
              <HomeScrollReveal variant="left" delay={0}>
                <div>
                  <SiteLogo linked={false} />
                  <p className="mt-3 text-sm text-white/55 whitespace-pre-line">{t("site.footerTagline")}</p>
                </div>
              </HomeScrollReveal>
              <HomeScrollReveal variant="right" delay={100}>
                <nav aria-label={t("nav.siteLinks")}>
                  <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/55">
                    {FOOTER_LINKS.map((link, i) => (
                      <li key={link.label}>
                        <HomeScrollReveal variant="fade" delay={i * 50} as="span" className="inline-flex">
                          <a href={link.href} className="hover:text-white">
                            {link.label}
                          </a>
                        </HomeScrollReveal>
                      </li>
                    ))}
                  </ul>
                </nav>
              </HomeScrollReveal>
            </div>
            <HomeScrollReveal variant="fade" delay={200}>
              <div className="border-t border-white/5 py-5 text-center text-xs text-white/40">
                {t("site.copyright", { siteName: SITE_NAME })}
              </div>
            </HomeScrollReveal>
          </footer>
        </HomeScrollReveal>
      </div>
    </MotionConfig>
  );
}
