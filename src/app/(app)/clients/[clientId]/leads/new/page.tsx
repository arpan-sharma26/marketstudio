import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listPrograms } from "@/features/brand/queries";
import {
  getClient,
  getClientCapabilities,
} from "@/features/clients/queries";
import { LeadForm } from "@/features/leads/components/lead-form";
import { listAssignableMembers } from "@/features/leads/queries";
import { listLocations } from "@/features/locations/queries";
import { can } from "@/lib/permissions";
import { requireAuthContext } from "@/lib/auth";

export const metadata = { title: "New lead · Market Studio" };

export default async function NewLeadPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "lead.update", { clientId })) {
    redirect("/unauthorized");
  }

  const [client, capabilities] = await Promise.all([
    getClient(clientId),
    getClientCapabilities(clientId),
  ]);
  if (!client) notFound();

  const [locations, programs, members] = await Promise.all([
    listLocations(clientId).catch(() => []),
    listPrograms(clientId).catch(() => []),
    listAssignableMembers(clientId).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New lead"
        description={`Manual enquiry capture for ${client.name}.`}
      />
      <ClientSubnav clientId={clientId} active="leads" />

      <Card>
        <CardHeader>
          <CardTitle>Lead details</CardTitle>
          <CardDescription>
            Duplicate email/phone matches are blocked unless you explicitly allow them.
          </CardDescription>
        </CardHeader>
        <LeadForm
          clientId={clientId}
          mode="create"
          locations={locations.map((l) => ({ id: l.id, name: l.name }))}
          programs={programs.map((p) => ({ id: p.id, name: p.name }))}
          members={members}
          canAssign={capabilities.canAssignLeads}
        />
      </Card>
    </div>
  );
}
