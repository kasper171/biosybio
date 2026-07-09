import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const discordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string().optional(),
  avatar: z.string().nullable().optional(),
  global_name: z.string().nullable().optional(),
});

export const albumFetchDiscordPresenceFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string().regex(/^\d{15,22}$/) }))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${data.userId}`, { cache: "no-store" });
      if (!res.ok) return { ok: false as const };
      const json = await res.json();
      if (!json?.success || !json?.data?.discord_user) return { ok: false as const };
      const user = discordUserSchema.safeParse(json.data.discord_user);
      if (!user.success) return { ok: false as const };
      return {
        ok: true as const,
        user: user.data,
        activities: json.data.activities ?? [],
        spotify: json.data.spotify ?? null,
        badges: json.data.badges ?? [],
      };
    } catch {
      return { ok: false as const };
    }
  });
