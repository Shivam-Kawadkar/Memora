-- =====================================================================
-- Memory Vault — Phase 3 write functions (SECURITY DEFINER)
-- Paste into Supabase → SQL Editor → Run AFTER 02_policies.sql.
-- These are the ONLY sanctioned ways to create a group or join one,
-- so membership roles can't be forged by clients.
-- =====================================================================

-- Tighten membership inserts: clients cannot insert directly.
-- All inserts happen through the functions below (which bypass RLS).
drop policy if exists "insert own membership" on memberships;

-- ---------- create a group and make the caller its admin ----------
create or replace function create_group(
  p_name        text,
  p_description text default '',
  p_cover_color text default '#6366f1'
)
returns groups
language plpgsql
security definer
set search_path = public
as $$
declare
  new_group groups;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Group name is required';
  end if;

  insert into groups (name, description, cover_color, created_by)
  values (trim(p_name), coalesce(p_description, ''), coalesce(p_cover_color, '#6366f1'), auth.uid())
  returning * into new_group;

  insert into memberships (group_id, user_id, role)
  values (new_group.id, auth.uid(), 'admin');

  return new_group;
end;
$$;

-- ---------- join a group using an invite token ----------
create or replace function join_group_with_token(p_token text)
returns uuid          -- returns the group_id joined
language plpgsql
security definer
set search_path = public
as $$
declare
  inv invites;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into inv from invites where token = p_token;
  if inv.id is null then
    raise exception 'Invalid invite';
  end if;
  if inv.expires_at is not null and inv.expires_at < now() then
    raise exception 'This invite has expired';
  end if;

  insert into memberships (group_id, user_id, role)
  values (inv.group_id, auth.uid(), inv.role)
  on conflict (group_id, user_id) do nothing;

  return inv.group_id;
end;
$$;

-- ---------- create an invite (admin only) ----------
create or replace function create_invite(
  p_group_id uuid,
  p_token    text,
  p_role     member_role default 'member'
)
returns invites
language plpgsql
security definer
set search_path = public
as $$
declare
  new_invite invites;
begin
  if not is_group_admin(p_group_id) then
    raise exception 'Only admins can create invites';
  end if;

  insert into invites (group_id, token, role, created_by)
  values (p_group_id, p_token, p_role, auth.uid())
  returning * into new_invite;

  return new_invite;
end;
$$;
