export type TemplateId =
  | "template1"
  | "template2"
  | "template3"
  | "template4"
  | "template5"
  | "template6"
  | "template7"
  | "template8";

export const TEMPLATE_IDS: TemplateId[] = [
  "template1",
  "template2",
  "template3",
  "template4",
  "template5",
  "template6",
  "template7",
  "template8",
];

export const RESUME_THEME_COLORS = [
  "#9e7e6b",
  "#6f7568",
  "#7b6f99",
  "#2f6f73",
  "#8a5f55",
  "#3f6f91",
] as const;

export type ResumeThemeColor = (typeof RESUME_THEME_COLORS)[number];

export type UserRole = "school_student" | "college_student" | "working_professional";

export interface ResumeData {
  userRole: UserRole;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  schoolName: string;
  classGrade: string;
  collegeName: string;
  degree: string;
  department: string;
  cgpa: string;
  jobTitle: string;
  companyName: string;
  workExperience: string;
  careerObjective: string;
  professionalSummary: string;
  skills: string;
  projects: string;
  internships: string;
  achievements: string;
  certifications: string;
  education: string;
  summary: string;
  template: TemplateId;
  themeColor: string;
}

export interface SavedResume extends ResumeData {
  id: string;
  created_at: string;
}

export const emptyResume: ResumeData = {
  userRole: "college_student",
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  schoolName: "",
  classGrade: "",
  collegeName: "",
  degree: "",
  department: "",
  cgpa: "",
  jobTitle: "",
  companyName: "",
  workExperience: "",
  careerObjective: "",
  professionalSummary: "",
  skills: "",
  projects: "",
  internships: "",
  achievements: "",
  certifications: "",
  education: "",
  summary: "",
  template: "template1",
  themeColor: RESUME_THEME_COLORS[0],
};
