"use client";

/**
 * The single WortLaut store, shared by all three modules through React context
 * and persisted to localStorage. Modules 1 & 2 are entirely local — no network,
 * no API key spend. Only the exam room (Module 3) ever calls Claude.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { STUDENTS, getCity, isEligible } from "@/lib/scribe/data";
import { getPaper } from "@/lib/exam/data";
import { getPolicy } from "@/lib/exam/policy";
import {
  type AccommodationRequest,
  type Assignment,
  type Attendance,
  type AuditReport,
  type Booking,
  type DocStatus,
  type RequestStatus,
  type SupportPerson,
  type SupportRole,
  type SupportType,
  type WortLautState,
  supportMeta,
} from "./types";
import { EXTRA_TIME_PCT, buildDocs, durationWithExtra, seedState } from "./seed";

const STORAGE_KEY = "wortlaut.store.v1";

/* --------------------------------- IDs ------------------------------------ */

let counter = 0;
function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

/* ----------------------------- Pure helpers ------------------------------- */

export function candidate(candidateId: string) {
  return STUDENTS.find((s) => s.id === candidateId) ?? STUDENTS[0];
}

export function candidateCountry(candidateId: string): string {
  return getCity(candidate(candidateId).city).country;
}

/** Does a request need a human support person (reader/scribe)? */
export function neededHumanRoles(req: AccommodationRequest): SupportRole[] {
  return req.approvedSupports
    .map(supportMeta)
    .filter((m) => m.kind === "human" && m.role)
    .map((m) => m.role as SupportRole);
}

/** Tool-type supports that must be readied for the exam. */
export function neededTools(req: AccommodationRequest): SupportType[] {
  return req.approvedSupports.filter((s) => supportMeta(s).kind === "tool");
}

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  /** A required item must be done before the request can be marked Ready. */
  required: boolean;
  detail?: string;
}

/** Build the exam-day checklist for a request from current state. */
export function buildChecklist(
  state: WortLautState,
  req: AccommodationRequest,
): ChecklistItem[] {
  const policy = getPolicy(candidateCountry(req.candidateId));
  const a = req.assignment;
  const roles = neededHumanRoles(req);
  const tools = neededTools(req);

  const confirmedBooking =
    a?.bookingId != null
      ? state.bookings.find(
          (b) =>
            b.id === a.bookingId &&
            (b.attendance === "confirmed" ||
              b.attendance === "checked_in" ||
              b.attendance === "completed"),
        )
      : undefined;

  const items: ChecklistItem[] = [
    {
      key: "approved",
      label: "Support types approved",
      done: req.approvedSupports.length > 0,
      required: true,
      detail: req.approvedSupports.map((s) => supportMeta(s).label).join(", ") || "—",
    },
    {
      key: "room",
      label: "Room & time assigned",
      done: Boolean(a?.room && a?.date && a?.startTime),
      required: true,
      detail: a ? `${a.room} · ${a.date} · ${a.startTime}` : "Not assigned",
    },
    {
      key: "time",
      label: req.approvedSupports.includes("extra_time")
        ? "Extra time applied"
        : "Duration set",
      done: Boolean(a?.durationMin),
      required: true,
      detail: a
        ? `${a.durationMin} min${req.approvedSupports.includes("extra_time") ? ` (incl. +${Math.round(EXTRA_TIME_PCT * 100)}%)` : ""}`
        : "—",
    },
  ];

  if (roles.length) {
    const person = confirmedBooking
      ? state.people.find((p) => p.id === confirmedBooking.personId)
      : undefined;
    items.push({
      key: "human",
      label: `Human support booked & confirmed (${roles.join(", ")})`,
      done: Boolean(confirmedBooking),
      required: true,
      detail: person ? `${person.name} — confirmed` : "No confirmed booking",
    });
  }

  if (tools.length) {
    const ready = tools.every((t) => a?.tools.includes(t));
    items.push({
      key: "tools",
      label: "Assistive technology ready",
      done: ready,
      required: true,
      detail: tools.map((t) => supportMeta(t).label).join(", "),
    });
  }

  items.push({
    key: "docs",
    label: "Documentation verified",
    done: req.docs.every((d) => d.status === "verified"),
    required: true,
    detail: `${req.docs.filter((d) => d.status === "verified").length}/${req.docs.length} verified`,
  });

  if (req.approvedSupports.includes("ai_assistant") || policy.recordingRequired) {
    items.push({
      key: "audit",
      label: "Audit recording enabled",
      done:
        req.approvedSupports.includes("ai_assistant") ||
        Boolean(a?.bookingId),
      required: policy.recordingRequired,
      detail: policy.recordingRequired
        ? `${getPolicy(candidateCountry(req.candidateId)).country}: recording is mandatory`
        : "WortLaut logs every event",
    });
  }

  return items;
}

export function checklistComplete(
  state: WortLautState,
  req: AccommodationRequest,
): boolean {
  return buildChecklist(state, req)
    .filter((i) => i.required)
    .every((i) => i.done);
}

