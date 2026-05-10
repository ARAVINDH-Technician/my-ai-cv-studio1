import { RESUME_THEME_COLORS, TEMPLATE_IDS, type SavedResume, type TemplateId } from "./types";

export type AdminResume = SavedResume & {
  userId: string;
  userEmail: string;
};

const ADMIN_RESUMES_KEY = "inkwell_admin_resumes";
const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL ?? "/api";
const DJANGO_API_BASE = DJANGO_API_URL.replace(/\/+$/, '');

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

const hasLocalStorage = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const readAdminResumes = (): AdminResume[] => {
  if (!hasLocalStorage) return [];

  try {
    const rows = JSON.parse(localStorage.getItem(ADMIN_RESUMES_KEY) ?? "[]") as StoredAdminResume[];
    return rows.map(normalizeResume).sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch {
    return [];
  }
};

export const upsertAdminResume = (resume: AdminResume) => {
  if (!hasLocalStorage) return;

  const existing = readAdminResumes();
  const next = [resume, ...existing.filter((item) => item.id !== resume.id)];
  localStorage.setItem(ADMIN_RESUMES_KEY, JSON.stringify(next));
};

export const deleteAdminResume = (id: string) => {
  if (!hasLocalStorage) return;

  const next = readAdminResumes().filter((item) => item.id !== id);
  localStorage.setItem(ADMIN_RESUMES_KEY, JSON.stringify(next));
};

export const fetchAdminResumes = async (): Promise<AdminResume[]> => {
  const response = await fetch(`${DJANGO_API_BASE}/admin-resumes/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to load admin resumes from Django backend");
  }
  const data = (await response.json()) as Array<Record<string, unknown>>;
  return data
    .map((resume) =>
      normalizeResume({
        ...resume,
        userId: typeof resume.userId === "string" ? resume.userId : String(resume.userId ?? ""),
        userEmail: typeof resume.userEmail === "string" ? resume.userEmail : String(resume.userEmail ?? ""),
        created_at: typeof resume.created_at === "string" ? resume.created_at : "",
        template: typeof resume.template === "string" ? resume.template : "template1",
        themeColor: typeof resume.themeColor === "string" ? resume.themeColor : undefined,
      } as StoredAdminResume)
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const deleteAdminResumeRemote = async (id: string) => {
  const response = await fetch(`${DJANGO_API_BASE}/admin-resumes/${encodeURIComponent(id)}/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to delete admin resume on Django backend");
  }
};
