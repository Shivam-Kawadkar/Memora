import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Logo from "@/components/Logo";
import FeedbackForm from "@/components/FeedbackForm";

const features = [
  {
    n: "01",
    title: "Invite-only",
    desc: "No strangers, no noise. Your group, your space — entry by link only.",
  },
  {
    n: "02",
    title: "One shared feed",
    desc: "Everyone posts, everyone relives. A single timeline for the whole crew.",
  },
  {
    n: "03",
    title: "Albums & events",
    desc: "Group moments into trips and events worth coming back to.",
  },
  {
    n: "04",
    title: "Roles you control",
    desc: "Admins, moderators, members, viewers — you decide who can do what.",
  },
  {
    n: "05",
    title: "Share in one link",
    desc: "Send a single memory or a whole album with one tap.",
  },
  {
    n: "06",
    title: "Built to scale",
    desc: "From one friend group to your entire batch, without breaking a sweat.",
  },
];

const steps = [
  { n: "1", title: "Create a group", desc: "Start a private space and grab your invite link." },
  { n: "2", title: "Invite your people", desc: "Friends join in one tap with Google sign-in." },
  { n: "3", title: "Relive together", desc: "Upload, react, and keep every memory forever." },
];

const strip = ["mv-a", "mv-b", "mv-c", "mv-d", "mv-e"];

const testimonials = [
  {
    quote:
      "Finally all our trip photos live in one place instead of scattered across ten WhatsApp groups. Game changer.",
    name: "Aanya",
    handle: "Batch '25",
    seed: "mv-t1",
    stars: 5,
  },
  {
    quote:
      "Love that it's invite-only. It actually feels like our private corner — no randoms, no ads, just us.",
    name: "Rohan",
    handle: "Hostel B crew",
    seed: "mv-t2",
    stars: 5,
  },
  {
    quote:
      "Set up a group, dropped the link in our batch chat, and everyone was posting within minutes. So easy.",
    name: "Meera",
    handle: "CS '24",
    seed: "mv-t3",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="group flex items-center gap-2.5 font-bold">
          <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <Logo size={32} />
          </span>
          <span className="grad-text font-display text-lg tracking-tight">Memora</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="#feedback"
            className="link-sweep hidden text-sm font-medium text-muted transition hover:text-app sm:inline"
          >
            Feedback
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="link-sweep text-sm font-medium text-muted transition hover:text-app"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-28 sm:pb-32">
        <div className="animate-fade-up">
          <Logo size={64} float className="rounded-2xl" />
        </div>
        <p className="animate-fade-up mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-faint">
          Invite-only · for your college crew
        </p>
        <h1
          className="animate-fade-up mt-6 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-app sm:text-7xl lg:text-8xl"
          style={{ animationDelay: "80ms" }}
        >
          Every memory,
          <br />
          in one <span className="grad-text">private place.</span>
        </h1>
        <div
          className="animate-fade-up mt-10 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between"
          style={{ animationDelay: "160ms" }}
        >
          <p className="max-w-md text-lg leading-relaxed text-muted sm:text-xl">
            A photo vault for your batch, hostel, or trip squad. No strangers,
            no algorithms — just your people and the moments you made together.
          </p>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <Link
              href="/login"
              className="rounded-xl grad-accent px-7 py-3.5 text-center font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 active:scale-[0.98]"
            >
              Start your vault — free
            </Link>
            <Link
              href="#how"
              className="text-center text-sm text-faint underline-offset-4 transition hover:text-app hover:underline"
            >
              See how it works ↓
            </Link>
          </div>
        </div>
      </section>

      {/* Statement band + memory strip */}
      <section className="border-y border-app">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="max-w-3xl font-display text-2xl font-semibold leading-snug tracking-tight text-app sm:text-4xl">
            Not social media. <span className="text-faint">Just your people,</span>{" "}
            your moments, kept safe — and yours forever.
          </h2>
          <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {strip.map((seed, i) => (
              <div
                key={seed}
                className={`overflow-hidden rounded-xl glass ${i > 2 ? "hidden sm:block" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${seed}/400/500`}
                  alt="memory"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover grayscale transition duration-500 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — editorial numbered rows */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-faint">
          What&apos;s inside
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight text-app sm:text-5xl">
          Everything your group needs.
        </h2>
        <hr className="grad-line mt-8" />
        <div className="mt-14">
          {features.map((f) => (
            <div
              key={f.n}
              className="group grid grid-cols-1 gap-2 border-t border-app py-8 transition sm:grid-cols-[5rem_1fr_1.2fr] sm:items-baseline sm:gap-8"
            >
              <span className="text-2xl font-bold text-subtle transition group-hover:grad-text">
                {f.n}
              </span>
              <h3 className="text-2xl font-semibold tracking-tight text-app sm:text-3xl">
                {f.title}
              </h3>
              <p className="text-base leading-relaxed text-faint">{f.desc}</p>
            </div>
          ))}
          <div className="border-t border-app" />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-t border-app">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-faint">
            How it works
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-app sm:text-5xl">
            Up and running in minutes.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="text-6xl font-bold grad-text">{s.n}</div>
                <h3 className="mt-4 text-xl font-semibold text-app">{s.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-faint">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback — testimonials + form */}
      <section id="feedback" className="scroll-mt-20 border-t border-app">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-faint">
            Loved by groups
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-app sm:text-5xl">
            What people are saying.
          </h2>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure
                key={t.seed}
                className="glass glass-hover animate-fade-up flex flex-col rounded-2xl p-6"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="text-sm text-amber-400">
                  {"★".repeat(t.stars)}
                  <span className="text-subtle">
                    {"★".repeat(5 - t.stars)}
                  </span>
                </div>
                <blockquote className="mt-3 flex-1 text-base leading-relaxed text-muted">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/${t.seed}/80/80`}
                    alt={t.name}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[color:var(--border)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-app">{t.name}</p>
                    <p className="text-xs text-subtle">{t.handle}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Feedback form */}
          <div className="mx-auto mt-20 max-w-2xl">
            <div className="mb-8 text-center">
              <h3 className="font-display text-3xl font-bold tracking-tight text-app sm:text-4xl">
                Got <span className="grad-text">thoughts?</span>
              </h3>
              <p className="mx-auto mt-3 max-w-md text-base text-muted">
                We&apos;re building Memora for groups like yours. Tell us what
                you love or what we should add next.
              </p>
            </div>
            <FeedbackForm />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-6 py-28 text-center">
        <hr className="grad-line mx-auto mb-12 max-w-xs" />
        <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-app sm:text-6xl">
          Start your group&apos;s <span className="grad-text">vault</span> today.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          Free to begin. Private by default. Built to keep your memories safe.
        </p>
        <Link
          href="/login"
          className="mt-9 inline-block rounded-xl grad-accent px-9 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 active:scale-[0.98]"
        >
          Create your first group
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-app">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-faint">
            <Logo size={24} className="rounded-md" />
            <span className="font-display">Memora</span>
          </div>
          <p className="text-xs text-subtle">
            © 2026 Memora · Made for Batch 2024–28
          </p>
        </div>
      </footer>
    </div>
  );
}
