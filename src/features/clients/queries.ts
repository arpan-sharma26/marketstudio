import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAuthContext, requirePermission } from "@/lib/auth";
import { can, hasClientAccess, isPlatformAdmin } from "@/lib/permissions";
import type { Database } from "@/types/database";

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

/** Lists clients the authenticated user can access (enforced by RLS + app checks). */
export async function listClients(): Promise<ClientRow[]> {
  const ctx = await requireAuthContext();
  const supabase = await createClient();

  let query = supabase.from("clients").select("*").order("name", { ascending: true });

  // Non-admins only see members / assigned clients; RLS also enforces this.
  if (!isPlatformAdmin(ctx)) {
    const allowedIds = [
      ...new Set([
        ...ctx.memberships.map((m) => m.client_id),
        ...ctx.assignedClientIds,
      ]),
    ];
    if (allowedIds.length === 0) return [];
    query = query.in("id", allowedIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getClient(clientId: string): Promise<ClientRow | null> {
  const ctx = await requireAuthContext();
  if (!hasClientAccess(ctx, clientId)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getClientCapabilities(clientId: string) {
  const ctx = await requireAuthContext();
  return {
    canRead: can(ctx, "client.read", { clientId }),
    canUpdate: can(ctx, "client.update", { clientId }),
    canManage: can(ctx, "client.manage", { clientId }),
    canManageLocations: can(ctx, "location.manage", { clientId }),
    canManageMemberships: can(ctx, "membership.manage", { clientId }),
    canManageBrand: can(ctx, "brand.manage", { clientId }),
    canApproveBrand: can(ctx, "brand.approve", { clientId }),
    canManageOnboarding: can(ctx, "onboarding.manage", { clientId }),
    canReadLeads: can(ctx, "lead.read", { clientId }),
    canUpdateLeads: can(ctx, "lead.update", { clientId }),
    canAssignLeads: can(ctx, "lead.assign", { clientId }),
    canDeleteLeads: can(ctx, "lead.delete", { clientId }),
    canCreateClient: isPlatformAdmin(ctx),
  };
}

export async function requireClientRead(clientId: string) {
  await requirePermission("client.read", { clientId });
  const client = await getClient(clientId);
  if (!client) throw new Error("Client not found.");
  return client;
}
