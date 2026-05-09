import { RESUME_THEME_COLORS, TEMPLATE_IDS, type SavedResume, type TemplateId } from "./types";

export type AdminResume = SavedResume & {
  userId: string;
  userEmail: string;
};

const ADMIN_RESUMES_KEY = "inkwell_admin_resumes";

type StoredAdminResume = Omit<AdminResume, "themeColor" | "template"> & {
  template: string;
  themeColor?: string;
  theme_color?: string;
};

const normalizeResume = (resume: StoredAdminResume): AdminResume => ({
  ...resume,
  template: (TEMPLATE_IDS.includes(resume.template as TemplateId) ? resume.template : "template1") as TemplateId,
  themeColor: resume.themeColor ?? resume.theme_color ?? RESUME_THEME_COLORS[0],
});

export const readAdminResumes = (): AdminResume[] => {
  try {
    const rows = JSON.parse(localStorage.getItem(ADMIN_RESUMES_KEY) ?? "[]") as StoredAdminResume[];
    return rows.map(normalizeResume).sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch {
    return [];
  }
};

export const upsertAdminResume = (resume: AdminResume) => {
  const existing = readAdminResumes();
  const next = [resume, ...existing.filter((item) => item.id !== resume.id)];
  localStorage.setItem(ADMIN_RESUMES_KEY, JSON.stringify(next));
};

export const deleteAdminResume = (id: string) => {
  const next = readAdminResumes().filter((item) => item.id !== id);
  localStorage.setItem(ADMIN_RESUMES_KEY, JSON.stringify(next));
};
