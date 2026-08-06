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
import {
  AddLeadNoteForm,
  RecordLeadConsentForm,
} from "@/features/leads/components/lead-side-forms";
import {
  formatLeadStatus,
  leadDisplayName,
} from "@/features/leads/constants";
import {
  getLead,
  listAssignableMembers,
  listLeadActivities,
  listLeadConsents,
  listLeadNotes,
} from "@/features/leads/queries";
import { listLocations } from "@/features/locations/queries";
import { can } from "@/lib/permissions";
import { requireAuthContext } from "@/lib/auth";

export async function generateMetadata() {
  return { title: "Lead · Market Studio" };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; leadId: string }>;
}) {
  const { clientId, leadId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "lead.read", { clientId })) {
    redirect("/unauthorized");
  }

  const [client, capabilities, lead] = await Promise.all([
    getClient(clientId),
    getClientCapabilities(clientId),
    getLead(clientId, leadId),
  ]);
  if (!client || !lead) notFound();

  const [locations, programs, members, notes, activities, consents] =
    await Promise.all([
      listLocations(clientId).catch(() => []),
      listPrograms(clientId).catch(() => []),
      listAssignableMembers(clientId).catch(() => []),
      listLeadNotes(clientId, leadId),
      listLeadActivities(clientId, leadId),
      listLeadConsents(clientId, leadId),
    ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={leadDisplayName(lead)}
        description={`${formatLeadStatus(lead.status)} · ${lead.lead_source.replaceAll("_", " ")} · consent ${lead.consent_status}`}
      />
      <ClientSubnav clientId={clientId} active="leads" />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Lead profile</CardTitle>
            <CardDescription>
              {capabilities.canUpdateLeads
                ? "Update contact details, pipeline status, and assignment."
                : "Read-only lead details."}
            </CardDescription>
          </CardHeader>
          {capabilities.canUpdateLeads ? (
            <LeadForm
              clientId={clientId}
              mode="edit"
              lead={lead}
              locations={locations.map((l) => ({ id: l.id, name: l.name }))}
              programs={programs.map((p) => ({ id: p.id, name: p.name }))}
              members={members}
              canAssign={capabilities.canAssignLeads}
            />
          ) : (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium">{lead.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium">{lead.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium capitalize">
                  {formatLeadStatus(lead.status)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Source</dt>
                <dd className="font-medium capitalize">
                  {lead.lead_source.replaceAll("_", " ")}
                </dd>
              </div>
            </dl>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Internal follow-up notes.</CardDescription>
            </CardHeader>
            {capabilities.canUpdateLeads ? (
              <div className="mb-4">
                <AddLeadNoteForm clientId={clientId} leadId={leadId} />
              </div>
            ) : null}
            <ul className="space-y-3 text-sm">
              {notes.length === 0 ? (
                <li className="text-ink-muted">No notes yet.</li>
              ) : (
                notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                  >
                    {note.is_pinned ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                        Pinned
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap text-ink">{note.note}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consent history</CardTitle>
              <CardDescription>Never delete consent records.</CardDescription>
            </CardHeader>
            {capabilities.canUpdateLeads ? (
              <div className="mb-4">
                <RecordLeadConsentForm clientId={clientId} leadId={leadId} />
              </div>
            ) : null}
            <ul className="space-y-2 text-sm">
              {consents.length === 0 ? (
                <li className="text-ink-muted">No consent events yet.</li>
              ) : (
                consents.map((consent) => (
                  <li key={consent.id} className="capitalize text-ink">
                    {consent.consent_type.replaceAll("_", " ")} · {consent.status}
                    <span className="ml-2 text-xs text-ink-muted">
                      {new Date(consent.captured_at).toLocaleDateString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Lead timeline.</CardDescription>
            </CardHeader>
            <ul className="space-y-3 text-sm">
              {activities.length === 0 ? (
                <li className="text-ink-muted">No activity yet.</li>
              ) : (
                activities.map((activity) => (
                  <li key={activity.id}>
                    <p className="font-medium text-ink">
                      {activity.title || activity.activity_type}
                    </p>
                    {activity.description ? (
                      <p className="text-ink-muted">{activity.description}</p>
                    ) : null}
                    <p className="text-xs text-ink-soft">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
