import { createIsomorphicFn } from "@tanstack/react-start";

/** Server: current request CSP nonce from AsyncLocalStorage. Client: always undefined. */
export const readSsrCspNonce = createIsomorphicFn()
  .server(async (): Promise<string | undefined> => {
    const { getCspNonce } = await import("@/lib/security/csp-context.server");
    return getCspNonce();
  })
  .client(async (): Promise<undefined> => undefined);
