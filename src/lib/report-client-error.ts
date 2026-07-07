/** Relatório de erros no cliente (substitui integração Lovable; no-op fora do sandbox). */
export function reportClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[Biosy]", error, context);
}
