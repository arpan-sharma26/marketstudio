"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { assertSameClient, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { toFieldErrors } from "@/lib/validation";
import {
  createLocationSchema,
  resolveLocationSlug,
  saveBusinessHoursSchema,
  updateLocationSchema,
} from "./schemas";

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

export async function createLocationAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createLocationSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    internal_name: formData.get("internal_name") || undefined,
    address_line_1: formData.get("address_line_1"),
    address_line_2: formData.get("address_line_2") || undefined,
    city: formData.get("city"),
    province_code: formData.get("province_code"),
    postal_code: formData.get("postal_code"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    website_url: formData.get("website_url") || undefined,
    timezone: formData.get("timezone") || "America/Edmonton",
    status: formData.get("status") || "planned",
    accepting_registrations: formData.get("accepting_registrations") === "on",
    tour_booking_enabled: formData.get("tour_booking_enabled") === "on",
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId } = parsed.data;
  await requirePermission("location.manage", { clientId });

  const slug = resolveLocationSlug(parsed.data.name, parsed.data.slug);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_locations")
    .insert({
      client_id: clientId,
      name: parsed.data.name,
      slug,
      internal_name: emptyToNull(parsed.data.internal_name),
      address_line_1: parsed.data.address_line_1,
      address_line_2: emptyToNull(parsed.data.address_line_2),
      city: parsed.data.city,
      province_code: parsed.data.province_code,
      postal_code: parsed.data.postal_code,
      phone: emptyToNull(parsed.data.phone),
      email: emptyToNull(parsed.data.email),
      website_url: emptyToNull(parsed.data.website_url),
      timezone: parsed.data.timezone,
      status: parsed.data.status,
      accepting_registrations: parsed.data.accepting_registrations,
      tour_booking_enabled: parsed.data.tour_booking_enabled,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return actionError("A location with this slug already exists for this client.", {
        slug: ["Slug must be unique within the client."],
      });
    }
    console.error("createLocationAction failed", error.message);
    return actionError("Could not create the location. Please try again.");
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/locations`);
  redirect(`/clients/${clientId}/locations/${data.id}`);
}

export async function updateLocationAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateLocationSchema.safeParse({
    clientId: formData.get("clientId"),
    locationId: formData.get("locationId"),
    name: formData.get("name") || undefined,
    slug: formData.get("slug") || undefined,
    internal_name: formData.get("internal_name") || undefined,
    address_line_1: formData.get("address_line_1") || undefined,
    address_line_2: formData.get("address_line_2") || undefined,
    city: formData.get("city") || undefined,
    province_code: formData.get("province_code") || undefined,
    postal_code: formData.get("postal_code") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    website_url: formData.get("website_url") || undefined,
    timezone: formData.get("timezone") || undefined,
    status: formData.get("status") || undefined,
    accepting_registrations: formData.has("accepting_registrations")
      ? formData.get("accepting_registrations") === "on"
      : undefined,
    tour_booking_enabled: formData.has("tour_booking_enabled")
      ? formData.get("tour_booking_enabled") === "on"
      : undefined,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, locationId, ...fields } = parsed.data;
  await requirePermission("location.manage", { clientId, locationId });

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("client_locations")
    .select("client_id")
    .eq("id", locationId)
    .maybeSingle();
  if (existingError) {
    console.error("updateLocationAction lookup failed", existingError.message);
    return actionError("Could not update the location. Please try again.");
  }
  if (!existing) return actionError("Location not found.");
  assertSameClient(clientId, existing.client_id);

  const updates: Database["public"]["Tables"]["client_locations"]["Update"] = {};
  if (fields.name !== undefined) updates.name = fields.name;
  if (fields.slug !== undefined) updates.slug = fields.slug;
  if (fields.internal_name !== undefined) {
    updates.internal_name = emptyToNull(fields.internal_name);
  }
  if (fields.address_line_1 !== undefined) updates.address_line_1 = fields.address_line_1;
  if (fields.address_line_2 !== undefined) {
    updates.address_line_2 = emptyToNull(fields.address_line_2);
  }
  if (fields.city !== undefined) updates.city = fields.city;
  if (fields.province_code !== undefined) updates.province_code = fields.province_code;
  if (fields.postal_code !== undefined) updates.postal_code = fields.postal_code;
  if (fields.phone !== undefined) updates.phone = emptyToNull(fields.phone);
  if (fields.email !== undefined) updates.email = emptyToNull(fields.email);
  if (fields.website_url !== undefined) {
    updates.website_url = emptyToNull(fields.website_url);
  }
  if (fields.timezone !== undefined) updates.timezone = fields.timezone;
  if (fields.status !== undefined) updates.status = fields.status;
  if (fields.accepting_registrations !== undefined) {
    updates.accepting_registrations = fields.accepting_registrations;
  }
  if (fields.tour_booking_enabled !== undefined) {
    updates.tour_booking_enabled = fields.tour_booking_enabled;
  }

  const { error } = await supabase
    .from("client_locations")
    .update(updates)
    .eq("id", locationId)
    .eq("client_id", clientId);

  if (error) {
    if (error.code === "23505") {
      return actionError("A location with this slug already exists for this client.", {
        slug: ["Slug must be unique within the client."],
      });
    }
    console.error("updateLocationAction failed", error.message);
    return actionError("Could not update the location. Please try again.");
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/locations`);
  revalidatePath(`/clients/${clientId}/locations/${locationId}`);
  return actionSuccess(undefined);
}

