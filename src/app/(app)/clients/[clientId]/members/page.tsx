import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClient, getClientCapabilities } from "@/features/clients/queries";
import { listLocations } from "@/features/locations/queries";
import { AddMemberForm } from "@/features/memberships/components/add-member-form";
import { MembershipRowActions } from "@/features/memberships/components/membership-row-actions";
import { listMemberships } from "@/features/memberships/queries";
import { requireAuthContext } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const metadata = { title: "Members · Market Studio" };

export default async function ClientMembersPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "membership.manage", { clientId })) {
    redirect("/unauthorized");
  }

  const client = await getClient(clientId);
  if (!client) notFound();

  await getClientCapabilities(clientId);
  const [members, locations] = await Promise.all([
    listMemberships(clientId),
    listLocations(clientId),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={`${client.name} members`}
        description="Manage who can access this client and which locations they can see."
      />
      <ClientSubnav clientId={clientId} active="members" />

      <Card>
        <CardHeader>
          <CardTitle>Add member</CardTitle>
          <CardDescription>
            The user must already have a Market Studio account. Location checkboxes restrict
            access; leave them empty for client-wide access.
          </CardDescription>
        </CardHeader>
        <AddMemberForm clientId={clientId} locations={locations} />
      </Card>

      {members.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Add a client administrator or staff member to get started."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Person</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Locations</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {member.full_name || "Unnamed user"}
                    </div>
                    <div className="text-xs text-slate-500">{member.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{member.role}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {member.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {member.location_ids.length === 0
                      ? "All locations"
                      : `${member.location_ids.length} assigned`}
                  </td>
                  <td className="px-4 py-3">
                    <MembershipRowActions member={member} />
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
