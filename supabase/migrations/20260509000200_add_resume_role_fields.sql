alter table public.resumes
  add column if not exists user_role text default 'college_student',
  add column if not exists school_name text,
  add column if not exists class_grade text,
  add column if not exists college_name text,
  add column if not exists degree text,
  add column if not exists department text,
  add column if not exists cgpa text,
  add column if not exists job_title text,
  add column if not exists company_name text,
  add column if not exists work_experience text,
  add column if not exists career_objective text,
  add column if not exists professional_summary text;
