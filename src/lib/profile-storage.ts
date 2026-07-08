import { supabase } from "@/integrations/supabase/client";
import {
  getOrCreateVisitorId,
  hasCountedProfileView,
  markProfileViewCounted,
} from "@/lib/profile-views";

export const DEFAULT_CARD_WIDTH = 600;
export const DEFAULT_CARD_HEIGHT = 400;
export const DEFAULT_CARD_LAYOUT = "centered" as const;

export type Profile = {
  id: string;
  public_uid: number | null;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  avatar_border_color: string;
  avatar_border_width: number;
  avatar_size: number;
  /** ID da moldura APNG (nome do arquivo em assets/molduras) */
  avatar_frame_id: string | null;
  /** Premium — desbloqueia molduras além das 50 primeiras */
  is_premium: boolean;
  /** Cargos atribuídos (Staff, Premium, etc.) — carregados separadamente */
  roles?: import("@/lib/profile-roles").ProfileRoleAssignment[];
  /** Exibir badges de cargo no card */
  show_role_badges: boolean;
  /** Filtro monocromático nos badges de cargo */
  role_badges_monochrome: boolean;
  /** Cor do filtro monocromático dos badges */
  role_badges_mono_color: string;
  banner_url: string | null;
  background_url: string | null;
  background_color: string;
  background_blur: number;
  background_brightness: number;
  card_color: string;
  card_opacity: number;
  card_blur: number;
  card_border_color: string;
  card_border_width: number;
  card_border_radius: number;
  socials: Record<string, string>;
  card_width: number;
  card_height: number;
  inner_banner_url: string | null;
  inner_banner_pos_x: number;
  inner_banner_pos_y: number;
  effect_tilt: boolean;
  effect_hover: boolean;
  effect_glow: boolean;
  effect_glow_color: string;
  effect_glow_size: number;
  /** Efeito de borda animado (GlowingEffect que segue o mouse) */
  effect_border_glow: boolean;
  /** Força do tilt 3D (1–10, padrão 5) */
  effect_tilt_strength: number;
  /** Layout do card: "default" | "centered" | "aligned" */
  card_layout: "default" | "centered" | "aligned";
  social_original_colors: boolean;
  social_icon_color: string;
  social_icon_style: "boxed" | "logo";
  /** Escala dos ícones sociais (60–200, padrão 100) — escala a logo visível */
  social_icon_size: number;
  /** Espaço entre ícones em px (0 = encostados, máx. 20) */
  social_icon_gap: number;
  /** Bloom / glow ao redor dos ícones sociais */
  social_icon_bloom: boolean;
  /** Cor do glow (independente da cor do ícone) */
  social_icon_bloom_color: string | null;
  /** Exibe o nome da rede abaixo do ícone */
  show_social_titles: boolean;
  card_border_style: string;
  discord_user_id: string | null;
  discord_card_mode: "inside" | "outside";
  discord_show_badges: boolean;
  /** Escala do bloco Discord dentro do card (80–140, padrão 100). */
  discord_inside_scale: number;
  /** Conexão Habbo Hotel */
  habbo_username: string | null;
  habbo_domain: string | null;
  habbo_figure: string | null;
  habbo_motto: string | null;
  habbo_level: number | null;
  /** Conexão Habblet */
  habblet_username: string | null;
  habblet_figure: string | null;
  habblet_motto: string | null;
  habblet_achievement_points: number | null;
  /** Última sincronização automática com a API do Habbo */
  habbo_synced_at: string | null;
  /** Última sincronização automática com a API do Habblet */
  habblet_synced_at: string | null;
  /** Layout compartilhado dos cards Habbo/Habblet */
  hotel_card_placement: "inside" | "outside";
  hotel_card_row: "same_row" | "separate_row";
  hotel_card_shape: "square" | "rectangle";
  hotel_card_size: "sm" | "md" | "lg";
  /** @deprecated migração — usar habbo_* / habblet_* */
  hotel_platform?: "habbo" | "habblet" | null;
  hotel_username?: string | null;
  hotel_domain?: string | null;
  hotel_figure?: string | null;
  hotel_motto?: string | null;
  hotel_level?: number | null;
  hotel_achievement_points?: number | null;
  view_count: number;
  show_view_count: boolean;
  link_click_count: number;
  show_username: boolean;
  show_public_uid: boolean;
  tap_to_reveal_enabled: boolean;
  tap_reveal_blur: number;
  tap_reveal_brightness: number;
  tap_reveal_mode: "avatar_text" | "text_only";
  tap_reveal_text: string;
  card_reveal_effect: "fade" | "slide_up" | "scale";
  text_typing_effect: boolean;
  text_typing_name_effect: boolean;
  text_typing_bio_effect: boolean;
  music_url: string | null;
  music_title: string | null;
  music_start_sec: number;
  music_end_sec: number | null;
  /** Exibe player como card abaixo do perfil (false = botão flutuante) */
  music_card_enabled: boolean;
  /** Imagem ou GIF circular no card do player */
  music_card_art_url: string | null;
  /** Título personalizado no card */
  music_card_title: string | null;
  /** Subtítulo opcional no card */
  music_card_subtitle: string | null;
  /** Largura do card do player (% do card principal, 40–100) */
  music_card_width_pct: number;
  comments_enabled: boolean;
  /** Template público ao vivo — sincroniza estilo automaticamente */
  public_template_enabled: boolean;
  /** Título do embed ao compartilhar o link (null = padrão Byosy) */
  share_embed_title: string | null;
  /** Descrição do embed ao compartilhar o link (null = padrão Byosy) */
  share_embed_description: string | null;
  /** Imagem banner do embed (null = padrão Byosy) */
  share_embed_image_url: string | null;
  /** Fonte da página inteira (stack CSS) */
  page_font_family: string;
  /** Fonte apenas do nome de exibição (stack CSS). Use "inherit" para herdar. */
  name_font_family: string;
  /** Cor principal de títulos (nome, headings) */
  title_text_color: string;
  /** Cor do texto principal (bio, etc) */
  body_text_color: string;
  /** Cor de texto secundário (ex: @username) */
  muted_text_color: string;
  /** Cor padrão de ícones (ex: view, discord, etc) */
  icon_color: string;
  /** Cor do fundo das badges (UID/views) */
  badge_bg_color: string;
  /** Cor do texto dentro das badges */
  badge_text_color: string;
  /** Cor da linha/divisor interno do card (ex: acima do footer) */
  inner_divider_color: string;
  /** Opacidade do divisor interno (0–1) */
  inner_divider_opacity: number;
  /** Glow/bloom em textos */
  text_glow_enabled: boolean;
  /** Cor do glow do texto */
  text_glow_color: string;
  /** Intensidade do glow (0–8) */
  text_glow_size: number;
  /** Onde aplicar o glow: nome, títulos ou toda a página */
  text_glow_scope: string;
  /** Efeito de animação no nome de exibição */
  name_text_animation: string;
  /** Efeito de animação na bio/descrição */
  bio_text_animation: string;
  /** Cor das partículas no nome (efeito particle) */
  name_particle_color: string;
  /** Cor das partículas na bio (efeito particle) */
  bio_particle_color: string;
  /** @deprecated mantido no banco; não usar no app */
  accent_color?: string;
};

