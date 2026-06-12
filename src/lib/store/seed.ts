/**
 * Deterministic seed for the WortLaut store.
 *
 * No randomness — the same demo state every load, so a presenter can rely on
 * exactly what's on screen. The human support pool is built by augmenting the
 * existing verified scribes with operational attributes (roles, training,
 * availability); a few accommodation requests are pre-loaded at different
 * stages so all three modules are useful the moment the app opens.
 */

import { SCRIBES, STUDENTS } from "@/lib/scribe/data";
import { getPaper } from "@/lib/exam/data";
import { getPolicy } from "@/lib/exam/policy";
import {
  type AccommodationRequest,
  type Booking,
  type DocItem,
  type SupportPerson,
  type SupportRole,
  type SupportType,
  type TrainingStatus,
  type WortLautState,
} from "./types";

/** Extra time granted when "extra_time" is an approved support. */
export const EXTRA_TIME_PCT = 0.25;

/** Exam minutes including extra time, when extra_time is approved. */
export function durationWithExtra(paperId: string, extraTime: boolean): number {
  const base = getPaper(paperId).durationMin;
  return Math.round(base * (extraTime ? 1 + EXTRA_TIME_PCT : 1));
}

/** The pool of exam dates the demo revolves around (from the candidates). */
export const EXAM_DATES = Array.from(
  new Set(STUDENTS.map((s) => s.examDate)),
).sort();

/**
 * Turn a verified scribe into a bookable support person. Roles, training and
 * availability are derived from stable fields (rating, sessions, index) so the
 * roster is realistic and reproducible.
 */
function toSupportPerson(scribe: (typeof SCRIBES)[number], i: number): SupportPerson {
  const roles: SupportRole[] = ["reader"];
  // Experienced volunteers also scribe; the most experienced also invigilate.
  if (scribe.sessions >= 10) roles.push("scribe");
  if (scribe.sessions >= 20) roles.push("invigilator");

  // Unverified profiles are still in training; one seasoned profile is lapsed
  // so the pool shows a blocked-by-training case.
  let training: TrainingStatus = scribe.verified ? "certified" : "in_training";
  if (scribe.id === "c3") training = "expired"; // Maximilian Bauer — also grade-blocked

  const certifiedUntil =
    training === "expired"
      ? "2026-03-31"
      : training === "in_training"
        ? "2026-12-31"
        : "2027-06-30";

  // Make a couple of people unavailable on specific exam dates so the conflict
  // check has something to catch. Spread deterministically across the pool.
  const unavailableDates: string[] = [];
  if (EXAM_DATES.length) {
    if (i % 4 === 0) unavailableDates.push(EXAM_DATES[i % EXAM_DATES.length]);
    if (i % 7 === 0)
      unavailableDates.push(EXAM_DATES[(i + 3) % EXAM_DATES.length]);
  }

  return { ...scribe, roles, training, certifiedUntil, unavailableDates };
}

const people: SupportPerson[] = SCRIBES.map(toSupportPerson);

/* ------------------------------- Documentation --------------------------- */

/** The supporting documents a request must carry, given its country and the
 *  support types in play. Used for the seed and for newly-created requests. */
export function buildDocs(
  countryCode: string,
  supports: SupportType[],
): DocItem[] {
  const docs: DocItem[] = [
    { key: "medical_evidence", label: "Medical / psychological evidence", status: "missing" },
    { key: "school_application", label: "School application to exam authority", status: "missing" },
    { key: "consent", label: "Candidate / guardian consent", status: "missing" },
  ];
  const policy = getPolicy(countryCode);
  // An AI assistant or a recording-mandate country needs data-processing consent.
  if (supports.includes("ai_assistant") || policy.recordingRequired) {
    docs.push({
      key: "data_processing",
      label: "Data-processing consent (audit recording)",
      status: "missing",
    });
  }
  return docs;
}

function verifiedDocs(countryCode: string, supports: SupportType[]): DocItem[] {
  return buildDocs(countryCode, supports).map((d) => ({ ...d, status: "verified" }));
}

/* ----------------------------- Seed requests ----------------------------- */

// Candidate cities → country, for the seeded requests.
const requests: AccommodationRequest[] = [
  // 1. Amira Khalil — fully arranged & READY. Feeds the AI Exam Room.
  {
    id: "req-amira",
    candidateId: "s1",
    paperId: "math12-en",
    requestedSupports: ["ai_assistant", "extra_time", "separate_room", "screen_reader", "human_reader"],
    approvedSupports: ["ai_assistant", "extra_time", "separate_room", "screen_reader", "human_reader"],
    status: "ready",
    assignment: {
      room: "Room A-12 (separate)",
      date: "2026-07-02",
      startTime: "09:00",
      durationMin: durationWithExtra("math12-en", true),
      tools: ["ai_assistant", "screen_reader"],
      bookingId: "bk-amira-reader",
    },
    docs: verifiedDocs("DE", ["ai_assistant", "human_reader"]),
    notes: "Blind candidate. Maths final. Uses the AI exam room with a human reader on standby.",
    createdAt: "2026-06-01T09:00:00.000Z",
    audit: null,
  },
  // 2. Felix Brandt — APPROVED, awaiting assignment (demo: assign live).
  {
    id: "req-felix",
    candidateId: "s2",
    paperId: "bio11-de",
    requestedSupports: ["extra_time", "screen_reader", "ai_assistant"],
    approvedSupports: ["extra_time", "screen_reader", "ai_assistant"],
    status: "approved",
    assignment: null,
    docs: (() => {
      const d = buildDocs("DE", ["ai_assistant"]);
      // Evidence in, application in, consent still pending.
      return d.map((x) =>
        x.key === "consent" ? x : { ...x, status: "verified" as const },
      );
    })(),
    notes: "Low-vision candidate. Needs magnified/screen-reader paper and extra time.",
    createdAt: "2026-06-04T10:30:00.000Z",
    audit: null,
  },
  // 3. Mateusz Wiśniewski — REQUESTED, not yet approved (demo: approve live).
  //    Poland mandates recorded scribe sessions — highlights the audit trail.
  {
    id: "req-mateusz",
    candidateId: "s4",
    paperId: "math12-en",
    requestedSupports: ["human_reader", "ai_assistant", "extra_time", "separate_room"],
    approvedSupports: [],
    status: "requested",
    assignment: null,
    docs: buildDocs("PL", ["ai_assistant"]).map((x) =>
      x.key === "medical_evidence" ? { ...x, status: "verified" as const } : x,
    ),
    notes: "Blind candidate, Poland — national rules require the session to be audio-recorded.",
    createdAt: "2026-06-08T14:15:00.000Z",
    audit: null,
  },
];

/* ----------------------------- Seed bookings ----------------------------- */

const bookings: Booking[] = [
  {
    id: "bk-amira-reader",
    personId: "c1", // Jonas Weber, grade 11 Munich reader — passes the grade rule for grade-12 Amira
    requestId: "req-amira",
    role: "reader",
    date: "2026-07-02",
    startTime: "09:00",
    durationMin: durationWithExtra("math12-en", true),
    attendance: "confirmed",
  },
];

export function seedState(): WortLautState {
  return {
    requests: requests.map((r) => ({ ...r })),
    people: people.map((p) => ({ ...p })),
    bookings: bookings.map((b) => ({ ...b })),
  };
}
