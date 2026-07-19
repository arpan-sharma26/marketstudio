import { redirect } from "next/navigation";

import { getAuthenticatedProfile } from "@/lib/auth";

export default async function HomePage() {
  const profile = await getAuthenticatedProfile();
  redirect(profile ? "/dashboard" : "/sign-in");
}
