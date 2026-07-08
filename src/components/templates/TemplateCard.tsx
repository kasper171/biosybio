import { Heart, Star, User, Zap } from "lucide-react";
import type { ProfileTemplateWithAuthor } from "@/lib/profile-template";
import { formatTemplateCount } from "@/lib/profile-template";
import { cn } from "@/lib/utils";
import { ProfileCard } from "@/components/ProfileCard";
import type { Profile } from "@/lib/profile-storage";

function buildTemplatePreviewProfile(template: ProfileTemplateWithAuthor): Profile {
  const t = template.theme;
  return {
    // ids
    id: template.user_id,
    public_uid: null,
    // conteúdo fictício (não copiar dados do autor)
    username: "template",
    display_name: "Template",
    bio: "Style preview",
    // mídia (fica vazio no preview)
    avatar_url: null,
    banner_url: null,
    background_url: null,
    inner_banner_url: null,
    // socials vazias para não poluir
    socials: {},
    // contadores/visibilidade
    view_count: 0,
    show_view_count: false,
    show_username: true,
    show_public_uid: false,
    // música e comentários (irrelevante no preview)
    music_url: null,
    music_title: null,
    music_start_sec: 0,
    music_end_sec: null,
    music_card_enabled: true,
    music_card_art_url: null,
    music_card_title: null,
    music_card_subtitle: null,
    music_card_width_pct: 100,
    comments_enabled: false,
    // tema (o que realmente importa)
    page_font_family: t.page_font_family,
    name_font_family: t.name_font_family,
    title_text_color: t.title_text_color,
    body_text_color: t.body_text_color,
    muted_text_color: t.muted_text_color,
    icon_color: t.icon_color,
    badge_bg_color: t.badge_bg_color,
    badge_text_color: t.badge_text_color,
    inner_divider_color: t.inner_divider_color,
    inner_divider_opacity: t.inner_divider_opacity,
    text_glow_enabled: t.text_glow_enabled,
    text_glow_color: t.text_glow_color,
    text_glow_size: t.text_glow_size,
    text_glow_scope: t.text_glow_scope ?? "all",
    name_text_animation: t.name_text_animation ?? "none",
    bio_text_animation: t.bio_text_animation ?? "none",
    name_particle_color: t.name_particle_color ?? "#ff2d7a",
    bio_particle_color: t.bio_particle_color ?? "#ff2d7a",
    background_color: t.background_color,
    background_blur: t.background_blur,
    background_brightness: t.background_brightness,
    card_color: t.card_color,
    card_opacity: t.card_opacity,
    card_blur: t.card_blur,
    card_border_color: t.card_border_color,
    card_border_width: t.card_border_width,
    card_border_radius: t.card_border_radius,
    card_border_style: t.card_border_style,
    card_width: t.card_width,
    card_height: t.card_height,
    card_layout: t.card_layout,
    avatar_border_color: t.avatar_border_color,
    avatar_border_width: t.avatar_border_width,
    avatar_size: t.avatar_size,
    inner_banner_pos_x: t.inner_banner_pos_x,
    inner_banner_pos_y: t.inner_banner_pos_y,
    effect_tilt: false, // preview estável
    effect_tilt_strength: t.effect_tilt_strength,
    effect_hover: false,
    effect_glow: t.effect_glow,
    effect_glow_color: t.effect_glow_color,
    effect_glow_size: t.effect_glow_size,
    effect_border_glow: t.effect_border_glow,
    social_original_colors: t.social_original_colors,
    social_icon_color: t.social_icon_color,
    social_icon_style: t.social_icon_style,
    social_icon_size: t.social_icon_size ?? 100,
    social_icon_bloom: t.social_icon_bloom === true,
    show_social_titles: t.show_social_titles === true,
    discord_user_id: null,
    discord_card_mode: t.discord_card_mode,
    discord_show_badges: t.discord_show_badges,
    discord_inside_scale: t.discord_inside_scale,
    tap_to_reveal_enabled: false,
    tap_reveal_blur: t.tap_reveal_blur,
    tap_reveal_brightness: t.tap_reveal_brightness,
    tap_reveal_mode: t.tap_reveal_mode,
    tap_reveal_text: "Tap to reveal",
    card_reveal_effect: t.card_reveal_effect,
    text_typing_effect: false,
    text_typing_name_effect: false,
    text_typing_bio_effect: false,
    public_template_enabled: false,
  };
}

type Props = {
  template: ProfileTemplateWithAuthor;
  onUse: () => void;
  onToggleFavorite: () => void;
  using?: boolean;
  showAuthor?: boolean;
  className?: string;
};

export function TemplateCard({
  template,
  onUse,
  onToggleFavorite,
  using = false,
  showAuthor = true,
  className,
}: Props) {
  const theme = template.theme;
  const authorLabel = template.author_display_name || template.author_username || "User";
  const previewProfile = buildTemplatePreviewProfile(template);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--biosy-shell)] transition hover:border-white/15 hover:bg-white/[0.03]",
        className,
      )}
    >
      <div className="relative h-40 overflow-hidden border-b border-white/[0.06] bg-black/20">
        {/* Preview real do card (escala) */}
        <div className="absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 origin-center"
            style={{
              transform: "translate(-50%, -50%) scale(0.23)",
              width: `${previewProfile.card_width}px`,
            }}
          >
            <ProfileCard profile={previewProfile} animateNameText={false} animateBioText={false} />
          </div>
        </div>
        {template.is_live && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
            <Zap className="h-3 w-3" />
            Live
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-white">{template.name}</h3>
            {showAuthor && (
              <div className="mt-1 flex items-center gap-2">
                <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-white/10">
                  {template.author_avatar_url ? (
                    <img src={template.author_avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <User className="h-3 w-3 text-white/40" />
                    </div>
                  )}
                </div>
                <span className="truncate text-xs text-white/45">@{template.author_username || authorLabel}</span>
              </div>
            )}
            {template.description && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/40">{template.description}</p>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-white/45">
            <span className="inline-flex items-center gap-1" title="Uses">
              <Heart className="h-3.5 w-3.5 text-rose-400/80" />
              {formatTemplateCount(template.use_count)}
            </span>
            <span className="inline-flex items-center gap-1" title="Favorites">
              <Star className="h-3.5 w-3.5 text-amber-400/80" />
              {formatTemplateCount(template.favorite_count)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={cn(
                "rounded-lg border px-2 py-1.5 transition",
                template.is_favorited
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                  : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06] hover:text-white",
              )}
              title={template.is_favorited ? "Remove from favorites" : "Favorite"}
              aria-label={template.is_favorited ? "Remove from favorites" : "Favorite"}
            >
              <Star className={cn("h-3.5 w-3.5", template.is_favorited && "fill-current")} />
            </button>
            <button
              type="button"
              onClick={onUse}
              disabled={using}
              className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {using ? "Applying..." : "Use"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
