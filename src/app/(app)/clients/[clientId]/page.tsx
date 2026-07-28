import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { PageHeader } from "@/components/shared/page-header";
import { PendingNavLink } from "@/components/shared/pending-nav-link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/features/clients/components/client-form";
import {
  getClient,
  getClientCapabilities,
} from "@/features/clients/queries";
import { listLocations } from "@/features/locations/queries";
import { can } from "@/lib/permissions";
import { requireAuthContext } from "@/lib/auth";

export async function generateMetadata() {
  return { title: "Client · Market Studio" };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "client.read", { clientId })) {
    redirect("/unauthorized");
  }

  const [client, capabilities] = await Promise.all([
    getClient(clientId),
    getClientCapabilities(clientId),
  ]);
  if (!client) notFound();

  const locations = capabilities.canRead
    ? await listLocations(clientId).catch(() => [])
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={client.name}
        description={`${client.slug} · ${client.status}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium capitalize text-brand-800 ring-1 ring-brand-100">
              Onboarding: {client.onboarding_status.replaceAll("_", " ")}
            </span>
            <PendingNavLink
              href={`/clients/${clientId}/onboarding`}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              View checklist
            </PendingNavLink>
          </div>
        }
      />
      <ClientSubnav clientId={clientId} active="overview" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client details</CardTitle>
            <CardDescription>
              {capabilities.canUpdate
                ? "Update approved business information for this client."
                : "You have read-only access to this client."}
            </CardDescription>
          </CardHeader>
          {capabilities.canUpdate ? (
            <ClientForm mode="edit" client={client} />
          ) : (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Legal name</dt>
                <dd className="font-medium text-slate-900">
                  {client.legal_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Primary email</dt>
                <dd className="font-medium text-slate-900">
                  {client.primary_email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Timezone</dt>
                <dd className="font-medium text-slate-900">{client.timezone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Website</dt>
                <dd className="font-medium text-slate-900">
                  {client.website_url || "—"}
                </dd>
              </div>
            </dl>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>
              {locations.length} location{locations.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <ul className="space-y-2 text-sm">
            {locations.length === 0 ? (
              <li className="text-slate-500">No locations yet.</li>
            ) : (
              locations.map((location) => (
                <li key={location.id}>
                  <PendingNavLink
                    href={`/clients/${clientId}/locations/${location.id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {location.name}
                  </PendingNavLink>
                  <div className="text-xs text-slate-500">
                    {location.city}, {location.province_code}
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
