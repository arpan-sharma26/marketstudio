import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClient, getClientCapabilities } from "@/features/clients/queries";
import { LocationForm } from "@/features/locations/components/location-form";
import { requireAuthContext } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const metadata = { title: "New location · Market Studio" };

export default async function NewLocationPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "location.manage", { clientId })) {
    redirect("/unauthorized");
  }

  const client = await getClient(clientId);
  if (!client) notFound();
  await getClientCapabilities(clientId);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New location"
        description={`Add a daycare location for ${client.name}.`}
      />
      <ClientSubnav clientId={clientId} active="locations" />
      <Card>
        <CardHeader>
          <CardTitle>Location details</CardTitle>
          <CardDescription>
            Address and status information used for marketing and tour booking.
          </CardDescription>
        </CardHeader>
        <LocationForm mode="create" clientId={clientId} />
      </Card>
    </div>
  );
}
