import Link from "next/link";
import {
  GraduationCap,
  Presentation,
  BookOpen,
  Users,
  ArrowRight,
  Languages,
  Wifi,
  HeartHandshake,
  Camera,
  Mic,
} from "lucide-react";
import Logo from "@/components/Logo";
import { MODES } from "@/lib/modes";

const ICONS = { GraduationCap, Presentation, BookOpen, Users } as const;

export default function Home() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* Nav */}
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <Link
          href="/tutor"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
          style={{ background: "var(--color-brand)" }}
        >
          Open Lumi
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-sm">
            <span className="size-2 rounded-full bg-accent" style={{ background: "var(--color-accent)" }} />
            Builders Club @ TUM · Education track
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Quality learning for{" "}
            <span className="text-brand" style={{ color: "var(--color-brand)" }}>
              every
            </span>{" "}
            student, in{" "}
            <span className="text-accent" style={{ color: "var(--color-accent)" }}>
              every
            </span>{" "}
            language.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Lumi is an AI learning companion that meets students where they are —
            in their own language, from a photo of a textbook, or just by
            speaking. No tutor, no fancy device, no problem.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tutor"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-md transition-transform hover:scale-105"
              style={{ background: "var(--color-brand)" }}
            >
              Start learning <ArrowRight size={18} />
            </Link>
            <Link
              href="/teacher"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-base font-semibold text-ink shadow-sm transition-colors hover:border-brand"
            >
              I&apos;m a teacher
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5"><Languages size={15} /> 16 languages</span>
            <span className="inline-flex items-center gap-1.5"><Camera size={15} /> Photo → text</span>
            <span className="inline-flex items-center gap-1.5"><Mic size={15} /> Voice questions</span>
            <span className="inline-flex items-center gap-1.5"><Wifi size={15} /> Light on data</span>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Wifi,
              title: "Geography",
              text: "Millions live far from a good school or a qualified teacher. Lumi works on a cheap phone and a weak connection.",
            },
            {
              icon: HeartHandshake,
              title: "Wealth",
              text: "Private tutors cost more than many families earn. Lumi gives every student a patient tutor for free.",
            },
            {
              icon: Languages,
              title: "Language",
              text: "Most learning material is in a handful of languages. Lumi teaches in the language a student actually thinks in.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
            >
              <Icon className="text-brand" style={{ color: "var(--color-brand)" }} />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modes */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold tracking-tight">
          Four ways to learn
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted">
          One companion — whether you&apos;re a student, a teacher, studying
          from a textbook, or need a scribe for your official exam.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-muted sm:px-6">
        <p>
          Built with Claude · open-source on-device AI (Whisper, Tesseract,
          MiniLM, NLLB) · Lumi for the Builders Club @ TUM hackathon.
        </p>
      </footer>
    </div>
  );
}
