-- =====================================================================
-- Memory Vault — Phase 4: memories (image + caption) + Storage
-- Paste this whole file into Supabase → SQL Editor → Run AFTER 03_functions.sql.
-- Safe to re-run.
-- =====================================================================

-- ---------- Helper functions (SECURITY DEFINER, avoid RLS recursion) ----------

-- Admin OR moderator of the group.
create or replace function is_group_moderator(g uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where group_id = g
      and user_id = auth.uid()
      and role in ('admin', 'moderator')
  );
$$;

-- A member who is allowed to upload (everyone except viewers).
create or replace function can_upload_to_group(g uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where group_id = g
      and user_id = auth.uid()
      and role <> 'viewer'
  );
$$;

-- ---------- memories table ----------
create table if not exists memories (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups (id) on delete cascade,
  album_id     uuid,  -- Phase 5 (albums); nullable, no FK yet
  uploader_id  uuid not null references profiles (id) on delete cascade,
  image_path   text not null,           -- object path inside the 'memories' bucket
  caption      text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists memories_group_idx on memories (group_id, created_at desc);

-- ---------- memories RLS ----------
alter table memories enable row level security;

drop policy if exists "members read memories" on memories;
create policy "members read memories"
  on memories for select
  to authenticated
  using (is_group_member(group_id));

drop policy if exists "uploaders insert memories" on memories;
create policy "uploaders insert memories"
  on memories for insert
  to authenticated
  with check (uploader_id = auth.uid() and can_upload_to_group(group_id));

drop policy if exists "delete own or moderate memories" on memories;
create policy "delete own or moderate memories"
  on memories for delete
  to authenticated
  using (uploader_id = auth.uid() or is_group_moderator(group_id));

-- =====================================================================
-- Storage: private 'memories' bucket. Object path convention:
--   {group_id}/{uuid}.{ext}
-- so the first folder segment identifies the owning group.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('memories', 'memories', false)
on conflict (id) do nothing;

-- Read an image if you're a member of the group it belongs to.
drop policy if exists "read memory objects" on storage.objects;
create policy "read memory objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'memories'
    and is_group_member(((storage.foldername(name))[1])::uuid)
  );

-- Upload an image if you're allowed to upload to that group.
drop policy if exists "upload memory objects" on storage.objects;
create policy "upload memory objects"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'memories'
    and can_upload_to_group(((storage.foldername(name))[1])::uuid)
  );

-- Delete an image if you own it or you moderate the group.
drop policy if exists "delete memory objects" on storage.objects;
create policy "delete memory objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'memories'
    and (
      owner = auth.uid()
      or is_group_moderator(((storage.foldername(name))[1])::uuid)
    )
  );
