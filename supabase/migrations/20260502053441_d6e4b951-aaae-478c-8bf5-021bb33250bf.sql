ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS projects text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS internships text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS achievements text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS certifications text NOT NULL DEFAULT '';

ALTER TABLE public.resumes DROP COLUMN IF EXISTS experience;