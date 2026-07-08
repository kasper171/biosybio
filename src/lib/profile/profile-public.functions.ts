import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const usernameInput = z.object({
  username: z.string().min(1).max(64),
});

export const fetchPublicProfileByUsernameFn = createServerFn({ method: "POST" })
  .inputValidator(usernameInput)
  .handler(async ({ data }) => {
    try {
      const { fetchPublicProfileByUsername } = await import("@/lib/profile/profile-public.server");
      return await fetchPublicProfileByUsername(data.username);
    } catch (error) {
      console.error("[fetchPublicProfileByUsernameFn]", error);
      return null;
    }
  });
