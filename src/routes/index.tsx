import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Download, FileText, Loader2, LogOut, Palette, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { TemplateSelector } from "@/components/resume/TemplateSelector";
import { ColorPicker } from "@/components/resume/ColorPicker";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { AiBuilder } from "@/components/resume/AiBuilder";
import { emptyResume, type ResumeData } from "@/components/resume/types";
import { roleLabels, roleTemplates, USER_ROLE_OPTIONS } from "@/components/resume/roleConfig";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Document, ImageRun, Packer, Paragraph } from "docx";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const adminPanelPath = "/admin";
  const navigate = useNavigate();
  const { user, loading, signOut, userRole } = useAuth();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [detailStep, setDetailStep] = useState<0 | 1 | 2>(0);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user) {
      setData((prev) => ({
        ...prev,
        userRole,
        template: prev.template === emptyResume.template ? roleTemplates[userRole] : prev.template,
      }));
    }
  }, [user, loading, userRole]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleNew = () => {
    setData({ ...emptyResume, userRole, template: roleTemplates[userRole] });
    setCurrentId(null);
    setStep(2);
    setDetailStep(0);
  };

  const handleSaved = (id: string) => {
    setCurrentId(id);
  };

  const handleAiBuilt = (fields: Omit<ResumeData, "template" | "themeColor">) => {
    setData((prev) => ({ ...prev, ...fields, userRole: prev.userRole, template: prev.template, themeColor: prev.themeColor }));
    setCurrentId(null);
  };

  const goToDetails = () => {
    setStep(3);
    setDetailStep(0);
    scrollTop();
  };

  const goToTemplates = () => {
    setStep(2);
    scrollTop();
  };

  const goToStep = (nextStep: 2 | 3 | 4) => {
    setStep(nextStep);
    scrollTop();
  };

  const goToDetailStep = (nextDetailStep: 0 | 1 | 2) => {
    setDetailStep(nextDetailStep);
    scrollTop();
  };

  const capturePreview = async () => {
    if (!previewRef.current) throw new Error("Preview not available");
    const container = previewRef.current;
    const previousBackground = container.style.backgroundColor;
    container.style.backgroundColor = "#ffffff";
    const canvas = await html2canvas(container, { backgroundColor: "#ffffff", scale: 3, useCORS: true });
    container.style.backgroundColor = previousBackground;
    return canvas;
  };

  const buildPdf = async (): Promise<Uint8Array> => {
    const canvas = await capturePreview();
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const maxW = pageW - 56 * 2;
    const maxH = pageH - 56 * 2;
    const aspect = canvas.width / canvas.height;
    const width = Math.min(maxW, maxH * aspect);
    const height = width / aspect;
    const x = (pageW - width) / 2;
    doc.addImage(imgData, "PNG", x, 56, width, height);
    return new Uint8Array(doc.output("arraybuffer"));
  };

  const buildDocx = async (): Promise<Blob> => {
    const canvas = await capturePreview();
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Failed to capture document image"));
      }, "image/png")
    );
    const arrayBuffer = await blob.arrayBuffer();
    const image = new ImageRun({
      type: "png",
      data: new Uint8Array(arrayBuffer),
      transformation: {
        width: Math.min(540, canvas.width),
        height: Math.round((Math.min(540, canvas.width) * canvas.height) / canvas.width),
      },
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 12240, height: 15840 },
              margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
            },
          },
          children: [new Paragraph({ children: [image] })],
        },
      ],
    });

    if (typeof Packer.toBlob === "function") return await Packer.toBlob(doc);
    const buffer = await Packer.toBuffer(doc);
    return new Blob([new Uint8Array(buffer).buffer as ArrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (kind: "pdf" | "docx") => {
    setExporting(kind);
    try {
      const filename = `${(data.name || "resume").replace(/[^a-z0-9_-]+/gi, "_").slice(0, 60) || "resume"}.${kind}`;
      if (kind === "pdf") {
        const bytes = await buildPdf();
        const pdfBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        downloadBlob(new Blob([pdfBuffer], { type: "application/pdf" }), filename);
      } else {
        downloadBlob(await buildDocx(), filename);
      }
      toast.success(`${filename} downloaded successfully`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const flowItems = [
    { label: "Login / Signup", done: true },
    { label: "Choose Resume Template", done: step > 2, active: step === 2 },
    { label: "Fill Resume Details", done: step > 3, active: step === 3 },
    { label: "Download PDF / Word", active: step === 4 },
  ];

  const detailPages = [
    {
      title: "Your details.",
      description: "Add your contact details and the role-specific basics for your resume.",
      section: "contact" as const,
    },
    {
      title: "Skills, projects, internships.",
      description: `Add ${roleLabels[data.userRole].experience.toLowerCase()}, skills, projects, and achievements.`,
      section: "experience" as const,
    },
    {
      title: "Education, certifications, summary.",
      description: `Finish your resume with ${roleLabels[data.userRole].summary.toLowerCase()} and AI suggestions.`,
      section: "final" as const,
    },
  ];

  const hiddenExportPreview = (
    <div aria-hidden="true" className="fixed -left-[10000px] top-0 w-[860px] bg-white">
      <div ref={previewRef} className="bg-white p-0">
        <ResumePreview data={data} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-display font-bold tracking-tight">Inkwell</h1>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
              AI Resume Builder
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to={adminPanelPath}>
                <ShieldCheck className="h-4 w-4 mr-1.5" /> Admin Panel
              </Link>
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[300px_minmax(0,1fr)] gap-10">
        <aside className="bg-card text-foreground border border-border rounded-2xl p-8 lg:sticky lg:top-6 self-start shadow-sm">
          <div className="font-display text-4xl font-bold mb-10 tracking-tight">Inkwell</div>
          <ol className="space-y-7">
            {flowItems.map((item, index) => (
              <li key={item.label} className="flex gap-4">
                <span
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base font-bold ${
                    item.done
                      ? "border-accent bg-accent text-accent-foreground"
                      : item.active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground"
                  }`}
                >
                  {item.done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className="pt-2 text-lg font-bold leading-snug text-foreground">
                  {item.label}
                </span>
              </li>
            ))}
          </ol>
        </aside>

        {step === 2 ? (
          <div className="max-w-5xl">
            <div className="space-y-6">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center text-sm font-semibold text-accent hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </button>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-3">Step 2</p>
                <h2 className="font-display text-4xl sm:text-5xl font-medium leading-[1.05] text-ink">
                  Choose your resume template.
                </h2>
                <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                  Pick a layout and accent color first. Your next page keeps this style for the final one-page resume.
                </p>
                <p className="mt-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {USER_ROLE_OPTIONS.find((option) => option.value === data.userRole)?.label}
                </p>
              </div>

              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <Palette className="h-5 w-5 text-accent" />
                  <h3 className="font-display text-xl font-bold">Template color</h3>
                </div>
                <TemplateSelector
                  value={data.template}
                  onChange={(t) => setData({ ...data, template: t })}
                  accentColor={data.themeColor}
                />
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Accent</span>
                  <ColorPicker value={data.themeColor} onChange={(themeColor) => setData({ ...data, themeColor })} />
                </div>
              </section>

              <div className="flex justify-end">
                <Button type="button" onClick={goToDetails} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : step === 3 ? (
          <div className="max-w-5xl">
            <div className="space-y-8">
              <button
                type="button"
                onClick={goToTemplates}
                className="inline-flex items-center text-sm font-semibold text-accent hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </button>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-3">Step 3</p>
                <h2 className="font-display text-4xl sm:text-5xl font-medium leading-[1.05] text-ink">
                  {detailPages[detailStep].title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                  {detailPages[detailStep].description}
                </p>
              </div>

              {detailStep === 0 && (
                <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="font-display text-xl font-bold">Build with AI</h3>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent">New</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Describe your background and AI will fill every field for you.
                  </p>
                  <AiBuilder userRole={data.userRole} onBuilt={handleAiBuilt} />
                </section>
              )}

              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <UserRound className="h-5 w-5 text-accent" />
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      Details {detailStep + 1} of 3
                    </h3>
                    <p className="text-xs text-muted-foreground">Your resume content is prepared for a one-page export.</p>
                  </div>
                </div>
                <ResumeForm
                  data={data}
                  onChange={setData}
                  onSaved={handleSaved}
                  currentId={currentId}
                  onNew={handleNew}
                  section={detailPages[detailStep].section}
                />
              </section>

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={detailStep === 0 ? goToTemplates : () => goToDetailStep((detailStep - 1) as 0 | 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={detailStep === 2 ? () => goToStep(4) : () => goToDetailStep((detailStep + 1) as 1 | 2)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="inline-flex items-center text-sm font-semibold text-accent hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </button>
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-3">Step 4</p>
              <h2 className="font-display text-4xl sm:text-5xl font-medium leading-[1.05] text-ink">
                Download PDF / Word.
              </h2>
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                Download your final one-page resume as a PDF or Word document.
              </p>
            </div>
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl">
              <div className="mb-5">
                <h3 className="font-display text-xl font-bold">Preview</h3>
                <p className="text-xs text-muted-foreground">Review your resume before downloading PDF or Word.</p>
              </div>
              <div className="mb-6 max-w-[860px] bg-white">
                <ResumePreview data={data} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  disabled={exporting !== null}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {exporting === "pdf" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleExport("docx")}
                  disabled={exporting !== null}
                >
                  {exporting === "docx" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                  Download Word
                </Button>
              </div>
            </section>
            {hiddenExportPreview}
            <div className="flex items-center justify-between gap-3 max-w-4xl">
              <Button type="button" variant="outline" onClick={() => goToStep(3)}>
                Previous
              </Button>
              <Button type="button" variant="outline" onClick={handleNew}>
                New resume
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs font-mono uppercase tracking-widest text-muted-foreground flex justify-between">
          <span>(c) Inkwell</span>
          <span>Set in Fraunces &amp; Inter</span>
        </div>
      </footer>
    </div>
  );
}