export async function incrementProfileView(profileId: string): Promise<number | null> {
  getOrCreateVisitorId();

  const { error: eventError } = await supabase
    .from("profile_view_events")
    .insert({ profile_id: profileId });

  if (!eventError) {
    const { data, error: readError } = await supabase
      .from("profiles")
      .select("view_count")
      .eq("id", profileId)
      .maybeSingle();
    if (!readError && data) {
      return Number(data.view_count ?? 0);
    }
    return null;
  }

  const { data, error } = await supabase.rpc("increment_profile_view", {
    target_profile_id: profileId,
  });
  if (error) {
    console.error("[incrementProfileView]", eventError.message, error.message);
    return null;
  }
  return typeof data === "number" ? data : Number(data);
}

export { hasCountedProfileView, markProfileViewCounted };

export async function logProfileLinkClick(profileId: string, socialKey: string): Promise<boolean> {
  const { error: eventError } = await supabase
    .from("profile_link_click_events")
    .insert({ profile_id: profileId, social_key: socialKey });

  if (!eventError) return true;

  const { error: rpcError } = await supabase.rpc("increment_profile_link_click", {
    target_profile_id: profileId,
  });

  if (rpcError) {
    console.error("[logProfileLinkClick]", eventError.message, rpcError.message);
    return false;
  }

  return true;
}

const BUCKET = "profile-assets";
// 100 years signed URL
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 100;

export async function uploadProfileAsset(
  userId: string,
  kind: "avatar" | "banner" | "background" | "inner_banner" | "music" | "music_art" | "share_embed",
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error("Sign URL failed");
  return data.signedUrl;
}
