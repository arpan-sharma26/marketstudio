"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { exportAuditPdf } from "@/features/audits/export-audit-pdf";
import type { AuditInput, AuditResult } from "@/features/audits/types";

interface ExportAuditPdfButtonProps {
  result: AuditResult;
  input: AuditInput;
  generatedAt: string | null;
}

export function ExportAuditPdfButton({
  result,
  input,
  generatedAt,
}: ExportAuditPdfButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      await exportAuditPdf({ result, input, generatedAt });
    } catch (err) {
      console.error("exportAuditPdf failed", err);
      setError("Could not generate the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="secondary"
        onClick={handleExport}
        disabled={exporting}
        aria-disabled={exporting}
      >
        {exporting ? "Preparing PDF…" : "Export PDF"}
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
