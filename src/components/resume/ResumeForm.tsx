import { useState } from "react";
import { Loader2, Save, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { upsertAdminResume } from "./adminStore";
import { roleAiHints, roleLabels } from "./roleConfig";
import type { ResumeData } from "./types";

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onSaved: (id: string) => void;
  currentId: string | null;
  onNew: () => void;
  section?: "contact" | "experience" | "final";
}

const localResumeKey = (userId: string) => `inkwell_resumes_${userId}`;

const readLocalResumes = (userId: string) => {
  try {
    return JSON.parse(localStorage.getItem(localResumeKey(userId)) ?? "[]") as Array<Record<string, string>>;
  } catch {
    return [];
  }
};

const writeLocalResumes = (userId: string, resumes: Array<Record<string, string>>) => {
  localStorage.setItem(localResumeKey(userId), JSON.stringify(resumes));
};

const makeResumeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `resume-${Date.now().toString(36)}-${randomPart}`;
};

const syncResumeToDjangoAdmin = async (
  resume: ResumeData & { id: string; created_at: string; userId: string; userEmail: string }
) => {
  const baseUrl = import.meta.env.VITE_DJANGO_API_URL ?? "http://127.0.0.1:8000/api";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/sync-resume/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resume),
  });
  if (!response.ok) {
    throw new Error("Django admin sync failed");
  }
};

const buildAdminResume = (
  data: ResumeData,
  id: string,
  createdAt: string,
  user: NonNullable<ReturnType<typeof useAuth>["user"]>
) => ({
  ...data,
  id,
  created_at: createdAt,
  userId: user.id,
  userEmail: user.email ?? "signed-in user",
});

