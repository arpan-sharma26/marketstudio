import { BRAND } from "@/config/brand";
import { AuditWorkspace } from "@/features/audits/components/audit-workspace";
import { listAuditClientOptions } from "@/features/audits/queries";
import { requireAuthContext } from "@/lib/auth";

export const metadata = { title: "AI Presence Audit · Market Studio" };

export default async function AuditPage() {
  await requireAuthContext();
  const clientOptions = await listAuditClientOptions();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-brand-600">Module 1</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">AI Presence Audit</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Pick a daycare already in {BRAND.name} or enter a prospect&apos;s details. You
          get a visibility score, top issues, quick wins, and a 30-day action plan — the
          same deliverable you use on sales calls and client onboarding.
        </p>
      </div>

      <AuditWorkspace clientOptions={clientOptions} />
    </div>
  );
}
