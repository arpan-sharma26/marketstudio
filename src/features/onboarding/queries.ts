import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import type { Database } from "@/types/database";
import { DEFAULT_ONBOARDING_TASKS } from "./task-definitions";

export type OnboardingTaskRow =
  Database["public"]["Tables"]["onboarding_tasks"]["Row"];

export interface OnboardingProgress {
  total: number;
  done: number;
  requiredTotal: number;
  requiredDone: number;
  percentComplete: number;
  canComplete: boolean;
}

/**
 * Idempotently ensure the default checklist exists for a client.
 * Uses the service-role client so page loads for read-only roles still backfill
 * missing tasks without relying on insert RLS.
 */
export async function ensureOnboardingTasks(clientId: string): Promise<void> {
  const admin = createAdminClient();
  const rows = DEFAULT_ONBOARDING_TASKS.map((task) => ({
    client_id: clientId,
    task_key: task.task_key,
    title: task.title,
    description: task.description,
    sort_order: task.sort_order,
    is_required: task.is_required,
  }));

  const { error } = await admin.from("onboarding_tasks").upsert(rows, {
    onConflict: "client_id,task_key",
    ignoreDuplicates: true,
  });
  if (error) throw error;
}

export async function listOnboardingTasks(
  clientId: string,
): Promise<OnboardingTaskRow[]> {
  await requirePermission("client.read", { clientId });
  await ensureOnboardingTasks(clientId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("onboarding_tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function summarizeOnboardingProgress(
  tasks: OnboardingTaskRow[],
): OnboardingProgress {
  const doneStatuses = new Set(["completed", "skipped"]);
  const total = tasks.length;
  const done = tasks.filter((t) => doneStatuses.has(t.status)).length;
  const required = tasks.filter((t) => t.is_required);
  const requiredDone = required.filter((t) => doneStatuses.has(t.status)).length;

  return {
    total,
    done,
    requiredTotal: required.length,
    requiredDone,
    percentComplete: total === 0 ? 0 : Math.round((done / total) * 100),
    canComplete: required.length > 0 && requiredDone === required.length,
  };
}