/** Why a person can't be booked for a date (empty array = bookable). */
export function bookingConflicts(
  state: WortLautState,
  person: SupportPerson,
  date: string,
  ignoreBookingId?: string,
): string[] {
  const reasons: string[] = [];
  if (person.training === "expired") reasons.push("Certification expired");
  if (person.unavailableDates.includes(date))
    reasons.push("Marked unavailable that day");
  const clash = state.bookings.find(
    (b) => b.personId === person.id && b.date === date && b.id !== ignoreBookingId,
  );
  if (clash) reasons.push("Already booked that day");
  return reasons;
}

/** People who could fill a role for a request: right role, certified, passes
 *  the grade rule, shares a language with the candidate, and is conflict-free
 *  on the assigned date (when one is set). */
export function eligiblePeople(
  state: WortLautState,
  req: AccommodationRequest,
  role: SupportRole,
): { person: SupportPerson; conflicts: string[] }[] {
  const cand = candidate(req.candidateId);
  const date = req.assignment?.date;
  return state.people
    .filter((p) => p.roles.includes(role))
    .filter((p) => p.languages.some((l) => cand.languages.includes(l)))
    .map((person) => ({
      person,
      conflicts: [
        ...(isEligible(person.grade, cand.grade)
          ? []
          : [`Grade rule: needs grade ≤ ${cand.grade - 1}`]),
        ...(date ? bookingConflicts(state, person, date) : []),
        ...(person.training === "expired" && date === undefined
          ? ["Certification expired"]
          : []),
      ],
    }))
    .sort((a, b) => {
      if (a.conflicts.length !== b.conflicts.length)
        return a.conflicts.length - b.conflicts.length;
      return b.person.rating - a.person.rating;
    });
}

/* --------------------------------- Context -------------------------------- */

