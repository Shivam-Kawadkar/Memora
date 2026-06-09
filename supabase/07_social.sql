-- =====================================================================
-- Memory Vault — Phase 6: likes & comments
-- Paste into Supabase → SQL Editor → Run AFTER 06_albums.sql.
-- Safe to re-run.
-- =====================================================================

-- ---------- helpers: resolve a memory -> its group ----------
create or replace function memory_in_my_group(p_memory_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memories m
    where m.id = p_memory_id and is_group_member(m.group_id)
  );
$$;

create or replace function memory_i_moderate(p_memory_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memories m
    where m.id = p_memory_id and is_group_moderator(m.group_id)
  );
$$;

-- ---------- likes (one per user per memory) ----------
create table if not exists likes (
  memory_id  uuid not null references memories (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (memory_id, user_id)
);

create index if not exists likes_memory_idx on likes (memory_id);

alter table likes enable row level security;

drop policy if exists "read likes in my groups" on likes;
create policy "read likes in my groups"
  on likes for select
  to authenticated
  using (memory_in_my_group(memory_id));

drop policy if exists "like as self" on likes;
create policy "like as self"
  on likes for insert
  to authenticated
  with check (user_id = auth.uid() and memory_in_my_group(memory_id));

drop policy if exists "unlike own" on likes;
create policy "unlike own"
  on likes for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------- comments ----------
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  memory_id  uuid not null references memories (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_memory_idx on comments (memory_id, created_at);

alter table comments enable row level security;

drop policy if exists "read comments in my groups" on comments;
create policy "read comments in my groups"
  on comments for select
  to authenticated
  using (memory_in_my_group(memory_id));

drop policy if exists "comment as self" on comments;
create policy "comment as self"
  on comments for insert
  to authenticated
  with check (user_id = auth.uid() and memory_in_my_group(memory_id));

drop policy if exists "edit own comment" on comments;
create policy "edit own comment"
  on comments for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "delete own or moderate comment" on comments;
create policy "delete own or moderate comment"
  on comments for delete
  to authenticated
  using (user_id = auth.uid() or memory_i_moderate(memory_id));
