import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { loadAuthContext } from "@/lib/auth";

export const metadata = {
  title: "Dashboard · Market Studio",
};

export default async function DashboardPage() {
  const ctx = await loadAuthContext();
  const clientCount = ctx?.memberships.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Workspace
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Welcome to Market Studio. Manage daycare clients, run presence audits, and build
          toward enrolment outcomes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Your access</CardTitle>
          <CardDescription>
            Platform role: <span className="font-medium text-ink">{ctx?.profile.platform_role}</span>
          </CardDescription>
          <CardDescription>
            Client memberships: <span className="font-medium text-ink">{clientCount}</span>
          </CardDescription>
        </Card>

        <Card>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>
            Manage daycare clients and locations from the{" "}
            <Link href="/clients" className="font-semibold text-brand-700 hover:text-brand-800">
              Clients
            </Link>{" "}
            section, or run an{" "}
            <Link href="/audit" className="font-semibold text-brand-700 hover:text-brand-800">
              AI Audit
            </Link>
            .
          </CardDescription>
        </Card>
      </div>
    </div>
  );
}
