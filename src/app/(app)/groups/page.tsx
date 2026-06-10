import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyGroups } from "@/lib/groups";
import { getRecentMemories, getMyMemoryCount } from "@/lib/memories";
import CreateGroupButton from "@/components/CreateGroupButton";
import GroupsList from "@/components/GroupsList";

function StatCard({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: string;
}) {
  return (
    <div className="glass glass-hover rounded-2xl px-4 py-4 sm:px-5">
      <span className="text-lg">{icon}</span>
      <p className="mt-1 text-2xl font-bold text-app sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs text-faint">{label}</p>
    </div>
  );
}

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const firstName =
    ((user?.user_metadata?.full_name as string) ?? "there").split(" ")[0];

  const [groups, memoryCount, recent] = await Promise.all([
    getMyGroups(),
    getMyMemoryCount(),
    getRecentMemories(6),
  ]);
  const adminCount = groups.filter((g) => g.myRole === "admin").length;

  return (
    <div className="animate-fade-up">
      {/* Welcome hero — wraps cleanly on mobile */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">
            Your vault
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-app sm:text-4xl">
            Hi, {firstName} <span className="inline-block animate-float">👋</span>
          </h1>
          <p className="mt-1 text-sm text-faint">
            Your groups and shared memories, all in one place.
          </p>
        </div>
        <div className="shrink-0">
          <CreateGroupButton />
        </div>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-3 sm:max-w-md">
        <StatCard value={groups.length} label="Groups" icon="👥" />
        <StatCard value={adminCount} label="You admin" icon="⭐" />
        <StatCard value={memoryCount} label="Memories" icon="📸" />
      </div>

      {recent.length > 0 && (
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">
              Recent memories
            </h2>
            <hr className="grad-line-soft flex-1" />
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {recent.map((m, i) => (
              <Link
                key={m.id}
                href={`/groups/${m.groupId}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group animate-fade-up shrink-0 overflow-hidden rounded-xl glass glass-hover"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.imageUrl}
                  alt="recent memory"
                  loading="lazy"
                  decoding="async"
                  className="h-24 w-24 object-cover transition duration-300 group-hover:scale-110"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">
          All groups
        </h2>
        <hr className="grad-line-soft flex-1" />
      </div>
      <GroupsList groups={groups} />
    </div>
  );
}
