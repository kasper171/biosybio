import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { ensureNodeWebSocket } from "./lib/ensure-node-websocket";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const nodeWebSocketMiddleware = createMiddleware().server(async ({ next }) => {
  await ensureNodeWebSocket();
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [nodeWebSocketMiddleware, errorMiddleware],
}));
