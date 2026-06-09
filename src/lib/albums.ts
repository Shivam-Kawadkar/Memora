import { createClient } from "@/lib/supabase/server";
import type { Album, AlbumRef, AlbumSummary } from "@/lib/types";

const SIGNED_URL_TTL = 60 * 60;

// Albums in a group with an auto cover (latest photo) + memory count.
export async function getAlbumsForGroup(
  groupId: string,
): Promise<AlbumSummary[]> {
  const supabase = await createClient();

  const { data: albums } = await supabase
    .from("albums")
    .select("id, title")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  if (!albums || albums.length === 0) return [];

  const albumIds = albums.map((a) => a.id);
  const { data: mems } = await supabase
    .from("memories")
    .select("album_id, image_path, created_at")
    .in("album_id", albumIds)
    .order("created_at", { ascending: false });

  const coverPath = new Map<string, string>();
  const count = new Map<string, number>();
  for (const m of mems ?? []) {
    if (!m.album_id) continue;
    count.set(m.album_id, (count.get(m.album_id) ?? 0) + 1);
    if (!coverPath.has(m.album_id)) coverPath.set(m.album_id, m.image_path);
  }

  const paths = [...coverPath.values()];
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("memories")
      .createSignedUrls(paths, SIGNED_URL_TTL);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
    }
  }

  return albums.map((a) => {
    const cp = coverPath.get(a.id);
    return {
      id: a.id,
      title: a.title,
      coverUrl: cp ? urlByPath.get(cp) ?? null : null,
      count: count.get(a.id) ?? 0,
    };
  });
}

// Lightweight list for pickers.
export async function getAlbumRefs(groupId: string): Promise<AlbumRef[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("albums")
    .select("id, title")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((a) => ({ id: a.id, title: a.title }));
}

export async function getAlbum(albumId: string): Promise<Album | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("albums")
    .select("id, title, group_id, created_by")
    .eq("id", albumId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    groupId: data.group_id,
    createdBy: data.created_by,
  };
}
