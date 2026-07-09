import { z } from "zod";
import { albumSanitizeHexColor, albumSanitizePlainText } from "@/features/album/lib/security/album-sanitize";
import {
  albumNormalizeMediaUrl,
  albumNormalizeSpotifyEmbedUrl,
} from "@/features/album/lib/security/album-url-validation";

const gridInt = z.number().int().min(0).max(48);

const connectionDataSchema = z.object({
  showBadges: z.boolean().optional(),
  scale: z.number().min(0.5).max(2).optional(),
});

const blockDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("image"),
    data: z.object({
      url: z.string().max(2048).refine((v) => albumNormalizeMediaUrl(v) !== null || v.startsWith("https://"), "Invalid image URL"),
      alt: z.string().max(200).optional(),
      objectFit: z.enum(["cover", "contain"]).optional(),
      posX: z.number().min(0).max(100).optional(),
      posY: z.number().min(0).max(100).optional(),
    }),
  }),
  z.object({
    type: z.literal("video"),
    data: z.object({
      url: z.string().max(2048),
      posterUrl: z.string().max(2048).optional(),
      autoplay: z.boolean().optional(),
      muted: z.boolean().optional(),
      loop: z.boolean().optional(),
      posX: z.number().min(0).max(100).optional(),
      posY: z.number().min(0).max(100).optional(),
    }),
  }),
  z.object({
    type: z.literal("spotify"),
    data: z.object({
      embedUrl: z.string().max(2048).refine((v) => albumNormalizeSpotifyEmbedUrl(v) !== null, "Invalid Spotify embed"),
      title: z.string().max(120).optional(),
    }),
  }),
  z.object({
    type: z.literal("text"),
    data: z.object({
      content: z.string().max(8000),
      textAnimation: z.string().max(64).optional(),
      fontFamily: z.string().max(128).optional(),
      color: z.string().max(32).optional(),
      align: z.enum(["left", "center", "right"]).optional(),
    }),
  }),
  z.object({
    type: z.literal("discord"),
    data: connectionDataSchema,
  }),
  z.object({
    type: z.literal("habbo"),
    data: connectionDataSchema,
  }),
  z.object({
    type: z.literal("habblet"),
    data: connectionDataSchema,
  }),
]);

export const albumBlockSchema = z
  .object({
    id: z.string().uuid(),
    type: z.enum(["image", "video", "spotify", "text", "discord", "habbo", "habblet"]),
    x: gridInt,
    y: gridInt,
    w: gridInt.refine((n) => n >= 1 && n <= 12),
    h: gridInt.refine((n) => n >= 1 && n <= 24),
    data: z.record(z.unknown()),
  })
  .superRefine((block, ctx) => {
    const parsed = blockDataSchema.safeParse({ type: block.type, data: block.data });
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => ctx.addIssue({ ...issue, path: ["data", ...issue.path.slice(1)] }));
    }
  });

export const albumThemeSchema = z.object({
  pageFontFamily: z.string().max(128).optional(),
  backgroundColor: z.string().max(32).optional(),
  backgroundUrl: z.string().max(2048).optional(),
  backgroundBlur: z.number().min(0).max(40).optional(),
  backgroundBrightness: z.number().min(0).max(2).optional(),
  titleTextColor: z.string().max(32).optional(),
  bodyTextColor: z.string().max(32).optional(),
  mutedTextColor: z.string().max(32).optional(),
  glowEnabled: z.boolean().optional(),
  glowColor: z.string().max(32).optional(),
  glowSize: z.number().min(0).max(24).optional(),
  sidebar: z
    .object({
      visible: z.boolean().optional(),
      layout: z.enum(["centered", "aligned"]).optional(),
      glassEnabled: z.boolean().optional(),
      cardColor: z.string().max(32).optional(),
      cardOpacity: z.number().min(0).max(1).optional(),
      cardBlur: z.number().min(0).max(40).optional(),
      borderWidth: z.number().min(0).max(16).optional(),
      borderColor: z.string().max(32).optional(),
      borderStyle: z.enum(["none", "solid", "dashed", "dotted", "double"]).optional(),
      borderRadius: z.number().min(0).max(48).optional(),
      showDivider: z.boolean().optional(),
      dividerColor: z.string().max(32).optional(),
      padding: z.number().min(0).max(48).optional(),
      showSidebarConnections: z.boolean().optional(),
    })
    .optional(),
});

export const albumLayoutPayloadSchema = z.object({
  layout: z.array(albumBlockSchema).max(64),
  theme: albumThemeSchema.optional(),
});

export type AlbumLayoutPayload = z.infer<typeof albumLayoutPayloadSchema>;

export function sanitizeAlbumLayoutPayload(payload: AlbumLayoutPayload): AlbumLayoutPayload {
  const layout = payload.layout.map((block) => {
    const base = { ...block };
    if (block.type === "text" && block.data && typeof block.data === "object") {
      const d = block.data as Record<string, unknown>;
      return {
        ...base,
        data: {
          ...d,
          content: albumSanitizePlainText(String(d.content ?? "")),
          color: d.color ? albumSanitizeHexColor(String(d.color)) ?? undefined : undefined,
        },
      };
    }
    if (block.type === "image" && block.data && typeof block.data === "object") {
      const d = block.data as Record<string, unknown>;
      return {
        ...base,
        data: {
          ...d,
          alt: d.alt ? albumSanitizePlainText(String(d.alt), 200) : undefined,
          url: String(d.url ?? ""),
        },
      };
    }
    if (block.type === "spotify" && block.data && typeof block.data === "object") {
      const d = block.data as Record<string, unknown>;
      const embed = albumNormalizeSpotifyEmbedUrl(String(d.embedUrl ?? ""));
      return {
        ...base,
        data: {
          ...d,
          embedUrl: embed ?? "",
          title: d.title ? albumSanitizePlainText(String(d.title), 120) : undefined,
        },
      };
    }
    return base;
  });

  const theme = payload.theme
    ? {
        ...payload.theme,
        backgroundColor: payload.theme.backgroundColor
          ? albumSanitizeHexColor(payload.theme.backgroundColor) ?? undefined
          : undefined,
        titleTextColor: payload.theme.titleTextColor
          ? albumSanitizeHexColor(payload.theme.titleTextColor) ?? undefined
          : undefined,
        bodyTextColor: payload.theme.bodyTextColor
          ? albumSanitizeHexColor(payload.theme.bodyTextColor) ?? undefined
          : undefined,
        mutedTextColor: payload.theme.mutedTextColor
          ? albumSanitizeHexColor(payload.theme.mutedTextColor) ?? undefined
          : undefined,
        glowColor: payload.theme.glowColor
          ? albumSanitizeHexColor(payload.theme.glowColor) ?? undefined
          : undefined,
      }
    : undefined;

  return { layout, theme };
}

export function parseAndSanitizeAlbumLayoutPayload(raw: unknown): AlbumLayoutPayload {
  const parsed = albumLayoutPayloadSchema.parse(raw);
  return sanitizeAlbumLayoutPayload(parsed);
}
