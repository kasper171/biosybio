import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Instagram, Youtube, Music2, Twitter, Twitch, ArrowRight, Check,
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
import { cleanUsername, isUsernameTaken } from "@/lib/username";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biosy — Seu mundo. Seu perfil. Seu jeito." },
      { name: "description", content: "Crie um perfil único com links, músicas, álbuns, cards, redes sociais e muito mais. Tudo em um só lugar." },
      { property: "og:title", content: "Biosy — A plataforma mais completa para seu perfil digital" },
      { property: "og:description", content: "Junte-se a milhares de criadores e mostre seu mundo para o mundo." },
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

    if (cleanUser.length < 3) {
      const message = "Use pelo menos 3 letras, números ou _.";
      setReserveError(message);
      toast.error("Nome de usuário inválido", { description: message });
      return;
    }

    setReserveLoading(true);
    try {
      const { taken } = await isUsernameTaken(cleanUser);
      if (taken) {
        const message = "Usuário já existente. Escolha outro nome.";
        setReserveError(message);
        toast.error("Usuário já existente", {
          description: `biosy.bio/${cleanUser} já está em uso.`,
        });
        return;
      }

      navigate({
        to: "/auth",
        search: { mode: "signup", username: cleanUser },
      });
    } catch {
      const message = "Não foi possível verificar o usuário. Tente novamente.";
      setReserveError(message);
      toast.error("Erro ao verificar usuário");
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
          <a href="#recursos" className="hover:text-white">Recursos</a>
          <a href="#modelos" className="hover:text-white">Modelos</a>
          <a href="#precos" className="hover:text-white">Preços</a>
          <a href="#blog" className="hover:text-white">Blog</a>
          <a href="#empresa" className="hover:text-white">Empresa</a>
        </nav>
        <div className="flex items-center gap-3">
          <SiteAuthButtons />
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pt-8 pb-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1.15fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-hot/40 bg-pink-hot/10 px-3 py-1 text-xs">
              <span className="rounded-full bg-pink-hot px-2 py-0.5 text-[10px] font-bold">NOVO</span>
              <span className="text-white/80">A plataforma mais completa para seu perfil digital</span>
            </div>
            <h1 className="mt-6 text-6xl font-black leading-[0.95] tracking-tight lg:text-7xl">
              Seu mundo.<br />
              <span
                className="text-glow bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))" }}
              >Seu perfil.</span><br />
              Seu jeito.
            </h1>
            <p className="mt-6 max-w-md text-white/60">
              Crie um perfil único com links, músicas, álbuns, cards, redes sociais e muito mais. Tudo em um só lugar.
            </p>
            <div className="mt-7 max-w-md">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="glow-pink inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}
                >
                  Ir para o Dashboard <ArrowRight className="h-4 w-4" />
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
                      byosy.bio/
                    </span>
                    <input
                      type="text"
                      value={reserveUsername}
                      onChange={(e) => {
                        setReserveUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                        setReserveError(null);
                      }}
                      placeholder="seunome"
                      maxLength={30}
                      className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={reserveLoading}
                      className="glow-pink flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}
                    >
                      {reserveLoading ? "Verificando..." : "Reservar"} <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                  {reserveError ? (
                    <p className="mt-2 pl-4 text-[11px] text-red-400" role="alert">
                      {reserveError}
                    </p>
                  ) : (
                    <p className="mt-2 pl-4 text-[11px] text-white/40">
                      Reserve seu link único antes que alguém pegue.
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
            <span className="font-semibold">Conecte tudo que importa</span>
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
            <span className="text-white/50">e muito mais</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_2.4fr]">
          <div>
            <HomeScrollReveal variant="up">
              <h2 className="text-4xl font-black leading-tight">
                Tudo que você precisa<br/>
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))" }}>
                  para se conectar
                </span>
              </h2>
            </HomeScrollReveal>
            <HomeScrollReveal variant="up" delay={80}>
              <p className="mt-4 text-sm text-white/60">Personalize do seu jeito. Sem limites.<br/>Do seu mundo para o mundo.</p>
            </HomeScrollReveal>
            <button className="glow-pink mt-6 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" }}>
              Explorar recursos <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { i: Link2, t: "Links ilimitados", d: "Adicione todos os seus links importantes." },
              { i: Music2, t: "Músicas", d: "Integre suas músicas favoritas." },
              { i: ImageIcon, t: "Álbuns de fotos", d: "Organize seus momentos em álbuns incríveis." },
              { i: Instagram, t: "Cards", d: "Crie cards personalizados do seu jeito." },
              { i: Sparkles, t: "Personalização", d: "Temas, cores, fontes e muito mais." },
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
              Conheça a<br/>
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))" }}>
                equipe Biosy
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
                    Pronto para criar<br/>seu perfil incrível?
                  </span>
                </h2>
              </HomeScrollReveal>
              <HomeScrollReveal variant="up" delay={80}>
                <p className="mt-4 max-w-md text-sm text-white/70">Junte-se a milhares de criadores e mostre seu mundo para o mundo.</p>
              </HomeScrollReveal>
              <SiteAuthButtons variant="cta" />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
          <div>
            <HomeScrollReveal variant="up">
              <h2 className="text-4xl font-black">Escolha seu plano</h2>
            </HomeScrollReveal>
            <HomeScrollReveal variant="up" delay={80}>
              <p className="mt-4 text-sm text-white/60">Comece grátis e evolua.<br/>quando quiser.</p>
            </HomeScrollReveal>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { name: "Plano Free", sub: "Perfeito para começar", price: "R$0", popular: false,
                features: ["Links ilimitados", "Álbum de fotos", "Músicas", "Cards básicos", "Suporte comunitário"],
                cta: "Começar grátis", ctaSolid: false },
              { name: "Plano Premium", sub: "Para criadores que vão além", price: "R$19,90", popular: true,
                features: ["Tudo do plano Free", "Cards avançados", "Estatísticas completas", "Domínio personalizado", "Suporte prioritário"],
                cta: "Assinar Premium", ctaSolid: true },
            ].map((p, i) => (
              <div key={i} className={`card-surface relative rounded-2xl p-7 ${p.popular ? "border-pink-hot/50" : ""}`}>
                {p.popular && (
                  <span className="absolute right-5 top-5 rounded-full bg-pink-hot/20 px-3 py-1 text-[10px] font-semibold text-pink-hot">Mais popular</span>
                )}
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-xs text-white/55">{p.sub}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className="mb-1 text-xs text-white/60">/mês</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f, k) => (
                    <li key={k} className="flex items-center gap-2 text-white/80">
                      <Check className="h-4 w-4 text-pink-hot" /> {f}
                    </li>
                  ))}
                </ul>
                <button className={`mt-6 w-full rounded-full py-3 text-sm font-semibold ${
                  p.ctaSolid
                    ? "text-white glow-pink"
                    : "border border-white/15 bg-white/5"
                }`} style={p.ctaSolid ? { background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))" } : {}}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
            <div className="md:col-span-1">
              <Logo />
              <p className="mt-3 text-sm text-white/55">Do seu jeito.<br/>Para o mundo.</p>
            </div>
            {[
              { t: "Produto", l: ["Recursos", "Modelos", "Preços", "Atualizações"] },
              { t: "Empresa", l: ["Sobre nós", "Carreiras", "Contato", "Imprensa"] },
              { t: "Suporte", l: ["Central de ajuda", "Tutoriais", "Privacidade", "Termos de uso"] },
            ].map((c, i) => (
              <div key={i}>
                <h4 className="text-sm font-bold">{c.t}</h4>
                <ul className="mt-3 space-y-2 text-sm text-white/55">
                  {c.l.map((it, k) => <li key={k}><a href="#" className="hover:text-white">{it}</a></li>)}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="text-sm font-bold">Siga-nos</h4>
              <div className="mt-3 flex gap-2">
                {[Instagram, Youtube, Twitter, Music2].map((Ic, i) => (
                  <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-pink-hot/30 bg-pink-hot/10 text-pink-hot hover:bg-pink-hot/20">
                    <Ic className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
        </div>
        <div className="border-t border-white/5 py-5 text-center text-xs text-white/40">
          © 2024 Biosy. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
