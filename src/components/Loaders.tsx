/** Bouncing gradient dots — inline loading indicator. */
export function Dots({ className = "" }: { className?: string }) {
  return (
    <span className={`dots ${className}`} role="status" aria-label="Loading">
      <span />
      <span />
      <span />
    </span>
  );
}

/** Gradient ring spinner. */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      className="spinner-ring inline-block"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
    />
  );
}

/** A single shimmering memory-card placeholder. */
export function MemoryCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2.5 p-3.5">
        <div className="skeleton h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3 w-28 rounded" />
          <div className="skeleton h-2.5 w-16 rounded" />
        </div>
      </div>
      <div className="skeleton aspect-square w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

/** A shimmering group/album tile placeholder. */
export function CardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="skeleton h-28 w-full" />
      <div className="space-y-2.5 p-5">
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-20 rounded" />
      </div>
    </div>
  );
}
