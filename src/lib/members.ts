import { createClient } from "@/lib/supabase/server";
import type { Member, Role } from "@/lib/types";

// Members of a group with their profile info, oldest first.
export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: mems } = await supabase
    .from("memberships")
    .select("user_id, role, joined_at")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (!mems || mems.length === 0) return [];

  const ids = mems.map((m) => m.user_id);
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", ids);

  const byId = new Map(
    (profs ?? []).map((p) => [p.id, p as { name: string | null; avatar_url: string | null }]),
  );

  return mems.map((m) => {
    const p = byId.get(m.user_id);
    return {
      userId: m.user_id,
      name: p?.name ?? "Member",
      avatarUrl: p?.avatar_url ?? "",
      role: m.role as Role,
      isMe: m.user_id === user?.id,
    };
  });
}
