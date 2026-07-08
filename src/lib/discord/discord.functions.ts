import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const discordUserIdInput = z.object({
  userId: z.string().regex(/^\d{15,22}$/),
});

export const getDiscordDcdnProfileFn = createServerFn({ method: "POST" })
  .inputValidator(discordUserIdInput)
  .handler(async ({ data }) => {
    const { ensureDiscordServicesStarted } = await import("@/lib/discord/discord-services.server");
    const { getDcdnProfileCached } = await import("@/lib/discord/dcdn-profile.server");
    ensureDiscordServicesStarted();
    return getDcdnProfileCached(data.userId);
  });

export const getDiscordPresenceFn = createServerFn({ method: "POST" })
  .inputValidator(discordUserIdInput)
  .handler(async ({ data }) => {
    const { ensureDiscordServicesStarted } = await import("@/lib/discord/discord-services.server");
    const { readPresenceCache } = await import("@/lib/discord/presence-cache.server");
    ensureDiscordServicesStarted();
    return readPresenceCache(data.userId);
  });
