import { MemoryCardSkeleton } from "@/components/Loaders";

export default function GroupFeedLoading() {
  return (
    <div>
      <div className="skeleton mb-4 h-3 w-24 rounded" />
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-9 w-52 rounded-lg" />
          <div className="skeleton h-3 w-40 rounded" />
        </div>
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
      <div className="skeleton mb-6 h-9 w-40 rounded-xl" />
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <MemoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
