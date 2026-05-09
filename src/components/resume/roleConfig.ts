import type { ResumeData, TemplateId, UserRole } from "./types";

export const USER_ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  {
    value: "school_student",
    label: "School Student",
    description: "Academic profile, projects, certificates, and career objective.",
  },
  {
    value: "college_student",
    label: "College Student",
    description: "Internships, technical projects, CGPA, and fresher summary.",
  },
  {
    value: "working_professional",
    label: "Working Professional",
    description: "Experience, achievements, ATS-ready summary, and portfolio.",
  },
];

export const roleTemplates: Record<UserRole, TemplateId> = {
  school_student: "template3",
  college_student: "template8",
  working_professional: "template6",
};

export const roleLabels: Record<UserRole, { summary: string; experience: string; education: string }> = {
  school_student: {
    summary: "Career Objective",
    experience: "Projects",
    education: "School Details",
  },
  college_student: {
    summary: "Career Objective",
    experience: "Internships",
    education: "Education",
  },
  working_professional: {
    summary: "Professional Summary",
    experience: "Work Experience",
    education: "Current Role",
  },
};

export const roleAiHints: Record<UserRole, string[]> = {
  school_student: ["Student career objective", "Beginner skills", "Academic achievements"],
  college_student: ["Internship descriptions", "Fresher summary", "Technical skills", "Project descriptions"],
  working_professional: ["Professional summary", "Work experience enhancement", "ATS optimization", "Leadership achievements"],
};

export const rolePromptExamples: Record<UserRole, string> = {
  school_student:
    "I'm Aarav Sharma, a Class 10 student at Green Valley School. I enjoy coding, debate, and science projects. I built a weather dashboard and won a school innovation award.",
  college_student:
    "I'm Priya Nair, B.Tech CSE student at SRM University with 8.7 CGPA. Skilled in React, Python, SQL. Built a job portal and completed a frontend internship.",
  working_professional:
    "I'm Maya Chen, Product Designer at Figma with 5 years of experience. Skilled in design systems, prototyping, user research, and leading cross-functional product work.",
};

const compact = (lines: string[]) => lines.filter((line) => line.trim()).join("\n");

export const toPreviewData = (data: ResumeData): ResumeData => {
  if (data.userRole === "school_student") {
    return {
      ...data,
      summary: data.careerObjective || data.summary,
      education: compact([data.schoolName && `School: ${data.schoolName}`, data.classGrade && `Class / Grade: ${data.classGrade}`]),
      internships: "",
      linkedin: "",
      github: "",
      portfolio: "",
    };
  }

  if (data.userRole === "working_professional") {
    return {
      ...data,
      summary: data.professionalSummary || data.summary,
      education: compact([data.jobTitle && `Job Title: ${data.jobTitle}`, data.companyName && `Company: ${data.companyName}`]),
      internships: data.workExperience,
      projects: data.projects,
    };
  }

  return {
    ...data,
    summary: data.careerObjective || data.summary,
    education: compact([
      data.collegeName && `College: ${data.collegeName}`,
      data.degree && `Degree: ${data.degree}`,
      data.department && `Department: ${data.department}`,
      data.cgpa && `CGPA: ${data.cgpa}`,
      data.education,
    ]),
  };
};
