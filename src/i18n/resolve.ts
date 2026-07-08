import type { MessageTree, TranslateParams } from "@/i18n/types";

export function resolveMessage(messages: MessageTree, key: string): string | undefined {
  const parts = key.split(".");
  let node: unknown = messages;
  for (const part of parts) {
    if (!node || typeof node !== "object" || !(part in (node as object))) return undefined;
    node = (node as MessageTree)[part];
  }
  return typeof node === "string" ? node : undefined;
}

export function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = params[token];
    return value == null ? "" : String(value);
  });
}
