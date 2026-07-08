import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_LAYOUT,
  DEFAULT_CARD_WIDTH,
  type Profile,
} from "@/lib/profile-storage";

/** Tabelas novas ainda não estão no types.ts gerado */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** Campos de estilo copiáveis — sem avatar, mídia, música ou conteúdo pessoal */
export type ProfileTheme = {
  page_font_family: string;
  name_font_family: string;
  title_text_color: string;
  body_text_color: string;
  muted_text_color: string;
  icon_color: string;
  badge_bg_color: string;
  badge_text_color: string;
  inner_divider_color: string;
  inner_divider_opacity: number;
  text_glow_enabled: boolean;
  text_glow_color: string;
  text_glow_size: number;
  text_glow_scope: string;
  name_text_animation: string;
  bio_text_animation: string;
  name_particle_color: string;
  bio_particle_color: string;
  background_color: string;
  background_blur: number;
  background_brightness: number;
  card_color: string;
  card_opacity: number;
  card_blur: number;
  card_border_color: string;
  card_border_width: number;
  card_border_radius: number;
  card_border_style: string;
  card_width: number;
  card_height: number;
  card_layout: Profile["card_layout"];
  avatar_border_color: string;
  avatar_border_width: number;
  avatar_size: number;
  inner_banner_pos_x: number;
  inner_banner_pos_y: number;
  effect_tilt: boolean;
  effect_tilt_strength: number;
  effect_hover: boolean;
  effect_glow: boolean;
  effect_glow_color: string;
  effect_glow_size: number;
  effect_border_glow: boolean;
  social_original_colors: boolean;
  social_icon_color: string;
  social_icon_style: Profile["social_icon_style"];
  social_icon_size: number;
  social_icon_gap: number;
  social_icon_bloom: boolean;
  social_icon_bloom_color: string | null;
  show_social_titles: boolean;
  discord_card_mode: Profile["discord_card_mode"];
  discord_show_badges: boolean;
  discord_inside_scale: number;
  tap_reveal_blur: number;
  tap_reveal_brightness: number;
  tap_reveal_mode: Profile["tap_reveal_mode"];
  card_reveal_effect: Profile["card_reveal_effect"];
  text_typing_name_effect: boolean;
  text_typing_bio_effect: boolean;
};

export type TemplateVisibility = "public" | "private";

export type ProfileTemplateRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  visibility: TemplateVisibility;
  is_live: boolean;
  theme: ProfileTheme;
  use_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
};

export type ProfileTemplateWithAuthor = ProfileTemplateRow & {
  author_username: string;
  author_display_name: string;
  author_avatar_url: string | null;
  is_favorited?: boolean;
};

export type TemplateSort = "recent" | "most_used" | "most_favorited";

export function extractThemeFromProfile(profile: Profile): ProfileTheme {
  return {
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
    text_glow_enabled: profile.text_glow_enabled,
    text_glow_color: profile.text_glow_color,
    text_glow_size: profile.text_glow_size,
    text_glow_scope: profile.text_glow_scope ?? "all",
    name_text_animation: profile.name_text_animation ?? "none",
    bio_text_animation: profile.bio_text_animation ?? "none",
    name_particle_color: profile.name_particle_color ?? "#ff2d7a",
    bio_particle_color: profile.bio_particle_color ?? "#ff2d7a",
    background_color: profile.background_color,
    background_blur: profile.background_blur ?? 0,
    background_brightness: profile.background_brightness ?? 100,
    card_color: profile.card_color,
    card_opacity: profile.card_opacity,
    card_blur: profile.card_blur,
    card_border_color: profile.card_border_color,
    card_border_width: profile.card_border_width,
    card_border_radius: profile.card_border_radius,
    card_border_style: profile.card_border_style,
    card_width: profile.card_width ?? DEFAULT_CARD_WIDTH,
    card_height: profile.card_height ?? DEFAULT_CARD_HEIGHT,
    card_layout: profile.card_layout ?? DEFAULT_CARD_LAYOUT,
    avatar_border_color: profile.avatar_border_color,
    avatar_border_width: profile.avatar_border_width,
    avatar_size: profile.avatar_size,
    inner_banner_pos_x: profile.inner_banner_pos_x ?? 50,
    inner_banner_pos_y: profile.inner_banner_pos_y ?? 50,
    effect_tilt: profile.effect_tilt ?? false,
    effect_tilt_strength: profile.effect_tilt_strength ?? 5,
    effect_hover: profile.effect_hover ?? false,
    effect_glow: profile.effect_glow ?? false,
    effect_glow_color: profile.effect_glow_color ?? profile.card_border_color,
    effect_glow_size: profile.effect_glow_size ?? 24,
    effect_border_glow: profile.effect_border_glow ?? false,
    social_original_colors: profile.social_original_colors !== false,
    social_icon_color: profile.social_icon_color ?? "#ffffff",
    social_icon_style: profile.social_icon_style ?? "boxed",
    social_icon_size: profile.social_icon_size ?? 100,
    social_icon_gap: profile.social_icon_gap ?? 5,
    social_icon_bloom: profile.social_icon_bloom === true,
    social_icon_bloom_color: profile.social_icon_bloom_color ?? null,
    show_social_titles: profile.show_social_titles === true,
    discord_card_mode: profile.discord_card_mode ?? "inside",
    discord_show_badges: profile.discord_show_badges !== false,
    discord_inside_scale: profile.discord_inside_scale ?? 100,
    tap_reveal_blur: profile.tap_reveal_blur ?? 20,
    tap_reveal_brightness: profile.tap_reveal_brightness ?? 55,
    tap_reveal_mode: profile.tap_reveal_mode ?? "avatar_text",
    card_reveal_effect: profile.card_reveal_effect ?? "fade",
    text_typing_name_effect: profile.text_typing_name_effect !== false,
    text_typing_bio_effect: profile.text_typing_bio_effect !== false,
  };
}