interface StoreApi {
  state: WortLautState;
  hydrated: boolean;
  // Module 1 — accommodation lifecycle
  createRequest: (input: {
    candidateId: string;
    paperId: string;
    requestedSupports: SupportType[];
    notes: string;
  }) => string;
  approveRequest: (requestId: string, approvedSupports: SupportType[]) => void;
  assignRequest: (
    requestId: string,
    input: { room: string; date: string; startTime: string; tools: SupportType[] },
  ) => void;
  setDoc: (requestId: string, key: string, status: DocStatus) => void;
  markReady: (requestId: string) => { ok: boolean; error?: string };
  deleteRequest: (requestId: string) => void;
  // Module 2 — pool & bookings
  bookPerson: (
    requestId: string,
    personId: string,
    role: SupportRole,
  ) => { ok: boolean; error?: string };
  cancelBooking: (bookingId: string) => void;
  setAttendance: (bookingId: string, attendance: Attendance) => void;
  setUnavailable: (personId: string, date: string, unavailable: boolean) => void;
  // Module 3 — write the audit report back
  saveAudit: (requestId: string, report: AuditReport) => void;
  // utility
  resetDemo: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function WortLautProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WortLautState>(() => seedState());
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  // Load persisted state after mount (localStorage is client-only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WortLautState;
        if (parsed && parsed.requests && parsed.people && parsed.bookings) {
          setState(parsed);
        }
      }
    } catch {
      /* corrupt storage — fall back to the seed */
    }
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [state]);

  const updateRequest = useCallback(
    (id: string, fn: (r: AccommodationRequest) => AccommodationRequest) => {
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) => (r.id === id ? fn(r) : r)),
      }));
    },
    [],
  );

  const createRequest = useCallback<StoreApi["createRequest"]>((input) => {
    const id = newId("req");
    const country = candidateCountry(input.candidateId);
    const req: AccommodationRequest = {
      id,
      candidateId: input.candidateId,
      paperId: input.paperId,
      requestedSupports: input.requestedSupports,
      approvedSupports: [],
      status: "requested",
      assignment: null,
      docs: buildDocs(country, input.requestedSupports),
      notes: input.notes,
      createdAt: new Date().toISOString(),
      audit: null,
    };
    setState((s) => ({ ...s, requests: [req, ...s.requests] }));
    return id;
  }, []);

  const approveRequest = useCallback<StoreApi["approveRequest"]>(
    (requestId, approvedSupports) => {
      updateRequest(requestId, (r) => {
        const country = candidateCountry(r.candidateId);
        // Re-derive docs against the approved set (may add data-processing).
        const required = buildDocs(country, approvedSupports);
        const docs = required.map((d) => {
          const existing = r.docs.find((x) => x.key === d.key);
          return existing ? existing : d;
        });
        return {
          ...r,
          approvedSupports,
          docs,
          status: r.status === "requested" ? "approved" : r.status,
        };
      });
    },
    [updateRequest],
  );

  const assignRequest = useCallback<StoreApi["assignRequest"]>(
    (requestId, input) => {
      updateRequest(requestId, (r) => {
        const extra = r.approvedSupports.includes("extra_time");
        const assignment: Assignment = {
          room: input.room,
          date: input.date,
          startTime: input.startTime,
          durationMin: durationWithExtra(r.paperId, extra),
          tools: input.tools,
          bookingId: r.assignment?.bookingId ?? null,
        };
        return {
          ...r,
          assignment,
          status:
            r.status === "approved" || r.status === "requested"
              ? "assigned"
              : r.status,
        };
      });
    },
    [updateRequest],
  );

  const setDoc = useCallback<StoreApi["setDoc"]>(
    (requestId, key, status) => {
      updateRequest(requestId, (r) => ({
        ...r,
        docs: r.docs.map((d) => (d.key === key ? { ...d, status } : d)),
      }));
    },
    [updateRequest],
  );

  const bookPerson = useCallback<StoreApi["bookPerson"]>(
    (requestId, personId, role) => {
      let result: { ok: boolean; error?: string } = { ok: true };
      setState((s) => {
        const req = s.requests.find((r) => r.id === requestId);
        const person = s.people.find((p) => p.id === personId);
        if (!req || !person) {
          result = { ok: false, error: "Request or person not found." };
          return s;
        }
        if (!req.assignment?.date) {
          result = { ok: false, error: "Assign a date before booking support." };
          return s;
        }
        const cand = candidate(req.candidateId);
        if (!isEligible(person.grade, cand.grade)) {
          result = {
            ok: false,
            error: `Grade rule: scribe must be grade ≤ ${cand.grade - 1}.`,
          };
          return s;
        }
        const conflicts = bookingConflicts(s, person, req.assignment.date);
        if (conflicts.length) {
          result = { ok: false, error: conflicts.join("; ") };
          return s;
        }
        // Replace any existing booking for this request.
        const bookings = s.bookings.filter((b) => b.requestId !== requestId);
        const booking: Booking = {
          id: newId("bk"),
          personId,
          requestId,
          role,
          date: req.assignment.date,
          startTime: req.assignment.startTime,
          durationMin: req.assignment.durationMin,
          attendance: "pending",
        };
        return {
          ...s,
          bookings: [...bookings, booking],
          requests: s.requests.map((r) =>
            r.id === requestId
              ? { ...r, assignment: { ...r.assignment!, bookingId: booking.id } }
              : r,
          ),
        };
      });
      return result;
    },
    [],
  );

  const cancelBooking = useCallback<StoreApi["cancelBooking"]>((bookingId) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.filter((b) => b.id !== bookingId),
      requests: s.requests.map((r) =>
        r.assignment?.bookingId === bookingId
          ? { ...r, assignment: { ...r.assignment, bookingId: null } }
          : r,
      ),
    }));
  }, []);

  const setAttendance = useCallback<StoreApi["setAttendance"]>(
    (bookingId, attendance) => {
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === bookingId ? { ...b, attendance } : b,
        ),
      }));
    },
    [],
  );

  const setUnavailable = useCallback<StoreApi["setUnavailable"]>(
    (personId, date, unavailable) => {
      setState((s) => ({
        ...s,
        people: s.people.map((p) => {
          if (p.id !== personId) return p;
          const set = new Set(p.unavailableDates);
          if (unavailable) set.add(date);
          else set.delete(date);
          return { ...p, unavailableDates: [...set].sort() };
        }),
      }));
    },
    [],
  );

  const markReady = useCallback<StoreApi["markReady"]>(
    (requestId) => {
      let result: { ok: boolean; error?: string } = { ok: true };
      setState((s) => {
        const req = s.requests.find((r) => r.id === requestId);
        if (!req) return s;
        if (!checklistComplete(s, req)) {
          result = {
            ok: false,
            error: "Complete every required checklist item first.",
          };
          return s;
        }
        return {
          ...s,
          requests: s.requests.map((r) =>
            r.id === requestId ? { ...r, status: "ready" } : r,
          ),
        };
      });
      return result;
    },
    [],
  );

  const deleteRequest = useCallback<StoreApi["deleteRequest"]>((requestId) => {
    setState((s) => ({
      ...s,
      requests: s.requests.filter((r) => r.id !== requestId),
      bookings: s.bookings.filter((b) => b.requestId !== requestId),
    }));
  }, []);

  const saveAudit = useCallback<StoreApi["saveAudit"]>(
    (requestId, report) => {
      updateRequest(requestId, (r) => ({
        ...r,
        audit: report,
        status: "completed",
      }));
    },
    [updateRequest],
  );

  const resetDemo = useCallback(() => {
    setState(seedState());
  }, []);

  const value = useMemo<StoreApi>(
    () => ({
      state,
      hydrated,
      createRequest,
      approveRequest,
      assignRequest,
      setDoc,
      markReady,
      deleteRequest,
      bookPerson,
      cancelBooking,
      setAttendance,
      setUnavailable,
      saveAudit,
      resetDemo,
    }),
    [
      state,
      hydrated,
      createRequest,
      approveRequest,
      assignRequest,
      setDoc,
      markReady,
      deleteRequest,
      bookPerson,
      cancelBooking,
      setAttendance,
      setUnavailable,
      saveAudit,
      resetDemo,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useWortLaut(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx)
    throw new Error("useWortLaut must be used within <WortLautProvider>");
  return ctx;
}

export { STATUS_ORDER } from "./types";
