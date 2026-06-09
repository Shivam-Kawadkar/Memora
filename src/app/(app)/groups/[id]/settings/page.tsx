import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroupForUser } from "@/lib/groups";
import { getGroupMembers } from "@/lib/members";
import EditGroupForm from "@/components/settings/EditGroupForm";
import MembersManager from "@/components/settings/MembersManager";
import DangerZone from "@/components/settings/DangerZone";
import LeaveGroupButton from "@/components/settings/LeaveGroupButton";

export default async function GroupSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await getGroupForUser(id);
  if (!group) notFound();

  const isAdmin = group.myRole === "admin";
  const members = await getGroupMembers(id);

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <Link
        href={`/groups/${id}`}
        className="inline-flex items-center gap-1 text-sm text-faint transition hover:text-app"
      >
        ← Back to {group.name}
      </Link>

      <h1 className="mt-4 mb-8 text-3xl font-bold tracking-tight text-app">
        Group settings
      </h1>

      <div className="space-y-6">
        {isAdmin && <EditGroupForm group={group} />}

        <MembersManager groupId={id} members={members} isAdmin={isAdmin} />

        <LeaveGroupButton groupId={id} />

        {isAdmin && <DangerZone groupId={id} groupName={group.name} />}
      </div>
    </div>
  );
}
