-- Delete pre-existing unowned resumes (created before auth)
DELETE FROM public.resumes;

-- Add user_id column
ALTER TABLE public.resumes
  ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can create resumes" ON public.resumes;
DROP POLICY IF EXISTS "Anyone can delete resumes" ON public.resumes;
DROP POLICY IF EXISTS "Anyone can update resumes" ON public.resumes;
DROP POLICY IF EXISTS "Anyone can view resumes" ON public.resumes;

-- Per-user RLS
CREATE POLICY "Users can view their own resumes"
  ON public.resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes"
  ON public.resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.resumes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-set user_id on insert so the client doesn't have to
CREATE OR REPLACE FUNCTION public.set_resume_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_resume_user_id_trigger
  BEFORE INSERT ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_resume_user_id();