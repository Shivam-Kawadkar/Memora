import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupForUser } from "@/lib/groups";
import { getMemoriesForGroup } from "@/lib/memories";
import { getAlbum, getAlbumsForGroup, getAlbumRefs } from "@/lib/albums";
import { ROLE_CAN_UPLOAD, ROLE_LABEL } from "@/lib/types";
import InviteButton from "@/components/InviteButton";
import UploadMemoryButton from "@/components/UploadMemoryButton";
import MemoryCard from "@/components/MemoryCard";
import CreateAlbumButton from "@/components/CreateAlbumButton";
import AlbumActions from "@/components/AlbumActions";

function Tabs({ groupId, active }: { groupId: string; active: "feed" | "albums" }) {
  const base = "rounded-lg px-4 py-1.5 text-sm font-medium transition";
  return (
    <div className="mb-6 inline-flex gap-1 rounded-xl glass p-1">
      <Link
        href={`/groups/${groupId}`}
        className={`${base} ${active === "feed" ? "bg-soft text-app" : "text-faint hover:text-app"}`}
      >
        Feed
      </Link>
      <Link
        href={`/groups/${groupId}?view=albums`}
        className={`${base} ${active === "albums" ? "bg-soft text-app" : "text-faint hover:text-app"}`}
      >
        Albums
      </Link>
    </div>
  );
}

export default async function GroupFeedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; album?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const group = await getGroupForUser(id);
  if (!group) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  const canUpload = ROLE_CAN_UPLOAD[group.myRole];
  const isAdmin = group.myRole === "admin";
  const canModerate = group.myRole === "admin" || group.myRole === "moderator";

  const showingAlbums = sp.view === "albums" && !sp.album;
  const albumId = sp.album;

  const settingsGear = (
    <Link
      href={`/groups/${group.id}/settings`}
      aria-label="Group settings"
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    </Link>
  );

  return (
    <div className="animate-fade-up">
      <Link
        href="/groups"
        className="inline-flex items-center gap-1 text-sm text-faint transition hover:text-app"
      >
        ← All groups
      </Link>

      {/* Banner — latest memory image, with gradient fallback */}
      <div
        className="relative mt-4 mb-6 overflow-hidden rounded-3xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${group.coverColor}, #a855f7)`,
        }}
      >
        {group.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.coverUrl}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative flex min-h-[9rem] flex-col justify-end gap-3 p-5 sm:min-h-[11rem] sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl font-bold tracking-tight text-white drop-shadow sm:text-4xl">
              {group.name}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {group.memberCount}{" "}
              {group.memberCount === 1 ? "member" : "members"} · you are{" "}
              <span className="text-white">{ROLE_LABEL[group.myRole]}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {settingsGear}
            {isAdmin && <InviteButton groupId={group.id} />}
          </div>
        </div>
      </div>

      <Tabs groupId={group.id} active={showingAlbums || albumId ? "albums" : "feed"} />

      {/* ---------------- Albums grid ---------------- */}
      {showingAlbums ? (
        <AlbumsGrid groupId={group.id} canUpload={canUpload} />
      ) : albumId ? (
        /* ---------------- Single album view ---------------- */
        <AlbumView
          groupId={group.id}
          albumId={albumId}
          canUpload={canUpload}
          canModerate={canModerate}
          userId={userId}
        />
      ) : (
        /* ---------------- Full feed ---------------- */
        <FeedView
          groupId={group.id}
          canUpload={canUpload}
          canModerate={canModerate}
        />
      )}
    </div>
  );
}

async function FeedView({
  groupId,
  canUpload,
  canModerate,
}: {
  groupId: string;
  canUpload: boolean;
  canModerate: boolean;
}) {
  const [memories, albums] = await Promise.all([
    getMemoriesForGroup(groupId),
    getAlbumRefs(groupId),
  ]);

  return (
    <>
      <div className="mb-6 flex justify-end">
        {canUpload ? (
          <UploadMemoryButton groupId={groupId} albums={albums} />
        ) : (
          <span className="rounded-xl glass px-4 py-2.5 text-sm text-subtle">
            🔒 View only
          </span>
        )}
      </div>

      {memories.length === 0 ? (
        <EmptyState canUpload={canUpload} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {memories.map((memory, i) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              groupId={groupId}
              canModerate={canModerate}
              albums={albums}
              index={i}
            />
          ))}
        </div>
      )}
    </>
  );
}

