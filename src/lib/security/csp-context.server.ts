import '@tanstack/react-start/server-only';

import { AsyncLocalStorage } from "node:async_hooks";

import { createCspNonce } from "@/lib/security/csp.server";

// Share one AsyncLocalStorage instance across server bundles (Nitro/Vercel splits chunks).
const GLOBAL_CSP_NONCE_KEY = Symbol.for("byosy:csp-nonce-context");

const globalObj = globalThis as typeof globalThis & {
  [key: symbol]: AsyncLocalStorage<string> | undefined;
};

if (!globalObj[GLOBAL_CSP_NONCE_KEY]) {
  globalObj[GLOBAL_CSP_NONCE_KEY] = new AsyncLocalStorage<string>();
}

const cspNonceStore = globalObj[GLOBAL_CSP_NONCE_KEY]!;

type CspNonceCallback<T> = (nonce: string) => T | Promise<T>;

/** Runs a request handler with a per-request CSP nonce available to SSR. */
export function runWithCspNonce<T>(fn: CspNonceCallback<T>): T | Promise<T> {
  const nonce = createCspNonce();
  return cspNonceStore.run(nonce, () => fn(nonce));
}

/** Nonce for the current request (server only). */
export function getCspNonce(): string | undefined {
  return cspNonceStore.getStore();
}
