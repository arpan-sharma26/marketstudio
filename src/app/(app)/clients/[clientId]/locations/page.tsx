import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PendingNavLink } from "@/components/shared/pending-nav-link";
import { Button } from "@/components/ui/button";
import { getClient, getClientCapabilities } from "@/features/clients/queries";
import { listLocations } from "@/features/locations/queries";
import { requireAuthContext } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const metadata = { title: "Locations · Market Studio" };

export default async function ClientLocationsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "location.read", { clientId })) {
    redirect("/unauthorized");
  }

  const client = await getClient(clientId);
  if (!client) notFound();

  const capabilities = await getClientCapabilities(clientId);
  const locations = await listLocations(clientId);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`${client.name} locations`}
        description="Daycare centres and sites for this client."
        actions={
          capabilities.canManageLocations ? (
            <Link href={`/clients/${clientId}/locations/new`}>
              <Button>New location</Button>
            </Link>
          ) : null
        }
      />
      <ClientSubnav clientId={clientId} active="locations" />

      {locations.length === 0 ? (
        <EmptyState
          title="No locations yet"
          description="Add the first daycare location for this client."
          action={
            capabilities.canManageLocations ? (
              <Link href={`/clients/${clientId}/locations/new`}>
                <Button>Add location</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">City</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map((location) => (
                <tr key={location.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{location.name}</div>
                    <div className="text-xs text-slate-500">{location.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {location.city}, {location.province_code}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{location.status}</td>
                  <td className="px-4 py-3 text-right">
                    <PendingNavLink
                      href={`/clients/${clientId}/locations/${location.id}`}
                      className="font-medium text-brand-700 hover:underline"
                      pendingLabel="Opening location"
                    >
                      Open
                    </PendingNavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
