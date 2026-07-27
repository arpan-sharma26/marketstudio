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
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome to Market Studio. The workspace foundation is in place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Your access</CardTitle>
          <CardDescription>
            Platform role: <span className="font-medium">{ctx?.profile.platform_role}</span>
          </CardDescription>
          <CardDescription>
            Client memberships: <span className="font-medium">{clientCount}</span>
          </CardDescription>
        </Card>

        <Card>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>
            Manage daycare clients and locations from the{" "}
            <a href="/clients" className="font-medium text-brand-700 hover:underline">
              Clients
            </a>{" "}
            section. Brand profiles and leads come next.
          </CardDescription>
        </Card>
      </div>
    </div>
  );
}
