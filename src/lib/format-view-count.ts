/** Número inteiro completo — sem abreviar (5k → 5,000). */
export function formatViewCount(count: number): string {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  return n.toLocaleString("en-US");
}
