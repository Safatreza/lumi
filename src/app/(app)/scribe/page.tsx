"use client";

import { useMemo, useState } from "react";
import {
  Users,
  MapPin,
  Search,
  ShieldCheck,
  BadgeCheck,
  Star,
  Ban,
  Building2,
  CalendarDays,
  Check,
} from "lucide-react";
import {
  EU_COUNTRIES,
  EU_LANGUAGES,
  CITIES,
  STUDENTS,
  SCRIBES,
  getCity,
  getCountry,
  getEULanguage,
  flagEmoji,
  searchScribes,
  SUBJECTS,
  type StudentGrade,
  type SearchResult,
} from "@/lib/scribe/data";

const RADII = [0, 25, 50, 100, 250, 500, 1000]; // km; 0 = EU-wide

const ACCOMMODATION_LABEL: Record<string, string> = {
  blind: "Blind",
  "low vision": "Low vision",
  "motor impairment": "Motor impairment",
  dysgraphia: "Dysgraphia",
};

export default function ScribePage() {
  // "custom" = manual filters; otherwise a demo student id
  const [studentId, setStudentId] = useState<string>("s1");
  const [grade, setGrade] = useState<StudentGrade>(12);
  const [language, setLanguage] = useState("any");
  const [country, setCountry] = useState("DE");
  const [cityName, setCityName] = useState("Munich");
  const [radiusKm, setRadiusKm] = useState(100);
  const [institute, setInstitute] = useState("");
  const [subject, setSubject] = useState("any");
  const [showBlocked, setShowBlocked] = useState(true);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const student = STUDENTS.find((s) => s.id === studentId) ?? null;

  function pickStudent(id: string) {
    setStudentId(id);
    const s = STUDENTS.find((x) => x.id === id);
    if (s) {
      setGrade(s.grade);
      const home = getCity(s.city);
      setCountry(home.country);
      setCityName(home.name);
      setSubject(s.examSubject);
      setLanguage(s.languages[0]);
    }
  }

  const citiesInCountry = useMemo(
    () => CITIES.filter((c) => country === "any" || c.country === country),
    [country],
  );

  const center = useMemo(() => {
    const c = CITIES.find((x) => x.name === cityName);
    return c ? { lat: c.lat, lng: c.lng } : null;
  }, [cityName]);

  const results: SearchResult[] = useMemo(
    () =>
      searchScribes({ grade, language, center, radiusKm, institute, subject }),
    [grade, language, center, radiusKm, institute, subject],
  );

  const eligible = results.filter((r) => r.eligible);
  const blocked = results.filter((r) => !r.eligible);
  const shown = showBlocked ? results : eligible;

  function request(id: string) {
    setRequested((prev) => new Set(prev).add(id));
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[360px_1fr]">
      {/* ------------------------------ Filters ----------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{
              background:
                "color-mix(in srgb, var(--color-scribe) 12%, transparent)",
              color: "var(--color-scribe)",
            }}
          >
            <Users size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Scribe finder</h1>
            <p className="text-xs text-muted">
              Verified exam scribes across the EU
            </p>
          </div>
        </div>

        {/* The rule */}
        <div
          className="flex items-start gap-2 rounded-2xl border border-line p-3 text-xs"
          style={{
            background:
              "color-mix(in srgb, var(--color-scribe) 6%, var(--color-surface))",
          }}
        >
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--color-scribe)" }}
          />
          <p className="text-muted">
            <strong className="text-ink">Integrity rule:</strong> a scribe must
            study at least <strong className="text-ink">one grade below</strong>{" "}
            the candidate — so they can write for you, never for themselves.
            Ineligible volunteers are blocked automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          {/* Candidate */}
          <label
            htmlFor="candidate"
            className="block text-xs font-semibold text-muted"
          >
            Exam candidate
          </label>
          <select
            id="candidate"
            value={studentId}
            onChange={(e) =>
              e.target.value === "custom"
                ? setStudentId("custom")
                : pickStudent(e.target.value)
            }
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          >
            {STUDENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — grade {s.grade}, {s.city}
              </option>
            ))}
            <option value="custom">Custom search…</option>
          </select>

          {student && (
            <div className="mt-2 rounded-xl border border-line bg-bg p-3 text-xs text-muted">
              <p className="font-semibold text-ink">
                {student.name} · {ACCOMMODATION_LABEL[student.accommodation]}
              </p>
              <p className="mt-0.5 flex items-center gap-1">
                <Building2 size={12} /> {student.institution},{" "}
                {flagEmoji(getCity(student.city).country)} {student.city}
              </p>
              <p className="mt-0.5 flex items-center gap-1">
                <CalendarDays size={12} /> {student.examSubject} exam ·{" "}
                {student.examDate}
              </p>
            </div>
          )}

          {/* Grade */}
          <label
            htmlFor="grade"
            className="mt-3 block text-xs font-semibold text-muted"
          >
            Candidate grade
          </label>
          <select
            id="grade"
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value) as StudentGrade)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          >
            {[10, 11, 12].map((g) => (
              <option key={g} value={g}>
                Grade {g} (scribe must be in grade {g - 1} or below)
              </option>
            ))}
          </select>

          {/* Language */}
          <label
            htmlFor="language"
            className="mt-3 block text-xs font-semibold text-muted"
          >
            Exam language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          >
            <option value="any">Any of the 24 EU languages</option>
            {EU_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label} · {l.native}
              </option>
            ))}
          </select>

          {/* Location */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="country"
                className="block text-xs font-semibold text-muted"
              >
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  const first = CITIES.find(
                    (c) => c.country === e.target.value,
                  );
                  setCityName(first ? first.name : "");
                }}
                className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
              >
                {EU_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {flagEmoji(c.code)} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-xs font-semibold text-muted"
              >
                Near city
              </label>
              <select
                id="city"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
              >
                {citiesInCountry.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Radius */}
          <label
            htmlFor="radius"
            className="mt-3 block text-xs font-semibold text-muted"
          >
            Search radius
          </label>
          <select
            id="radius"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          >
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r === 0 ? "Anywhere in the EU" : `Within ${r} km`}
              </option>
            ))}
          </select>

          {/* Subject + institute */}
          <label
            htmlFor="subject"
            className="mt-3 block text-xs font-semibold text-muted"
          >
            Exam subject
          </label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          >
            <option value="any">Any subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label
            htmlFor="institute"
            className="mt-3 block text-xs font-semibold text-muted"
          >
            Institute
          </label>
          <div className="relative mt-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="institute"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              placeholder="e.g. Gymnasium, Lycée, Liceo…"
              className="w-full rounded-xl border border-line bg-bg py-2 pl-9 pr-3 text-[15px] outline-none"
            />
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-muted">
            <input
              type="checkbox"
              checked={showBlocked}
              onChange={(e) => setShowBlocked(e.target.checked)}
              className="size-4 accent-current"
            />
            Show scribes blocked by the grade rule
          </label>
        </div>

        <p className="px-1 text-xs text-muted">
          {SCRIBES.length} verified volunteers · 27 EU countries · 24 official
          languages
        </p>
      </div>

      {/* ------------------------------ Results ----------------------------- */}
      <div className="space-y-3">
        <p aria-live="polite" className="px-1 text-sm font-semibold">
          {eligible.length} eligible{" "}
          {eligible.length === 1 ? "scribe" : "scribes"} found
          {blocked.length > 0 && showBlocked && (
            <span className="font-normal text-muted">
              {" "}
              · {blocked.length} blocked by the grade rule
            </span>
          )}
        </p>

        {shown.length === 0 ? (
          <div className="grid min-h-48 place-items-center rounded-3xl border border-line bg-surface p-6 text-center shadow-sm">
            <div>
              <MapPin
                className="mx-auto mb-2"
                style={{ color: "var(--color-scribe)" }}
              />
              <p className="font-semibold">No scribes match yet</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                Widen the radius, switch to “Anywhere in the EU”, or relax the
                language and subject filters.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {shown.map(({ scribe, distanceKm, eligible: ok }) => {
              const home = getCity(scribe.city);
              const isRequested = requested.has(scribe.id);
              return (
                <li
                  key={scribe.id}
                  className={`rounded-2xl border bg-surface p-4 shadow-sm transition-opacity ${
                    ok ? "border-line" : "border-line opacity-60"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className="grid size-11 shrink-0 place-items-center rounded-full text-base font-bold text-white"
                        style={{
                          background: ok
                            ? "var(--color-scribe)"
                            : "var(--color-muted)",
                        }}
                        aria-hidden
                      >
                        {scribe.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div>
                        <p className="flex flex-wrap items-center gap-1.5 font-bold">
                          {scribe.name}
                          {scribe.verified && (
                            <BadgeCheck
                              size={16}
                              style={{ color: "var(--color-teacher)" }}
                              aria-label="Verified scribe"
                            />
                          )}
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                            style={{
                              background: ok
                                ? "var(--color-scribe)"
                                : "var(--color-muted)",
                            }}
                          >
                            Grade {scribe.grade}
                          </span>
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Building2 size={12} /> {scribe.institution}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {flagEmoji(home.country)}{" "}
                            {scribe.city},{" "}
                            {getCountry(home.country)?.name}
                            {distanceKm !== null &&
                              ` · ${Math.round(distanceKm)} km away`}
                          </span>
                        </p>
                        <p className="mt-1.5 flex flex-wrap gap-1.5">
                          {scribe.languages.map((l) => (
                            <span
                              key={l}
                              className="rounded-full border border-line bg-bg px-2 py-0.5 text-xs font-medium"
                            >
                              {getEULanguage(l).native}
                            </span>
                          ))}
                          {scribe.subjects.map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-muted"
                            >
                              {s}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold">
                        <Star
                          size={14}
                          fill="currentColor"
                          style={{ color: "var(--color-textbook)" }}
                        />
                        {scribe.rating.toFixed(1)}
                        <span className="font-normal text-muted">
                          · {scribe.sessions} sessions
                        </span>
                      </span>
                      {ok ? (
                        <button
                          onClick={() => request(scribe.id)}
                          disabled={isRequested}
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-70"
                          style={{
                            background: isRequested
                              ? "var(--color-teacher)"
                              : "var(--color-scribe)",
                          }}
                        >
                          {isRequested ? (
                            <>
                              <Check size={15} /> Requested
                            </>
                          ) : (
                            "Request scribe"
                          )}
                        </button>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold"
                          style={{ color: "var(--color-accent)" }}
                        >
                          <Ban size={13} /> Grade rule: needs grade ≤{" "}
                          {grade - 1}
                        </span>
                      )}
                    </div>
                  </div>
                  {isRequested && (
                    <p
                      className="mt-2 rounded-xl px-3 py-2 text-xs font-medium"
                      style={{
                        background:
                          "color-mix(in srgb, var(--color-teacher) 10%, transparent)",
                        color: "var(--color-teacher)",
                      }}
                      role="status"
                    >
                      Request sent — {scribe.name.split(" ")[0]} and your exam
                      office will be notified to confirm the session
                      {student ? ` for ${student.examDate}` : ""}.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
