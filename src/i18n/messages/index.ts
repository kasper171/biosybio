import type { MessageTree } from "@/i18n/types";
import { enCore } from "@/i18n/messages/en-core";
import { ptCore } from "@/i18n/messages/pt-core";
import { esCore } from "@/i18n/messages/es-core";
import { enDashboard } from "@/i18n/messages/en-dashboard";
import { ptDashboard } from "@/i18n/messages/pt-dashboard";
import { esDashboard } from "@/i18n/messages/es-dashboard";

function withDashboard(core: MessageTree, dashboard: MessageTree): MessageTree {
  return { ...core, dashboard };
}

export const messages = {
  en: withDashboard(enCore, enDashboard),
  pt: withDashboard(ptCore, ptDashboard),
  es: withDashboard(esCore, esDashboard),
} as const;
