-- =====================================================================
-- Memory Vault — Phase 3 schema: profiles, groups, memberships, invites
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE where possible).
-- =====================================================================

-- ---------- ENUM: roles ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'member_role') then
    create type member_role as enum ('admin', 'moderator', 'member', 'viewer');
  end if;
end$$;

-- ---------- profiles ----------
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default 'Member',
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

-- ---------- groups ----------
create table if not exists groups (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text default '',
  cover_color  text default '#6366f1',
  created_by   uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now()
);

-- ---------- memberships (a user's role within a group) ----------
create table if not exists memberships (
  group_id   uuid not null references groups (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       member_role not null default 'member',
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ---------- invites ----------
create table if not exists invites (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups (id) on delete cascade,
  token       text not null unique,
  role        member_role not null default 'member',
  created_by  uuid not null references auth.users (id) on delete cascade,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists invites_token_idx on invites (token);
create index if not exists memberships_user_idx on memberships (user_id);

-- =====================================================================
-- Helper functions (SECURITY DEFINER) to avoid RLS recursion on
-- memberships. These run with the owner's rights, so policies can call
-- them without triggering the policies again.
-- =====================================================================

create or replace function is_group_member(g uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where group_id = g and user_id = auth.uid()
  );
$$;

create or replace function is_group_admin(g uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where group_id = g and user_id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
-- Auto-create a profile row whenever a new auth user signs up.
-- =====================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email, 'Member'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill a profile for any users that already exist (e.g. you).
insert into profiles (id, name, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.email, 'Member'),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;
