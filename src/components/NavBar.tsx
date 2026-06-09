import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getMyProfile } from "@/lib/profile";
import NavBarShell from "./NavBarShell";

export default async function NavBar() {
  let name = "Member";
  let avatarUrl = "";

  if (isSupabaseConfigured) {
    const profile = await getMyProfile();
    if (profile) {
      name = profile.name;
      avatarUrl = profile.avatarUrl;
    }
  }

  return <NavBarShell name={name} avatarUrl={avatarUrl} />;
}
