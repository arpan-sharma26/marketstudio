import { jsPDF } from "jspdf";

import { BRAND } from "@/config/brand";
import { PACKAGE_LABELS } from "@/features/audits/display";
import type { AuditInput, AuditResult } from "@/features/audits/types";

const COLORS = {
  navy: [10, 47, 61] as const,
  teal: [47, 196, 174] as const,
  mint: [150, 229, 211] as const,
  ink: [42, 49, 64] as const,
  muted: [91, 100, 114] as const,
  soft: [139, 147, 161] as const,
  paper: [246, 248, 249] as const,
  white: [255, 255, 255] as const,
  high: [190, 48, 72] as const,
  medium: [180, 120, 20] as const,
  low: [91, 100, 114] as const,
  good: [5, 122, 85] as const,
  warn: [180, 120, 20] as const,
  bad: [190, 48, 72] as const,
};

const MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = PAGE_HEIGHT - 14;

type RGB = readonly [number, number, number];

export interface ExportAuditPdfOptions {
  result: AuditResult;
  input: AuditInput;
  generatedAt?: string | null;
}

function slugifyFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function scoreRgb(score: number): RGB {
  if (score >= 8) return COLORS.good;
  if (score >= 6) return COLORS.warn;
  return COLORS.bad;
}

function severityRgb(severity: "high" | "medium" | "low"): RGB {
  if (severity === "high") return COLORS.high;
  if (severity === "medium") return COLORS.medium;
  return COLORS.low;
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch(BRAND.logoSrc);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function wrapText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export async function exportAuditPdf({
  result,
  input,
  generatedAt,
}: ExportAuditPdfOptions): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const logoDataUrl = await loadLogoDataUrl();
  const generatedLabel = generatedAt
    ? new Date(generatedAt).toLocaleString()
    : new Date().toLocaleString();

  let y = 0;
  let page = 1;

  const setFill = (rgb: RGB) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setDraw = (rgb: RGB) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  const setText = (rgb: RGB) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

  function drawFooter() {
    setDraw(COLORS.mint);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, FOOTER_Y - 4, PAGE_WIDTH - MARGIN, FOOTER_Y - 4);
    setText(COLORS.soft);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`${BRAND.name} · ${BRAND.tagline}`, MARGIN, FOOTER_Y);
    doc.text(`Page ${page}`, PAGE_WIDTH - MARGIN, FOOTER_Y, { align: "right" });
  }

  function ensureSpace(needed: number) {
    if (y + needed <= FOOTER_Y - 8) return;
    drawFooter();
    doc.addPage();
    page += 1;
    drawPageChrome(false);
    y = 42;
  }

  function drawPageChrome(isCover: boolean) {
    // Soft paper background tint via top/bottom brand accents.
    setFill(COLORS.navy);
    doc.rect(0, 0, PAGE_WIDTH, isCover ? 36 : 28, "F");
    setFill(COLORS.teal);
    doc.rect(0, isCover ? 36 : 28, PAGE_WIDTH, 2.2, "F");
    setFill(COLORS.mint);
    doc.rect(0, isCover ? 38.2 : 30.2, PAGE_WIDTH, 1.2, "F");

    if (logoDataUrl) {
      // Portrait logo — keep compact in the header.
      try {
        doc.addImage(logoDataUrl, "PNG", MARGIN, isCover ? 6 : 4, 14, 16);
      } catch {
        // Ignore logo decode issues; text brand still renders.
      }
    }

    setText(COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(isCover ? 16 : 12);
    doc.text(BRAND.name, MARGIN + (logoDataUrl ? 18 : 0), isCover ? 14 : 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(COLORS.mint);
    doc.text(isCover ? "AI Presence Audit Report" : "AI Presence Audit", MARGIN + (logoDataUrl ? 18 : 0), isCover ? 21 : 18);
    setText(COLORS.white);
    doc.setFontSize(8);
    doc.text(generatedLabel, PAGE_WIDTH - MARGIN, isCover ? 14 : 12, { align: "right" });
  }

  function sectionTitle(title: string) {
    ensureSpace(14);
    setText(COLORS.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, MARGIN, y);
    y += 2;
    setDraw(COLORS.teal);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y, MARGIN + 28, y);
    y += 7;
  }

  function bodyText(text: string, options?: { size?: number; color?: RGB; indent?: number }) {
    const size = options?.size ?? 10;
    const color = options?.color ?? COLORS.ink;
    const indent = options?.indent ?? 0;
    const lines = wrapText(doc, text, CONTENT_WIDTH - indent, size);
    const lineHeight = size * 0.42;
    ensureSpace(lines.length * lineHeight + 2);
    setText(color);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.text(lines, MARGIN + indent, y);
    y += lines.length * lineHeight + 3;
  }

  function bullet(text: string, bulletChar = "•") {
    const lines = wrapText(doc, text, CONTENT_WIDTH - 6, 9.5);
    const lineHeight = 4.1;
    ensureSpace(lines.length * lineHeight + 2);
    setText(COLORS.teal);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(bulletChar, MARGIN, y);
    setText(COLORS.ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(lines, MARGIN + 5, y);
    y += lines.length * lineHeight + 2;
  }

  // --- Cover / header block ---
  drawPageChrome(true);
  y = 52;

  setText(COLORS.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(input.businessName, MARGIN, y);
  y += 8;

  setText(COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${input.city}, ${input.country}`, MARGIN, y);
  y += 6;
  if (input.websiteUrl) {
    doc.setFontSize(9);
    setText(COLORS.soft);
    doc.text(input.websiteUrl, MARGIN, y);
    y += 8;
  } else {
    y += 4;
  }

  // Score card
  ensureSpace(38);
  setFill(COLORS.paper);
  setDraw(COLORS.mint);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 34, 3, 3, "FD");

  const scoreColor = scoreRgb(result.visibilityScore);
  setFill(COLORS.navy);
  doc.roundedRect(MARGIN + 4, y + 4, 32, 26, 2, 2, "F");
  setText(COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(String(result.visibilityScore), MARGIN + 20, y + 18, { align: "center" });
  setText(scoreColor);
  doc.setFontSize(9);
  doc.text("/10", MARGIN + 20, y + 24, { align: "center" });

  setText(COLORS.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Visibility score", MARGIN + 42, y + 12);
  setText(COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const scoreCaption =
    result.visibilityScore >= 8
      ? "Strong local presence with room for polish."
      : result.visibilityScore >= 6
        ? "Solid foundation — focused fixes will lift enquiry volume."
        : "Significant visibility gaps — prioritize foundational fixes first.";
  const captionLines = wrapText(doc, scoreCaption, CONTENT_WIDTH - 48, 9);
  doc.text(captionLines, MARGIN + 42, y + 19);
  y += 42;

  sectionTitle("Executive summary");
  bodyText(result.summary, { size: 10.5 });

  // Issues
  sectionTitle("Top issues");
  for (const issue of result.issues) {
    const descLines = wrapText(doc, issue.description, CONTENT_WIDTH - 8, 9);
    const blockHeight = 12 + descLines.length * 4;
    ensureSpace(blockHeight + 3);

    setFill(COLORS.paper);
    setDraw(COLORS.mint);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, blockHeight, 2, 2, "FD");

    const sev = severityRgb(issue.severity);
    setFill(sev);
    doc.roundedRect(MARGIN + 3, y + 3, 18, 5.5, 1, 1, "F");
    setText(COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(issue.severity.toUpperCase(), MARGIN + 12, y + 6.7, { align: "center" });

    setText(COLORS.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(issue.title, MARGIN + 24, y + 6.8);

    setText(COLORS.ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(descLines, MARGIN + 4, y + 13);
    y += blockHeight + 3;
  }

  // Quick wins
  sectionTitle("Quick wins");
  for (const win of result.quickWins) {
    const impactLines = wrapText(doc, win.impact, CONTENT_WIDTH - 8, 9);
    const blockHeight = 12 + impactLines.length * 4;
    ensureSpace(blockHeight + 3);

    setFill(COLORS.white);
    setDraw(COLORS.teal);
    doc.setLineWidth(0.35);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, blockHeight, 2, 2, "FD");

    setText(COLORS.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(win.title, MARGIN + 4, y + 6.5);

    setFill(COLORS.mint);
    doc.roundedRect(PAGE_WIDTH - MARGIN - 28, y + 3, 24, 5.5, 1.5, 1.5, "F");
    setText(COLORS.navy);
    doc.setFontSize(7);
    doc.text(`${win.effort} effort`, PAGE_WIDTH - MARGIN - 16, y + 6.7, {
      align: "center",
    });

    setText(COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(impactLines, MARGIN + 4, y + 13);
    y += blockHeight + 3;
  }

  // 30-day plan
  sectionTitle("30-day action plan");
  for (const week of result.plan) {
    const actionBlocks = week.actions.map((action) =>
      wrapText(doc, action, CONTENT_WIDTH - 14, 9),
    );
    const actionsHeight = actionBlocks.reduce((sum, lines) => sum + lines.length * 4 + 1, 0);
    const blockHeight = 14 + actionsHeight;
    ensureSpace(blockHeight + 3);

    setFill(COLORS.paper);
    setDraw(COLORS.mint);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, blockHeight, 2, 2, "FD");

    setFill(COLORS.navy);
    doc.roundedRect(MARGIN + 3, y + 3, 16, 6, 1, 1, "F");
    setText(COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`W${week.week}`, MARGIN + 11, y + 7, { align: "center" });

    setText(COLORS.navy);
    doc.setFontSize(10);
    doc.text(week.focus, MARGIN + 22, y + 7);

    let ay = y + 13;
    for (const lines of actionBlocks) {
      setText(COLORS.teal);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("•", MARGIN + 5, ay);
      setText(COLORS.ink);
      doc.setFont("helvetica", "normal");
      doc.text(lines, MARGIN + 10, ay);
      ay += lines.length * 4 + 1;
    }
    y += blockHeight + 3;
  }

  // Competitors
  sectionTitle("AI-identified competitors");
  bodyText(
    "Suggested from the centre's city and country — review before sharing with a prospect.",
    { size: 8.5, color: COLORS.muted },
  );
  for (const insight of result.competitorInsights) {
    bullet(insight, "→");
  }

  // Recommended package
  sectionTitle("Recommended package");
  const rationaleLines = wrapText(doc, result.packageRationale, CONTENT_WIDTH - 10, 9.5);
  const packageHeight = 18 + rationaleLines.length * 4.2;
  ensureSpace(packageHeight + 4);

  setFill(COLORS.navy);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, packageHeight, 3, 3, "F");
  setFill(COLORS.teal);
  doc.rect(MARGIN, y, 2.5, packageHeight, "F");

  setText(COLORS.mint);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("RECOMMENDED ENGAGEMENT", MARGIN + 8, y + 7);

  setText(COLORS.white);
  doc.setFontSize(13);
  doc.text(PACKAGE_LABELS[result.recommendedPackage], MARGIN + 8, y + 14);

  setText(COLORS.mint);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(rationaleLines, MARGIN + 8, y + 21);
  y += packageHeight + 10;

  // Closing note
  ensureSpace(20);
  setText(COLORS.muted);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  const closing = wrapText(
    doc,
    `Prepared by ${BRAND.name}. AI-assisted analysis for sales conversations and onboarding — validate claims against approved client information before publishing.`,
    CONTENT_WIDTH,
    8.5,
  );
  doc.text(closing, MARGIN, y);

  drawFooter();

  const filename = `market-studio-audit-${slugifyFilename(input.businessName) || "report"}.pdf`;
  doc.save(filename);
}
