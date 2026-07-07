import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Save, Eye, User, Image as ImageIcon, Palette, Link2, Upload,
  X, Check, Trash2, Play, Pause, MessageSquare,
  PanelLeftClose, ChevronRight, LayoutTemplate,
} from "lucide-react";
import {
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_LAYOUT,
  DEFAULT_CARD_WIDTH,
  uploadProfileAsset,
  type Profile,
} from "@/lib/profile-storage";
import { PublicProfileView } from "@/components/PublicProfileView";
import { DashboardOverviewPage } from "@/components/dashboard/DashboardOverviewPage";
import { DashboardEstatisticasPage } from "@/components/dashboard/DashboardEstatisticasPage";
import { DashboardPrivacidadePage } from "@/components/dashboard/DashboardPrivacidadePage";
import { DashboardTemplatesPage } from "@/components/dashboard/DashboardTemplatesPage";
import { FontPickerField, DEFAULT_PAGE_FONT_STACK } from "@/components/dashboard/FontPickerField";
import { TextAnimationPicker } from "@/components/dashboard/TextAnimationPicker";
import type { TextAnimationId } from "@/lib/text-animations";
import { SaveTemplateDialog } from "@/components/templates/SaveTemplateDialog";
import { BlocosPanel } from "@/components/dashboard/BlocosPanel";
import { useProfileBlocks } from "@/hooks/useProfileBlocks";
import {
  CARD_HEIGHT_SLIDER_MAX,
  clampCardHeight,
  estimateMinCardHeight,
} from "@/lib/card-min-height";
import { syncLivePublicTemplate, ensureLivePublicTemplateIfEnabled } from "@/lib/profile-template";
import {
  DashboardAccountLayout,
  PERSONALIZE_PANELS,
  type PersonalizePanelKey,
} from "@/components/dashboard/DashboardAccountLayout";
import { normalizeProfile } from "@/lib/normalize-profile";
import { getMusicCardWidthPct } from "@/lib/profile-music";
import {
  TEXT_GLOW_MAX_PX,
  TEXT_GLOW_SCOPE_LABELS,
  normalizeTextGlowScope,
  type TextGlowScope,
} from "@/lib/profile-colors";
import {
  DASHBOARD_TEXT_SCALE_DEFAULT,
  getDashboardTextScale,
  type DashboardTextScale,
} from "@/lib/dashboard-text-scale";
import { BannerPositionEditor } from "@/components/BannerPositionEditor";
import { DiscordConnectedCard } from "@/components/dashboard/DiscordConnectedCard";
import { HotelConnectionPanel } from "@/components/dashboard/HotelConnectionPanel";
import { MoldurasPanel } from "@/components/dashboard/MoldurasPanel";
import { SOCIALS, SOCIAL_MAP, normalizeHandle } from "@/lib/socials";
import { CARD_REVEAL_OPTIONS } from "@/lib/card-reveal";
import { BiosyToggle } from "@/components/ui/BiosyToggle";
import { cn } from "@/lib/utils";
import { canUseAvatarFrame } from "@/lib/avatar-frames";
import { attachProfileRoles } from "@/lib/profile-roles";
import {
  DISCORD_OTP_WAIT_MS,
  DISCORD_OTP_VALIDATE_WINDOW_MS,
  DISCORD_VERIFY_MESSAGES,
  LANYARD_INVITE_URL,
  generateDiscordOtp,
} from "@/lib/discord-verify";
import { CONNECTION_ALREADY_LINKED_MESSAGE } from "@/lib/connection-verify";
import { linkVerifiedConnectionFn } from "@/lib/connection/connection.functions";

type PanelKey = PersonalizePanelKey;

type DashboardSearch = {
  view?: "personalizar";
  panel?: PanelKey;
  section?: "estatisticas" | "privacidade" | "templates";
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Biosy" }] }),
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    view: search.view === "personalizar" ? "personalizar" : undefined,
    panel: isPanelKey(search.panel) ? search.panel : undefined,
    section:
      search.section === "estatisticas"
        ? "estatisticas"
        : search.section === "privacidade"
          ? "privacidade"
          : search.section === "templates"
            ? "templates"
            : undefined,
  }),
  component: Dashboard,
});

function isPanelKey(value: unknown): value is PanelKey {
  return (
    value === "perfil" ||
    value === "midia" ||
    value === "audio" ||
    value === "blocos" ||
    value === "aparencia" ||
    value === "molduras" ||
    value === "efeitos" ||
    value === "colors" ||
    value === "redes" ||
    value === "conexoes" ||
    value === "comentarios"
  );
}

const PERSONALIZE_PANELS_NAV = PERSONALIZE_PANELS;

const TOOLS_PANEL_WIDTH = 360;
const TOOLS_OPEN_STORAGE_KEY = "biosy-editor-tools-open";

