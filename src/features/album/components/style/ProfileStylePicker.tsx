import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { useAlbumStyle } from "@/features/album/hooks/useAlbumStyle";
import { AlbumI18nProvider, useAlbumI18n } from "@/features/album/i18n/album-messages";
import type { ProfileDisplayStyle } from "@/features/album/types/album.types";

function ProfileStylePickerInner() {
  const { t } = useAlbumI18n();
  const navigate = useNavigate();
  const { style, loading, saving, saveStyle } = useAlbumStyle();

  const select = async (next: ProfileDisplayStyle) => {
    const ok = await saveStyle(next);
    if (!ok) {
      toast.error("Não foi possível salvar o estilo. Tente novamente.");
      return;
    }
    toast.success(next === "album" ? "Estilo Álbum ativado" : "Estilo Card Normal ativado");
    navigate({
      to: "/dashboard",
      search: {
        view: "personalizar",
        panel: next === "album" ? "album-layout" : "perfil",
      },
    });
  };

  return (
    <div className="album-page album-style-picker">
      <h1 className="album-style-picker__title">{t("album.style.title")}</h1>
      <p className="album-style-picker__sub">{t("album.style.subtitle")}</p>

      <div className="album-style-picker__grid">
        <button
          type="button"
          disabled={loading || saving}
          className={`album-style-card ${style === "card" ? "album-style-card--active" : ""}`}
          onClick={() => void select("card")}
        >
          <div className="album-style-card__preview album-style-card__preview--card" />
          <div className="flex items-center gap-2 font-semibold">
            <LayoutTemplate className="h-4 w-4 text-[oklch(0.65_0.28_0)]" />
            {t("album.style.cardTitle")}
          </div>
          <p className="mt-1 text-sm text-white/45">{t("album.style.cardDesc")}</p>
        </button>

        <button
          type="button"
          disabled={loading || saving}
          className={`album-style-card ${style === "album" ? "album-style-card--active" : ""}`}
          onClick={() => void select("album")}
        >
          <div className="album-style-card__preview album-style-card__preview--album">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <LayoutGrid className="h-4 w-4 text-[oklch(0.65_0.28_0)]" />
            {t("album.style.albumTitle")}
          </div>
          <p className="mt-1 text-sm text-white/45">{t("album.style.albumDesc")}</p>
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-white/35">
        <Link to="/dashboard" className="underline hover:text-white/60">
          Voltar ao painel
        </Link>
      </p>
    </div>
  );
}

export function ProfileStylePicker() {
  return (
    <AlbumI18nProvider>
      <ProfileStylePickerInner />
    </AlbumI18nProvider>
  );
}
