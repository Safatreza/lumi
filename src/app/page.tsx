import Link from "next/link";
import {
  Mic,
  Users,
  ArrowRight,
  Languages,
  ShieldCheck,
  Scale,
  Building2,
  ScrollText,
  Volume2,
  BadgeCheck,
} from "lucide-react";
import Logo from "@/components/Logo";
import TeamAvatar from "@/components/TeamAvatar";
import { MODES } from "@/lib/modes";

const ICONS = { Mic, Users } as const;

export default function Home() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* Nav */}
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <Link
          href="/exam"
          className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
          style={{ background: "var(--color-brand)" }}
        >
          Open exam room
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-sm">
            <span
              className="size-2 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            UN CRPD Art. 24 · 27 EU countries · 24 languages
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Your exam. Your words —{" "}
            <span style={{ color: "var(--color-brand)" }}>im Wortlaut.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            WortLaut is an exam-access platform for blind and differently-abled
            students in Europe. Readers, scribes, assistive tech, and extra time
            are legally recognized — arranging them shouldn&apos;t be the hardest
            part of the exam.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/exam"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white shadow-md transition-transform hover:scale-105"
              style={{ background: "var(--color-brand)" }}
            >
              Try the AI exam room <ArrowRight size={18} />
            </Link>
            <Link
              href="/scribe"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-base font-semibold text-ink shadow-sm transition-colors hover:border-brand"
            >
              Find human support
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Volume2 size={15} /> Reads & repeats verbatim
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
      </section>

      {/* The problem */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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
            <div
              key={title}
              className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
            >
              <Icon style={{ color: "var(--color-brand)" }} />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modes */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold tracking-tight">
          One platform, both halves of exam access
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted">
          Schools and universities manage verified human support — and when
          technology is the right accommodation, the exam-safe AI assistant is
          ready.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                <p
                  className="mt-0.5 text-sm font-medium"
                  style={{ color: mode.color }}
                >
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

      {/* Integrity by design */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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

      {/* About us */}
      <section
        id="about"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
        aria-label="About the team"
      >
        <div className="relative overflow-hidden rounded-3xl border border-line shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/team/about-bg.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(13, 11, 28, 0.72)" }}
          />
          <div className="relative px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-2xl font-extrabold tracking-tight">
              About us — Team WortLaut
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/85">
              Two builders in Munich who believe an exam should measure what a
              student knows — never whether they could see the paper or hold
              the pen.
            </p>
            <div className="mx-auto mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <TeamAvatar
                  src="/team/samia.jpg"
                  name="Samia Tasnim"
                  position="center 30%"
                />
                <div>
                  <p className="text-base font-bold">Samia Tasnim</p>
                  <p className="mt-0.5 text-xs text-white/80">
                    Co-creator · Vision, research & storytelling
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <TeamAvatar
                  src="/team/safat.jpg"
                  name="Md Safat Rezanur Majumder"
                  position="center"
                />
                <div>
                  <p className="text-base font-bold">
                    Md Safat Rezanur Majumder
                  </p>
                  <p className="mt-0.5 text-xs text-white/80">
                    Co-creator · Engineering & product
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-muted sm:px-6">
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
