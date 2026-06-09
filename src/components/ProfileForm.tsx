"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/lib/actions";
import type { MyProfile } from "@/lib/types";

export default function ProfileForm({ profile }: { profile: MyProfile }) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const initial = profile.name.trim().charAt(0).toUpperCase() || "?";
  const shown = preview ?? (profile.avatarUrl || null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Avatar must be an image.");
      e.target.value = "";
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setError("Avatar is too large (max 4 MB).");
      e.target.value = "";
      return;
    }
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p);
      return URL.createObjectURL(f);
    });
  }

  function onSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res?.error) setError(res.error);
      else {
        setSaved(true);
        setPreview(null);
        router.refresh();
      }
    });
  }

  return (
    <form action={onSubmit} className="glass space-y-5 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <label className="block cursor-pointer">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt="Your avatar"
              loading="lazy"
              decoding="async"
              className="h-20 w-20 rounded-full object-cover ring-2 ring-[color:var(--border)]"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full grad-accent text-2xl font-semibold text-white ring-2 ring-[color:var(--border)]">
              {initial}
            </span>
          )}
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
        </label>
        <div>
          <p className="text-sm font-medium text-app">Profile photo</p>
          <p className="mt-0.5 text-xs text-subtle">
            Tap the photo to change · JPG/PNG up to 4 MB
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Name
        </label>
        <input
          name="name"
          defaultValue={profile.name}
          maxLength={60}
          placeholder="Your name"
          className="w-full rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Bio <span className="text-subtle">(optional)</span>
        </label>
        <textarea
          name="bio"
          defaultValue={profile.bio}
          rows={3}
          maxLength={200}
          placeholder="Tell your group a little about you…"
          className="w-full resize-none rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Email
        </label>
        <p className="rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-faint">
          {profile.email}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {saved && !error && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl grad-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 active:scale-[0.97] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
