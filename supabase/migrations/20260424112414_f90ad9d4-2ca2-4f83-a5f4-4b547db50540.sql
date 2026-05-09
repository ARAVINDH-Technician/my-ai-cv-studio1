create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  skills text not null default '',
  experience text not null default '',
  education text not null default '',
  summary text not null default '',
  template text not null default 'template1',
  created_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

create policy "Anyone can view resumes"
on public.resumes for select
using (true);

create policy "Anyone can create resumes"
on public.resumes for insert
with check (true);

create index resumes_created_at_idx on public.resumes (created_at desc);