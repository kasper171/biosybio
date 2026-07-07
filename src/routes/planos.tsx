import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Check, Crown, Gem, Heart, Sparkles } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { SiteAuthButtons } from "@/components/SiteAuthButtons";
import { BADGE_PRODUCTS, PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — Biosy" },
      {
        name: "description",
        content: "Escolha o plano Free ou Premium e desbloqueie badges exclusivas para o seu perfil.",
      },
      { property: "og:title", content: "Planos — Biosy" },
      {
        property: "og:description",
        content: "Plano Free, Premium vitalício e badges exclusivas para personalizar seu perfil.",
      },
    ],
  }),
  component: PlanosPage,
});

const gradientStyle = {
  background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))",
};

const badgeAccentClass: Record<NonNullable<(typeof BADGE_PRODUCTS)[number]["accent"]>, string> = {
  pink: "border-pink-hot/40 bg-pink-hot/10 text-pink-hot",
  gold: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  green: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  blue: "border-sky-400/40 bg-sky-400/10 text-sky-300",
};

const badgeIcons = {
  custom: Sparkles,
  rich: Gem,
  donator: Heart,
  verified: BadgeCheck,
} as const;

function Logo({ size = 36 }: { size?: number }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src={logoUrl}
        alt="Biosy"
        width={size}
        height={size}
        style={{ filter: "drop-shadow(0 0 12px oklch(0.65 0.28 0 / 0.55))" }}
      />
      <span className="text-xl font-bold tracking-tight">Biosy</span>
    </Link>
  );
}

function PlanosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <SiteAuthButtons />
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-6">
        <div className="mx-auto max-w-2xl text-center">
          <HomeScrollReveal variant="up">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Escolha seu plano</h1>
          </HomeScrollReveal>
          <HomeScrollReveal variant="up" delay={80}>
            <p className="mt-4 text-sm text-white/60 md:text-base">
              Comece grátis ou desbloqueie tudo com um pagamento único. Sem mensalidade.
            </p>
          </HomeScrollReveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <HomeScrollReveal key={plan.id} variant="up" delay={i * 80} className="h-full">
              <div
                className={cn(
                  "card-surface relative flex h-full flex-col rounded-2xl p-7",
                  plan.popular && "border-pink-hot/50",
                )}
              >
                {plan.popular && (
                  <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-pink-hot/20 px-3 py-1 text-[10px] font-semibold text-pink-hot">
                    <Crown className="h-3 w-3" />
                    Mais popular
                  </span>
                )}
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="mt-1 text-xs text-white/55">{plan.subtitle}</p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-4xl font-black tabular-nums">{plan.price}</span>
                  <span className="mb-1 text-xs uppercase tracking-wide text-white/50">
                    {plan.priceNote}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-white/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-pink-hot" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.id === "free" ? "/auth" : "/auth"}
                  search={plan.id === "free" ? { mode: "signup" } : { mode: "signup" }}
                  className={cn(
                    "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition",
                    plan.ctaSolid
                      ? "glow-pink text-white"
                      : "border border-white/15 bg-white/5 hover:bg-white/10",
                  )}
                  style={plan.ctaSolid ? gradientStyle : undefined}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </HomeScrollReveal>
          ))}
        </div>

        <section className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <HomeScrollReveal variant="up">
              <h2 className="text-3xl font-black">Outros produtos</h2>
            </HomeScrollReveal>
            <HomeScrollReveal variant="up" delay={80}>
              <p className="mt-3 text-sm text-white/60">
                Badges exclusivas para destacar seu perfil. Compra única, sua para sempre.
              </p>
            </HomeScrollReveal>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {BADGE_PRODUCTS.map((product, i) => {
              const Icon = badgeIcons[product.id as keyof typeof badgeIcons] ?? Sparkles;
              const accent = product.accent ?? "pink";

              return (
                <HomeScrollReveal key={product.id} variant="up" delay={i * 60} className="h-full">
                  <div className="card-surface flex h-full flex-col rounded-2xl p-6">
                    <div
                      className={cn(
                        "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border",
                        badgeAccentClass[accent],
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">{product.name}</h3>
                    {product.description ? (
                      <p className="mt-1 text-xs text-white/55">{product.description}</p>
                    ) : null}
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-2xl font-black tabular-nums">{product.price}</span>
                      <span className="mb-0.5 text-[10px] uppercase tracking-wide text-white/50">
                        {product.priceNote}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-6 w-full rounded-full border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                    >
                      Comprar
                    </button>
                  </div>
                </HomeScrollReveal>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <Logo size={32} />
          <Link to="/" className="text-sm text-white/55 transition hover:text-white">
            Voltar para o início
          </Link>
        </div>
      </footer>
    </div>
  );
}
