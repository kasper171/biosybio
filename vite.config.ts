// @lovable.dev/vite-tanstack-config — wrapper Vite/TanStack (funciona fora do Lovable).
// Para Vercel, o preset Nitro é fixado em "vercel" abaixo.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { discordPresenceWsPlugin } from "./src/lib/discord/discord-ws-vite-plugin";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
  plugins: [discordPresenceWsPlugin()],
});
