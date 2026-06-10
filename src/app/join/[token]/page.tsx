import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { joinGroupAction } from "@/lib/actions";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → send to login, then come back to this invite.
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join/${token}`)}`);
  }

  // Look up the invite to show which group they're joining.
  const { data: invite } = await supabase
    .from("invites")
    .select("group_id, groups ( name, cover_color )")
    .eq("token", token)
    .maybeSingle();

  const group = invite?.groups as unknown as
    | { name: string; cover_color: string }
    | undefined;

  async function accept() {
    "use server";
    await joinGroupAction(token);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="animate-fade-up w-full max-w-sm rounded-3xl glass p-8 text-center shadow-2xl">
        {!invite ? (
          <>
            <div className="text-4xl">🔗</div>
            <h1 className="mt-4 text-xl font-bold text-app">Invalid invite</h1>
            <p className="mt-2 text-sm text-faint">
              This link is broken or has expired. Ask for a new one.
            </p>
            <Link
              href="/groups"
              className="mt-6 inline-block rounded-xl glass px-5 py-2.5 text-sm font-medium text-muted transition hover:text-app"
            >
              Go to my groups
            </Link>
          </>
        ) : (
          <>
            <div
              className="animate-float mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-lg"
              style={{
                backgroundImage: `linear-gradient(135deg, ${group?.cover_color ?? "#6366f1"}, #a855f7)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="Memora" className="h-[68%] w-[68%] object-contain" />
            </div>
            <h1 className="mt-4 font-display text-xl font-bold text-app">
              Join <span className="grad-text">{group?.name ?? "this group"}</span>?
            </h1>
            <p className="mt-2 text-sm text-faint">
              You&apos;ll be able to see and share memories with this group.
            </p>
            <form action={accept} className="mt-6">
              <button
                type="submit"
                className="w-full rounded-xl grad-accent px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 active:scale-[0.98]"
              >
                Join group
              </button>
            </form>
            <Link
              href="/groups"
              className="mt-3 inline-block text-sm text-subtle transition hover:text-app"
            >
              Not now
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
