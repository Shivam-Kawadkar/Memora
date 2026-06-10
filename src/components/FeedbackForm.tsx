"use client";

import { useRef, useState, useTransition } from "react";
import { submitFeedbackAction } from "@/lib/actions";
import { Dots } from "@/components/Loaders";

export default function FeedbackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitFeedbackAction(formData);
      if (res?.error) setError(res.error);
      else {
        setDone(true);
        setRating(0);
        formRef.current?.reset();
      }
    });
  }

  if (done) {
    return (
      <div className="animate-pop glass rounded-2xl p-10 text-center">
        <p className="text-5xl">🎉</p>
        <h3 className="mt-4 font-display text-2xl font-bold text-app">
          Thank you!
        </h3>
        <p className="mt-2 text-sm text-faint">
          Your feedback means a lot — we read every message.
        </p>
        <button
          onClick={() => setDone(false)}
          className="link-sweep mt-5 text-sm font-medium text-muted transition hover:text-app"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="glass rounded-2xl p-6 sm:p-8"
    >
      <input type="hidden" name="rating" value={rating} />

      {/* Star rating */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= (hover || rating);
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className={`text-3xl transition-transform duration-150 hover:scale-125 ${
                active ? "grayscale-0" : "grayscale"
              }`}
            >
              {active ? "⭐" : "☆"}
            </button>
          );
        })}
        <span className="ml-2 text-sm text-subtle">
          {rating ? `${rating}/5` : "Rate us"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input
          name="name"
          maxLength={80}
          placeholder="Your name (optional)"
          className="w-full rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
        />
        <input
          name="email"
          type="email"
          maxLength={120}
          placeholder="Email (optional)"
          className="w-full rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
        />
      </div>

      <textarea
        name="message"
        rows={4}
        maxLength={2000}
        required
        placeholder="Tell us what you think, what you'd love to see…"
        className="mt-4 w-full resize-none rounded-xl border border-app bg-soft px-4 py-3 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
      />

      {error && (
        <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl grad-accent px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-indigo-500/50 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Dots />
            <span>Sending</span>
          </>
        ) : (
          "Send feedback"
        )}
      </button>
    </form>
  );
}
