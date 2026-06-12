"use client";

import { useMemo, useState } from "react";
import {
  Users,
  BadgeCheck,
  Star,
  MapPin,
  Building2,
  CalendarCheck,
  CalendarX,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Search,
  CircleSlash,
} from "lucide-react";
import {
  getCity,
  getCountry,
  getEULanguage,
  flagEmoji,
} from "@/lib/scribe/data";
import { useWortLaut, candidate } from "@/lib/store/store";
import { EXAM_DATES } from "@/lib/store/seed";
import {
  ATTENDANCE_LABEL,
  SUPPORT_ROLE_LABEL,
  TRAINING_LABEL,
  type Attendance,
  type SupportPerson,
  type SupportRole,
  type TrainingStatus,
} from "@/lib/store/types";

const ATTENDANCE_OPTIONS: Attendance[] = [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "no_show",
];

const TRAINING_STYLE: Record<TrainingStatus, { color: string; Icon: typeof ShieldCheck }> = {
  certified: { color: "var(--color-teacher)", Icon: ShieldCheck },
  in_training: { color: "var(--color-textbook)", Icon: ShieldAlert },
  expired: { color: "var(--color-accent)", Icon: ShieldAlert },
};

function shortDate(iso: string): string {
  // "2026-07-02" → "2 Jul"
  const [, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(d)} ${months[Number(m) - 1]}`;
}

export default function PoolPage() {
  const { state, setAttendance, setUnavailable, resetDemo } = useWortLaut();

  const [role, setRole] = useState<"any" | SupportRole>("any");
  const [training, setTraining] = useState<"any" | TrainingStatus>("any");
  const [query, setQuery] = useState("");

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.people.filter((p) => {
      if (role !== "any" && !p.roles.includes(role)) return false;
      if (training !== "any" && p.training !== training) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.institution.toLowerCase().includes(q) &&
        !p.city.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [state.people, role, training, query]);

  const certifiedCount = state.people.filter((p) => p.training === "certified").length;
  const activeBookings = state.bookings.filter((b) => b.attendance !== "no_show");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{
              background: "color-mix(in srgb, var(--color-scribe) 12%, transparent)",
              color: "var(--color-scribe)",
            }}
          >
            <Users size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Human Support Pool</h1>
            <p className="text-xs text-muted">
              Verified readers, scribes &amp; invigilators — availability, training &amp; attendance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Users size={13} /> {state.people.length} people
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={13} style={{ color: "var(--color-teacher)" }} />{" "}
            {certifiedCount} certified
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarCheck size={13} /> {activeBookings.length} booked
          </span>
          <button
            onClick={resetDemo}
            className="rounded-full border border-line px-2.5 py-1 font-semibold hover:text-ink"
          >
            Reset demo
          </button>
        </div>
      </div>

      {/* Bookings & attendance */}
      <section className="mt-4 rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <h2 className="flex items-center gap-1.5 text-sm font-bold">
          <CalendarCheck size={16} style={{ color: "var(--color-scribe)" }} />
          Bookings &amp; attendance
        </h2>
        {state.bookings.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No bookings yet. Assign support to an accommodation in the{" "}
            <span className="font-semibold text-ink">Accommodation Manager</span> to book someone here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {state.bookings.map((b) => {
              const person = state.people.find((p) => p.id === b.personId);
              const req = state.requests.find((r) => r.id === b.requestId);
              const cand = req ? candidate(req.candidateId) : null;
              return (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {person?.name ?? "Unknown"}{" "}
                      <span className="font-normal text-muted">
                        · {SUPPORT_ROLE_LABEL[b.role]}
                      </span>
                    </p>
                    <p className="text-xs text-muted">
                      {cand ? `${cand.name} · ` : ""}
                      {shortDate(b.date)} · {b.startTime} · {b.durationMin} min
                    </p>
                  </div>
                  <select
                    aria-label={`Attendance for ${person?.name}`}
                    value={b.attendance}
                    onChange={(e) => setAttendance(b.id, e.target.value as Attendance)}
                    className="rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs font-semibold outline-none"
                    style={
                      b.attendance === "no_show"
                        ? { color: "var(--color-accent)", borderColor: "var(--color-accent)" }
                        : b.attendance === "confirmed" || b.attendance === "checked_in" || b.attendance === "completed"
                          ? { color: "var(--color-teacher)" }
                          : undefined
                    }
                  >
                    {ATTENDANCE_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {ATTENDANCE_LABEL[a]}
                      </option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="f-role" className="block text-xs font-semibold text-muted">
            Role
          </label>
          <select
            id="f-role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="mt-1 rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
          >
            <option value="any">Any role</option>
            <option value="reader">Readers</option>
            <option value="scribe">Scribes</option>
            <option value="invigilator">Invigilators</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-train" className="block text-xs font-semibold text-muted">
            Training
          </label>
          <select
            id="f-train"
            value={training}
            onChange={(e) => setTraining(e.target.value as typeof training)}
            className="mt-1 rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
          >
            <option value="any">Any status</option>
            <option value="certified">Certified</option>
            <option value="in_training">In training</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="min-w-48 flex-1">
          <label htmlFor="f-q" className="block text-xs font-semibold text-muted">
            Search
          </label>
          <div className="relative mt-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="f-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, school or city…"
              className="w-full rounded-xl border border-line bg-bg py-2 pl-9 pr-3 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 px-1 text-sm font-semibold">
        {people.length} {people.length === 1 ? "person" : "people"}
      </p>

      {/* Roster */}
      <ul className="mt-2 grid gap-3 sm:grid-cols-2">
        {people.map((p) => (
          <PersonCard
            key={p.id}
            person={p}
            bookings={state.bookings.filter((b) => b.personId === p.id)}
            requests={state.requests}
            onToggleDate={(date, unavailable) => setUnavailable(p.id, date, unavailable)}
          />
        ))}
      </ul>
    </div>
  );
}

function PersonCard({
  person,
  bookings,
  requests,
  onToggleDate,
}: {
  person: SupportPerson;
  bookings: { id: string; date: string; requestId: string }[];
  requests: { id: string; candidateId: string }[];
  onToggleDate: (date: string, unavailable: boolean) => void;
}) {
  const home = getCity(person.city);
  const { color, Icon } = TRAINING_STYLE[person.training];
  const bookedDates = new Set(bookings.map((b) => b.date));

  return (
    <li className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full text-base font-bold text-white"
            style={{ background: "var(--color-scribe)" }}
            aria-hidden
          >
            {person.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 font-bold">
              {person.name}
              {person.verified && (
                <BadgeCheck size={15} style={{ color: "var(--color-teacher)" }} aria-label="Verified" />
              )}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <GraduationCap size={12} /> Grade {person.grade}
              </span>
              <span className="inline-flex items-center gap-1">
                <Building2 size={12} /> {person.institution}
              </span>
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
              <MapPin size={12} /> {flagEmoji(home.country)} {person.city},{" "}
              {getCountry(home.country)?.name}
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold">
          <Star size={14} fill="currentColor" style={{ color: "var(--color-textbook)" }} />
          {person.rating.toFixed(1)}
        </span>
      </div>

      {/* Roles + training */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {person.roles.map((r) => (
          <span
            key={r}
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
            style={{ background: "var(--color-scribe)" }}
          >
            {SUPPORT_ROLE_LABEL[r]}
          </span>
        ))}
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold"
          style={{ color, borderColor: color }}
        >
          <Icon size={12} /> {TRAINING_LABEL[person.training]}
          {person.training !== "certified" ? "" : ` · to ${shortDate(person.certifiedUntil)} '${person.certifiedUntil.slice(2, 4)}`}
        </span>
      </div>

      {/* Languages + subjects */}
      <p className="mt-2 flex flex-wrap gap-1.5">
        {person.languages.map((l) => (
          <span key={l} className="rounded-full border border-line bg-bg px-2 py-0.5 text-xs font-medium">
            {getEULanguage(l).native}
          </span>
        ))}
        {person.subjects.map((s) => (
          <span key={s} className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-muted">
            {s}
          </span>
        ))}
      </p>

      {/* Availability + schedule */}
      <details className="mt-3 rounded-xl border border-line bg-bg p-2.5">
        <summary className="cursor-pointer text-xs font-semibold text-muted">
          Availability &amp; schedule
        </summary>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Exam dates — click to toggle availability
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EXAM_DATES.map((d) => {
            const isBooked = bookedDates.has(d);
            const isUnavailable = person.unavailableDates.includes(d);
            return (
              <button
                key={d}
                disabled={isBooked}
                onClick={() => onToggleDate(d, !isUnavailable)}
                title={
                  isBooked
                    ? "Booked — cannot change"
                    : isUnavailable
                      ? "Marked unavailable — click to free up"
                      : "Available — click to block"
                }
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                style={
                  isBooked
                    ? { background: "var(--color-scribe)", color: "white", borderColor: "var(--color-scribe)" }
                    : isUnavailable
                      ? { color: "var(--color-accent)", borderColor: "var(--color-accent)" }
                      : { color: "var(--color-teacher)", borderColor: "color-mix(in srgb, var(--color-teacher) 50%, transparent)" }
                }
              >
                {isBooked ? <CalendarCheck size={11} /> : isUnavailable ? <CircleSlash size={11} /> : <CalendarCheck size={11} />}
                {shortDate(d)}
              </button>
            );
          })}
        </div>
        {bookings.length > 0 && (
          <>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Booked
            </p>
            <ul className="mt-1 space-y-1">
              {bookings.map((b) => {
                const req = requests.find((r) => r.id === b.requestId);
                const cand = req ? candidate(req.candidateId) : null;
                return (
                  <li key={b.id} className="text-xs text-muted">
                    {shortDate(b.date)} — {cand ? cand.name : b.requestId}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {person.unavailableDates.length === 0 && bookings.length === 0 && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted">
            <CalendarX size={12} /> No blocked dates — fully available.
          </p>
        )}
      </details>
    </li>
  );
}
