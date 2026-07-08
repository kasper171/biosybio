import '@tanstack/react-start/server-only';

import { AsyncLocalStorage } from "node:async_hooks";

import { createCspNonce } from "@/lib/security/csp.server";

const cspNonceStore = new AsyncLocalStorage<string>();

/** Runs a request handler with a per-request CSP nonce available to SSR. */
export function runWithCspNonce<T>(fn: () => T): T;
export function runWithCspNonce<T>(fn: () => Promise<T>): Promise<T>;
export function runWithCspNonce<T>(fn: () => T | Promise<T>): T | Promise<T> {
  return cspNonceStore.run(createCspNonce(), fn);
}

/** Nonce for the current request (server only). */
export function getCspNonce(): string | undefined {
  return cspNonceStore.getStore();
}
