"use client";

import { useState, useTransition } from "react";
import { toggleLikeAction } from "@/lib/actions";

export default function LikeButton({
  memoryId,
  groupId,
  initialLiked,
  initialCount,
  size = "sm",
}: {
  memoryId: string;
  groupId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "lg";
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();

  function toggle() {
    // Optimistic update.
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
    startTransition(async () => {
      const res = await toggleLikeAction(memoryId, groupId);
      if (res?.error || typeof res?.liked !== "boolean") {
        // Revert on failure.
        setLiked(liked);
        setCount(initialCount);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={liked ? "Unlike" : "Like"}
      className={`flex items-center gap-1.5 transition active:scale-90 ${
        size === "lg" ? "text-base" : "text-sm"
      }`}
    >
      <span className={size === "lg" ? "text-xl" : "text-base"}>
        {liked ? "❤️" : "🤍"}
      </span>
      <span className={liked ? "font-medium text-pink-500" : "text-faint"}>
        {count}
      </span>
    </button>
  );
}
