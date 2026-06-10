"use server";

import { randomBytes, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { pickCoverColor } from "@/lib/groups";
import type { Role } from "@/lib/types";

export type ActionResult = { error?: string };

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_AVATAR_BYTES = 4 * 1024 * 1024; // 4 MB

// Create a group via the SECURITY DEFINER RPC; caller becomes admin.
export async function createGroupAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Please enter a group name." };
  if (name.length > 60) return { error: "Group name is too long." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_group", {
    p_name: name,
    p_description: description,
    p_cover_color: pickCoverColor(name),
  });

  if (error) return { error: error.message };

  revalidatePath("/groups");
  redirect(`/groups/${data.id}`);
}

// Create (or reuse) an invite link for a group. Returns the token.
export async function createInviteAction(
  groupId: string,
): Promise<{ token?: string; error?: string }> {
  const supabase = await createClient();
  const token = randomBytes(9).toString("base64url");

  const { data, error } = await supabase.rpc("create_invite", {
    p_group_id: groupId,
    p_token: token,
    p_role: "member",
  });

  if (error) return { error: error.message };
  return { token: data.token };
}

// Join a group using an invite token, then go to that group.
export async function joinGroupAction(token: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_group_with_token", {
    p_token: token,
  });

  if (error) return { error: error.message };

  revalidatePath("/groups");
  redirect(`/groups/${data}`);
}

// Upload an image + caption as a new memory in a group.
export async function uploadMemoryAction(
  groupId: string,
  formData: FormData,
): Promise<ActionResult> {
  const file = formData.get("image");
  const caption = String(formData.get("caption") ?? "").trim();

  if (!(file instanceof File) || file.size === 0)
    return { error: "Please choose an image." };
  if (!file.type.startsWith("image/"))
    return { error: "Only image files are allowed." };
  if (file.size > MAX_IMAGE_BYTES)
    return { error: "Image is too large (max 8 MB)." };
  if (caption.length > 280) return { error: "Caption is too long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const albumRaw = formData.get("album_id");
  const albumId =
    typeof albumRaw === "string" && albumRaw.length > 0 ? albumRaw : null;
  if (albumId) {
    const { data: album } = await supabase
      .from("albums")
      .select("id")
      .eq("id", albumId)
      .eq("group_id", groupId)
      .maybeSingle();
    if (!album) return { error: "Selected album is invalid." };
  }

  const ext =
    (file.name.split(".").pop() || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${groupId}/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("memories")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (upErr) return { error: upErr.message };

  const { error: insErr } = await supabase.from("memories").insert({
    group_id: groupId,
    uploader_id: user.id,
    image_path: path,
    caption,
    album_id: albumId,
  });
  if (insErr) {
    // Roll back the orphaned object if the row insert failed.
    await supabase.storage.from("memories").remove([path]);
    return { error: insErr.message };
  }

  revalidatePath(`/groups/${groupId}`);
  return {};
}

// Delete a memory (RLS allows own posts, or moderators/admins).
export async function deleteMemoryAction(
  memoryId: string,
  groupId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: memory } = await supabase
    .from("memories")
    .select("image_path")
    .eq("id", memoryId)
    .maybeSingle();

  const { error } = await supabase.from("memories").delete().eq("id", memoryId);
  if (error) return { error: error.message };

  if (memory?.image_path) {
    await supabase.storage.from("memories").remove([memory.image_path]);
  }

  revalidatePath(`/groups/${groupId}`);
  return {};
}

// ---------------------------------------------------------------------------
// Group management
// ---------------------------------------------------------------------------

// Edit a group's name / description / cover color (admin — enforced by RLS).
export async function updateGroupAction(
  groupId: string,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const coverColor = String(formData.get("cover_color") ?? "").trim();

  if (!name) return { error: "Group name is required." };
  if (name.length > 60) return { error: "Group name is too long." };

  const supabase = await createClient();
  const update: Record<string, unknown> = { name, description };
  if (/^#[0-9a-fA-F]{6}$/.test(coverColor)) update.cover_color = coverColor;

  const { error } = await supabase.from("groups").update(update).eq("id", groupId);
  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/settings`);
  revalidatePath("/groups");
  return {};
}

// Permanently delete a group + its stored images (admin — enforced by RLS).
export async function deleteGroupAction(groupId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Storage isn't cascaded by the FK, so remove the group's images first.
  const { data: files } = await supabase.storage
    .from("memories")
    .list(groupId, { limit: 1000 });
  if (files && files.length > 0) {
    await supabase.storage
      .from("memories")
      .remove(files.map((f) => `${groupId}/${f.name}`));
  }

  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) return { error: error.message };

  revalidatePath("/groups");
  return {};
}

export async function setMemberRoleAction(
  groupId: string,
  userId: string,
  role: Role,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_member_role", {
    p_group_id: groupId,
    p_user_id: userId,
    p_role: role,
  });
  if (error) return { error: error.message };
  revalidatePath(`/groups/${groupId}/settings`);
  return {};
}

export async function removeMemberAction(
  groupId: string,
  userId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_member", {
    p_group_id: groupId,
    p_user_id: userId,
  });
  if (error) return { error: error.message };
  revalidatePath(`/groups/${groupId}/settings`);
  return {};
}

export async function leaveGroupAction(groupId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_group", { p_group_id: groupId });
  if (error) return { error: error.message };
  revalidatePath("/groups");
  return {};
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (name.length > 60) return { error: "Name is too long." };
  if (bio.length > 200) return { error: "Bio is too long (max 200)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  let avatarUrl: string | undefined;
  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/"))
      return { error: "Avatar must be an image." };
    if (file.size > MAX_AVATAR_BYTES)
      return { error: "Avatar is too large (max 4 MB)." };

    const { data: existing } = await supabase.storage
      .from("avatars")
      .list(user.id);
    if (existing && existing.length > 0) {
      await supabase.storage
        .from("avatars")
        .remove(existing.map((f) => `${user.id}/${f.name}`));
    }

    const ext =
      (file.name.split(".").pop() || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (upErr) return { error: upErr.message };

    avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data
      .publicUrl;
  }

  const update: Record<string, unknown> = { name, bio };
  if (avatarUrl) update.avatar_url = avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/groups");
  return {};
}

// ---------------------------------------------------------------------------
// Albums
// ---------------------------------------------------------------------------

export async function createAlbumAction(
  groupId: string,
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Album title is required." };
  if (title.length > 60) return { error: "Album title is too long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { data, error } = await supabase
    .from("albums")
    .insert({ group_id: groupId, title, created_by: user.id })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}`);
  return { id: data.id };
}

export async function renameAlbumAction(
  albumId: string,
  groupId: string,
  formData: FormData,
): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Album title is required." };
  if (title.length > 60) return { error: "Album title is too long." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("albums")
    .update({ title })
    .eq("id", albumId);
  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}`);
  return {};
}

export async function deleteAlbumAction(
  albumId: string,
  groupId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("albums").delete().eq("id", albumId);
  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}`);
  return {};
}

