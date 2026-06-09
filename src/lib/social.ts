import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/memories";
import type { Comment, MemoryDetail } from "@/lib/types";

const SIGNED_URL_TTL = 60 * 60;

type DetailRow = {
  id: string;
  group_id: string;
  caption: string;
  created_at: string;
  uploader_id: string;
  image_path: string;
  album_id: string | null;
  profiles: { name: string | null; avatar_url: string | null } | null;
};

export async function getMemoryDetail(
  memoryId: string,
): Promise<MemoryDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("memories")
    .select(
      "id, group_id, caption, created_at, uploader_id, image_path, album_id, profiles!memories_uploader_id_fkey ( name, avatar_url )",
    )
    .eq("id", memoryId)
    .maybeSingle();
  if (error) console.error("[getMemoryDetail] query error:", error);
  if (!data) {
    console.error("[getMemoryDetail] no row for", memoryId, "user:", user?.id);
    return null;
  }
  const row = data as unknown as DetailRow;

  const { data: signed } = await supabase.storage
    .from("memories")
    .createSignedUrl(row.image_path, SIGNED_URL_TTL);

  let albumTitle: string | null = null;
  if (row.album_id) {
    const { data: album } = await supabase
      .from("albums")
      .select("title")
      .eq("id", row.album_id)
      .maybeSingle();
    albumTitle = album?.title ?? null;
  }

  const { data: likes } = await supabase
    .from("likes")
    .select("user_id")
    .eq("memory_id", memoryId);

  return {
    id: row.id,
    groupId: row.group_id,
    imageUrl: signed?.signedUrl ?? "",
    caption: row.caption,
    uploaderName: row.profiles?.name ?? "Member",
    uploaderAvatar: row.profiles?.avatar_url ?? "",
    createdAt: timeAgo(row.created_at),
    isMine: row.uploader_id === user?.id,
    albumTitle,
    likeCount: likes?.length ?? 0,
    likedByMe: (likes ?? []).some((l) => l.user_id === user?.id),
  };
}

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { name: string | null; avatar_url: string | null } | null;
};

export async function getComments(memoryId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, profiles ( name, avatar_url )")
    .eq("memory_id", memoryId)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as CommentRow[];
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: timeAgo(r.created_at),
    authorName: r.profiles?.name ?? "Member",
    authorAvatar: r.profiles?.avatar_url ?? "",
    isMine: r.user_id === user?.id,
  }));
}
