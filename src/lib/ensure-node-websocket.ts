/** Polyfill WebSocket no Node < 22 para Supabase Realtime durante SSR. */
export async function ensureNodeWebSocket(): Promise<void> {
  if (typeof globalThis.WebSocket !== "undefined") return;

  try {
    const { WebSocket } = await import("ws");
    globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
  } catch (error) {
    console.warn(
      "[Byosy] WebSocket nativo ausente e pacote ws nao encontrado. Use Node 22+ ou npm install ws.",
      error,
    );
  }
}
