import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyProfile } from "@/lib/profile";
import { getMyGroups } from "@/lib/groups";
import { ROLE_LABEL } from "@/lib/types";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const profile = await getMyProfile();
  if (!profile) notFound();
  const groups = await getMyGroups();

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-app">
        Your profile
      </h1>

      <ProfileForm profile={profile} />

      <section className="glass mt-6 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-app">
          Your groups{" "}
          <span className="text-sm font-normal text-subtle">
            ({groups.length})
          </span>
        </h2>
        {groups.length === 0 ? (
          <p className="mt-3 text-sm text-faint">
            You&apos;re not in any group yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[color:var(--border)]">
            {groups.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/groups/${g.id}`}
                  className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-8 shrink-0 rounded-lg"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${g.coverColor}, #a855f7)`,
                      }}
                    />
                    <span className="text-sm font-medium text-app">{g.name}</span>
                  </div>
                  <span className="text-xs text-faint">
                    {ROLE_LABEL[g.myRole]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
