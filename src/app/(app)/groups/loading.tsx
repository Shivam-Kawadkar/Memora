import { CardSkeleton } from "@/components/Loaders";

export default function GroupsLoading() {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-8 w-40 rounded-lg" />
          <div className="skeleton h-3 w-56 rounded" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
