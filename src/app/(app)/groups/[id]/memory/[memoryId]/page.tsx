import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroupForUser } from "@/lib/groups";
import { getMemoryDetail, getComments } from "@/lib/social";
import LikeButton from "@/components/LikeButton";
import CommentThread from "@/components/CommentThread";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string; memoryId: string }>;
}) {
  const { id, memoryId } = await params;

  // group, memory and comments are independent reads — run them together.
  const [group, memory, comments] = await Promise.all([
    getGroupForUser(id),
    getMemoryDetail(memoryId),
    getComments(memoryId),
  ]);

  if (!group) notFound();
  if (!memory || memory.groupId !== id) notFound();

  const canModerate =
    group.myRole === "admin" || group.myRole === "moderator";
  const initial = memory.uploaderName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="animate-fade-up mx-auto max-w-4xl">
      <Link
        href={`/groups/${id}`}
        className="inline-flex items-center gap-1 text-sm text-faint transition hover:text-app"
      >
        ← Back to {group.name}
      </Link>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="glass overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={memory.imageUrl}
            alt={memory.caption || "memory"}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            {memory.uploaderAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={memory.uploaderAvatar}
                alt={memory.uploaderName}
                loading="lazy"
                decoding="async"
                className="h-10 w-10 rounded-full ring-2 ring-[color:var(--border)]"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full grad-accent text-sm font-semibold text-white ring-2 ring-[color:var(--border)]">
                {initial}
              </span>
            )}
            <div>
              <p className="text-sm font-medium text-app">
                {memory.uploaderName}
              </p>
              <p className="text-xs text-subtle">{memory.createdAt}</p>
            </div>
          </div>

          {memory.albumTitle && (
            <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-soft px-2.5 py-0.5 text-xs text-muted">
              📁 {memory.albumTitle}
            </span>
          )}

          {memory.caption && (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {memory.caption}
            </p>
          )}

          <div className="mt-4 flex items-center gap-5 border-y border-app py-3">
            <LikeButton
              memoryId={memory.id}
              groupId={id}
              initialLiked={memory.likedByMe}
              initialCount={memory.likeCount}
              size="lg"
            />
            <span className="flex items-center gap-1.5 text-faint">
              <span className="text-xl">💬</span>
              {comments.length}
            </span>
          </div>

          <div className="mt-5">
            <CommentThread
              memoryId={memory.id}
              groupId={id}
              comments={comments}
              canModerate={canModerate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