function Dashboard() {
  const { view, panel: panelFromSearch, section } = Route.useSearch();
  const isPersonalizar = view === "personalizar";
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [textScale, setTextScale] = useState<DashboardTextScale>(DASHBOARD_TEXT_SCALE_DEFAULT);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [openPanel, setOpenPanel] = useState<PanelKey>(panelFromSearch ?? "perfil");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);
  const innerBannerRef = useRef<HTMLInputElement>(null);
  const musicRef = useRef<HTMLInputElement>(null);
  const musicArtRef = useRef<HTMLInputElement>(null);
  const { blocks, setBlocks } = useProfileBlocks(profile?.id);

  const minCardHeight = useMemo(
    () => (profile ? estimateMinCardHeight(profile, { blocks }) : DEFAULT_CARD_HEIGHT),
    [profile, blocks],
  );

  useEffect(() => {
    if (!profile) return;
    const current = profile.card_height ?? DEFAULT_CARD_HEIGHT;
    if (current < minCardHeight) {
      setProfile((prev) => (prev ? { ...prev, card_height: minCardHeight } : prev));
    }
  }, [minCardHeight, profile?.card_height, profile?.id]);

  useEffect(() => {
    setTextScale(getDashboardTextScale());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(TOOLS_OPEN_STORAGE_KEY);
    if (stored === "0") setToolsOpen(false);
    if (stored === "1") setToolsOpen(true);
  }, []);

  const setToolsPanelOpen = (open: boolean) => {
    setToolsOpen(open);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TOOLS_OPEN_STORAGE_KEY, open ? "1" : "0");
    }
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);

      const applyProfile = async (row: Record<string, unknown>) => {
        const p = normalizeProfile(row);
        const withRoles = await attachProfileRoles(p);
        setProfile(normalizeProfile(withRoles as unknown as Record<string, unknown>));
        await ensureLivePublicTemplateIfEnabled(withRoles);
      };

      const { data, error } = await supabase
        .from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        await applyProfile(data as Record<string, unknown>);
      } else {
        // O trigger `handle_new_user` já cria o perfil no cadastro — aguarda e busca de novo
        for (let attempt = 0; attempt < 4; attempt++) {
          await new Promise((r) => setTimeout(r, 350));
          const { data: retry, error: retryErr } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", u.user.id)
            .maybeSingle();
          if (retryErr) {
            toast.error(retryErr.message);
            break;
          }
          if (retry) {
            await applyProfile(retry as Record<string, unknown>);
            return;
          }
        }

        // Fallback raro: trigger não rodou — upsert evita erro de chave duplicada
        const fallbackUser =
          (u.user.user_metadata?.username as string | undefined) ??
          u.user.email?.split("@")[0] ??
          "user";
        const cleanUser =
          fallbackUser.toLowerCase().replace(/[^a-z0-9_]/g, "") + u.user.id.slice(0, 4);
        const { error: upsertErr } = await supabase.from("profiles").upsert(
          {
            id: u.user.id,
            username: cleanUser,
            display_name: fallbackUser,
            public_template_enabled: true,
            card_layout: DEFAULT_CARD_LAYOUT,
            card_width: DEFAULT_CARD_WIDTH,
            card_height: DEFAULT_CARD_HEIGHT,
          },
          { onConflict: "id", ignoreDuplicates: true },
        );
        const { data: created, error: fetchErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.user.id)
          .maybeSingle();
        if (fetchErr) toast.error(fetchErr.message);
        else if (created) await applyProfile(created as Record<string, unknown>);
        else if (upsertErr) toast.error(upsertErr.message);
        else toast.error("Não foi possível carregar seu perfil. Recarregue a página.");
      }
    })();
  }, []);

  useEffect(() => {
    if (panelFromSearch) setOpenPanel(panelFromSearch);
  }, [panelFromSearch]);

  const update = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => (p ? { ...p, [k]: v } : p));

  const handleUpload = async (
    kind: "avatar" | "banner" | "background" | "inner_banner" | "music" | "music_art",
    file: File | undefined,
  ) => {
    if (!file || !userId) return;
    try {
      toast.loading(kind === "music" ? "Enviando áudio..." : kind === "music_art" ? "Enviando capa..." : "Enviando imagem...", { id: kind });
      const url = await uploadProfileAsset(userId, kind, file);
      const field =
        kind === "avatar" ? "avatar_url"
        : kind === "banner" ? "banner_url"
        : kind === "background" ? "background_url"
        : kind === "inner_banner" ? "inner_banner_url"
        : kind === "music_art" ? "music_card_art_url"
        : "music_url";
      setProfile((p) =>
        p
          ? {
              ...p,
              [field]: url,
              ...(kind === "inner_banner"
                ? { inner_banner_pos_x: 50, inner_banner_pos_y: 50 }
                : kind === "music"
                  ? {
                      music_title: file.name.replace(/\.[a-z0-9]+$/i, ""),
                      music_start_sec: 0,
                      music_end_sec: null,
                      tap_to_reveal_enabled: true,
                      music_card_enabled: true,
                    }
                : {}),
            }
          : p,
      );
      toast.success(
        kind === "music" ? "Música enviada" : kind === "music_art" ? "Capa enviada" : "Imagem enviada",
        { id: kind },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload", { id: kind });
    }
  };

  const handleRemoveMedia = (
    kind: "avatar" | "background" | "inner_banner" | "music" | "music_art",
  ) => {
    setProfile((p) => {
      if (!p) return p;
      if (kind === "avatar") return { ...p, avatar_url: null };
      if (kind === "background") return { ...p, background_url: null };
      if (kind === "music_art") return { ...p, music_card_art_url: null };
      if (kind === "music") {
        return {
          ...p,
          music_url: null,
          music_title: null,
          music_start_sec: 0,
          music_end_sec: null,
          music_card_art_url: null,
          music_card_title: null,
          music_card_subtitle: null,
        };
      }
      return {
        ...p,
        inner_banner_url: null,
        inner_banner_pos_x: 50,
        inner_banner_pos_y: 50,
      };
    });
    toast.success(
      kind === "music" ? "Música removida" : kind === "music_art" ? "Capa removida" : "Imagem removida",
    );
  };

  const handleSave = async () => {
    if (!profile) return;
    const savedCardHeight = clampCardHeight(profile, profile.card_height ?? DEFAULT_CARD_HEIGHT, blocks);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        avatar_border_color: profile.avatar_border_color ?? profile.card_border_color,
        avatar_border_width: profile.avatar_border_width ?? 4,
        avatar_size: profile.avatar_size ?? 96,
        avatar_frame_id: canUseAvatarFrame(profile.avatar_frame_id, profile)
          ? profile.avatar_frame_id
          : null,
        show_role_badges: profile.show_role_badges !== false,
        role_badges_monochrome: profile.role_badges_monochrome === true,
        role_badges_mono_color: profile.role_badges_mono_color ?? "#ffffff",
        banner_url: profile.banner_url,
        background_url: profile.background_url,
        background_color: profile.background_color,
        background_blur: profile.background_blur ?? 0,
        background_brightness: profile.background_brightness ?? 100,
        card_color: profile.card_color,
        card_opacity: profile.card_opacity,
        card_blur: profile.card_blur,
        card_border_color: profile.card_border_color,
        card_border_width: profile.card_border_width,
        card_border_radius: profile.card_border_radius,
        socials: profile.socials,
        card_width: profile.card_width,
        card_height: savedCardHeight,
        inner_banner_url: profile.inner_banner_url,
        inner_banner_pos_x: profile.inner_banner_pos_x ?? 50,
        inner_banner_pos_y: profile.inner_banner_pos_y ?? 50,
        effect_tilt: profile.effect_tilt,
        effect_hover: profile.effect_hover,
        effect_glow: profile.effect_glow,
        effect_glow_color: profile.effect_glow_color ?? profile.card_border_color,
        effect_glow_size: profile.effect_glow_size ?? 24,
        social_original_colors: profile.social_original_colors,
        social_icon_color: profile.social_icon_color ?? "#ffffff",
        social_icon_style: profile.social_icon_style ?? "boxed",
        show_social_titles: profile.show_social_titles === true,
        card_border_style: profile.card_border_style,
        discord_user_id: profile.discord_user_id,
        discord_card_mode: profile.discord_card_mode ?? "inside",
        discord_show_badges: profile.discord_show_badges !== false,
        discord_inside_scale: profile.discord_inside_scale ?? 100,
        hotel_platform: profile.hotel_platform ?? null,
        hotel_username: profile.hotel_username ?? null,
        hotel_domain: profile.hotel_domain ?? null,
        hotel_figure: profile.hotel_figure ?? null,
        hotel_motto: profile.hotel_motto ?? null,
        hotel_level: profile.hotel_level ?? null,
        hotel_achievement_points: profile.hotel_achievement_points ?? null,
        habbo_username: profile.habbo_username,
        habbo_domain: profile.habbo_domain,
        habbo_figure: profile.habbo_figure,
        habbo_motto: profile.habbo_motto,
        habbo_level: profile.habbo_level,
        habblet_username: profile.habblet_username,
        habblet_figure: profile.habblet_figure,
        habblet_motto: profile.habblet_motto,
        habblet_achievement_points: profile.habblet_achievement_points,
        hotel_card_placement: profile.hotel_card_placement ?? "inside",
        hotel_card_row: profile.hotel_card_row ?? "separate_row",
        hotel_card_shape: profile.hotel_card_shape ?? "rectangle",
        hotel_card_size: profile.hotel_card_size ?? "md",
        show_view_count: profile.show_view_count !== false,
        show_username: profile.show_username !== false,
        show_public_uid: profile.show_public_uid !== false,
        tap_to_reveal_enabled: profile.music_url ? true : profile.tap_to_reveal_enabled === true,
        tap_reveal_blur: profile.tap_reveal_blur ?? 20,
        tap_reveal_brightness: profile.tap_reveal_brightness ?? 55,
        tap_reveal_mode: profile.tap_reveal_mode ?? "avatar_text",
        tap_reveal_text: profile.tap_reveal_text ?? "Toque para revelar",
        card_reveal_effect: profile.card_reveal_effect ?? "fade",
        text_typing_effect: profile.text_typing_effect !== false,
        text_typing_name_effect: profile.text_typing_name_effect !== false,
        text_typing_bio_effect: profile.text_typing_bio_effect !== false,
        music_url: profile.music_url,
        music_title: profile.music_title,
        music_start_sec: profile.music_start_sec ?? 0,
        music_end_sec: profile.music_end_sec,
        music_card_enabled: profile.music_card_enabled !== false,
        music_card_art_url: profile.music_card_art_url,
        music_card_title: profile.music_card_title,
        music_card_subtitle: profile.music_card_subtitle,
        music_card_width_pct: getMusicCardWidthPct(profile.music_card_width_pct),
        comments_enabled: profile.comments_enabled !== false,
        effect_border_glow: profile.effect_border_glow === true,
        effect_tilt_strength: profile.effect_tilt_strength ?? 5,
        card_layout: profile.card_layout ?? DEFAULT_CARD_LAYOUT,
        public_template_enabled: profile.public_template_enabled === true,
        page_font_family: profile.page_font_family,
        name_font_family: profile.name_font_family,
        title_text_color: profile.title_text_color,
        body_text_color: profile.body_text_color,
        muted_text_color: profile.muted_text_color,
        icon_color: profile.icon_color,
        badge_bg_color: profile.badge_bg_color,
        badge_text_color: profile.badge_text_color,
        inner_divider_color: profile.inner_divider_color,
        inner_divider_opacity: profile.inner_divider_opacity,
        text_glow_enabled: profile.text_glow_enabled === true,
        text_glow_color: profile.text_glow_color,
        text_glow_size: profile.text_glow_size ?? 0,
        text_glow_scope: profile.text_glow_scope ?? "all",
        name_text_animation: profile.name_text_animation ?? "none",
        bio_text_animation: profile.bio_text_animation ?? "none",
        name_particle_color: profile.name_particle_color ?? "#ff2d7a",
        bio_particle_color: profile.bio_particle_color ?? "#ff2d7a",
      })
      .eq("id", profile.id);
    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }
    try {
      await syncLivePublicTemplate({ ...profile, card_height: savedCardHeight });
    } catch (syncErr) {
      console.error("[syncLivePublicTemplate]", syncErr);
    }
    setProfile((p) => (p ? { ...p, card_height: savedCardHeight } : p));
    setSaving(false);
    toast.success("Perfil salvo!");
  };

  const panelLabel =
    PERSONALIZE_PANELS_NAV.find((p) => p.key === openPanel)?.label ?? "Personalizar";

  if (!profile) return <div className="grid min-h-screen place-items-center text-white/60">Carregando...</div>;

  if (!isPersonalizar) {
    if (section === "estatisticas") {
      return <DashboardEstatisticasPage profile={profile} />;
    }
    if (section === "privacidade") {
      return (
        <DashboardPrivacidadePage profile={profile} onProfileChange={setProfile} />
      );
    }
    if (section === "templates") {
      return (
        <DashboardTemplatesPage profile={profile} onProfileChange={setProfile} />
      );
    }
    return <DashboardOverviewPage profile={profile} />;
  }

  return (
    <div
      className="biosy-dash relative min-h-screen overflow-hidden"
      data-text-scale={textScale}
      style={{ ["--dash-tools-w" as string]: `${TOOLS_PANEL_WIDTH}px` }}
    >
      <motion.div
        className="absolute inset-0 overflow-auto"
        animate={{
          marginLeft: toolsOpen
            ? `calc(var(--dash-sidebar-w) + ${TOOLS_PANEL_WIDTH}px)`
            : "var(--dash-sidebar-w)",
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <PublicProfileView
          profile={profile}
          blocks={blocks}
          isEditor
          onProfileChange={setProfile}
        />
      </motion.div>

      <DashboardAccountLayout
        overlay
        profile={profile}
        activeSection="personalizar"
        activePanel={openPanel}
      />

      <motion.aside
        key="tools-panel"
        initial={false}
        animate={{ x: toolsOpen ? 0 : -TOOLS_PANEL_WIDTH - 8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="biosy-dashboard-shell fixed inset-y-0 left-[var(--dash-sidebar-w)] z-30 flex flex-col border-r"
        style={{ width: TOOLS_PANEL_WIDTH }}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.05] px-4 py-3">
          <h2 className="min-w-0 truncate dash-t-body font-semibold text-white">{panelLabel}</h2>
          <button
            type="button"
            onClick={() => setToolsPanelOpen(false)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            title="Minimizar ferramentas"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Minimizar</span>
          </button>
        </div>
        <div className="biosy-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={openPanel}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {openPanel === "perfil" && <PerfilPanel profile={profile} update={update} />}
              {openPanel === "midia" && (
                <MidiaPanel
                  profile={profile}
                  update={update}
                  refs={{ avatarRef, bannerRef, bgRef, innerBannerRef }}
                  handleUpload={handleUpload}
                  handleRemove={handleRemoveMedia}
                />
              )}
              {openPanel === "audio" && (
                <AudioPanel
                  profile={profile}
                  update={update}
                  musicRef={musicRef}
                  musicArtRef={musicArtRef}
                  handleUpload={handleUpload}
                  handleRemove={handleRemoveMedia}
                />
              )}
              {openPanel === "blocos" && profile && (
                <BlocosPanel
                  profile={profile}
                  blocks={blocks}
                  onBlocksChange={setBlocks}
                />
              )}
              {openPanel === "aparencia" && profile && (
                <AparenciaPanel
                  profile={profile}
                  update={update}
                  blocks={blocks}
                  minCardHeight={minCardHeight}
                />
              )}
              {openPanel === "molduras" && <MoldurasPanel profile={profile} update={update} />}
              {openPanel === "efeitos" && <EfeitosPanel profile={profile} update={update} />}
              {openPanel === "colors" && <ColorsPanel profile={profile} update={update} />}
              {openPanel === "redes" && <RedesPanel profile={profile} update={update} />}
              {openPanel === "conexoes" && <ConexoesPanel profile={profile} update={update} />}
              {openPanel === "comentarios" && <ComentariosPanel profile={profile} update={update} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.aside>

      {!toolsOpen && (
        <button
          type="button"
          onClick={() => setToolsPanelOpen(true)}
          className="biosy-tools-reveal-tab group fixed z-30"
          style={{
            left: "var(--dash-sidebar-w)",
            top: "calc(50% + 48px)",
            transform: "translateY(-50%)",
          }}
          title="Abrir ferramentas"
          aria-label="Abrir ferramentas"
        >
          <span className="biosy-tools-reveal-glow" aria-hidden />
          <span className="biosy-tools-reveal-ring" aria-hidden />
          <ChevronRight className="biosy-tools-reveal-icon relative z-[2] h-[18px] w-[18px]" strokeWidth={2.25} />
        </button>
      )}

      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end p-4"
        style={{
          paddingLeft: toolsOpen
            ? `calc(var(--dash-sidebar-w) + ${TOOLS_PANEL_WIDTH}px + 1rem)`
            : "calc(var(--dash-sidebar-w) + 1rem)",
        }}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setToolsPanelOpen(!toolsOpen)}
            className="biosy-dashboard-shell flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white"
            title={toolsOpen ? "Minimizar ferramentas" : "Abrir ferramentas"}
            aria-label={toolsOpen ? "Minimizar ferramentas" : "Abrir ferramentas"}
          >
            {toolsOpen ? (
              <>
                <PanelLeftClose className="h-3.5 w-3.5" />
                <span>Ocultar painel</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <Link
            to="/$username"
            params={{ username: profile.username }}
            target="_blank"
            className="biosy-dashboard-shell flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.04]"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver ao vivo
          </Link>
          <button
            type="button"
            onClick={() => setSaveTemplateOpen(true)}
            className="biosy-dashboard-shell flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.04]"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Salvar template
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12] disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </motion.div>

      {userId && (
        <SaveTemplateDialog
          open={saveTemplateOpen}
          onOpenChange={setSaveTemplateOpen}
          profile={profile}
          userId={userId}
        />
      )}

      <input ref={avatarRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload("avatar", e.target.files?.[0])} />
      <input ref={bannerRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload("banner", e.target.files?.[0])} />
      <input ref={bgRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload("background", e.target.files?.[0])} />
      <input ref={innerBannerRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload("inner_banner", e.target.files?.[0])} />
      <input ref={musicRef} type="file" accept="audio/*,video/mp4" hidden onChange={(e) => handleUpload("music", e.target.files?.[0])} />
      <input ref={musicArtRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload("music_art", e.target.files?.[0])} />
    </div>
  );
}

/* ===================== PANELS ===================== */

function PerfilPanel({ profile, update }: { profile: Profile; update: <K extends keyof Profile>(k: K, v: Profile[K]) => void }) {
  const effectiveTapEnabled = profile.music_url ? true : profile.tap_to_reveal_enabled === true;
  return (
    <div className="space-y-4">
      <Field label="Nome exibido">
        <input
          value={profile.display_name}
          onChange={(e) => update("display_name", e.target.value)}
          className={panelInputClass}
        />
      </Field>
      <Field label="Descrição / Bio">
        <textarea
          value={profile.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={4} maxLength={280}
          className={`${panelInputClass} resize-none`}
        />
        <p className="mt-1 text-xs text-white/40">{profile.bio.length}/280</p>
      </Field>

      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Badges de cargo</p>
        <ToggleField
          label="Mostrar badges no perfil"
          checked={profile.show_role_badges !== false}
          onChange={(v) => update("show_role_badges", v)}
        />
        <ToggleField
          label="Cor monocromática"
          checked={profile.role_badges_monochrome === true}
          onChange={(v) => update("role_badges_monochrome", v)}
        />
        {profile.role_badges_monochrome && (
          <Field label="Cor dos badges">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.role_badges_mono_color ?? "#ffffff"}
                onChange={(e) => update("role_badges_mono_color", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <input
                value={profile.role_badges_mono_color ?? "#ffffff"}
                onChange={(e) => update("role_badges_mono_color", e.target.value)}
                className={panelInputClass}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-white/40">
              Aplica tons escuros e claros automaticamente para preservar o relevo de cada badge.
            </p>
          </Field>
        )}
        {(profile.roles?.length ?? 0) > 0 ? (
          <p className="text-[11px] text-white/45">
            Seus cargos: {profile.roles!.map((r) => r.label).join(", ")}
          </p>
        ) : (
          <p className="text-[11px] text-white/35">Nenhum cargo atribuído à sua conta.</p>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Toque para revelar</p>
        <ToggleField
          label="Ativar tela de toque"
          checked={effectiveTapEnabled}
          disabled={Boolean(profile.music_url)}
          onChange={(v) => {
            if (profile.music_url) {
              toast.error("Remova a música para desativar o clique para revelar");
              return;
            }
            update("tap_to_reveal_enabled", v);
          }}
        />
        {profile.music_url && (
          <p className="text-[11px] text-amber-300/80">
            Com música ativa, o clique para revelar é obrigatório para autoplay.
          </p>
        )}
        {effectiveTapEnabled && (
          <>
            <SliderField
              label="Desfoque do fundo"
              min={0}
              max={40}
              step={1}
              value={profile.tap_reveal_blur ?? 20}
              onChange={(v) => update("tap_reveal_blur", v)}
              display={`${profile.tap_reveal_blur ?? 20}px`}
            />
            <SliderField
              label="Brilho do fundo"
              min={20}
              max={120}
              step={5}
              value={profile.tap_reveal_brightness ?? 55}
              onChange={(v) => update("tap_reveal_brightness", v)}
              display={`${profile.tap_reveal_brightness ?? 55}%`}
            />
            <Field label="Texto da tela">
              <input
                value={profile.tap_reveal_text ?? "Toque para revelar"}
                onChange={(e) => update("tap_reveal_text", e.target.value)}
                maxLength={80}
                placeholder="Toque para revelar"
                className={panelInputClass}
              />
            </Field>
            <p className="text-[11px] text-white/45">Exibido abaixo do avatar ou sozinho, conforme o modo.</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Modo de exibição</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update("tap_reveal_mode", "avatar_text")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                  (profile.tap_reveal_mode ?? "avatar_text") === "avatar_text"
                    ? "bg-white text-black"
                    : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"
                }`}
              >
                Avatar + texto
              </button>
              <button
                type="button"
                onClick={() => update("tap_reveal_mode", "text_only")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                  profile.tap_reveal_mode === "text_only"
                    ? "bg-white text-black"
                    : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"
                }`}
              >
                Só texto
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Entrada do card</p>
        <p className="text-[11px] leading-relaxed text-white/45">
          Como o perfil aparece após o toque ou ao carregar. Com Discord separado, o card principal entra primeiro.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CARD_REVEAL_OPTIONS.map(({ key, label, hint }) => (
            <button
              key={key}
              type="button"
              onClick={() => update("card_reveal_effect", key)}
              className={`rounded-lg px-2 py-2.5 text-center transition ${
                (profile.card_reveal_effect ?? "fade") === key
                  ? "bg-white text-black"
                  : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"
              }`}
            >
              <span className="block text-xs font-semibold">{label}</span>
              <span className="mt-0.5 block text-[9px] leading-tight opacity-70">{hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MidiaPanel({
  profile, update, refs, handleUpload, handleRemove,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
  refs: {
    avatarRef: React.RefObject<HTMLInputElement | null>;
    bannerRef: React.RefObject<HTMLInputElement | null>;
    bgRef: React.RefObject<HTMLInputElement | null>;
    innerBannerRef: React.RefObject<HTMLInputElement | null>;
  };
  handleUpload: (k: "avatar" | "banner" | "background" | "inner_banner" | "music", f: File | undefined) => void;
  handleRemove: (k: "avatar" | "background" | "inner_banner") => void;
}) {
  return (
    <div className="space-y-4">
      <MediaUpload
        label="Avatar"
        url={profile.avatar_url}
        onPick={() => refs.avatarRef.current?.click()}
        onRemove={() => handleRemove("avatar")}
        shape="circle"
      />
      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Anel do avatar</p>
        <ColorField
          label="Cor do anel"
          value={profile.avatar_border_color ?? profile.card_border_color}
          onChange={(v) => update("avatar_border_color", v)}
        />
        <SliderField
          label="Tamanho do anel"
          min={64}
          max={160}
          step={2}
          value={profile.avatar_size ?? 96}
          onChange={(v) => update("avatar_size", v)}
          display={`${profile.avatar_size ?? 96}px`}
        />
        <SliderField
          label="Espessura do anel"
          min={0}
          max={8}
          step={0.1}
          value={profile.avatar_border_width ?? 4}
          onChange={(v) => update("avatar_border_width", v)}
          display={`${profile.avatar_border_width ?? 4}px`}
        />
      </div>
      <MediaUpload
        label="Imagem de fundo da página"
        url={profile.background_url}
        onPick={() => refs.bgRef.current?.click()}
        onRemove={() => handleRemove("background")}
        shape="wide"
      />
      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Wallpaper</p>
        <SliderField
          label="Desfoque"
          min={0}
          max={30}
          step={1}
          value={profile.background_blur ?? 0}
          onChange={(v) => update("background_blur", v)}
          display={`${profile.background_blur ?? 0}px`}
        />
        <SliderField
          label="Brilho"
          min={40}
          max={160}
          step={5}
          value={profile.background_brightness ?? 100}
          onChange={(v) => update("background_brightness", v)}
          display={`${profile.background_brightness ?? 100}%`}
        />
      </div>
      <MediaUpload
        label="Banner interno do card"
        url={profile.inner_banner_url}
        onPick={() => refs.innerBannerRef.current?.click()}
        onRemove={() => handleRemove("inner_banner")}
        shape="wide"
      />
      {profile.inner_banner_url && (
        <BannerPositionEditor
          url={profile.inner_banner_url}
          posX={profile.inner_banner_pos_x ?? 50}
          posY={profile.inner_banner_pos_y ?? 50}
          onChange={(x, y) => {
            update("inner_banner_pos_x", x);
            update("inner_banner_pos_y", y);
          }}
        />
      )}
    </div>
  );
}

function AudioPanel({
  profile,
  update,
  musicRef,
  musicArtRef,
  handleUpload,
  handleRemove,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
  musicRef: React.RefObject<HTMLInputElement | null>;
  musicArtRef: React.RefObject<HTMLInputElement | null>;
  handleUpload: (k: "avatar" | "banner" | "background" | "inner_banner" | "music" | "music_art", f: File | undefined) => void;
  handleRemove: (k: "avatar" | "background" | "inner_banner" | "music" | "music_art") => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/45">
          Música do perfil
        </p>
        <p className="mb-3 text-[11px] leading-relaxed text-white/45">
          Envie um arquivo de áudio ou vídeo (mp3, mp4). A faixa toca em loop no trecho que você
          escolher. Com música ativa, a tela de toque para revelar fica obrigatória.
        </p>
        <MediaUpload
          label="Faixa (mp3 / mp4)"
          url={profile.music_url}
          onPick={() => musicRef.current?.click()}
          onRemove={() => handleRemove("music")}
          shape="wide"
          isMedia
        />
      </div>

      {profile.music_url && (
        <>
          <Field label="Título da faixa (player flutuante)">
            <input
              value={profile.music_title ?? ""}
              onChange={(e) => update("music_title", e.target.value)}
              placeholder="Nome da música"
              className={panelInputClass}
            />
          </Field>

          <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Card do player
            </p>
            <p className="text-[11px] leading-relaxed text-white/45">
              Exibe um card personalizado abaixo do seu perfil com capa circular, nome e controles de
              reprodução. Desative para usar apenas o botão flutuante no canto da tela.
            </p>
            <ToggleField
              label="Exibir card abaixo do perfil"
              checked={profile.music_card_enabled !== false}
              onChange={(v) => update("music_card_enabled", v)}
            />
            {profile.music_card_enabled !== false && (
              <>
                <Field label="Capa circular (imagem ou GIF)">
                  <MediaUpload
                    label="Arte do player"
                    url={profile.music_card_art_url}
                    onPick={() => musicArtRef.current?.click()}
                    onRemove={() => handleRemove("music_art")}
                    shape="square"
                  />
                  <p className="mt-1.5 text-[11px] text-white/40">
                    Deixe vazio para usar o ícone de música padrão.
                  </p>
                </Field>
                <Field label="Nome no card">
                  <input
                    value={profile.music_card_title ?? ""}
                    onChange={(e) => update("music_card_title", e.target.value || null)}
                    placeholder={profile.music_title ?? "Nome exibido no card"}
                    className={panelInputClass}
                  />
                </Field>
                <Field label="Subtítulo (opcional)">
                  <input
                    value={profile.music_card_subtitle ?? ""}
                    onChange={(e) => update("music_card_subtitle", e.target.value || null)}
                    placeholder="Artista, álbum, frase..."
                    className={panelInputClass}
                  />
                </Field>
                <SliderField
                  label="Largura do card do player"
                  min={40}
                  max={100}
                  step={5}
                  value={profile.music_card_width_pct ?? 100}
                  onChange={(v) => update("music_card_width_pct", v)}
                  display={`${profile.music_card_width_pct ?? 100}%`}
                />
                <p className="text-[11px] leading-relaxed text-white/40">
                  Percentual da largura do card principal. O player fica centralizado abaixo do perfil.
                </p>
              </>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
              Trecho em loop
            </p>
            <MusicTrimEditor
              url={profile.music_url}
              startSec={profile.music_start_sec ?? 0}
              endSec={profile.music_end_sec}
              onChangeStart={(v) => update("music_start_sec", v)}
              onChangeEnd={(v) => update("music_end_sec", v)}
            />
          </div>
        </>
      )}
    </div>
  );
}

type CardLayoutOption = { value: "default" | "centered" | "aligned"; label: string; desc: string; preview: React.ReactNode };

const CARD_LAYOUT_OPTIONS: CardLayoutOption[] = [
  {
    value: "default",
    label: "Padrão",
    desc: "Avatar no topo, conteúdo abaixo",
    preview: (
      <svg viewBox="0 0 60 72" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="72" rx="6" fill="currentColor" opacity="0.08" />
        <circle cx="30" cy="20" r="9" fill="currentColor" opacity="0.55" />
        <rect x="18" y="33" width="24" height="3.5" rx="1.5" fill="currentColor" opacity="0.6" />
        <rect x="22" y="39" width="16" height="2.5" rx="1.25" fill="currentColor" opacity="0.35" />
        <rect x="14" y="46" width="32" height="2" rx="1" fill="currentColor" opacity="0.2" />
        <rect x="16" y="50" width="28" height="2" rx="1" fill="currentColor" opacity="0.15" />
        <rect x="8" y="59" width="44" height="7" rx="3" fill="currentColor" opacity="0.18" />
      </svg>
    ),
  },
  {
    value: "centered",
    label: "Centralizado",
    desc: "Tudo alinhado no centro",
    preview: (
      <svg viewBox="0 0 60 72" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="72" rx="6" fill="currentColor" opacity="0.08" />
        <circle cx="30" cy="24" r="11" fill="currentColor" opacity="0.55" />
        <rect x="17" y="39" width="26" height="3.5" rx="1.5" fill="currentColor" opacity="0.6" />
        <rect x="21" y="45" width="18" height="2.5" rx="1.25" fill="currentColor" opacity="0.35" />
        <rect x="15" y="52" width="30" height="2" rx="1" fill="currentColor" opacity="0.2" />
        <g transform="translate(20,58)">
          <rect x="0" y="0" width="6" height="6" rx="2" fill="currentColor" opacity="0.4" />
          <rect x="8" y="0" width="6" height="6" rx="2" fill="currentColor" opacity="0.4" />
          <rect x="16" y="0" width="6" height="6" rx="2" fill="currentColor" opacity="0.4" />
        </g>
      </svg>
    ),
  },
  {
    value: "aligned",
    label: "Alinhado",
    desc: "Avatar à esquerda, info à direita",
    preview: (
      <svg viewBox="0 0 60 72" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="72" rx="6" fill="currentColor" opacity="0.08" />
        <circle cx="16" cy="22" r="9" fill="currentColor" opacity="0.55" />
        <rect x="30" y="14" width="22" height="4" rx="1.75" fill="currentColor" opacity="0.6" />
        <rect x="30" y="21" width="16" height="2.5" rx="1.25" fill="currentColor" opacity="0.35" />
        <rect x="30" y="27" width="20" height="2" rx="1" fill="currentColor" opacity="0.2" />
        <rect x="8" y="40" width="44" height="1" rx="0.5" fill="currentColor" opacity="0.12" />
        <g transform="translate(10,46)">
          <rect x="0" y="0" width="7" height="7" rx="2" fill="currentColor" opacity="0.35" />
          <rect x="10" y="0" width="7" height="7" rx="2" fill="currentColor" opacity="0.35" />
          <rect x="20" y="0" width="7" height="7" rx="2" fill="currentColor" opacity="0.35" />
          <rect x="30" y="0" width="7" height="7" rx="2" fill="currentColor" opacity="0.35" />
        </g>
        <rect x="8" y="60" width="44" height="8" rx="3" fill="currentColor" opacity="0.18" />
      </svg>
    ),
  },
];

function LayoutPickerField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">Layout do card</p>
      <div className="grid grid-cols-3 gap-2">
        {CARD_LAYOUT_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all ${
                active
                  ? "border-pink-500/60 bg-pink-500/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <div className={`h-16 w-full rounded-lg p-1 ${active ? "bg-pink-500/10" : "bg-white/[0.03]"}`}>
                {opt.preview}
              </div>
              <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
              <span className="text-[10px] leading-tight text-white/40">{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AparenciaPanel({
  profile,
  update,
  blocks,
  minCardHeight,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
  blocks: import("@/lib/profile-blocks").ProfileBlock[];
  minCardHeight: number;
}) {
  const borderStyle = profile.card_border_style ?? "solid";
  const isCustomBorder = borderStyle !== "solid";
  const cardHeight = clampCardHeight(profile, profile.card_height ?? DEFAULT_CARD_HEIGHT, blocks);

  return (
    <div className="space-y-4">
      {/* Layout do card */}
      <LayoutPickerField
        value={profile.card_layout ?? DEFAULT_CARD_LAYOUT}
        onChange={(v) => {
          const next = v as Profile["card_layout"];
          update("card_layout", next);
          if (next === "aligned") {
            update("card_width", 630);
            update("card_height", 390);
            update("avatar_size", 160);
            update("avatar_border_width", 0);
          }
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Fundo da página" value={profile.background_color} onChange={(v) => update("background_color", v)} />
        <ColorField label="Cor do card" value={profile.card_color} onChange={(v) => update("card_color", v)} />
      </div>
      <SliderField label="Opacidade do card" min={0} max={1} step={0.05} value={profile.card_opacity} onChange={(v) => update("card_opacity", v)} display={`${Math.round(profile.card_opacity * 100)}%`} />
      <SliderField label="Desfoque (blur)" min={0} max={40} step={1} value={profile.card_blur} onChange={(v) => update("card_blur", v)} display={`${profile.card_blur}px`} />
      <SliderField label="Arredondamento" min={0} max={40} step={1} value={profile.card_border_radius} onChange={(v) => update("card_border_radius", v)} display={`${profile.card_border_radius}px`} />

      <BorderStylePicker value={borderStyle} onChange={(v) => update("card_border_style", v)} />

      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
          {isCustomBorder ? "Borda personalizada" : "Borda"}
        </p>

        {profile.effect_tilt ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2.5">
            <span className="mt-0.5 text-amber-400" aria-hidden>⚠</span>
            <p className="text-xs text-amber-300/90 leading-relaxed">
              Com o efeito Tilt 3D ativo não é possível usar bordas. Desative o Tilt para configurar a borda.
            </p>
          </div>
        ) : (
          <>
            <ColorField label="Cor da borda" value={profile.card_border_color} onChange={(v) => update("card_border_color", v)} />
            <SliderField label="Espessura da borda" min={0} max={8} step={0.1} value={profile.card_border_width} onChange={(v) => update("card_border_width", v)} display={`${profile.card_border_width}px`} />
            <ToggleField
              label="Efeito de borda (glowing)"
              checked={!!profile.effect_border_glow}
              onChange={(v) => update("effect_border_glow", v)}
            />
            {profile.effect_border_glow && (
              <p className="text-[11px] text-white/40">
                A borda segue o cursor do mouse com efeito de brilho animado.
              </p>
            )}
          </>
        )}
      </div>

      <SliderField label="Largura do card" min={280} max={1200} step={10} value={profile.card_width ?? DEFAULT_CARD_WIDTH} onChange={(v) => update("card_width", v)} display={`${profile.card_width ?? DEFAULT_CARD_WIDTH}px`} />
      <SliderField
        label="Altura do card"
        min={minCardHeight}
        max={CARD_HEIGHT_SLIDER_MAX}
        step={10}
        value={cardHeight}
        onChange={(v) => update("card_height", clampCardHeight(profile, v, blocks))}
        display={`${cardHeight}px`}
      />
      <p className="text-[11px] leading-relaxed text-white/40">
        Altura mínima: {minCardHeight}px — calculada pelo conteúdo do card (bio, redes, Discord, hotel, blocos internos).
      </p>

      <div className="border-t border-white/10 pt-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">Efeitos</h3>
        <ToggleField
          label="Tilt 3D (inclinar com mouse)"
          checked={!!profile.effect_tilt}
          onChange={(v) => {
            update("effect_tilt", v);
            if (v) {
              update("card_border_width", 0);
              update("effect_border_glow", false);
            }
          }}
        />
        {profile.effect_tilt && (
          <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <SliderField
              label="Força do tilt"
              min={1}
              max={10}
              step={1}
              value={profile.effect_tilt_strength ?? 5}
              onChange={(v) => update("effect_tilt_strength", v)}
              display={`${profile.effect_tilt_strength ?? 5}`}
            />
            <div className="mt-2 flex justify-between text-[10px] text-white/30">
              <span>Suave</span>
              <span>Forte</span>
            </div>
          </div>
        )}
        <ToggleField label="Elevar ao passar o mouse" checked={!!profile.effect_hover} onChange={(v) => update("effect_hover", v)} />
        <ToggleField label="Brilho (glow)" checked={!!profile.effect_glow} onChange={(v) => update("effect_glow", v)} />
        {profile.effect_glow && (
          <div className="mt-2 space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <ColorField
              label="Cor do brilho"
              value={profile.effect_glow_color ?? profile.card_border_color}
              onChange={(v) => update("effect_glow_color", v)}
            />
            <SliderField
              label="Tamanho do brilho"
              min={4}
              max={80}
              step={1}
              value={profile.effect_glow_size ?? 24}
              onChange={(v) => update("effect_glow_size", v)}
              display={`${profile.effect_glow_size ?? 24}px`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EfeitosPanel({ profile, update }: { profile: Profile; update: <K extends keyof Profile>(k: K, v: Profile[K]) => void }) {
  const resetEffects = () => {
    update("name_text_animation", "none");
    update("bio_text_animation", "none");
    update("name_particle_color", "#ff2d7a");
    update("bio_particle_color", "#ff2d7a");
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={resetEffects}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
      >
        Resetar efeitos de texto
      </button>
      <div className={panelSectionClass}>
        <p className={panelSectionTitleClass}>Animação de texto</p>
        <p className="mb-2 text-[11px] leading-relaxed text-white/40">
          Escolha o efeito para o nome ou para a descrição. A maioria usa as cores de Colors.
          O <span className="text-white/55">Glitch</span> mantém as cores próprias do efeito (vermelho/ciano).
          No Morphing, separe palavras com <span className="text-white/55">|</span> na bio.
        </p>
        <TextAnimationPicker
          label="Nome de exibição"
          value={(profile.name_text_animation ?? "none") as TextAnimationId}
          onChange={(v) => update("name_text_animation", v)}
          previewColor={profile.title_text_color ?? "#ffffff"}
          previewAccent={profile.text_glow_color ?? "#ff2d7a"}
          previewParticleColor={profile.name_particle_color ?? "#ff2d7a"}
        />
        {(profile.name_text_animation ?? "none") === "particle" && (
          <ColorField
            label="Cor das partículas (nome)"
            value={profile.name_particle_color ?? "#ff2d7a"}
            onChange={(v) => update("name_particle_color", v)}
          />
        )}
        <TextAnimationPicker
          label="Descrição / Bio"
          value={(profile.bio_text_animation ?? "none") as TextAnimationId}
          onChange={(v) => update("bio_text_animation", v)}
          previewColor={profile.body_text_color ?? "rgba(255,255,255,0.80)"}
          previewAccent={profile.text_glow_color ?? "#ff2d7a"}
          previewParticleColor={profile.bio_particle_color ?? "#ff2d7a"}
        />
        {(profile.bio_text_animation ?? "none") === "particle" && (
          <ColorField
            label="Cor das partículas (bio)"
            value={profile.bio_particle_color ?? "#ff2d7a"}
            onChange={(v) => update("bio_particle_color", v)}
          />
        )}
      </div>
    </div>
  );
}

function ColorsPanel({ profile, update }: { profile: Profile; update: <K extends keyof Profile>(k: K, v: Profile[K]) => void }) {
  const pageFont = profile.page_font_family ?? DEFAULT_PAGE_FONT_STACK;
  const nameFont = profile.name_font_family ?? "inherit";
  const resetColors = () => {
    update("page_font_family", DEFAULT_PAGE_FONT_STACK);
    update("name_font_family", "inherit");
    update("title_text_color", "#ffffff");
    update("body_text_color", "rgba(255,255,255,0.80)");
    update("muted_text_color", "rgba(255,255,255,0.55)");
    update("icon_color", "rgba(255,255,255,0.85)");
    update("badge_bg_color", "rgba(0,0,0,0.45)");
    update("badge_text_color", "rgba(255,255,255,0.85)");
    update("inner_divider_color", "#ffffff");
    update("inner_divider_opacity", 0.15);
    update("text_glow_enabled", false);
    update("text_glow_color", "#ff2d7a");
    update("text_glow_size", 0);
    update("text_glow_scope", "all");
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={resetColors}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
      >
        Resetar para o padrão do site
      </button>
      <div className={panelSectionClass}>
        <p className={panelSectionTitleClass}>Fontes</p>
        <FontPickerField
          label="Fonte da página inteira"
          value={pageFont}
          onChange={(v) => update("page_font_family", v)}
        />
        <FontPickerField
          label="Fonte do nome de exibição"
          value={nameFont}
          onChange={(v) => update("name_font_family", v)}
          allowInherit
        />
      </div>

      <div className={panelSectionClass}>
        <p className={panelSectionTitleClass}>Cores de texto</p>
        <ColorField label="Títulos (nome e headings)" value={profile.title_text_color ?? "#ffffff"} onChange={(v) => update("title_text_color", v)} />
        <ColorField label="Texto (bio/descrições)" value={profile.body_text_color ?? "rgba(255,255,255,0.80)"} onChange={(v) => update("body_text_color", v)} />
        <ColorField label="Texto secundário (@, labels)" value={profile.muted_text_color ?? "rgba(255,255,255,0.55)"} onChange={(v) => update("muted_text_color", v)} />
      </div>

      <div className={panelSectionClass}>
        <p className={panelSectionTitleClass}>Ícones e detalhes</p>
        <ColorField label="Cor de ícones" value={profile.icon_color ?? "rgba(255,255,255,0.85)"} onChange={(v) => update("icon_color", v)} />
        <ColorField label="Badge (fundo)" value={profile.badge_bg_color ?? "rgba(0,0,0,0.45)"} onChange={(v) => update("badge_bg_color", v)} />
        <ColorField label="Badge (texto)" value={profile.badge_text_color ?? "rgba(255,255,255,0.85)"} onChange={(v) => update("badge_text_color", v)} />
        <ColorField label="Divisor interno" value={profile.inner_divider_color ?? "#ffffff"} onChange={(v) => update("inner_divider_color", v)} />
        <SliderField
          label="Opacidade do divisor interno"
          min={0}
          max={1}
          step={0.05}
          value={profile.inner_divider_opacity ?? 0.15}
          onChange={(v) => update("inner_divider_opacity", v)}
          display={`${Math.round((profile.inner_divider_opacity ?? 0.15) * 100)}%`}
        />
      </div>

      <div className={panelSectionClass}>
        <p className={panelSectionTitleClass}>Bloom / Glow em textos</p>
        <ToggleField
          label="Ativar glow em textos"
          checked={profile.text_glow_enabled === true}
          onChange={(v) => {
            update("text_glow_enabled", v);
            if (v && (profile.text_glow_size ?? 0) <= 0) {
              update("text_glow_size", TEXT_GLOW_MAX_PX);
            }
          }}
        />
        {profile.text_glow_enabled && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/55">Onde aplicar</label>
              <div className="grid gap-1.5">
                {(["display_name", "titles", "all"] as TextGlowScope[]).map((scope) => {
                  const active = normalizeTextGlowScope(profile.text_glow_scope) === scope;
                  return (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => update("text_glow_scope", scope)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left text-sm transition",
                        active
                          ? "border-pink-500/50 bg-pink-500/10 text-white"
                          : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-white/15 hover:bg-white/[0.05]",
                      )}
                    >
                      {TEXT_GLOW_SCOPE_LABELS[scope]}
                    </button>
                  );
                })}
              </div>
            </div>
            <ColorField label="Cor do glow" value={profile.text_glow_color ?? "#ff2d7a"} onChange={(v) => update("text_glow_color", v)} />
            <SliderField
              label="Intensidade do glow"
              min={0}
              max={TEXT_GLOW_MAX_PX}
              step={1}
              value={Math.min(TEXT_GLOW_MAX_PX, profile.text_glow_size ?? TEXT_GLOW_MAX_PX)}
              onChange={(v) => update("text_glow_size", Math.min(TEXT_GLOW_MAX_PX, v))}
              display={`${Math.min(TEXT_GLOW_MAX_PX, profile.text_glow_size ?? TEXT_GLOW_MAX_PX)}px`}
            />
          </>
        )}
      </div>
    </div>
  );
}

function RedesPanel({ profile, update }: { profile: Profile; update: <K extends keyof Profile>(k: K, v: Profile[K]) => void }) {
  const useBrand = profile.social_original_colors !== false;
  const active = profile.socials ?? {};

  const removeSocial = (key: string) => {
    if (!(key in active)) return;
    const next = { ...active };
    delete next[key];
    update("socials", next);
  };

  const toggleSocial = (key: string) => {
    if (key in active) {
      removeSocial(key);
    } else {
      update("socials", { ...active, [key]: "" });
    }
  };

  const setHandle = (key: string, raw: string) => {
    const def = SOCIAL_MAP[key];
    const v = def ? normalizeHandle(def, raw) : raw;
    update("socials", { ...active, [key]: v });
  };

  return (
    <div className="space-y-5">
      {/* Color mode toggle */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">Cor dos ícones</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => update("social_original_colors", true)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${useBrand ? "bg-white text-black" : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"}`}
          >
            Cores originais
          </button>
          <button
            onClick={() => update("social_original_colors", false)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${!useBrand ? "bg-white text-black" : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"}`}
          >
            Personalizada
          </button>
        </div>
        {!useBrand && (
          <div className="mt-3">
            <ColorField
              label="Cor dos ícones"
              value={profile.social_icon_color ?? "#ffffff"}
              onChange={(v) => update("social_icon_color", v)}
            />
          </div>
        )}
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">
            Estilo dos ícones
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update("social_icon_style", "boxed")}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                (profile.social_icon_style ?? "boxed") === "boxed"
                  ? "bg-white text-black"
                  : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"
              }`}
            >
              Quadradinho
            </button>
            <button
              type="button"
              onClick={() => update("social_icon_style", "logo")}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                profile.social_icon_style === "logo"
                  ? "bg-white text-black"
                  : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"
              }`}
            >
              Só logo
            </button>
          </div>
        </div>
        <div className="mt-3">
          <ToggleField
            label="Mostrar título"
            checked={profile.show_social_titles === true}
            onChange={(v) => update("show_social_titles", v)}
          />
          <p className="mt-1 text-[11px] leading-relaxed text-white/40">
            Exibe o nome da rede abaixo do ícone no card (ex.: Imgur, GitHub).
          </p>
        </div>
      </div>

      {/* Grid of social icons */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">Escolha as redes</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {SOCIALS.map((s) => {
            const isActive = s.key in active;
            const Icon = s.icon;
            const color = useBrand ? s.brandColor : (profile.social_icon_color ?? "#ffffff");
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSocial(s.key)}
                title={s.label}
                className={`group relative aspect-square rounded-xl border bg-white/[0.03] transition hover:bg-white/[0.06] ${
                  isActive ? "border-pink-500/50 ring-2 ring-pink-500/20" : "border-white/[0.06] hover:border-white/15"
                }`}
              >
                <Icon className="mx-auto h-5 w-5" style={{ color: isActive ? color : "rgba(255,255,255,0.55)" }} />
                <span className="mt-1 block truncate px-1 text-[10px] text-white/80">{s.label}</span>
                {isActive && (
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-green-500 text-[10px] text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs for active socials */}
      {Object.keys(active).length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">Preencha seus links</p>
          <div className="space-y-2">
            {Object.keys(active).map((key) => {
              const def = SOCIAL_MAP[key];
              if (!def) return null;
              const Icon = def.icon;
              const value = active[key] ?? "";
              const displayColor = useBrand ? def.brandColor : (profile.social_icon_color ?? "#ffffff");
              return (
                <div key={key} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/5 border border-white/10">
                      <Icon className="h-4 w-4" style={{ color: displayColor }} />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center rounded-md border border-white/10 bg-black/40 pl-2 text-xs">
                      <span className="truncate text-white/40">{def.prefix}</span>
                      <input
                        value={value}
                        onChange={(e) => setHandle(key, e.target.value)}
                        placeholder={def.placeholder}
                        className="w-full min-w-0 bg-transparent px-1 py-2 text-white outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSocial(key)}
                      className="shrink-0 rounded-md p-1.5 text-white/50 transition hover:bg-white/[0.06] hover:text-red-400"
                      title="Remover"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type ProfileCommentRow = {
  id: number;
  profile_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  is_visible: boolean;
  created_at: string;
};

function ComentariosPanel({
  profile,
  update,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
}) {
  const [comments, setComments] = useState<ProfileCommentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profile_comments")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComments((data as ProfileCommentRow[]) ?? []);
  };

  useEffect(() => {
    void loadComments();
  }, [profile.id]);

  const toggleVisibility = async (comment: ProfileCommentRow) => {
    const { error } = await supabase
      .from("profile_comments")
      .update({ is_visible: !comment.is_visible })
      .eq("id", comment.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComments((prev) => prev.map((c) => (
      c.id === comment.id ? { ...c, is_visible: !c.is_visible } : c
    )));
  };

  const deleteComment = async (id: number) => {
    const { error } = await supabase
      .from("profile_comments")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <ToggleField
          label="Mostrar comentários no perfil público"
          checked={profile.comments_enabled !== false}
          onChange={(v) => update("comments_enabled", v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
          Todos os comentários
        </p>
        <button
          type="button"
          onClick={() => void loadComments()}
          className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-white/70 transition hover:bg-white/10"
        >
          Recarregar
        </button>
      </div>

      {loading && <p className="text-xs text-white/55">Carregando...</p>}
      {!loading && comments.length === 0 && (
        <p className="text-xs text-white/45">Nenhum comentário ainda.</p>
      )}

      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/10">
                {c.author_avatar_url ? (
                  <img src={c.author_avatar_url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{c.author_name}</p>
                <p className="text-[10px] text-white/45">
                  {new Date(c.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                c.is_visible ? "bg-emerald-500/20 text-emerald-300" : "bg-yellow-500/20 text-yellow-300"
              }`}>
                {c.is_visible ? "Visível" : "Oculto"}
              </span>
            </div>
            <p className="mb-3 whitespace-pre-wrap text-xs text-white/80">{c.content}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void toggleVisibility(c)}
                className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-white/80 transition hover:bg-white/10"
              >
                {c.is_visible ? "Ocultar" : "Mostrar"}
              </button>
              <button
                type="button"
                onClick={() => void deleteComment(c.id)}
                className="rounded-md border border-red-300/30 px-2 py-1 text-[11px] text-red-200 transition hover:bg-red-500/20"
              >
                Apagar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConexoesPanel({ profile, update }: { profile: Profile; update: <K extends keyof Profile>(k: K, v: Profile[K]) => void }) {
  const [discordInput, setDiscordInput] = useState(profile.discord_user_id ?? "");
  const [discordLoading, setDiscordLoading] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [validateUnlockAt, setValidateUnlockAt] = useState<number | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [waitSecondsLeft, setWaitSecondsLeft] = useState(0);
  const [transferPending, setTransferPending] = useState(false);

  const applyPatch = (patch: Partial<Profile>) => {
    (Object.entries(patch) as [keyof Profile, Profile[keyof Profile]][]).forEach(([k, v]) =>
      update(k, v),
    );
  };

  useEffect(() => {
    setDiscordInput(profile.discord_user_id ?? "");
  }, [profile.discord_user_id]);

  useEffect(() => {
    if (!validateUnlockAt && !otpExpiresAt) {
      setWaitSecondsLeft(0);
      return;
    }
    const tick = () => {
      const now = Date.now();
      if (validateUnlockAt) {
        setWaitSecondsLeft(Math.max(0, Math.ceil((validateUnlockAt - now) / 1000)));
      }
      if (otpExpiresAt && now > otpExpiresAt) {
        setOtp(null);
        setValidateUnlockAt(null);
        setOtpExpiresAt(null);
      }
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [validateUnlockAt, otpExpiresAt]);

  const startVerification = () => {
    const userId = discordInput.trim();
    if (!/^\d{15,22}$/.test(userId)) {
      toast.error(DISCORD_VERIFY_MESSAGES.invalid_id);
      return;
    }
    const code = generateDiscordOtp();
    const now = Date.now();
    setOtp(code);
    setValidateUnlockAt(now + DISCORD_OTP_WAIT_MS);
    setOtpExpiresAt(now + DISCORD_OTP_WAIT_MS + DISCORD_OTP_VALIDATE_WINDOW_MS);
    setTransferPending(false);
    toast.success("Código gerado — coloque na descrição do Discord");
  };

  const runDiscordLink = async (forceTransfer: boolean) => {
    const userId = discordInput.trim();
    if (!otp || !validateUnlockAt || !otpExpiresAt) return;
    if (waitSecondsLeft > 0) {
      toast.error(DISCORD_VERIFY_MESSAGES.waiting);
      return;
    }
    try {
      setDiscordLoading(true);
      const result = await linkVerifiedConnectionFn({
        data: {
          type: "discord",
          discordUserId: userId,
          otp,
          unlockAt: validateUnlockAt,
          expiresAt: otpExpiresAt,
          forceTransfer,
        },
      });
      if (result.ok) {
        applyPatch(result.patch as Partial<Profile>);
        setOtp(null);
        setValidateUnlockAt(null);
        setOtpExpiresAt(null);
        setTransferPending(false);
        toast.success(
          forceTransfer
            ? "Discord transferido e conectado neste perfil!"
            : "Discord verificado e conectado!",
        );
        return;
      }
      if (result.needsTransfer) {
        setTransferPending(true);
        return;
      }
      toast.error(result.error ?? "Falha ao validar.");
      if (result.code === "expired") {
        setOtp(null);
        setValidateUnlockAt(null);
        setOtpExpiresAt(null);
        setTransferPending(false);
      }
    } finally {
      setDiscordLoading(false);
    }
  };

  const validateDiscord = () => void runDiscordLink(false);

  const copyOtp = async () => {
    if (!otp) return;
    try {
      await navigator.clipboard.writeText(otp);
      toast.success("Código copiado");
    } catch {
      toast.error("Não foi possível copiar o código");
    }
  };

  const disconnectDiscord = () => {
    update("discord_user_id", null);
    setDiscordInput("");
    setOtp(null);
    setValidateUnlockAt(null);
    setOtpExpiresAt(null);
    setTransferPending(false);
    toast.success("Discord desconectado");
  };

  const verificationPending = Boolean(otp && otpExpiresAt);
  const canValidate = Boolean(otp && waitSecondsLeft <= 0 && verificationPending);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">Discord</p>
        {profile.discord_user_id ? (
          <DiscordConnectedCard
            userId={profile.discord_user_id}
            onDisconnect={disconnectDiscord}
          />
        ) : (
          <>
            <p className="mb-3 text-xs text-white/50">
              Para conectar, você precisa estar no{" "}
              <a
                href={LANYARD_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-pink-300 underline hover:text-pink-200"
              >
                servidor Lanyard
              </a>
              . Gere um código, coloque na descrição do seu perfil Discord e valide.
            </p>
            <div className="flex gap-2">
              <input
                value={discordInput}
                onChange={(e) => setDiscordInput(e.target.value.replace(/\s+/g, ""))}
                placeholder="ID do usuário (ex: 123456789012345678)"
                disabled={verificationPending}
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-pink-500/40 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={startVerification}
                disabled={!discordInput.trim() || verificationPending}
                className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Gerar código
              </button>
            </div>

            {verificationPending && (
              <div className="mt-3 space-y-3 rounded-lg border border-pink-500/30 bg-pink-500/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-white/70">Coloque este código na descrição do Discord:</p>
                  {waitSecondsLeft > 0 ? (
                    <span className="text-xs font-semibold text-pink-200">{waitSecondsLeft}s</span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-300">Pronto</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={copyOtp}
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2.5 text-center font-mono text-lg font-bold tracking-widest text-white transition hover:bg-black/55"
                >
                  {otp}
                </button>
                <p className="text-[11px] leading-relaxed text-white/50">
                  Discord → Configurações do usuário → Perfil → Sobre mim. Cole o código, salve e aguarde 50s para validar.
                </p>
                <button
                  type="button"
                  onClick={validateDiscord}
                  disabled={discordLoading || !canValidate}
                  className="w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {discordLoading
                    ? "Validando..."
                    : waitSecondsLeft > 0
                      ? `Aguarde ${waitSecondsLeft}s`
                      : "Validar"}
                </button>
                {transferPending && (
                  <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="text-xs leading-relaxed text-amber-100/90">
                      {CONNECTION_ALREADY_LINKED_MESSAGE}
                    </p>
                    <button
                      type="button"
                      onClick={() => void runDiscordLink(true)}
                      disabled={discordLoading || !canValidate}
                      className="w-full rounded-lg border border-amber-400/40 bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {discordLoading ? "Transferindo..." : "Continuar e vincular aqui"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">
          Posição do Discord
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => update("discord_card_mode", "inside")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              (profile.discord_card_mode ?? "inside") === "inside"
                ? "bg-white text-black"
                : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"
            }`}
          >
            Dentro do card
          </button>
          <button
            type="button"
            onClick={() => update("discord_card_mode", "outside")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              profile.discord_card_mode === "outside"
                ? "bg-white text-black"
                : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"
            }`}
          >
            Separado
          </button>
        </div>
      </div>

      {profile.discord_user_id && (
        <ToggleField
          label="Mostrar badges do Discord"
          checked={profile.discord_show_badges !== false}
          onChange={(v) => update("discord_show_badges", v)}
        />
      )}

      {profile.discord_user_id && (profile.discord_card_mode ?? "inside") === "inside" && (
        <SliderField
          label="Tamanho do Discord no card"
          min={80}
          max={140}
          step={5}
          value={profile.discord_inside_scale ?? 100}
          onChange={(v) => update("discord_inside_scale", v)}
          display={`${profile.discord_inside_scale ?? 100}%`}
        />
      )}

      <HotelConnectionPanel profile={profile} update={update} onBatchUpdate={applyPatch} />
    </div>
  );
}

/* ===================== Helpers ===================== */

const panelInputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-pink-500/40 focus:bg-white/[0.06]";
const panelSectionClass = "space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3";
const panelSectionTitleClass = "text-xs font-semibold uppercase tracking-wider text-white/45";

function Field({ label, children, center }: { label: string; children: React.ReactNode; center?: boolean }) {
  return (
    <div className={center ? "flex flex-col items-center" : undefined}>
      <label className={`mb-1.5 block text-xs font-medium text-white/50 ${center ? "text-center" : ""}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded bg-transparent" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-xs text-white outline-none" />
      </div>
    </Field>
  );
}

function roundToStep(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  const decimals = step.toString().includes(".") ? step.toString().split(".")[1]!.length : 0;
  const snapped = Math.round(value / step) * step;
  return Number(snapped.toFixed(decimals));
}

function SliderField({ label, min, max, step, value, onChange, display }: {
  label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; display: string;
}) {
  const safeValue = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

  const emit = (raw: number) => {
    onChange(roundToStep(raw, step));
  };

  return (
    <Field label={`${label} — ${display}`}>
      <div className="biosy-range-wrap py-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onInput={(e) => emit(Number(e.currentTarget.value))}
          onChange={(e) => emit(Number(e.currentTarget.value))}
          className="biosy-range-input w-full"
        />
      </div>
    </Field>
  );
}

function MediaUpload({ label, url, onPick, onRemove, shape, isMedia }: {
  label: string;
  url: string | null;
  onPick: () => void;
  onRemove?: () => void;
  shape: "circle" | "wide";
  isMedia?: boolean;
}) {
  const shapeClass =
    shape === "circle"
      ? "aspect-square max-w-[140px] rounded-full"
      : "aspect-[3/1] w-full rounded-xl";

  return (
    <Field label={label} center={shape === "circle"}>
      <div className={`group relative ${shape === "circle" ? "mx-auto max-w-[140px]" : "w-full"}`}>
        <button
          type="button"
          onClick={onPick}
          className={`relative flex w-full items-center justify-center overflow-hidden border border-dashed border-white/[0.08] bg-white/[0.03] transition hover:border-pink-500/35 hover:bg-white/[0.05] ${shapeClass}`}
        >
          {url ? (
            isMedia ? (
              <div className="grid h-full w-full place-items-center bg-black/40 text-white/80">
                <div className="text-center">
                  <Upload className="mx-auto mb-1 h-5 w-5 opacity-80" />
                  <p className="text-xs font-medium">Arquivo de música enviado</p>
                </div>
              </div>
            ) : (
              <img src={url} alt={label} className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-6 text-white/50">
              <Upload className="h-5 w-5" />
              <span className="text-xs">{isMedia ? "Enviar música" : "Enviar imagem"}</span>
            </div>
          )}
          {url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <Upload className="h-3.5 w-3.5" />
                Trocar
              </span>
            </div>
          )}
        </button>
        {url && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title={isMedia ? "Remover música" : "Remover imagem"}
            className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/25 backdrop-blur-md transition hover:scale-105 hover:bg-red-500/90 hover:ring-red-300/40 ${
              shape === "circle" ? "right-1 top-1" : "right-2 top-2"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Field>
  );
}

function MusicTrimEditor({
  url,
  startSec,
  endSec,
  onChangeStart,
  onChangeEnd,
}: {
  url: string;
  startSec: number;
  endSec: number | null;
  onChangeStart: (v: number) => void;
  onChangeEnd: (v: number | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState<null | "start" | "end" | "range">(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragMetaRef = useRef<{
    pointerX: number;
    startValue: number;
    endValue: number;
  } | null>(null);
  const MIN_GAP = 0.2;

  const fmtTime = (sec: number) => {
    const safe = Math.max(0, Math.floor(sec));
    const mm = Math.floor(safe / 60);
    const ss = safe % 60;
    return `${mm}:${String(ss).padStart(2, "0")}`;
  };

  const safeStart = Math.min(Math.max(startSec, 0), duration || startSec);
  const safeEnd = endSec == null ? duration : Math.min(Math.max(endSec, safeStart + MIN_GAP), duration || endSec);
  const total = Math.max(duration, 0.2);
  const startPct = Math.min(Math.max((safeStart / total) * 100, 0), 100);
  const endPct = Math.min(Math.max((safeEnd / total) * 100, startPct), 100);
  const currentPct = Math.min(Math.max((current / total) * 100, 0), 100);

  const playFrom = (sec: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(sec, 0), total);
    setCurrent(audio.currentTime);
    void audio.play().catch(() => {});
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (audio.currentTime < safeStart || audio.currentTime > safeEnd) {
        audio.currentTime = safeStart;
      }
      void audio.play().catch(() => {});
      return;
    }
    audio.pause();
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(d);
      if (d > 0) {
        if (startSec > d) onChangeStart(0);
        if (endSec != null && endSec > d) onChangeEnd(d);
      }
    };
    const onTime = () => {
      setCurrent(audio.currentTime);
      const end = endSec ?? (duration || audio.duration || 0);
      if (end > 0 && audio.currentTime >= end) {
        audio.currentTime = safeStart;
        if (!audio.paused) {
          void audio.play().catch(() => {});
        }
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [duration, endSec, onChangeEnd, onChangeStart, safeStart, startSec]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const track = trackRef.current;
      const meta = dragMetaRef.current;
      if (!track || !meta) return;
      const rect = track.getBoundingClientRect();
      const secPerPx = total / Math.max(rect.width, 1);
      const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const value = Number((ratio * total).toFixed(2));
      if (dragging === "start") {
        const maxStart = Math.max((safeEnd || total) - MIN_GAP, 0);
        const nextStart = Number(Math.min(value, maxStart).toFixed(2));
        onChangeStart(nextStart);
        playFrom(nextStart);
      } else if (dragging === "end") {
        const nextEnd = Number(Math.max(value, safeStart + MIN_GAP).toFixed(2));
        onChangeEnd(nextEnd);
        playFrom(Math.max(nextEnd - 0.15, safeStart));
      } else {
        const deltaSec = (e.clientX - meta.pointerX) * secPerPx;
        const span = Math.max(meta.endValue - meta.startValue, MIN_GAP);
        const maxStart = Math.max(total - span, 0);
        const nextStart = Math.min(Math.max(meta.startValue + deltaSec, 0), maxStart);
        const nextEnd = Math.min(nextStart + span, total);
        onChangeStart(Number(nextStart.toFixed(2)));
        onChangeEnd(Number(nextEnd.toFixed(2)));
        playFrom(nextStart);
      }
    };
    const onUp = () => {
      setDragging(null);
      dragMetaRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [MIN_GAP, dragging, onChangeEnd, onChangeStart, safeEnd, safeStart, total]);

  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-2">
      <audio ref={audioRef} src={url} className="hidden" />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex items-center gap-1 rounded-md border border-white/20 px-2 py-1 text-xs text-white/85 transition hover:bg-white/10"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Pausar" : "Tocar"}
        </button>
        <span className="text-xs text-white/70">
          {fmtTime(current)} / {fmtTime(total)}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-16 overflow-hidden rounded-md border border-white/15 bg-[#131313]"
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-handle='1']")) return;
          if (target.closest("[data-range='1']")) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
          playFrom(Number((ratio * total).toFixed(2)));
        }}
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(91,135,255,0.35)_0_7px,rgba(91,135,255,0.06)_7px_14px)]" />
        <div className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-white/15" />
        <div
          data-range="1"
          onPointerDown={(e) => {
            e.preventDefault();
            setDragging("range");
            dragMetaRef.current = {
              pointerX: e.clientX,
              startValue: safeStart,
              endValue: safeEnd,
            };
          }}
          className="absolute inset-y-0 cursor-grab border-x-2 border-emerald-300/95 bg-emerald-300/20 active:cursor-grabbing"
          style={{
            left: `${startPct}%`,
            width: `${Math.max(endPct - startPct, 0)}%`,
          }}
        />
        <button
          type="button"
          data-handle="1"
          onPointerDown={(e) => {
            e.preventDefault();
            setDragging("start");
            dragMetaRef.current = {
              pointerX: e.clientX,
              startValue: safeStart,
              endValue: safeEnd,
            };
          }}
          className="absolute inset-y-0 w-3 cursor-ew-resize border-r border-black/35 bg-emerald-200 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
          style={{ left: `calc(${startPct}% - 6px)` }}
          title="Início"
        />
        <button
          type="button"
          data-handle="1"
          onPointerDown={(e) => {
            e.preventDefault();
            setDragging("end");
            dragMetaRef.current = {
              pointerX: e.clientX,
              startValue: safeStart,
              endValue: safeEnd,
            };
          }}
          className="absolute inset-y-0 w-3 cursor-ew-resize border-l border-black/35 bg-emerald-200 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
          style={{ left: `calc(${endPct}% - 6px)` }}
          title="Fim"
        />
        <div
          className="absolute inset-y-0 w-[2px] bg-red-400/90"
          style={{ left: `${currentPct}%` }}
        />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "mb-2 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs transition-all duration-200",
        disabled
          ? "cursor-not-allowed border-white/[0.04] bg-white/[0.02] opacity-70"
          : "cursor-pointer border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]",
        checked && !disabled && "border-pink-500/25 bg-pink-500/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
      )}
    >
      <span className={cn("transition-colors", checked ? "font-medium text-white" : "text-white/75")}>
        {label}
      </span>
      <BiosyToggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        variant="checkbox"
        aria-label={label}
      />
    </label>
  );
}

const BORDER_STYLES: { key: string; label: string; preview: React.CSSProperties }[] = [
  { key: "solid", label: "Sólida", preview: { border: "2px solid #fff" } },
  { key: "dashed", label: "Tracejada", preview: { border: "2px dashed #fff" } },
  { key: "dotted", label: "Pontilhada", preview: { border: "2px dotted #fff" } },
  { key: "double", label: "Dupla", preview: { border: "4px double #fff" } },
];

function BorderStylePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/50">Estilo da borda</label>
      <div className="grid grid-cols-2 gap-2">
        {BORDER_STYLES.map((s) => {
          const active = value === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onChange(s.key)}
              className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2 text-[10px] font-medium transition ${
                active ? "border-pink-500/50 bg-pink-500/10 text-white" : "border-white/[0.06] bg-white/[0.03] text-white/65 hover:border-white/15 hover:text-white"
              }`}
            >
              <span className="h-8 w-full rounded-md bg-white/[0.04]" style={s.preview} />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

