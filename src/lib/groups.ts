import { createClient } from "@/lib/supabase/server";
import type { Group, Role } from "@/lib/types";

const COVER_TTL = 60 * 60; // signed-URL lifetime for banner images

// Latest memory image (signed URL) for each group, used as a banner.
// Groups with no memories simply won't appear in the map.
async function getGroupCovers(
  groupIds: string[],
): Promise<Record<string, string>> {
  if (groupIds.length === 0) return {};
  const supabase = await createClient();

  const { data: mems } = await supabase
    .from("memories")
    .select("group_id, image_path, created_at")
    .in("group_id", groupIds)
    .order("created_at", { ascending: false });

  // First (newest) path seen per group wins.
  const coverPath = new Map<string, string>();
  for (const m of mems ?? []) {
    if (!coverPath.has(m.group_id)) coverPath.set(m.group_id, m.image_path);
  }

  const paths = [...coverPath.values()];
  if (paths.length === 0) return {};

  const { data: signed } = await supabase.storage
    .from("memories")
    .createSignedUrls(paths, COVER_TTL);
  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  }

  const covers: Record<string, string> = {};
  for (const [groupId, path] of coverPath) {
    const url = urlByPath.get(path);
    if (url) covers[groupId] = url;
  }
  return covers;
}

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
  const [counts, covers] = await Promise.all([
    getMemberCounts(groupIds),
    getGroupCovers(groupIds),
  ]);

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
        coverUrl: covers[g.id] ?? null,
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

  // group row, my membership, member counts, and cover are independent reads.
  const [groupRes, membershipRes, counts, covers] = await Promise.all([
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
    getGroupCovers([groupId]),
  ]);

  const group = groupRes.data;
  const myMembership = membershipRes.data;
  if (!group || !myMembership) return null;

  return {
    id: group.id,
    name: group.name,
    description: group.description ?? "",
    coverColor: group.cover_color ?? "#6366f1",
    coverUrl: covers[groupId] ?? null,
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
