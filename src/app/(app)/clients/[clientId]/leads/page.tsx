import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PendingNavLink } from "@/components/shared/pending-nav-link";
import { Button } from "@/components/ui/button";
import {
  getClient,
  getClientCapabilities,
} from "@/features/clients/queries";
import { DeleteLeadButton } from "@/features/leads/components/delete-lead-button";
import { LeadPipelineBoard } from "@/features/leads/components/lead-pipeline-board";
import {
  formatLeadStatus,
  leadDisplayName,
  LEAD_STATUSES,
} from "@/features/leads/constants";
import { listLeads } from "@/features/leads/queries";
import { listLocations } from "@/features/locations/queries";
import { can } from "@/lib/permissions";
import { requireAuthContext } from "@/lib/auth";

export const metadata = { title: "Leads · Market Studio" };

export default async function ClientLeadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ q?: string; status?: string; locationId?: string }>;
}) {
  const { clientId } = await params;
  const filters = await searchParams;
  const ctx = await requireAuthContext();

  if (!can(ctx, "lead.read", { clientId })) {
    redirect("/unauthorized");
  }

  const [client, capabilities] = await Promise.all([
    getClient(clientId),
    getClientCapabilities(clientId),
  ]);
  if (!client) notFound();

  const [leads, locations] = await Promise.all([
    listLeads(clientId, {
      q: filters.q,
      status: filters.status,
      locationId: filters.locationId,
    }),
    listLocations(clientId).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`${client.name} leads`}
        description="Capture enquiries, move them through the pipeline, and track consent."
        actions={
          capabilities.canUpdateLeads ? (
            <Link href={`/clients/${clientId}/leads/new`}>
              <Button>New lead</Button>
            </Link>
          ) : null
        }
      />
      <ClientSubnav clientId={clientId} active="leads" />

      <form className="mb-5 grid gap-3 sm:grid-cols-4" method="get">
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search name, email, phone"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-600 dark:bg-paper-elevated sm:col-span-2"
        />
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-paper-elevated"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLeadStatus(status)}
            </option>
          ))}
        </select>
        <select
          name="locationId"
          defaultValue={filters.locationId ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-paper-elevated"
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" className="sm:col-span-4 sm:w-fit">
          Apply filters
        </Button>
      </form>

      {leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Add the first enquiry manually, or wait for website and ad capture integrations in later phases."
          action={
            capabilities.canUpdateLeads ? (
              <Link href={`/clients/${clientId}/leads/new`}>
                <Button>Create lead</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Pipeline</h2>
            <LeadPipelineBoard clientId={clientId} leads={leads} />
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Source</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Consent</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {leadDisplayName(lead)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {[lead.email, lead.phone].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-700">
                      {formatLeadStatus(lead.status)}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-700">
                      {lead.lead_source.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-700">
                      {lead.consent_status}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <PendingNavLink
                          href={`/clients/${clientId}/leads/${lead.id}`}
                          className="font-medium text-brand-700 hover:underline"
                        >
                          Open
                        </PendingNavLink>
                        {capabilities.canDeleteLeads ? (
                          <DeleteLeadButton
                            clientId={clientId}
                            leadId={lead.id}
                            leadName={leadDisplayName(lead)}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}
