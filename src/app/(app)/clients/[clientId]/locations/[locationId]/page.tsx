import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClient, getClientCapabilities } from "@/features/clients/queries";
import { BusinessHoursForm } from "@/features/locations/components/business-hours-form";
import { LocationForm } from "@/features/locations/components/location-form";
import { getLocation, listBusinessHours } from "@/features/locations/queries";
import { requireAuthContext } from "@/lib/auth";
import { can } from "@/lib/permissions";

export async function generateMetadata() {
  return { title: "Location · Market Studio" };
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; locationId: string }>;
}) {
  const { clientId, locationId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "location.read", { clientId, locationId })) {
    redirect("/unauthorized");
  }

  const client = await getClient(clientId);
  if (!client) notFound();

  const location = await getLocation(clientId, locationId);
  if (!location) notFound();

  const capabilities = await getClientCapabilities(clientId);
  const hours = await listBusinessHours(clientId, locationId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={location.name}
        description={`${location.city}, ${location.province_code} · ${location.status}`}
      />
      <ClientSubnav clientId={clientId} active="locations" />

      <Card>
        <CardHeader>
          <CardTitle>Location details</CardTitle>
          <CardDescription>
            {capabilities.canManageLocations
              ? "Update public and operational details for this location."
              : "You have read-only access to this location."}
          </CardDescription>
        </CardHeader>
        {capabilities.canManageLocations ? (
          <LocationForm mode="edit" clientId={clientId} location={location} />
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Address</dt>
              <dd className="font-medium text-slate-900">{location.address_line_1}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium text-slate-900">{location.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{location.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Timezone</dt>
              <dd className="font-medium text-slate-900">{location.timezone}</dd>
            </div>
          </dl>
        )}
      </Card>

      {capabilities.canManageLocations ? (
        <Card>
          <CardHeader>
            <CardTitle>Operating hours</CardTitle>
            <CardDescription>
              Weekly schedule used for marketing and tour availability context.
            </CardDescription>
          </CardHeader>
          <BusinessHoursForm
            clientId={clientId}
            locationId={locationId}
            hours={hours}
          />
        </Card>
      ) : null}
    </div>
  );
}
