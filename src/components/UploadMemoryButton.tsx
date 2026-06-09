"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadMemoryAction } from "@/lib/actions";
import type { AlbumRef } from "@/lib/types";

const MAX_MB = 8;

export default function UploadMemoryButton({
  groupId,
  albums = [],
  defaultAlbumId = "",
}: {
  groupId: string;
  albums?: AlbumRef[];
  defaultAlbumId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function clearPreview() {
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p);
      return null;
    });
  }

  function reset() {
    clearPreview();
    setError(null);
    formRef.current?.reset();
  }

  function close() {
    if (pending) return;
    setOpen(false);
    reset();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large (max ${MAX_MB} MB).`);
      e.target.value = "";
      return;
    }
    clearPreview();
    setPreview(URL.createObjectURL(f));
  }

  function onSubmit(formData: FormData) {
    setError(null);
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      setError("Please choose an image.");
      return;
    }
    startTransition(async () => {
      const res = await uploadMemoryAction(groupId, formData);
      if (res?.error) setError(res.error);
      else {
        close();
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl grad-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 active:scale-[0.97]"
      >
        + Upload memory
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <div className="animate-fade-up relative w-full max-w-md rounded-2xl glass p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-app">Upload a memory</h2>
            <p className="mt-1 text-sm text-faint">Share a photo with the group.</p>

            <form ref={formRef} action={onSubmit} className="mt-5 space-y-4">
              <label className="block cursor-pointer">
                {preview ? (
                  <div className="relative overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Selected preview"
                      decoding="async"
                      className="aspect-square w-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
                      Change photo
                    </span>
                  </div>
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-app bg-soft text-center transition hover:border-indigo-400/60">
                    <span className="text-4xl">🖼️</span>
                    <span className="text-sm text-faint">Tap to choose a photo</span>
                    <span className="text-xs text-subtle">
                      JPG / PNG · up to {MAX_MB} MB
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                />
              </label>

              <textarea
                name="caption"
                rows={2}
                maxLength={280}
                placeholder="Add a caption…"
                className="w-full resize-none rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
              />

              {albums.length > 0 && (
                <select
                  name="album_id"
                  defaultValue={defaultAlbumId}
                  aria-label="Album"
                  className="w-full rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition focus:border-indigo-400/60"
                >
                  <option value="">No album</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              )}

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={close}
                  disabled={pending}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-faint transition hover:text-app disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl grad-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 active:scale-[0.97] disabled:opacity-60"
                >
                  {pending ? "Uploading…" : "Share memory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
