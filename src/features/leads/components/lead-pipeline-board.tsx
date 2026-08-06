import { PendingNavLink } from "@/components/shared/pending-nav-link";
import {
  PIPELINE_COLUMNS,
  formatLeadStatus,
  leadDisplayName,
  type LeadStatus,
} from "../constants";
import type { LeadRow } from "../queries";

interface LeadPipelineBoardProps {
  clientId: string;
  leads: LeadRow[];
}

export function LeadPipelineBoard({ clientId, leads }: LeadPipelineBoardProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {PIPELINE_COLUMNS.map((column) => {
        const columnLeads = leads.filter((lead) =>
          column.statuses.includes(lead.status as LeadStatus),
        );

        return (
          <section
            key={column.key}
            className="w-64 shrink-0 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <header className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{column.label}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-ink-muted dark:bg-paper-elevated">
                {columnLeads.length}
              </span>
            </header>
            <ul className="space-y-2">
              {columnLeads.length === 0 ? (
                <li className="text-xs text-ink-muted">No leads</li>
              ) : (
                columnLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-paper-elevated"
                  >
                    <PendingNavLink
                      href={`/clients/${clientId}/leads/${lead.id}`}
                      className="text-sm font-medium text-brand-700 hover:underline"
                    >
                      {leadDisplayName(lead)}
                    </PendingNavLink>
                    <p className="mt-1 text-xs capitalize text-ink-muted">
                      {formatLeadStatus(lead.status)}
                      {lead.lead_source ? ` · ${lead.lead_source.replaceAll("_", " ")}` : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
