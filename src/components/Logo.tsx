type LogoProps = {
  /** Box size in pixels (the rounded gradient tile). */
  size?: number;
  /** Extra classes for the tile (e.g. shadow tweaks). */
  className?: string;
  /** Animate a gentle float — nice for hero/auth screens. */
  float?: boolean;
};

export default function Logo({ size = 32, className = "", float = false }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-xl grad-accent shadow-md shadow-indigo-500/30 ${
        float ? "animate-float" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon.png"
        alt="Memora"
        width={size}
        height={size}
        className="h-[68%] w-[68%] object-contain"
      />
    </span>
  );
}
