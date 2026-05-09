import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { jsPDF } from "jspdf";

const ResumeSchema = z.object({
  resumeId: z.string().uuid(),
});

interface ResumeRow {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  skills: string;
  projects: string;
  internships: string;
  achievements: string;
  certifications: string;
  education: string;
}

const RESUME_FIELDS: (keyof ResumeRow)[] = [
  "name",
  "email",
  "phone",
  "location",
  "linkedin",
  "github",
  "portfolio",
  "summary",
  "skills",
  "projects",
  "internships",
  "achievements",
  "certifications",
  "education",
];

function contactLine(r: ResumeRow): string {
  return [r.email, r.phone, r.location, r.linkedin, r.github, r.portfolio]
    .filter(Boolean)
    .join("  ·  ");
}

const SECTIONS: { key: keyof ResumeRow; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "internships", label: "Internships" },
  { key: "education", label: "Education" },
  { key: "certifications", label: "Certifications" },
  { key: "achievements", label: "Achievements" },
];

// ---------- PDF ----------
function buildPdf(r: ResumeRow): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 56;
  const maxW = pageW - marginX * 2;
  let y = 64;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - 56) {
      doc.addPage();
      y = 64;
    }
  };

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(r.name || "Your Name", marginX, y);
  y += 22;

  // Contact line
  const contact = contactLine(r);
  if (contact) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);
    const lines = doc.splitTextToSize(contact, maxW);
    doc.text(lines, marginX, y);
    y += lines.length * 13 + 4;
    doc.setTextColor(0);
  }

  // rule
  doc.setDrawColor(180);
  doc.line(marginX, y, pageW - marginX, y);
  y += 18;

  for (const s of SECTIONS) {
    const body = (r[s.key] || "").trim();
    if (!body) continue;
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(s.label.toUpperCase(), marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(body, maxW);
    for (const line of lines) {
      ensureSpace(14);
      doc.text(line, marginX, y);
      y += 14;
    }
    y += 10;
  }

  return new Uint8Array(doc.output("arraybuffer"));
}

// ---------- DOCX ----------
function bodyParagraphs(text: string): Paragraph[] {
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .map(
      (line) =>
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: line, size: 22 })],
        })
    );
}

function buildDocx(r: ResumeRow): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: r.name || "Your Name", bold: true, size: 40 })],
    })
  );
  const contact = contactLine(r);
  if (contact) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: contact, size: 20, color: "555555" })],
      })
    );
  }
  // divider
  children.push(
    new Paragraph({
      border: {
        bottom: { color: "888888", style: BorderStyle.SINGLE, size: 6, space: 1 },
      },
      spacing: { after: 200 },
    })
  );

  for (const s of SECTIONS) {
    const body = (r[s.key] || "").trim();
    if (!body) continue;
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: s.label.toUpperCase(), bold: true, size: 24 })],
      })
    );
    children.push(...bodyParagraphs(body));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

async function loadResume(resumeId: string, supabase: SupabaseClient, userId: string): Promise<ResumeRow> {
  const { data, error } = await supabase
    .from("resumes")
    .select(
      "name,email,phone,location,linkedin,github,portfolio,summary,skills,projects,internships,achievements,certifications,education"
    )
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();
  if (error || !data) throw new Error("Resume not found");
  const row = data as Partial<Record<keyof ResumeRow, string | null>>;
  const out = {} as ResumeRow;
  for (const k of RESUME_FIELDS) {
    out[k] = row[k] ?? "";
  }
  return out;
}

function safeName(name: string, ext: string): string {
  const base = (name || "resume").replace(/[^a-z0-9_-]+/gi, "_").slice(0, 60) || "resume";
  return `${base}.${ext}`;
}

export const exportResumePdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => ResumeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const r = await loadResume(data.resumeId, context.supabase, context.userId);
    const bytes = buildPdf(r);
    return {
      filename: safeName(r.name, "pdf"),
      base64: Buffer.from(bytes).toString("base64"),
      mime: "application/pdf",
    };
  });

export const exportResumeDocx = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => ResumeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const r = await loadResume(data.resumeId, context.supabase, context.userId);
    const buf = await buildDocx(r);
    return {
      filename: safeName(r.name, "docx"),
      base64: buf.toString("base64"),
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  });
