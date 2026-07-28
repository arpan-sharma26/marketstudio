import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type BrandProfileRow = Database["public"]["Tables"]["brand_profiles"]["Row"];
export type ClientFaqRow = Database["public"]["Tables"]["client_faqs"]["Row"];
export type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
export type LocationProgramRow = Database["public"]["Tables"]["location_programs"]["Row"];

export type ProgramWithLocations = ProgramRow & {
  location_programs: Pick<
    LocationProgramRow,
    "id" | "location_id" | "is_available" | "accepting_registrations" | "availability_notes"
  >[];
};

export async function getBrandProfile(
  clientId: string,
): Promise<BrandProfileRow | null> {
  await requirePermission("client.read", { clientId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) {
    console.error("getBrandProfile failed", error.message);
    throw new Error("Could not load brand profile.");
  }
  return data;
}

export async function listFaqs(clientId: string): Promise<ClientFaqRow[]> {
  await requirePermission("client.read", { clientId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_faqs")
    .select("*")
    .eq("client_id", clientId)
    .order("category", { ascending: true })
    .order("question", { ascending: true });

  if (error) {
    console.error("listFaqs failed", error.message);
    throw new Error("Could not load FAQs.");
  }
  return data ?? [];
}

export async function listPrograms(
  clientId: string,
): Promise<ProgramWithLocations[]> {
  await requirePermission("client.read", { clientId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select(
      "*, location_programs(id, location_id, is_available, accepting_registrations, availability_notes)",
    )
    .eq("client_id", clientId)
    .order("name", { ascending: true });

  if (error) {
    console.error("listPrograms failed", error.message);
    throw new Error("Could not load programs.");
  }
  return (data ?? []) as ProgramWithLocations[];
}