/** Campos pessoais que nunca devem ser copiados ao aplicar um template */
const PERSONAL_THEME_KEYS = ["tap_reveal_text"] as const;

function stripPersonalThemeFields<T extends Record<string, unknown>>(theme: T): Omit<T, (typeof PERSONAL_THEME_KEYS)[number]> {
  const next = { ...theme };
  for (const key of PERSONAL_THEME_KEYS) {
    delete next[key];
  }
  return next;
}

export function applyThemeToProfile(profile: Profile, theme: ProfileTheme): Profile {
  const styleOnly = stripPersonalThemeFields(theme as ProfileTheme & Record<string, unknown>);
  return { ...profile, ...styleOnly };
}

export function themeToProfileUpdate(theme: ProfileTheme): Record<string, unknown> {
  return stripPersonalThemeFields({ ...theme });
}

export function liveTemplateName(profile: Profile): string {
  const label = profile.display_name?.trim() || profile.username;
  return `Template of ${label}`;
}

function mapTemplateRow(
  row: Record<string, unknown>,
  author?: { username: string; display_name: string; avatar_url: string | null },
  isFavorited?: boolean,
): ProfileTemplateWithAuthor {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    visibility: row.visibility as TemplateVisibility,
    is_live: row.is_live === true,
    theme: row.theme as ProfileTheme,
    use_count: Number(row.use_count ?? 0),
    favorite_count: Number(row.favorite_count ?? 0),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    author_username: author?.username ?? "",
    author_display_name: author?.display_name ?? "",
    author_avatar_url: author?.avatar_url ?? null,
    is_favorited: isFavorited,
  };
}

async function fetchAuthors(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { username: string; display_name: string; avatar_url: string | null }>();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", userIds);
  const map = new Map<string, { username: string; display_name: string; avatar_url: string | null }>();
  for (const p of data ?? []) {
    map.set(p.id, {
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
    });
  }
  return map;
}

async function fetchFavoriteIds(userId: string, templateIds: string[]) {
  if (!userId || templateIds.length === 0) return new Set<string>();
  const { data } = await db
    .from("template_favorites")
    .select("template_id")
    .eq("user_id", userId)
    .in("template_id", templateIds);
  return new Set((data ?? []).map((r: { template_id: string }) => r.template_id));
}

export async function fetchPublicTemplates(
  sort: TemplateSort,
  currentUserId?: string | null,
): Promise<ProfileTemplateWithAuthor[]> {
  let query = db
    .from("profile_templates")
    .select("*")
    .eq("visibility", "public");

  if (sort === "recent") query = query.order("updated_at", { ascending: false });
  else if (sort === "most_used") query = query.order("use_count", { ascending: false });
  else query = query.order("favorite_count", { ascending: false });

  const { data, error } = await query.limit(48);
  if (error) throw error;

  const rows = (data ?? []) as Record<string, unknown>[];
  const authorIds = [...new Set(rows.map((r) => r.user_id as string))];
  const authors = await fetchAuthors(authorIds);
  const favIds = await fetchFavoriteIds(currentUserId ?? "", rows.map((r) => r.id as string));

  return rows.map((row) =>
    mapTemplateRow(
      row as Record<string, unknown>,
      authors.get(row.user_id as string),
      favIds.has(row.id as string),
    ),
  );
}

