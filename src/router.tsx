import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { getCspNonce } from "@/lib/security/csp-context.server";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const nonce = typeof window === "undefined" ? getCspNonce() : undefined;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(nonce ? { ssr: { nonce } } : {}),
  });

  return router;
};
