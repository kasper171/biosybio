import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { readSsrCspNonce } from "@/lib/security/read-ssr-csp-nonce";

export type CreateAppRouterOptions = {
  cspNonce?: string;
};

/** Client-safe router factory — pass CSP nonce only during SSR. */
export function createAppRouter(options?: CreateAppRouterOptions) {
  const queryClient = new QueryClient();

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(options?.cspNonce ? { ssr: { nonce: options.cspNonce } } : {}),
  });
}

export const getRouter = async () => {
  const cspNonce = await readSsrCspNonce();
  return createAppRouter(cspNonce ? { cspNonce } : undefined);
};
