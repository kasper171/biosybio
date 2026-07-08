import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";
import { useI18n } from "@/i18n/LocaleProvider";
import { LANYARD_INVITE_URL } from "@/lib/discord-verify";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function LanyardNotFoundModal({ open, onClose }: Props) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lanyard-not-found-title"
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xl backdrop-saturate-150"
        aria-hidden
        onClick={onClose}
      />

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-pink-500/35 via-violet-500/20 to-rose-500/25" />
        <div className="relative overflow-hidden rounded-[1.3rem] border border-white/10 bg-[#0f0f14]/95 shadow-2xl shadow-black/50">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label={t("dashboard.conexoes.discord.lanyardModal.close")}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <div className="relative px-6 pb-6 pt-8 sm:px-8">
            <div className="mb-4 flex justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-200">
                <AlertCircle className="h-6 w-6" aria-hidden />
              </span>
            </div>

            <h2
              id="lanyard-not-found-title"
              className="mb-3 text-center text-lg font-bold tracking-tight text-white sm:text-xl"
            >
              {t("dashboard.conexoes.discord.lanyardModal.title")}
            </h2>

            <p className="text-center text-sm leading-relaxed text-white/75">
              {t("dashboard.conexoes.discord.lanyardModal.body")}
            </p>
            <p className="mt-3 text-center text-sm leading-relaxed text-white/55">
              {t("dashboard.conexoes.discord.lanyardModal.bodyWait")}
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a
                href={LANYARD_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {t("dashboard.conexoes.discord.lanyardModal.joinServer")}
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
              >
                {t("dashboard.conexoes.discord.lanyardModal.close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
