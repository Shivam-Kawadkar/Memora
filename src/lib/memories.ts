import { createClient } from "@/lib/supabase/server";
import type { FeedMemory } from "@/lib/types";

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

type MemoryRow = {
  id: string;
  caption: string;
  created_at: string;
  uploader_id: string;
  image_path: string;
  album_id: string | null;
  profiles: { name: string | null; avatar_url: string | null } | null;
};

// All memories in a group, newest first, with signed image URLs.
// Pass an albumId to filter to one album, or "none" for unsorted photos.
export async function getMemoriesForGroup(
  groupId: string,
  albumId?: string,
): Promise<FeedMemory[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("memories")
    .select(
      "id, caption, created_at, uploader_id, image_path, album_id, profiles ( name, avatar_url )",
    )
    .eq("group_id", groupId);

  if (albumId === "none") query = query.is("album_id", null);
  else if (albumId) query = query.eq("album_id", albumId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return [];

  const rows = data as unknown as MemoryRow[];

  const { data: signed } = await supabase.storage
    .from("memories")
    .createSignedUrls(
      rows.map((r) => r.image_path),
      SIGNED_URL_TTL,
    );
  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  }

  // Map album ids -> titles for chips.
  const titleById = new Map<string, string>();
  const usedAlbumIds = [
    ...new Set(rows.map((r) => r.album_id).filter((x): x is string => !!x)),
  ];
  if (usedAlbumIds.length > 0) {
    const { data: albums } = await supabase
      .from("albums")
      .select("id, title")
      .in("id", usedAlbumIds);
    for (const a of albums ?? []) titleById.set(a.id, a.title);
  }

  // Like + comment counts for these memories.
  const memIds = rows.map((r) => r.id);
  const likeCount = new Map<string, number>();
  const likedByMe = new Set<string>();
  const { data: likes } = await supabase
    .from("likes")
    .select("memory_id, user_id")
    .in("memory_id", memIds);
  for (const l of likes ?? []) {
    likeCount.set(l.memory_id, (likeCount.get(l.memory_id) ?? 0) + 1);
    if (l.user_id === user?.id) likedByMe.add(l.memory_id);
  }
  const commentCount = new Map<string, number>();
  const { data: cmts } = await supabase
    .from("comments")
    .select("memory_id")
    .in("memory_id", memIds);
  for (const c of cmts ?? [])
    commentCount.set(c.memory_id, (commentCount.get(c.memory_id) ?? 0) + 1);

  return rows
    .map((r) => ({
      id: r.id,
      imageUrl: urlByPath.get(r.image_path) ?? "",
      caption: r.caption,
      uploaderName: r.profiles?.name ?? "Member",
      uploaderAvatar: r.profiles?.avatar_url ?? "",
      createdAt: timeAgo(r.created_at),
      isMine: r.uploader_id === user?.id,
      albumId: r.album_id,
      albumTitle: r.album_id ? titleById.get(r.album_id) ?? null : null,
      likeCount: likeCount.get(r.id) ?? 0,
      likedByMe: likedByMe.has(r.id),
      commentCount: commentCount.get(r.id) ?? 0,
    }))
    .filter((m) => m.imageUrl !== "");
}

export type RecentMemory = { id: string; imageUrl: string; groupId: string };

// Most recent memories across all the current user's groups.
export async function getRecentMemories(limit = 6): Promise<RecentMemory[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: mems } = await supabase
    .from("memberships")
    .select("group_id")
    .eq("user_id", user.id);
  const groupIds = (mems ?? []).map((m) => m.group_id);
  if (groupIds.length === 0) return [];

  const { data, error } = await supabase
    .from("memories")
    .select("id, image_path, group_id")
    .in("group_id", groupIds)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data || data.length === 0) return [];

  const { data: signed } = await supabase.storage
    .from("memories")
    .createSignedUrls(
      data.map((r) => r.image_path),
      SIGNED_URL_TTL,
    );
  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  }

  return data
    .map((r) => ({
      id: r.id,
      imageUrl: urlByPath.get(r.image_path) ?? "",
      groupId: r.group_id,
    }))
    .filter((m) => m.imageUrl !== "");
}

// Count of memories across all the current user's groups.
export async function getMyMemoryCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: mems } = await supabase
    .from("memberships")
    .select("group_id")
    .eq("user_id", user.id);
  const groupIds = (mems ?? []).map((m) => m.group_id);
  if (groupIds.length === 0) return 0;

  const { count } = await supabase
    .from("memories")
    .select("id", { count: "exact", head: true })
    .in("group_id", groupIds);
  return count ?? 0;
}
