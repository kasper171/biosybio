import { getClientIp } from "@/lib/get-client-ip.server";

type AuditParams = {
  action: string;
  actorId?: string | null;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_log").insert({
      action: params.action,
      actor_id: params.actorId ?? null,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      metadata: params.metadata ?? {},
      client_ip: getClientIp(),
    });
  } catch (err) {
    console.error("[writeAuditLog]", params.action, err);
  }
}