async function AlbumView({
  groupId,
  albumId,
  canUpload,
  canModerate,
  userId,
}: {
  groupId: string;
  albumId: string;
  canUpload: boolean;
  canModerate: boolean;
  userId?: string;
}) {
  const album = await getAlbum(albumId);
  if (!album || album.groupId !== groupId) notFound();

  const [memories, albums] = await Promise.all([
    getMemoriesForGroup(groupId, albumId),
    getAlbumRefs(groupId),
  ]);
  const canManageAlbum = canModerate || album.createdBy === userId;
  const coverUrl = memories[0]?.imageUrl ?? null;

  return (
    <>
      <Link
        href={`/groups/${groupId}?view=albums`}
        className="text-sm text-faint transition hover:text-app"
      >
        ← Albums
      </Link>

      {/* Album banner — first photo, gradient fallback when empty */}
      <div className="relative mt-3 mb-6 overflow-hidden rounded-3xl grad-accent">
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative flex min-h-[8rem] flex-col justify-end gap-3 p-5 sm:min-h-[10rem] sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow sm:text-3xl">
            📁 {album.title}{" "}
            <span className="text-sm font-normal text-white/80">
              · {memories.length} {memories.length === 1 ? "photo" : "photos"}
            </span>
          </h2>
          <div className="flex shrink-0 items-center gap-3">
            {canManageAlbum && (
              <AlbumActions albumId={album.id} groupId={groupId} title={album.title} />
            )}
            {canUpload && (
              <UploadMemoryButton
                groupId={groupId}
                albums={albums}
                defaultAlbumId={album.id}
              />
            )}
          </div>
        </div>
      </div>

      {memories.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-5xl">📁</p>
          <p className="mt-3 text-muted">This album is empty.</p>
          <p className="mt-1 text-sm text-subtle">
            {canUpload
              ? "Upload a photo into it, or move one here from the feed."
              : "Photos added to this album will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {memories.map((memory, i) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              groupId={groupId}
              canModerate={canModerate}
              albums={albums}
              index={i}
            />
          ))}
        </div>
      )}
    </>
  );
}

async function AlbumsGrid({
  groupId,
  canUpload,
}: {
  groupId: string;
  canUpload: boolean;
}) {
  const albums = await getAlbumsForGroup(groupId);

  return (
    <>
      {canUpload && (
        <div className="mb-6 flex justify-end">
          <CreateAlbumButton groupId={groupId} />
        </div>
      )}

      {albums.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-5xl">📁</p>
          <p className="mt-3 text-muted">No albums yet.</p>
          <p className="mt-1 text-sm text-subtle">
            {canUpload
              ? "Create an album to organize memories into events."
              : "Albums created here will appear in this tab."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <Link
              key={a.id}
              href={`/groups/${groupId}?album=${a.id}`}
              className="glass glass-hover group block overflow-hidden rounded-2xl"
            >
              <div className="relative h-36 w-full">
                {a.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.coverUrl}
                    alt={a.title}
                    loading="lazy"
                    decoding="async"
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="grad-accent flex h-36 w-full items-center justify-center text-4xl">
                    📁
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10" />
              </div>
              <div className="p-4">
                <h3 className="truncate font-semibold text-app transition group-hover:grad-text">
                  {a.title}
                </h3>
                <p className="mt-0.5 text-xs text-subtle">
                  {a.count} {a.count === 1 ? "photo" : "photos"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function EmptyState({ canUpload }: { canUpload: boolean }) {
  return (
    <div className="glass rounded-2xl p-16 text-center">
      <p className="text-5xl">🖼️</p>
      <p className="mt-3 text-muted">No memories yet.</p>
      <p className="mt-1 text-sm text-subtle">
        {canUpload
          ? "Upload the first photo to start this group's vault."
          : "Photos shared here will appear once members start uploading."}
      </p>
    </div>
  );
}
