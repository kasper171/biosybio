/** Relatório de erros no cliente (substitui integração Lovable; no-op fora do sandbox). */
import { SITE_NAME } from "@/lib/site";

export function reportClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error(`[${SITE_NAME}]`, error, context);
}
