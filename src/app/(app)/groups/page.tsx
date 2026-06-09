import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyGroups } from "@/lib/groups";
import { getRecentMemories, getMyMemoryCount } from "@/lib/memories";
import CreateGroupButton from "@/components/CreateGroupButton";
import GroupsList from "@/components/GroupsList";

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <p className="text-2xl font-bold text-app">{value}</p>
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
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-app">
            Hi, {firstName} <span className="grad-text">👋</span>
          </h1>
          <p className="mt-1 text-sm text-faint">Your groups and shared memories.</p>
        </div>
        <CreateGroupButton />
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3 sm:max-w-md">
        <StatCard value={groups.length} label="Groups" />
        <StatCard value={adminCount} label="You admin" />
        <StatCard value={memoryCount} label="Memories" />
      </div>

      {recent.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
            Recent memories
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recent.map((m) => (
              <Link
                key={m.id}
                href={`/groups/${m.groupId}`}
                className="shrink-0 overflow-hidden rounded-xl glass"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.imageUrl}
                  alt="recent memory"
                  className="h-24 w-24 object-cover transition hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <GroupsList groups={groups} />
    </div>
  );
}
