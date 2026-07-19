import { AppShell } from "@/components/shared/app-shell";
import { requireProfile } from "@/lib/auth";

/**
 * Protected application layout. Server-side guard: any unauthenticated or inactive user
 * is redirected before children render. This is defense-in-depth alongside middleware
 * and Row Level Security.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireProfile();

  return (
    <AppShell
      userName={profile.full_name ?? "Market Studio user"}
      userEmail={profile.email ?? ""}
    >
      {children}
    </AppShell>
  );
}
