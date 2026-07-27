/**
 * Local development seed data for Market Studio.
 *
 * Creates a small, safe dataset for local testing ONLY. Contains no real parent or client
 * information. Run against a LOCAL Supabase instance:
 *
 *   npm run db:seed
 *
 * Requires `.env.local` with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * The service-role client bypasses RLS and must only ever be used in trusted contexts
 * like this script. Never run this against production.
 */
import { config as loadEnv } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/types/database";

loadEnv({ path: ".env.local", override: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Seed requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

// Development-only credentials. These are intentionally weak and must never be used
// outside local development.
const SEED_PASSWORD = "MarketStudio!Dev123";

const USERS = {
  admin: {
    email: "admin@marketstudio.test",
    fullName: "Morgan Admin",
    platformRole: "market_studio_admin" as const,
  },
  clientAdmin: {
    email: "owner@sunnydays.test",
    fullName: "Alex Owner",
    platformRole: "client_user" as const,
  },
  locationManager: {
    email: "manager@sunnydays.test",
    fullName: "Riley Manager",
    platformRole: "client_user" as const,
  },
};

async function ensureUser(
  supabase: SupabaseClient<Database>,
  email: string,
  fullName: string,
): Promise<string> {
  // createUser is idempotent-ish: if the user exists we look them up instead.
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (data?.user) return data.user.id;

  if (error && !/already/i.test(error.message)) {
    throw error;
  }

  // Fall back to listing users to find the existing id.
  const { data: list, error: listError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw new Error(`Could not resolve seeded user: ${email}`);
  return existing.id;
}

async function main() {
  const supabase = createClient<Database>(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Seeding auth users…");
  const adminId = await ensureUser(supabase, USERS.admin.email, USERS.admin.fullName);
  const clientAdminId = await ensureUser(
    supabase,
    USERS.clientAdmin.email,
    USERS.clientAdmin.fullName,
  );
  const locationManagerId = await ensureUser(
    supabase,
    USERS.locationManager.email,
    USERS.locationManager.fullName,
  );

  console.log("Setting platform roles…");
  await supabase
    .from("profiles")
    .update({ platform_role: USERS.admin.platformRole, full_name: USERS.admin.fullName })
    .eq("id", adminId);
  await supabase
    .from("profiles")
    .update({ full_name: USERS.clientAdmin.fullName })
    .eq("id", clientAdminId);
  await supabase
    .from("profiles")
    .update({ full_name: USERS.locationManager.fullName })
    .eq("id", locationManagerId);

  console.log("Seeding client…");
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .upsert(
      {
        name: "Sunny Days Daycare",
        legal_name: "Sunny Days Early Learning Inc.",
        slug: "sunny-days",
        website_url: "https://example.test/sunny-days",
        primary_email: "hello@sunnydays.test",
        country_code: "CA",
        timezone: "America/Edmonton",
        status: "active",
        assigned_account_manager_id: adminId,
        onboarding_status: "completed",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (clientError) throw clientError;
  const clientId = client.id;

  console.log("Seeding locations…");
  const { data: locations, error: locationError } = await supabase
    .from("client_locations")
    .upsert(
      [
        {
          client_id: clientId,
          name: "Sunny Days — Downtown",
          slug: "downtown",
          address_line_1: "100 Main Street",
          city: "Calgary",
          province_code: "AB",
          postal_code: "T2P 1A1",
          timezone: "America/Edmonton",
          status: "active",
          accepting_registrations: true,
          tour_booking_enabled: true,
        },
        {
          client_id: clientId,
          name: "Sunny Days — Northside",
          slug: "northside",
          address_line_1: "250 North Avenue",
          city: "Calgary",
          province_code: "AB",
          postal_code: "T3K 2B2",
          timezone: "America/Edmonton",
          status: "coming_soon",
          accepting_registrations: false,
          tour_booking_enabled: false,
        },
      ],
      { onConflict: "client_id,slug" },
    )
    .select("id, slug");
  if (locationError) throw locationError;
  const downtown = locations.find((l) => l.slug === "downtown");
  if (!downtown) throw new Error("Downtown location was not seeded");

  console.log("Seeding memberships…");
  await supabase.from("client_memberships").upsert(
    [
      { client_id: clientId, profile_id: clientAdminId, role: "client_admin", is_active: true },
      {
        client_id: clientId,
        profile_id: locationManagerId,
        role: "location_manager",
        is_active: true,
      },
    ],
    { onConflict: "client_id,profile_id" },
  );

  // Restrict the location manager to the Downtown location only.
  await supabase.from("location_memberships").upsert(
    [
      {
        client_id: clientId,
        location_id: downtown.id,
        profile_id: locationManagerId,
        role: "location_manager",
      },
    ],
    { onConflict: "location_id,profile_id" },
  );

  console.log("\nSeed complete. Development sign-in credentials:");
  console.table([
    { role: "Market Studio admin", email: USERS.admin.email, password: SEED_PASSWORD },
    { role: "Client admin", email: USERS.clientAdmin.email, password: SEED_PASSWORD },
    {
      role: "Location manager (Downtown only)",
      email: USERS.locationManager.email,
      password: SEED_PASSWORD,
    },
  ]);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
