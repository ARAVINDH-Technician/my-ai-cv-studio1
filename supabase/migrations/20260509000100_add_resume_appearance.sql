alter table public.resumes
add column if not exists theme_color text not null default '#9e7e6b';

alter table public.resumes
drop constraint if exists resumes_template_check;

alter table public.resumes
add constraint resumes_template_check
check (template in (
  'template1',
  'template2',
  'template3',
  'template4',
  'template5',
  'template6',
  'template7',
  'template8'
));
