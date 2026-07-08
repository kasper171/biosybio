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

/** Runs a request handler with a per-request CSP nonce available to SSR. */
export function runWithCspNonce<T>(fn: () => T): T;
export function runWithCspNonce<T>(fn: () => Promise<T>): Promise<T>;
export function runWithCspNonce<T>(fn: () => T | Promise<T>): T | Promise<T> {
  const nonce = createCspNonce();
  return cspNonceStore.run(nonce, fn);
}

/** Nonce for the current request (server only). */
export function getCspNonce(): string | undefined {
  return cspNonceStore.getStore();
}

/** Creates a nonce and runs fn without AsyncLocalStorage (for error paths). */
export function withFreshCspNonce<T>(fn: (nonce: string) => T): T {
  return fn(createCspNonce());
}
