import Link from "next/link";
import {
  Mic,
  Users,
  ClipboardList,
  ArrowRight,
  Languages,
  ShieldCheck,
  Scale,
  Building2,
  ScrollText,
  Volume2,
  BadgeCheck,
  Heart,
  Eye,
  Ear,
  Accessibility,
} from "lucide-react";
import Logo from "@/components/Logo";
import TeamAvatar from "@/components/TeamAvatar";
import { MODES } from "@/lib/modes";

const ICONS = { Mic, Users, ClipboardList } as const;

/* Decorative inclusion images shown in the "why we build" gallery. */
const GALLERY = [
  { src: "/img/unity-hands.jpg", alt: "Many hands joining colourful puzzle pieces together" },
  { src: "/img/circle-hands.jpg", alt: "A circle of clasped hands surrounded by spring flowers" },
  { src: "/img/world-children.jpg", alt: "Children of the world holding hands around the globe" },
  { src: "/img/arts-grid.jpg", alt: "People of every kind making music, art and stories" },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      {/* Nav */}
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link
            href="/manage"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:text-brand sm:inline"
          >
            For schools
          </Link>
          <Link
            href="/exam"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
            style={{ background: "var(--color-brand)" }}
          >
            Open exam room
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-sm">
              <span className="size-2 rounded-full" style={{ background: "var(--color-accent)" }} />
              UN CRPD Art. 24 · 27 EU countries · 24 languages
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              Your exam. Your words —{" "}
              <span style={{ color: "var(--color-brand)" }}>im Wortlaut.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              WortLaut is an exam-access platform for blind and differently-abled
              students in Europe. Readers, scribes, assistive tech and extra time
              are a legal right — arranging them shouldn&apos;t be the hardest
              part of the exam.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/exam"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white shadow-md transition-transform hover:scale-105"
                style={{ background: "var(--color-brand)" }}
              >
                Try the AI exam room <ArrowRight size={18} />
              </Link>
              <Link
                href="/manage"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-base font-semibold text-ink shadow-sm transition-colors hover:border-brand"
              >
                For schools: manage access
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Volume2 size={15} /> Reads &amp; repeats verbatim
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mic size={15} /> Dictated answers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} /> Refuses academic help
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages size={15} /> 24 EU languages
              </span>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-line bg-surface shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/children-meadow.jpg"
                alt="Children of all abilities — including a wheelchair user and a child with a white cane — playing together on a flowering hillside"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="absolute -bottom-3 left-5 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-md ring-1 ring-line">
              <Heart size={13} style={{ color: "var(--color-scribe)" }} /> Built for
              every learner
            </span>
          </div>
        </div>
      </section>

      {/* Accessibility strip */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:flex-row sm:gap-7 sm:p-7">
          <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-line sm:w-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/access-icons.jpg"
              alt="Accessibility symbols: an eye, an ear with sound waves, signing hands, a wheelchair and braille dots"
              className="h-36 w-full object-cover sm:h-40"
            />
          </div>
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">
              Every way of reading, hearing, signing and moving
            </h3>
            <p className="mt-2 text-muted">
              Vision, hearing, motor and cognitive needs all look different in an
              exam room. WortLaut starts from the <em>accommodation</em> a student
              is entitled to — not a one-size-fits-all tool — and makes the legal
              right the easy path.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted">
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1"><Eye size={13} /> Low vision &amp; blind</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1"><Ear size={13} /> Deaf &amp; hard of hearing</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1"><Accessibility size={13} /> Motor &amp; dexterity</span>
            </div>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Scale,
              title: "Fragmented rules",
              text: "27 countries, 27 rulebooks — Germany alone has 16. The right to accommodation is universal (CRPD Art. 24); navigating it isn't.",
            },
            {
              icon: Building2,
              title: "Institution-dependent",
              text: "Authorities appoint the support, families chase the paperwork, and deadlines can sit a full year before the exam (France).",
            },
            {
              icon: Users,
              title: "Scarce human support",
              text: "A qualified, neutral, available scribe is the system's weak point. When one doesn't show up, the student doesn't sit the exam.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <Icon style={{ color: "var(--color-brand)" }} />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modes */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold tracking-tight">
          One platform, three connected modules
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted">
          From the exam office&apos;s first request to the student&apos;s last
          dictated word — one workflow, governed by each country&apos;s
          accommodation rules.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {MODES.map((mode) => {
            const Icon = ICONS[mode.icon];
            return (
              <Link
                key={mode.id}
                href={mode.href}
                className="group rounded-3xl border border-line bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <span
                  className="grid size-11 place-items-center rounded-2xl text-white shadow-sm"
                  style={{ background: mode.color }}
                >
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold">{mode.name}</h3>
                <p className="mt-0.5 text-sm font-medium" style={{ color: mode.color }}>
                  {mode.tagline}
                </p>
                <p className="mt-2 text-sm text-muted">{mode.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:gap-2">
                  Open <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Inclusion gallery */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Access is a right — not a favour
          </h2>
          <p className="mx-auto mt-2 text-muted">
            An exam should measure what a student knows — never whether they can
            see the paper or hold the pen. That conviction is the whole product.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {GALLERY.map((g) => (
            <div
              key={g.src}
              className="aspect-[3/4] overflow-hidden rounded-2xl border border-line shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.src}
                alt={g.alt}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Integrity by design */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-center text-2xl font-extrabold tracking-tight">
            An AI that knows everything — designed to act like it knows nothing
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted">
            Human scribes are kept honest by rules; WortLaut is kept honest by
            design, modeled on the strictest national regulations.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Volume2,
                title: "Verbatim only",
                text: "Reads and repeats the paper word-for-word — no commentary, no explanation. (France's secrétaire rule.)",
              },
              {
                icon: Mic,
                title: "Dictation, untouched",
                text: "Writes exactly what the candidate says — no corrections to grammar, syntax, or word choice.",
              },
              {
                icon: ShieldCheck,
                title: "Refuses & flags",
                text: "Any request for academic help gets a calm refusal — and a timestamped integrity flag.",
              },
              {
                icon: ScrollText,
                title: "Full audit trail",
                text: "Every read, command, and dictation logged and exportable. (Poland already requires recorded scribe sessions.)",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-bg p-4">
                <Icon size={20} style={{ color: "var(--color-brand)" }} />
                <h3 className="mt-2 text-sm font-bold">{title}</h3>
                <p className="mt-1 text-xs text-muted">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-sm text-muted">
            <BadgeCheck size={15} style={{ color: "var(--color-teacher)" }} />
            Per-country policy engine: verified rules for FR, DE, IE, PL, NL —
            CRPD defaults everywhere else.
          </p>
        </div>
      </section>

      {/* Closing band */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/dance.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(66,62,192,0.86), rgba(214,51,108,0.62))",
            }}
          />
          <div className="relative px-6 py-12 text-center text-white sm:px-10 sm:py-16">
            <Heart className="mx-auto" size={26} />
            <p className="mx-auto mt-3 max-w-2xl text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
              No student should miss an exam because a scribe didn&apos;t show up.
            </p>
            <Link
              href="/exam"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold shadow-md transition-transform hover:scale-105"
              style={{ color: "var(--color-brand)" }}
            >
              See it work <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* About us */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-label="About the team">
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.85fr_1fr]">
          {/* Painting */}
          <figure className="overflow-hidden rounded-3xl border border-line shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/team/about-bg.jpg"
              alt="Oil painting of an open book, a braille page, hearing aids, earphones and a tactile shape board around a sunflower"
              className="h-full w-full object-cover"
            />
            <figcaption className="bg-surface px-4 py-3 text-xs text-muted">
              WortLaut in one image: books, a braille page, hearing aids and a
              tactile shape board around a sunflower — every learner&apos;s tools,
              side by side.
            </figcaption>
          </figure>

          {/* Team */}
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-brand)" }}>
              The team
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Team WortLaut</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Two builders in Munich, at the{" "}
              <span className="font-semibold text-ink">Claude Builder Club @ TUM</span>{" "}
              hackathon (Education track), who believe an exam should measure what
              a student knows — never whether they can see the paper or hold the pen.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  src: "/team/samia.jpg",
                  name: "Samia Tasnim",
                  position: "center 28%",
                  role: "Co-creator · Research & product story",
                  bio: "Mapped exam-accommodation law across the EU's 27 systems and shaped WortLaut's integrity-by-design narrative.",
                },
                {
                  src: "/team/safat.jpg",
                  name: "Md Safat Rezanur Majumder",
                  position: "center 30%",
                  role: "Co-creator · Engineering",
                  bio: "Built the three connected modules, the shared data layer, and the integrity-guarded AI exam assistant.",
                },
              ].map((m) => (
                <div
                  key={m.name}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-bg p-5 text-center"
                >
                  <TeamAvatar src={m.src} name={m.name} position={m.position} />
                  <div>
                    <p className="text-base font-bold">{m.name}</p>
                    <p className="mt-0.5 text-xs font-semibold" style={{ color: "var(--color-brand)" }}>
                      {m.role}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{m.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-muted sm:px-6">
        <p>
          WortLaut — built with Claude + open-source on-device AI (Whisper,
          Web Speech) for the Builders Club @ TUM hackathon. Includes the{" "}
          <Link href="/tutor" className="underline hover:text-ink">
            Lumi learning tools
          </Link>
          .
        </p>
        <p className="mt-2 font-medium">
          Created by Samia Tasnim &amp; Md Safat Rezanur Majumder
        </p>
      </footer>
    </div>
  );
}