export function ResumeForm({ data, onChange, onSaved, currentId, onNew, section = "contact" }: Props) {
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const { user, isLocalUser } = useAuth();

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    onChange({ ...data, [key]: value });
  const labels = roleLabels[data.userRole];

  const field = (
    key: keyof ResumeData,
    label: string,
    placeholder: string,
    type = "text",
    className = "space-y-2"
  ) => (
    <div className={className}>
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={data[key] as string}
        onChange={(e) => update(key, e.target.value as never)}
        placeholder={placeholder}
      />
    </div>
  );

  const textArea = (key: keyof ResumeData, label: string, placeholder: string, rows = 3) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Textarea
        id={key}
        rows={rows}
        value={data[key] as string}
        onChange={(e) => update(key, e.target.value as never)}
        placeholder={placeholder}
      />
    </div>
  );

  const handleGenerate = async () => {
    if (!data.skills.trim() && !data.projects.trim() && !data.internships.trim()) {
      toast.error("Add some skills, projects or internships first");
      return;
    }
    setGenerating(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("generate-summary", {
        body: {
          userRole: data.userRole,
          suggestions: roleAiHints[data.userRole],
          name: data.name,
          skills: data.skills,
          projects: data.projects,
          internships: data.internships,
          workExperience: data.workExperience,
          achievements: data.achievements,
          certifications: data.certifications,
          education: data.education,
          schoolName: data.schoolName,
          collegeName: data.collegeName,
          jobTitle: data.jobTitle,
        },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      if (res?.summary) {
        update("summary", res.summary);
        toast.success("Summary drafted");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const handleRewrite = async () => {
    const hasContent = ["projects", "internships", "achievements", "certifications", "education", "skills"].some(
      (k) => (data[k as keyof ResumeData] as string).trim().length > 0
    );
    if (!hasContent) {
      toast.error("Add some details first");
      return;
    }
    setRewriting(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("build-resume", {
        body: { mode: "rewrite", resume: data },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      if (!res?.resume) throw new Error("No resume returned");
      onChange({ ...data, ...res.resume });
      toast.success("Corrected by AI");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI correction failed");
    } finally {
      setRewriting(false);
    }
  };

  const handleSave = async () => {
    if (!data.name.trim() || !data.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setSaving(true);
    try {
      const id = currentId ?? makeResumeId();
      const createdAt = new Date().toISOString();
      const adminResume = buildAdminResume(data, id, createdAt, user);
      await syncResumeToDjangoAdmin(adminResume);
      upsertAdminResume(adminResume);

      if (isLocalUser) {
        const existing = readLocalResumes(user.id);
        const row = {
          id,
          created_at: createdAt,
          user_id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedin: data.linkedin,
          github: data.github,
          portfolio: data.portfolio,
          userRole: data.userRole,
          schoolName: data.schoolName,
          classGrade: data.classGrade,
          collegeName: data.collegeName,
          degree: data.degree,
          department: data.department,
          cgpa: data.cgpa,
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          workExperience: data.workExperience,
          careerObjective: data.careerObjective,
          professionalSummary: data.professionalSummary,
          skills: data.skills,
          projects: data.projects,
          internships: data.internships,
          achievements: data.achievements,
          certifications: data.certifications,
          education: data.education,
          summary: data.summary,
          template: data.template,
          theme_color: data.themeColor,
        };
        const next = currentId ? existing.map((resume) => (resume.id === currentId ? row : resume)) : [row, ...existing];
        writeLocalResumes(user.id, next);
        toast.success(currentId ? "Resume updated" : "Resume saved");
        onSaved(id);
        return;
      }

      const payload = {
        id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        linkedin: data.linkedin,
        github: data.github,
        portfolio: data.portfolio,
        user_role: data.userRole,
        school_name: data.schoolName,
        class_grade: data.classGrade,
        college_name: data.collegeName,
        degree: data.degree,
        department: data.department,
        cgpa: data.cgpa,
        job_title: data.jobTitle,
        company_name: data.companyName,
        work_experience: data.workExperience,
        career_objective: data.careerObjective,
        professional_summary: data.professionalSummary,
        skills: data.skills,
        projects: data.projects,
        internships: data.internships,
        achievements: data.achievements,
        certifications: data.certifications,
        education: data.education,
        summary: data.summary,
        template: data.template,
        theme_color: data.themeColor,
        user_id: user.id,
      };
      try {
        if (currentId) {
          const { error } = await supabase
            .from("resumes")
            .update(payload)
            .eq("id", currentId)
            .eq("user_id", user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("resumes").insert(payload);
          if (error) throw error;
        }
      } catch (supabaseError) {
        console.warn("Supabase save skipped after Django admin sync", supabaseError);
      }
      toast.success(currentId ? "Resume updated" : "Resume saved");
      onSaved(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (section === "contact") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("name", "Full name", "Ada Lovelace")}
        {field("email", "Email", "ada@analytical.engine", "email")}
        {field("phone", "Phone", "+1 555 123 4567")}
        {field("location", "Location", "London, UK")}
        {data.userRole === "school_student" && field("schoolName", "School Name", "Green Valley School")}
        {data.userRole === "school_student" && field("classGrade", "Class / Grade", "Class 10")}
        {data.userRole === "college_student" && field("collegeName", "College Name", "SRM University")}
        {data.userRole === "college_student" && field("degree", "Degree", "B.Tech")}
        {data.userRole === "college_student" && field("department", "Department", "Computer Science")}
        {data.userRole === "college_student" && field("cgpa", "CGPA", "8.7")}
        {data.userRole === "working_professional" && field("jobTitle", "Job Title", "Product Designer")}
        {data.userRole === "working_professional" && field("companyName", "Company Name", "Figma")}
        {data.userRole !== "school_student" && field("linkedin", "LinkedIn", "linkedin.com/in/ada")}
        {data.userRole === "college_student" && field("github", "GitHub", "github.com/ada")}
        {data.userRole === "working_professional" && field("portfolio", "Portfolio URL", "ada.dev", "text", "space-y-2 sm:col-span-2")}
      </div>
    );
  }

  if (section === "experience") {
    return (
      <div className="space-y-5">
        {textArea(
          "skills",
          "Skills",
          data.userRole === "school_student"
            ? "Public speaking, HTML basics, teamwork, problem solving..."
            : data.userRole === "college_student"
              ? "React, Python, SQL, Git, REST APIs..."
              : "Strategy, stakeholder management, React, analytics, mentoring...",
          2
        )}
        {data.userRole === "working_professional"
          ? textArea("workExperience", labels.experience, "Senior Designer, Figma - Led design system rollout and improved adoption by 35%.", 4)
          : data.userRole === "college_student"
            ? textArea("internships", labels.experience, "Frontend Intern, Stripe - Shipped checkout improvements and wrote reusable UI components.", 3)
            : null}
        {textArea(
          "projects",
          "Projects",
          data.userRole === "school_student"
            ? "Weather Monitor - Built a simple website to show temperature and rainfall trends."
            : "Inkwell - AI resume builder. Built with React, Supabase, and Lovable AI.",
          4
        )}
        {textArea(
          "achievements",
          "Achievements",
          data.userRole === "working_professional"
            ? "Led a team of 4 designers. Reduced onboarding time by 20%."
            : "Winner - National Hackathon 2024. Dean's list 2023.",
          3
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {data.userRole !== "school_student" &&
        textArea(
          "education",
          labels.education,
          data.userRole === "college_student"
            ? "B.Tech Computer Science, SRM University, expected 2027"
            : "MBA, Product Leadership, 2018",
          3
        )}

      {textArea("certifications", "Certifications", "AWS Certified Cloud Practitioner (2024). Google UX Design (2023).", 3)}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={data.userRole === "working_professional" ? "professionalSummary" : "careerObjective"}>
            {labels.summary}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="text-accent hover:text-accent hover:bg-accent/10"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-1.5">{generating ? "Drafting..." : "Draft with AI"}</span>
          </Button>
        </div>
        <Textarea
          id={data.userRole === "working_professional" ? "professionalSummary" : "careerObjective"}
          rows={4}
          value={data.userRole === "working_professional" ? data.professionalSummary : data.careerObjective}
          onChange={(e) =>
            data.userRole === "working_professional"
              ? update("professionalSummary", e.target.value)
              : update("careerObjective", e.target.value)
          }
          placeholder={
            data.userRole === "school_student"
              ? "A motivated student seeking opportunities to learn, build projects, and grow academic strengths."
              : data.userRole === "college_student"
                ? "A motivated fresher seeking an internship or entry-level role to apply technical skills."
                : "A concise professional summary focused on impact, leadership, and measurable outcomes."
          }
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleRewrite}
        disabled={rewriting}
        className="w-full border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
      >
        {rewriting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
        {rewriting ? "Correcting with AI..." : "Use AI to correct resume"}
      </Button>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {currentId ? "Update resume" : "Save resume"}
        </Button>
        {currentId && (
          <Button type="button" variant="outline" onClick={onNew}>
            New
          </Button>
        )}
      </div>
      {currentId && <p className="text-xs text-muted-foreground font-mono">Editing saved resume - changes will overwrite</p>}
    </div>
  );
}
