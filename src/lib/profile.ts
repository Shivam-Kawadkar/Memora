import { createClient } from "@/lib/supabase/server";
import type { MyProfile } from "@/lib/types";

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("name, avatar_url, bio")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    name:
      data?.name ||
      (user.user_metadata?.full_name as string) ||
      user.email?.split("@")[0] ||
      "Member",
    avatarUrl:
      data?.avatar_url || (user.user_metadata?.avatar_url as string) || "",
    bio: data?.bio ?? "",
    email: user.email ?? "",
  };
}
