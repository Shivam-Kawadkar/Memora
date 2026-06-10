-- =====================================================================
-- Memory Vault — Phase 8: landing-page feedback
-- Paste into Supabase → SQL Editor → Run AFTER 07_social.sql.
-- Safe to re-run.
-- =====================================================================

create table if not exists feedback (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  rating     smallint check (rating between 1 and 5),
  message    text not null check (char_length(message) between 1 and 2000),
  user_id    uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

-- Anyone (even logged-out visitors) may leave feedback from the landing page.
drop policy if exists "anyone can submit feedback" on feedback;
create policy "anyone can submit feedback"
  on feedback for insert
  to anon, authenticated
  with check (char_length(message) between 1 and 2000);

-- No public read: submissions are reviewed in the Supabase dashboard.
-- (Add a read policy later if you build an in-app admin view.)
