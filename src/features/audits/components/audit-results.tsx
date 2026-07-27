import { BRAND } from "@/config/brand";
import { PACKAGE_LABELS, scoreColor, severityStyles } from "@/features/audits/display";
import type { AuditInput, AuditResult, SavedAudit } from "@/features/audits/types";

interface AuditResultsProps {
  result: AuditResult;
  input: AuditInput;
  generatedAt: string | null;
  savedAudit: SavedAudit | null;
}

export function AuditResults({
  result,
  input,
  generatedAt,
  savedAudit,
}: AuditResultsProps) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{BRAND.name} audit</p>
            <h2 className="text-2xl font-bold text-slate-900">{input.businessName}</h2>
            <p className="text-sm text-slate-500">{input.city}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Visibility score</p>
            <p className={`text-5xl font-bold ${scoreColor(result.visibilityScore)}`}>
              {result.visibilityScore}
              <span className="text-2xl text-slate-400">/10</span>
            </p>
          </div>
        </div>
        <p className="mt-4 text-slate-700">{result.summary}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
          {generatedAt && <span>Generated {new Date(generatedAt).toLocaleString()}</span>}
          {savedAudit && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              Saved · {savedAudit.id.slice(0, 8)}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Top issues">
          <div className="space-y-3">
            {result.issues.map((issue) => (
              <div
                key={issue.title}
                className={`rounded-xl border p-4 ${severityStyles(issue.severity)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">{issue.title}</h3>
                  <span className="text-xs uppercase">{issue.severity}</span>
                </div>
                <p className="mt-2 text-sm opacity-90">{issue.description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Quick wins">
          <div className="space-y-3">
            {result.quickWins.map((win) => (
              <div key={win.title} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium text-slate-900">{win.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {win.effort} effort
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{win.impact}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="30-day action plan">
        <div className="grid gap-4 md:grid-cols-2">
          {result.plan.map((week) => (
            <div key={week.week} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-brand-600">Week {week.week}</p>
              <h3 className="mt-1 font-semibold text-slate-900">{week.focus}</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {week.actions.map((action) => (
                  <li key={action} className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Competitor insights">
          <ul className="space-y-2 text-sm text-slate-600">
            {result.competitorInsights.map((insight) => (
              <li key={insight} className="flex gap-2">
                <span className="text-brand-500">→</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Recommended package">
          <div className="rounded-xl bg-brand-700 p-5 text-white">
            <p className="text-lg font-semibold">
              {PACKAGE_LABELS[result.recommendedPackage]}
            </p>
            <p className="mt-3 text-sm text-brand-100">{result.packageRationale}</p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
