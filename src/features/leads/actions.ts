"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireAuthContext, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import { toFieldErrors } from "@/lib/validation";
import {
  normalizeEmail,
  normalizePhone,
  type LeadStatus,
} from "./constants";
import {
  addLeadNoteSchema,
  createLeadSchema,
  deleteLeadSchema,
  recordLeadConsentSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} from "./schemas";
import { findDuplicateLeads } from "./queries";

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function emptyToNullNumber(
  value: number | string | undefined,
): number | null {
  if (value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function revalidateLeadPaths(clientId: string, leadId?: string) {
  revalidatePath(`/clients/${clientId}/leads`);
  if (leadId) revalidatePath(`/clients/${clientId}/leads/${leadId}`);
}

async function recordActivity(input: {
  clientId: string;
  leadId: string;
  activityType: string;
  title: string;
  description?: string | null;
  performedBy: string;
  metadata?: Json;
}) {
  const supabase = await createClient();
  await supabase.from("lead_activities").insert({
    client_id: input.clientId,
    lead_id: input.leadId,
    activity_type: input.activityType,
    title: input.title,
    description: input.description ?? null,
    performed_by: input.performedBy,
    metadata: (input.metadata ?? {}) as Json,
  });
}

export async function createLeadAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createLeadSchema.safeParse({
    clientId: formData.get("clientId"),
    locationId: formData.get("locationId") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    first_name: formData.get("first_name") || undefined,
    last_name: formData.get("last_name") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    preferred_contact_method: formData.get("preferred_contact_method") || undefined,
    child_age_months: formData.get("child_age_months") || undefined,
    age_group: formData.get("age_group") || undefined,
    programId: formData.get("programId") || undefined,
    desired_start_date: formData.get("desired_start_date") || undefined,
    schedule_preference: formData.get("schedule_preference") || undefined,
    lead_source: formData.get("lead_source") || "manual",
    status: formData.get("status") || "new",
    priority: formData.get("priority") || undefined,
    consent_follow_up: formData.get("consent_follow_up") || undefined,
    allowDuplicate: formData.get("allowDuplicate") === "true",
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const data = parsed.data;
  await requirePermission("lead.update", { clientId: data.clientId });
  const ctx = await requireAuthContext();

  const email = emptyToNull(data.email);
  const phone = emptyToNull(data.phone);
  const normalized_email = normalizeEmail(email);
  const normalized_phone = normalizePhone(phone);

  if (!data.allowDuplicate) {
    const duplicates = await findDuplicateLeads(data.clientId, {
      email,
      phone,
    });
    if (duplicates.length > 0) {
      const match = duplicates[0]!;
      return actionError(
        `Possible duplicate of existing lead (${match.first_name ?? ""} ${match.last_name ?? ""}). Open that lead or check “Allow duplicate” to create anyway.`.trim(),
        {
          email: ["A lead with this email or phone may already exist."],
        },
      );
    }
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      client_id: data.clientId,
      location_id: emptyToNull(data.locationId),
      assigned_to: emptyToNull(data.assignedTo),
      first_name: emptyToNull(data.first_name),
      last_name: emptyToNull(data.last_name),
      email,
      normalized_email,
      phone,
      normalized_phone,
      preferred_contact_method: emptyToNull(data.preferred_contact_method) as
        | "email"
        | "phone"
        | "sms"
        | "any"
        | null,
      child_age_months: emptyToNullNumber(data.child_age_months),
      age_group: emptyToNull(data.age_group),
      program_id: emptyToNull(data.programId),
      desired_start_date: emptyToNull(data.desired_start_date),
      schedule_preference: emptyToNull(data.schedule_preference) as
        | "full_time"
        | "part_time"
        | "flexible"
        | "unknown"
        | null,
      lead_source: data.lead_source,
      status: data.status,
      priority: emptyToNull(data.priority) as
        | "low"
        | "normal"
        | "high"
        | "urgent"
        | null,
      consent_status:
        data.consent_follow_up === "granted"
          ? "granted"
          : data.consent_follow_up === "denied"
            ? "denied"
            : "unknown",
      qualification_status: "unreviewed",
    })
    .select("id")
    .single();

  if (error || !lead) {
    console.error("createLeadAction failed", error?.message);
    return actionError("Could not create the lead.");
  }

  await supabase.from("lead_source_events").insert({
    client_id: data.clientId,
    lead_id: lead.id,
    source: data.lead_source,
    raw_payload: { via: "manual_entry" },
  });

  await recordActivity({
    clientId: data.clientId,
    leadId: lead.id,
    activityType: "lead_created",
    title: "Lead created",
    description: `Source: ${data.lead_source}`,
    performedBy: ctx.profile.id,
  });

  if (data.consent_follow_up === "granted" || data.consent_follow_up === "denied") {
    await supabase.from("lead_consents").insert({
      client_id: data.clientId,
      lead_id: lead.id,
      consent_type: "general_enquiry_follow_up",
      status: data.consent_follow_up,
      source: "manual_entry",
      captured_at: new Date().toISOString(),
    });
  }

  revalidateLeadPaths(data.clientId, lead.id);
  redirect(`/clients/${data.clientId}/leads/${lead.id}`);
}

export async function updateLeadAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateLeadSchema.safeParse({
    clientId: formData.get("clientId"),
    leadId: formData.get("leadId"),
    locationId: formData.get("locationId") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    first_name: formData.get("first_name") || undefined,
    last_name: formData.get("last_name") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    preferred_contact_method: formData.get("preferred_contact_method") || undefined,
    child_age_months: formData.get("child_age_months") || undefined,
    age_group: formData.get("age_group") || undefined,
    programId: formData.get("programId") || undefined,
    desired_start_date: formData.get("desired_start_date") || undefined,
    schedule_preference: formData.get("schedule_preference") || undefined,
    lead_source: formData.get("lead_source") || "manual",
    status: formData.get("status") || "new",
    priority: formData.get("priority") || undefined,
    next_action_at: formData.get("next_action_at") || undefined,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const data = parsed.data;
  await requirePermission("lead.update", { clientId: data.clientId });
  if (data.assignedTo) {
    await requirePermission("lead.assign", { clientId: data.clientId });
  }
  const ctx = await requireAuthContext();

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("leads")
    .select("status, assigned_to")
    .eq("id", data.leadId)
    .eq("client_id", data.clientId)
    .maybeSingle();

  const email = emptyToNull(data.email);
  const phone = emptyToNull(data.phone);
  const status = data.status as LeadStatus;
  const closed =
    status === "closed" ||
    status === "enrolled" ||
    status === "not_interested" ||
    status === "duplicate";

  const { error } = await supabase
    .from("leads")
    .update({
      location_id: emptyToNull(data.locationId),
      assigned_to: emptyToNull(data.assignedTo),
      first_name: emptyToNull(data.first_name),
      last_name: emptyToNull(data.last_name),
      email,
      normalized_email: normalizeEmail(email),
      phone,
      normalized_phone: normalizePhone(phone),
      preferred_contact_method: emptyToNull(data.preferred_contact_method) as
        | "email"
        | "phone"
        | "sms"
        | "any"
        | null,
      child_age_months: emptyToNullNumber(data.child_age_months),
      age_group: emptyToNull(data.age_group),
      program_id: emptyToNull(data.programId),
      desired_start_date: emptyToNull(data.desired_start_date),
      schedule_preference: emptyToNull(data.schedule_preference) as
        | "full_time"
        | "part_time"
        | "flexible"
        | "unknown"
        | null,
      lead_source: data.lead_source,
      status,
      priority: emptyToNull(data.priority) as
        | "low"
        | "normal"
        | "high"
        | "urgent"
        | null,
      next_action_at: emptyToNull(data.next_action_at),
      closed_at: closed ? new Date().toISOString() : null,
      converted_at: status === "enrolled" ? new Date().toISOString() : null,
    })
    .eq("id", data.leadId)
    .eq("client_id", data.clientId);

  if (error) {
    console.error("updateLeadAction failed", error.message);
    return actionError("Could not update the lead.");
  }

  if (existing && existing.status !== status) {
    await recordActivity({
      clientId: data.clientId,
      leadId: data.leadId,
      activityType: "status_changed",
      title: "Status updated",
      description: `${existing.status} → ${status}`,
      performedBy: ctx.profile.id,
      metadata: { from: existing.status, to: status },
    });
  }

  if (
    existing &&
    emptyToNull(data.assignedTo) &&
    existing.assigned_to !== emptyToNull(data.assignedTo)
  ) {
    await recordActivity({
      clientId: data.clientId,
      leadId: data.leadId,
      activityType: "assigned",
      title: "Assignee updated",
      performedBy: ctx.profile.id,
    });
  }

  revalidateLeadPaths(data.clientId, data.leadId);
  return actionSuccess(undefined);
}

export async function updateLeadStatusAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateLeadStatusSchema.safeParse({
    clientId: formData.get("clientId"),
    leadId: formData.get("leadId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return actionError("Invalid status update.", toFieldErrors(parsed.error));
  }

  const { clientId, leadId, status } = parsed.data;
  await requirePermission("lead.update", { clientId });
  const ctx = await requireAuthContext();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("leads")
    .select("status")
    .eq("id", leadId)
    .eq("client_id", clientId)
    .maybeSingle();

  const closed =
    status === "closed" ||
    status === "enrolled" ||
    status === "not_interested" ||
    status === "duplicate";

  const { error } = await supabase
    .from("leads")
    .update({
      status,
      closed_at: closed ? new Date().toISOString() : null,
      converted_at: status === "enrolled" ? new Date().toISOString() : null,
    })
    .eq("id", leadId)
    .eq("client_id", clientId);

  if (error) {
    console.error("updateLeadStatusAction failed", error.message);
    return actionError("Could not update lead status.");
  }

  if (existing && existing.status !== status) {
    await recordActivity({
      clientId,
      leadId,
      activityType: "status_changed",
      title: "Status updated",
      description: `${existing.status} → ${status}`,
      performedBy: ctx.profile.id,
      metadata: { from: existing.status, to: status },
    });
  }

  revalidateLeadPaths(clientId, leadId);
  return actionSuccess(undefined);
}

export async function deleteLeadAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = deleteLeadSchema.safeParse({
    clientId: formData.get("clientId"),
    leadId: formData.get("leadId"),
  });
  if (!parsed.success) {
    return actionError("Invalid lead delete request.", toFieldErrors(parsed.error));
  }

  const { clientId, leadId } = parsed.data;
  await requirePermission("lead.delete", { clientId });

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("client_id", clientId);

  if (error) {
    console.error("deleteLeadAction failed", error.message);
    return actionError("Could not delete the lead.");
  }

  revalidateLeadPaths(clientId, leadId);
  return actionSuccess(undefined);
}

export async function addLeadNoteAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = addLeadNoteSchema.safeParse({
    clientId: formData.get("clientId"),
    leadId: formData.get("leadId"),
    note: formData.get("note"),
    is_pinned: formData.get("is_pinned") === "on" || formData.get("is_pinned") === "true",
  });
  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, leadId, note, is_pinned } = parsed.data;
  await requirePermission("lead.update", { clientId });
  const ctx = await requireAuthContext();
  const supabase = await createClient();

  const { error } = await supabase.from("lead_notes").insert({
    client_id: clientId,
    lead_id: leadId,
    author_id: ctx.profile.id,
    note,
    is_pinned,
  });
  if (error) {
    console.error("addLeadNoteAction failed", error.message);
    return actionError("Could not add the note.");
  }

  await recordActivity({
    clientId,
    leadId,
    activityType: "note_added",
    title: "Note added",
    performedBy: ctx.profile.id,
  });

  revalidateLeadPaths(clientId, leadId);
  return actionSuccess(undefined);
}

export async function recordLeadConsentAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = recordLeadConsentSchema.safeParse({
    clientId: formData.get("clientId"),
    leadId: formData.get("leadId"),
    consent_type: formData.get("consent_type"),
    status: formData.get("status"),
    source: formData.get("source") || undefined,
  });
  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const data = parsed.data;
  await requirePermission("lead.update", { clientId: data.clientId });
  const ctx = await requireAuthContext();
  const supabase = await createClient();

  const { error } = await supabase.from("lead_consents").insert({
    client_id: data.clientId,
    lead_id: data.leadId,
    consent_type: data.consent_type,
    status: data.status,
    source: emptyToNull(data.source) ?? "manual_entry",
    captured_at: new Date().toISOString(),
    withdrawn_at:
      data.status === "withdrawn" ? new Date().toISOString() : null,
  });
  if (error) {
    console.error("recordLeadConsentAction failed", error.message);
    return actionError("Could not record consent.");
  }

  await supabase
    .from("leads")
    .update({
      consent_status:
        data.status === "granted"
          ? "granted"
          : data.status === "denied"
            ? "denied"
            : "withdrawn",
    })
    .eq("id", data.leadId)
    .eq("client_id", data.clientId);

  await recordActivity({
    clientId: data.clientId,
    leadId: data.leadId,
    activityType: "consent_updated",
    title: "Consent recorded",
    description: `${data.consent_type}: ${data.status}`,
    performedBy: ctx.profile.id,
  });

  revalidateLeadPaths(data.clientId, data.leadId);
  return actionSuccess(undefined);
}
