import { createClient } from "@/lib/supabase/server";
import type { Group, Role } from "@/lib/types";

export const COVER_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

export function pickCoverColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COVER_COLORS[h % COVER_COLORS.length];
}

// All groups the current user belongs to, with their role + member count.
export async function getMyGroups(): Promise<Group[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("role, group_id, groups ( id, name, description, cover_color )")
    .eq("user_id", user.id);

  if (error || !memberships) return [];

  const groupIds = memberships.map((m) => m.group_id);
  const counts = await getMemberCounts(groupIds);

  return memberships
    .filter((m) => m.groups)
    .map((m) => {
      const g = m.groups as unknown as {
        id: string;
        name: string;
        description: string;
        cover_color: string;
      };
      return {
        id: g.id,
        name: g.name,
        description: g.description ?? "",
        coverColor: g.cover_color ?? "#6366f1",
        memberCount: counts[g.id] ?? 1,
        myRole: m.role as Role,
      };
    });
}

// A single group, only if the current user is a member (RLS enforces this).
export async function getGroupForUser(groupId: string): Promise<Group | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // group row, my membership, and member counts are independent reads.
  const [groupRes, membershipRes, counts] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, description, cover_color")
      .eq("id", groupId)
      .maybeSingle(),
    supabase
      .from("memberships")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle(),
    getMemberCounts([groupId]),
  ]);

  const group = groupRes.data;
  const myMembership = membershipRes.data;
  if (!group || !myMembership) return null;

  return {
    id: group.id,
    name: group.name,
    description: group.description ?? "",
    coverColor: group.cover_color ?? "#6366f1",
    memberCount: counts[groupId] ?? 1,
    myRole: myMembership.role as Role,
  };
}

async function getMemberCounts(groupIds: string[]): Promise<Record<string, number>> {
  if (groupIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("group_id")
    .in("group_id", groupIds);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.group_id] = (counts[row.group_id] ?? 0) + 1;
  }
  return counts;
}
