-- =====================================================================
-- Memory Vault — Phase 3 Row-Level Security policies
-- Paste this whole file into Supabase → SQL Editor → Run AFTER 01_schema.sql.
-- =====================================================================

alter table profiles    enable row level security;
alter table groups      enable row level security;
alter table memberships enable row level security;
alter table invites     enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles readable by authenticated" on profiles;
create policy "profiles readable by authenticated"
  on profiles for select
  to authenticated
  using (true);

drop policy if exists "users update own profile" on profiles;
create policy "users update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------- groups ----------
drop policy if exists "members can read their groups" on groups;
create policy "members can read their groups"
  on groups for select
  to authenticated
  using (is_group_member(id));

drop policy if exists "authenticated can create groups" on groups;
create policy "authenticated can create groups"
  on groups for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "admins can update group" on groups;
create policy "admins can update group"
  on groups for update
  to authenticated
  using (is_group_admin(id));

drop policy if exists "admins can delete group" on groups;
create policy "admins can delete group"
  on groups for delete
  to authenticated
  using (is_group_admin(id));

-- ---------- memberships ----------
drop policy if exists "read memberships of my groups" on memberships;
create policy "read memberships of my groups"
  on memberships for select
  to authenticated
  using (is_group_member(group_id));

-- A user may insert their OWN membership row (used when creating a group
-- or joining via invite). Role is validated separately by server logic.
drop policy if exists "insert own membership" on memberships;
create policy "insert own membership"
  on memberships for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "admins manage memberships" on memberships;
create policy "admins manage memberships"
  on memberships for delete
  to authenticated
  using (is_group_admin(group_id));

-- ---------- invites ----------
-- Anyone authenticated can read an invite (needed to look it up by token
-- before joining). It only reveals the group_id + role, not group contents.
drop policy if exists "read invites" on invites;
create policy "read invites"
  on invites for select
  to authenticated
  using (true);

drop policy if exists "admins create invites" on invites;
create policy "admins create invites"
  on invites for insert
  to authenticated
  with check (is_group_admin(group_id) and created_by = auth.uid());

drop policy if exists "admins delete invites" on invites;
create policy "admins delete invites"
  on invites for delete
  to authenticated
  using (is_group_admin(group_id));
