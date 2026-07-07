import { cn } from "@/lib/utils";
import dashboardPreview from "@/assets/home-dashboard-preview.png";

type HomeDashboardPreviewProps = {
  variant?: "standalone" | "hero";
};

export function HomeDashboardPreview({ variant = "standalone" }: HomeDashboardPreviewProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "home-laptop-wrap relative mx-auto w-full",
        isHero ? "home-laptop-wrap-hero max-w-none px-0" : "max-w-[640px] px-1 lg:max-w-none lg:px-0",
      )}
    >
      <div className={cn("home-laptop-float relative", isHero && "home-laptop-float-hero")}>
        <div className={cn("relative w-full", isHero ? "aspect-[16/11]" : "aspect-[4/3]")}>
          {!isHero && (
            <>
              <div className="pointer-events-none absolute -left-8 top-8 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-6 bottom-4 h-36 w-36 rounded-full bg-violet-600/20 blur-3xl" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl" />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 bottom-2 h-24 rounded-[100%] bg-black/40 blur-2xl"
              />
            </>
          )}

          <div
            className={cn(
              "absolute flex items-center justify-center",
              isHero ? "inset-0" : "inset-x-[2%] bottom-[4%] top-[4%]",
            )}
          >
            {!isHero && (
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-[2%] left-[14%] right-[8%] z-0 h-12 rounded-[100%] bg-pink-500/15 blur-2xl"
              />
            )}
            <div
              className={cn(
                "home-laptop-device relative z-[1] w-full",
                isHero ? "home-laptop-device-hero max-w-full" : "max-w-[96%]",
              )}
            >
              <div
                className={cn(
                  "relative rounded-[1.35rem] border border-white/[0.14] bg-gradient-to-br from-[#32323c] via-[#1a1a22] to-[#101015] shadow-[0_28px_90px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_60px_rgba(255,45,122,0.12)]",
                  isHero ? "p-[7px]" : "p-[8px]",
                )}
              >
                <div className="absolute left-1/2 top-[11px] z-10 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#1a1a1f] ring-1 ring-white/10" />

                <div className="relative overflow-hidden rounded-[1rem] border border-black/60 bg-[#050508] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0e0e11]/95 px-2.5 py-1.5 backdrop-blur-sm">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.5)]" />
                      <span className="h-2 w-2 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
                      <span className="h-2 w-2 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
                    </div>
                    <div className="mx-auto flex h-[18px] min-w-[48%] max-w-[62%] items-center justify-center gap-1 rounded-md border border-white/[0.05] bg-black/30 px-2 text-[7px] text-white/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                      byosy.bio/dashboard
                    </div>
                  </div>

                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0b0b0d]">
                    <img
                      src={dashboardPreview}
                      alt="Biosy dashboard preview"
                      className="h-full w-full object-cover object-left-top"
                      draggable={false}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-black/15"
                    />
                  </div>
                </div>

                <div className="mx-auto mt-[6px] h-[3px] w-[18%] rounded-full bg-white/[0.08]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