export async function saveBusinessHoursAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const hoursType = String(formData.get("hours_type") || "operating");
  const days = Array.from({ length: 7 }, (_, day) => ({
    day_of_week: day,
    hours_type: hoursType,
    is_closed: formData.get(`day_${day}_closed`) === "on",
    open_time: String(formData.get(`day_${day}_open`) || ""),
    close_time: String(formData.get(`day_${day}_close`) || ""),
  }));

  const parsed = saveBusinessHoursSchema.safeParse({
    clientId: formData.get("clientId"),
    locationId: formData.get("locationId"),
    hours_type: hoursType,
    days,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, locationId, hours_type } = parsed.data;
  await requirePermission("location.manage", { clientId, locationId });

  for (const day of parsed.data.days) {
    if (!day.is_closed && (!day.open_time || !day.close_time)) {
      return actionError("Open and close times are required unless the day is closed.", {
        [`day_${day.day_of_week}`]: ["Provide open and close times, or mark closed."],
      });
    }
  }

  const supabase = await createClient();
  const { data: location, error: locationError } = await supabase
    .from("client_locations")
    .select("client_id")
    .eq("id", locationId)
    .maybeSingle();
  if (locationError || !location) {
    return actionError("Location not found.");
  }
  assertSameClient(clientId, location.client_id);

  const rows = parsed.data.days.map((day) => ({
    client_id: clientId,
    location_id: locationId,
    day_of_week: day.day_of_week,
    hours_type,
    is_closed: day.is_closed,
    open_time: day.is_closed ? null : `${day.open_time}:00`,
    close_time: day.is_closed ? null : `${day.close_time}:00`,
  }));

  const { error: deleteError } = await supabase
    .from("location_business_hours")
    .delete()
    .eq("location_id", locationId)
    .eq("hours_type", hours_type);
  if (deleteError) {
    console.error("saveBusinessHoursAction delete failed", deleteError.message);
    return actionError("Could not save business hours. Please try again.");
  }

  const { error: insertError } = await supabase
    .from("location_business_hours")
    .insert(rows);
  if (insertError) {
    console.error("saveBusinessHoursAction insert failed", insertError.message);
    return actionError("Could not save business hours. Please try again.");
  }

  revalidatePath(`/clients/${clientId}/locations/${locationId}`);
  return actionSuccess(undefined);
}
