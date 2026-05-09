create policy "Anyone can update resumes"
on public.resumes for update
using (true)
with check (true);

create policy "Anyone can delete resumes"
on public.resumes for delete
using (true);