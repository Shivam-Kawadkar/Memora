-- =====================================================================
-- Memory Vault — Phase: group management + profile
-- Paste into Supabase → SQL Editor → Run AFTER 04_memories.sql.
-- Safe to re-run.
-- =====================================================================

-- ---------- change a member's role (admin only, guards last admin) ----------
create or replace function set_member_role(
  p_group_id uuid,
  p_user_id  uuid,
  p_role     member_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
begin
  if not is_group_admin(p_group_id) then
    raise exception 'Only admins can change roles';
  end if;

  if p_role <> 'admin' then
    select count(*) into admin_count
      from memberships where group_id = p_group_id and role = 'admin';
    if admin_count <= 1
       and exists (
         select 1 from memberships
         where group_id = p_group_id and user_id = p_user_id and role = 'admin'
       ) then
      raise exception 'Cannot demote the last admin';
    end if;
  end if;

  update memberships
    set role = p_role
    where group_id = p_group_id and user_id = p_user_id;
end;
$$;

-- ---------- remove a member (admin only) ----------
create or replace function remove_member(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_group_admin(p_group_id) then
    raise exception 'Only admins can remove members';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Use "leave group" to remove yourself';
  end if;
  if exists (
       select 1 from memberships
       where group_id = p_group_id and user_id = p_user_id and role = 'admin'
     )
     and (select count(*) from memberships
          where group_id = p_group_id and role = 'admin') <= 1 then
    raise exception 'Cannot remove the last admin';
  end if;

  delete from memberships
    where group_id = p_group_id and user_id = p_user_id;
end;
$$;

-- ---------- leave a group (self) ----------
create or replace function leave_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  my_role      member_role;
  member_count int;
  admin_count  int;
begin
  select role into my_role
    from memberships where group_id = p_group_id and user_id = auth.uid();
  if my_role is null then
    raise exception 'You are not a member of this group';
  end if;

  select count(*) into member_count from memberships where group_id = p_group_id;
  select count(*) into admin_count
    from memberships where group_id = p_group_id and role = 'admin';

  if my_role = 'admin' and admin_count <= 1 and member_count > 1 then
    raise exception 'Promote another admin or delete the group before leaving';
  end if;

  delete from memberships
    where group_id = p_group_id and user_id = auth.uid();
end;
$$;

-- =====================================================================
-- Avatars: public bucket. Object path convention: {user_id}/avatar.{ext}
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar public read" on storage.objects;
create policy "avatar public read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "avatar insert own" on storage.objects;
create policy "avatar insert own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar update own" on storage.objects;
create policy "avatar update own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar delete own" on storage.objects;
create policy "avatar delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