// Move a memory into an album (or out, with null). Validates same group.
export async function setMemoryAlbumAction(
  memoryId: string,
  groupId: string,
  albumId: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();

  if (albumId) {
    const { data: album } = await supabase
      .from("albums")
      .select("id")
      .eq("id", albumId)
      .eq("group_id", groupId)
      .maybeSingle();
    if (!album) return { error: "Album not found in this group." };
  }

  const { error } = await supabase
    .from("memories")
    .update({ album_id: albumId })
    .eq("id", memoryId);
  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}`);
  return {};
}

// ---------------------------------------------------------------------------
// Likes & comments
// ---------------------------------------------------------------------------

export async function toggleLikeAction(
  memoryId: string,
  groupId: string,
): Promise<{ liked?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { data: existing } = await supabase
    .from("likes")
    .select("memory_id")
    .eq("memory_id", memoryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("memory_id", memoryId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ memory_id: memoryId, user_id: user.id });
    if (error) return { error: error.message };
  }

  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/memory/${memoryId}`);
  return { liked: !existing };
}

export async function addCommentAction(
  memoryId: string,
  groupId: string,
  formData: FormData,
): Promise<ActionResult> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Comment can't be empty." };
  if (body.length > 1000) return { error: "Comment is too long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { error } = await supabase
    .from("comments")
    .insert({ memory_id: memoryId, user_id: user.id, body });
  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}/memory/${memoryId}`);
  revalidatePath(`/groups/${groupId}`);
  return {};
}

export async function editCommentAction(
  commentId: string,
  memoryId: string,
  groupId: string,
  formData: FormData,
): Promise<ActionResult> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Comment can't be empty." };
  if (body.length > 1000) return { error: "Comment is too long." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .update({ body })
    .eq("id", commentId);
  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}/memory/${memoryId}`);
  return {};
}

export async function deleteCommentAction(
  commentId: string,
  memoryId: string,
  groupId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}/memory/${memoryId}`);
  revalidatePath(`/groups/${groupId}`);
  return {};
}

// ---------------------------------------------------------------------------
// Landing-page feedback (works for logged-out visitors too)
// ---------------------------------------------------------------------------

export async function submitFeedbackAction(
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const ratingRaw = Number(formData.get("rating"));
  const rating =
    Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5
      ? ratingRaw
      : null;

  if (!message) return { error: "Please write a short message." };
  if (message.length > 2000) return { error: "Message is too long (max 2000)." };
  if (name.length > 80) return { error: "Name is too long." };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { error: "That email doesn't look right." };

  // Demo mode (no Supabase keys yet): accept silently so the UI still works.
  if (!isSupabaseConfigured) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    name: name || null,
    email: email || null,
    rating,
    message,
    user_id: user?.id ?? null,
  });
  if (error) return { error: "Couldn't send feedback. Please try again." };

  return {};
}
