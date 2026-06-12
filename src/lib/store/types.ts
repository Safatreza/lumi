/**
 * Shared domain model for the three WortLaut modules.
 *
 * One store, three views:
 *   1. Accommodation Manager (schools)  — owns AccommodationRequest
 *   2. Human Support Pool (readers/scribes/invigilators) — owns SupportPerson + Booking
 *   3. AI Exam Access Assistant (the student) — reads an approved request, writes its audit report back
 *
 * Everything here is plain data so it can be serialised to localStorage and
 * round-tripped without loss.
 */

import type { ScribeProfile } from "@/lib/scribe/data";

/* --------------------------- Support people (Module 2) -------------------- */

/** What a human support person is trained to do in the exam room. */
export type SupportRole = "reader" | "scribe" | "invigilator";

export const SUPPORT_ROLE_LABEL: Record<SupportRole, string> = {
  reader: "Reader",
  scribe: "Scribe",
  invigilator: "Invigilator",
};

/** Training/certification state — drives whether someone may be booked. */
export type TrainingStatus = "certified" | "in_training" | "expired";

export const TRAINING_LABEL: Record<TrainingStatus, string> = {
  certified: "Certified",
  in_training: "In training",
  expired: "Expired",
};

/** A member of the human support pool: a scribe profile plus the operational
 *  attributes a school needs before it can book them for a real exam. */
export interface SupportPerson extends ScribeProfile {
  roles: SupportRole[];
  training: TrainingStatus;
  /** ISO date the current certification lapses. */
  certifiedUntil: string;
  /** Specific dates the person has declared themselves unavailable. A person is
   *  bookable for a date if it is NOT here and they hold no other booking that
   *  day (see the conflict check in the store). */
  unavailableDates: string[];
}

/* --------------------------- Accommodations (Module 1) -------------------- */

/** A support type a school can approve for a candidate. Some are human
 *  (reader/scribe), some are assistive technology (tools), one is the WortLaut
 *  AI Exam Room itself. */
export type SupportType =
  | "human_reader"
  | "human_scribe"
  | "extra_time"
  | "separate_room"
  | "screen_reader"
  | "speech_to_text"
  | "ai_assistant";

export interface SupportTypeMeta {
  id: SupportType;
  label: string;
  /** "human" types must be filled by a booked SupportPerson; "tool"/"setup"
   *  types are arranged by the school. */
  kind: "human" | "tool" | "setup";
  /** If human, the SupportRole that fulfils it. */
  role?: SupportRole;
}

export const SUPPORT_TYPES: SupportTypeMeta[] = [
  { id: "human_reader", label: "Human reader", kind: "human", role: "reader" },
  { id: "human_scribe", label: "Human scribe", kind: "human", role: "scribe" },
  { id: "extra_time", label: "Extra time", kind: "setup" },
  { id: "separate_room", label: "Separate room", kind: "setup" },
  { id: "screen_reader", label: "Screen reader", kind: "tool" },
  { id: "speech_to_text", label: "Speech-to-text", kind: "tool" },
  { id: "ai_assistant", label: "WortLaut AI Exam Room", kind: "tool" },
];

export function supportMeta(id: SupportType): SupportTypeMeta {
  return SUPPORT_TYPES.find((s) => s.id === id) as SupportTypeMeta;
}

/** Workflow status of a request. Advances left to right. */
export type RequestStatus =
  | "requested" // school logged the need
  | "approved" // support types approved by the exam office
  | "assigned" // room/time/person/tools set
  | "ready" // exam-day checklist complete
  | "completed"; // exam sat; audit report attached

export const STATUS_ORDER: RequestStatus[] = [
  "requested",
  "approved",
  "assigned",
  "ready",
  "completed",
];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  assigned: "Assigned",
  ready: "Ready",
  completed: "Completed",
};

/** Supporting documentation a request must carry. */
export type DocStatus = "missing" | "submitted" | "verified";

export interface DocItem {
  key: string;
  label: string;
  status: DocStatus;
}

/** The concrete exam-day arrangement. */
export interface Assignment {
  room: string;
  date: string; // ISO yyyy-mm-dd
  startTime: string; // "09:00"
  /** Minutes including any approved extra time. */
  durationMin: number;
  /** Tools the school will have ready (screen reader, STT, AI room…). */
  tools: SupportType[];
  /** Booking id of the human support person, if one is needed. */
  bookingId: string | null;
}

/** The audit/provenance report produced by the exam room (Module 3). */
export interface AuditReport {
  exportedAt: string;
  integrityFlags: number;
  events: number;
  /** Full exported JSON, kept for provenance/download. */
  data: unknown;
}

export interface AccommodationRequest {
  id: string;
  candidateId: string;
  paperId: string;
  requestedSupports: SupportType[];
  approvedSupports: SupportType[];
  status: RequestStatus;
  assignment: Assignment | null;
  docs: DocItem[];
  notes: string;
  createdAt: string;
  /** Written back by Module 3 after the exam. */
  audit: AuditReport | null;
}

/* ------------------------------- Bookings (Module 2) ---------------------- */

export type Attendance =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "no_show";

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  no_show: "No-show",
};

export interface Booking {
  id: string;
  personId: string;
  requestId: string;
  role: SupportRole;
  date: string;
  startTime: string;
  durationMin: number;
  attendance: Attendance;
}

/* --------------------------------- Store ---------------------------------- */

export interface WortLautState {
  requests: AccommodationRequest[];
  people: SupportPerson[];
  bookings: Booking[];
}
