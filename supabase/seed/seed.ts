/**
 * Development seed data for Market Studio (cloud Supabase).
 *
 * Creates a small, safe dataset for testing ONLY. Contains no real parent data.
 *
 *   npm run db:seed
 *
 * Requires `.env.local` with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Never run this against production with real customer data.
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

// Development-only credentials. Intentionally weak — local/dev use only.
const SEED_PASSWORD = "MarketStudio!Dev123";

const USERS = {
  admin: {
    email: "admin@marketstudio.test",
    fullName: "Morgan Admin",
    platformRole: "market_studio_admin" as const,
  },
  clientAdmin: {
    email: "owner@bloomingsteps.test",
    fullName: "Alex Owner",
    platformRole: "client_user" as const,
  },
  locationManager: {
    email: "manager@bloomingsteps.test",
    fullName: "Riley Manager",
    platformRole: "client_user" as const,
  },
};

const LOCATIONS = [
  {
    name: "Blooming Steps — Calgary",
    slug: "calgary",
    address_line_1: "100 Main Street",
    city: "Calgary",
    province_code: "AB",
    postal_code: "T2P 1A1",
    timezone: "America/Edmonton",
    status: "active" as const,
    accepting_registrations: true,
    tour_booking_enabled: true,
  },
  {
    name: "Blooming Steps — Winnipeg",
    slug: "winnipeg",
    address_line_1: "200 Portage Avenue",
    city: "Winnipeg",
    province_code: "MB",
    postal_code: "R3C 0A1",
    timezone: "America/Winnipeg",
    status: "active" as const,
    accepting_registrations: true,
    tour_booking_enabled: true,
  },
  {
    name: "Blooming Steps — Regina",
    slug: "regina",
    address_line_1: "300 Scarth Street",
    city: "Regina",
    province_code: "SK",
    postal_code: "S4P 2G9",
    timezone: "America/Regina",
    status: "coming_soon" as const,
    accepting_registrations: false,
    tour_booking_enabled: false,
  },
];

async function ensureUser(
  supabase: SupabaseClient<Database>,
  email: string,
  fullName: string,
): Promise<string> {
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

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
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
  const clientPayload = {
    name: "Blooming Steps Daycare",
    legal_name: "Blooming Steps Day Care",
    slug: "blooming-steps",
    website_url: "https://example.test/blooming-steps",
    primary_email: "hello@bloomingsteps.test",
    country_code: "CA",
    timezone: "America/Edmonton", // Calgary
    status: "active" as const,
    assigned_account_manager_id: adminId,
    onboarding_status: "completed" as const,
  };

  // Rename legacy Sunny Days seed row in place when present.
  const { data: legacyClient } = await supabase
    .from("clients")
    .select("id")
    .eq("slug", "sunny-days")
    .maybeSingle();

  let clientId: string;
  if (legacyClient) {
    const { data: renamed, error: renameError } = await supabase
      .from("clients")
      .update(clientPayload)
      .eq("id", legacyClient.id)
      .select("id")
      .single();
    if (renameError) throw renameError;
    clientId = renamed.id;
  } else {
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .upsert(clientPayload, { onConflict: "slug" })
      .select("id")
      .single();
    if (clientError) throw clientError;
    clientId = client.id;
  }

  console.log("Seeding locations…");
  const keepSlugs = LOCATIONS.map((l) => l.slug);

  // Remove old seed locations that are no longer part of this dataset (e.g. downtown/northside).
  const { data: existingLocations } = await supabase
    .from("client_locations")
    .select("id, slug")
    .eq("client_id", clientId);

  const obsoleteIds = (existingLocations ?? [])
    .filter((row) => !keepSlugs.includes(row.slug))
    .map((row) => row.id);

  if (obsoleteIds.length > 0) {
    await supabase.from("location_memberships").delete().in("location_id", obsoleteIds);
    await supabase.from("location_business_hours").delete().in("location_id", obsoleteIds);
    await supabase.from("client_locations").delete().in("id", obsoleteIds);
  }

  const { data: locations, error: locationError } = await supabase
    .from("client_locations")
    .upsert(
      LOCATIONS.map((location) => ({
        client_id: clientId,
        ...location,
      })),
      { onConflict: "client_id,slug" },
    )
    .select("id, slug");
  if (locationError) throw locationError;

  const calgary = locations.find((l) => l.slug === "calgary");
  if (!calgary) throw new Error("Calgary location was not seeded");

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

  // Restrict the location manager to the Calgary location only.
  await supabase.from("location_memberships").upsert(
    [
      {
        client_id: clientId,
        location_id: calgary.id,
        profile_id: locationManagerId,
        role: "location_manager",
      },
    ],
    { onConflict: "location_id,profile_id" },
  );

  console.log("Seeding brand profile…");
  await supabase.from("brand_profiles").upsert(
    {
      client_id: clientId,
      name: "Blooming Steps",
      business_summary:
        "Blooming Steps Daycare helps Canadian families find warm, licensed early learning near home.",
      mission_statement:
        "Nurture curious children through play-based learning and trusted caregiver partnerships.",
      brand_voice: "Warm, clear, reassuring, never pushy.",
      primary_colour: "#0A2F3D",
      secondary_colour: "#1FA6A0",
      accent_colour: "#7ED6C1",
      target_audience: [
        "Parents of infants to school-age children in Calgary, Winnipeg, and Regina",
        "Families comparing licensed daycare options",
      ],
      unique_selling_points: [
        "Licensed early learning environments",
        "Play-based curriculum",
        "Transparent tour and enrolment process",
      ],
      content_pillars: [
        "Daily learning moments",
        "Parent partnership",
        "Community and safety",
      ],
      approved_claims: [
        "Licensed daycare",
        "Play-based early learning",
        "Tour bookings available at select locations",
      ],
      restricted_claims: [
        "Guaranteed space availability",
        "Subsidy eligibility guarantees",
        "Medical or developmental claims",
      ],
      approved_ctas: ["Book a tour", "Ask about enrolment", "Contact our team"],
      status: "approved",
      approved_by: clientAdminId,
      approved_at: new Date().toISOString(),
    },
    { onConflict: "client_id" },
  );

  console.log("Seeding FAQs…");
  // Replace seed FAQs for this client so re-runs stay idempotent.
  await supabase.from("client_faqs").delete().eq("client_id", clientId);
  await supabase.from("client_faqs").insert([
    {
      client_id: clientId,
      location_id: null,
      question: "Do you offer tours?",
      answer:
        "Yes. Families can book a tour at locations where tour booking is enabled. Availability varies by location.",
      category: "Tours",
      is_ai_usable: true,
      status: "approved",
      approved_by: clientAdminId,
      approved_at: new Date().toISOString(),
    },
    {
      client_id: clientId,
      location_id: calgary.id,
      question: "Is the Calgary location accepting registrations?",
      answer:
        "The Calgary location is currently accepting registrations. Contact the centre to confirm age-group availability.",
      category: "Enrolment",
      is_ai_usable: true,
      status: "approved",
      approved_by: clientAdminId,
      approved_at: new Date().toISOString(),
    },
  ]);

  console.log("Seeding programs…");
  const programDefs = [
    {
      name: "Infant",
      description: "Nurturing care for our youngest learners.",
      minimum_age_months: 0,
      maximum_age_months: 18,
      status: "active" as const,
    },
    {
      name: "Toddler",
      description: "Play-based discovery for emerging walkers and talkers.",
      minimum_age_months: 18,
      maximum_age_months: 36,
      status: "active" as const,
    },
    {
      name: "Preschool",
      description: "School-readiness through guided play and social learning.",
      minimum_age_months: 36,
      maximum_age_months: 60,
      status: "active" as const,
    },
  ];

  const { data: programs, error: programError } = await supabase
    .from("programs")
    .upsert(
      programDefs.map((program) => ({ client_id: clientId, ...program })),
      { onConflict: "client_id,name" },
    )
    .select("id, name");
  if (programError) throw programError;

  const activeLocations = (locations ?? []).filter((l) =>
    ["calgary", "winnipeg"].includes(l.slug),
  );
  const locationProgramRows = programs.flatMap((program) =>
    activeLocations.map((location) => ({
      client_id: clientId,
      location_id: location.id,
      program_id: program.id,
      is_available: true,
      accepting_registrations: location.slug === "calgary",
    })),
  );

  if (locationProgramRows.length > 0) {
    await supabase
      .from("location_programs")
      .upsert(locationProgramRows, { onConflict: "location_id,program_id" });
  }

  console.log("\nSeed complete. Development sign-in credentials:");
  console.table([
    { role: "Market Studio admin", email: USERS.admin.email, password: SEED_PASSWORD },
    { role: "Client admin", email: USERS.clientAdmin.email, password: SEED_PASSWORD },
    {
      role: "Location manager (Calgary only)",
      email: USERS.locationManager.email,
      password: SEED_PASSWORD,
    },
  ]);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