export async function fetchMyTemplates(userId: string): Promise<ProfileTemplateWithAuthor[]> {
  const { data, error } = await db
    .from("profile_templates")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as Record<string, unknown>[];
  const favIds = await fetchFavoriteIds(userId, rows.map((r) => r.id as string));

  return rows.map((row) =>
    mapTemplateRow(row as Record<string, unknown>, undefined, favIds.has(row.id as string)),
  );
}

export async function saveTemplate(opts: {
  userId: string;
  profile: Profile;
  name: string;
  description?: string;
  visibility: TemplateVisibility;
  isLive?: boolean;
}): Promise<ProfileTemplateRow> {
  const theme = extractThemeFromProfile(opts.profile);
  const payload = {
    user_id: opts.userId,
    name: opts.name.trim(),
    description: (opts.description ?? "").trim(),
    visibility: opts.visibility,
    is_live: opts.isLive ?? false,
    theme,
  };

  if (opts.isLive) {
    const { data: existing } = await db
      .from("profile_templates")
      .select("id")
      .eq("user_id", opts.userId)
      .eq("is_live", true)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await db
        .from("profile_templates")
        .update({
          name: payload.name,
          description: payload.description,
          visibility: payload.visibility,
          theme: payload.theme,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as ProfileTemplateRow;
    }
  }

  const { data, error } = await db
    .from("profile_templates")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as ProfileTemplateRow;
}

export async function syncLivePublicTemplate(profile: Profile): Promise<void> {
  if (!profile.public_template_enabled) {
    const { data: live } = await db
      .from("profile_templates")
      .select("id")
      .eq("user_id", profile.id)
      .eq("is_live", true)
      .maybeSingle();
    if (live?.id) {
      await db
        .from("profile_templates")
        .update({ visibility: "private" })
        .eq("id", live.id);
    }
    return;
  }

  await saveTemplate({
    userId: profile.id,
    profile,
    name: liveTemplateName(profile),
    visibility: "public",
    isLive: true,
  });
}

/** Publica o template ao vivo na galeria quando o usuário tem template público ativo. */
export async function ensureLivePublicTemplateIfEnabled(profile: Profile): Promise<void> {
  if (!profile.public_template_enabled) return;
  try {
    await syncLivePublicTemplate(profile);
  } catch (err) {
    console.error("[ensureLivePublicTemplateIfEnabled]", err);
  }
}

export async function applyTemplateToProfile(
  templateId: string,
  profile: Profile,
): Promise<Profile> {
  const { data, error } = await db
    .from("profile_templates")
    .select("theme, visibility, user_id")
    .eq("id", templateId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Template not found");

  const theme = stripPersonalThemeFields(data.theme as ProfileTheme & Record<string, unknown>) as ProfileTheme;
  const updated = applyThemeToProfile(profile, theme);

  const { error: updateError } = await db
    .from("profiles")
    .update(themeToProfileUpdate(theme))
    .eq("id", profile.id);
  if (updateError) throw updateError;

  if (data.user_id !== profile.id) {
    await db.rpc("record_template_usage", { target_template_id: templateId });
  }

  return updated;
}

export async function toggleTemplateFavorite(
  templateId: string,
  userId: string,
  currentlyFavorited: boolean,
): Promise<void> {
  if (currentlyFavorited) {
    const { error } = await db
      .from("template_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("template_id", templateId);
    if (error) throw error;
  } else {
    const { error } = await db
      .from("template_favorites")
      .insert({ user_id: userId, template_id: templateId });
    if (error) throw error;
  }
}

export async function updateTemplateMeta(
  templateId: string,
  patch: Partial<Pick<ProfileTemplateRow, "name" | "description" | "visibility">>,
): Promise<void> {
  const { error } = await db.from("profile_templates").update(patch).eq("id", templateId);
  if (error) throw error;
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const { error } = await db.from("profile_templates").delete().eq("id", templateId);
  if (error) throw error;
}

export async function setPublicTemplateEnabled(
  profile: Profile,
  enabled: boolean,
): Promise<Profile> {
  const { error } = await db
    .from("profiles")
    .update({ public_template_enabled: enabled })
    .eq("id", profile.id);
  if (error) throw error;

  const next = { ...profile, public_template_enabled: enabled };
  await syncLivePublicTemplate(next);
  return next;
}

export function formatTemplateCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("en-US");
}
