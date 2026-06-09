-- =====================================================================
-- Memory Vault — Phase 5: albums
-- Paste into Supabase → SQL Editor → Run AFTER 05_management.sql.
-- Safe to re-run.
-- =====================================================================

-- ---------- albums table ----------
create table if not exists albums (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups (id) on delete cascade,
  title       text not null,
  created_by  uuid not null references profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists albums_group_idx on albums (group_id, created_at desc);

-- ---------- link memories.album_id -> albums (set null on album delete) ----------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'memories_album_fk'
  ) then
    alter table memories
      add constraint memories_album_fk
      foreign key (album_id) references albums (id) on delete set null;
  end if;
end$$;

create index if not exists memories_album_idx on memories (album_id);

-- ---------- albums RLS ----------
alter table albums enable row level security;

drop policy if exists "members read albums" on albums;
create policy "members read albums"
  on albums for select
  to authenticated
  using (is_group_member(group_id));

drop policy if exists "uploaders create albums" on albums;
create policy "uploaders create albums"
  on albums for insert
  to authenticated
  with check (can_upload_to_group(group_id) and created_by = auth.uid());

drop policy if exists "creator or mod update albums" on albums;
create policy "creator or mod update albums"
  on albums for update
  to authenticated
  using (created_by = auth.uid() or is_group_moderator(group_id))
  with check (created_by = auth.uid() or is_group_moderator(group_id));

drop policy if exists "creator or mod delete albums" on albums;
create policy "creator or mod delete albums"
  on albums for delete
  to authenticated
  using (created_by = auth.uid() or is_group_moderator(group_id));

-- ---------- allow moving memories between albums ----------
-- (own memory or a moderator may edit; album validity checked server-side)
drop policy if exists "update own or moderate memories" on memories;
create policy "update own or moderate memories"
  on memories for update
  to authenticated
  using (uploader_id = auth.uid() or is_group_moderator(group_id))
  with check (uploader_id = auth.uid() or is_group_moderator(group_id));
