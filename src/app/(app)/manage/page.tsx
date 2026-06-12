"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Check,
  ShieldCheck,
  DoorOpen,
  FileCheck2,
  ListChecks,
  UserCheck,
  Ban,
  Trash2,
  ArrowRight,
  CircleAlert,
  Mic,
  X,
} from "lucide-react";
import { STUDENTS, getCountry, flagEmoji } from "@/lib/scribe/data";
import { PAPERS, getPaper } from "@/lib/exam/data";
import { getPolicy } from "@/lib/exam/policy";
import {
  useWortLaut,
  candidate,
  candidateCountry,
  neededHumanRoles,
  neededTools,
  eligiblePeople,
  buildChecklist,
  checklistComplete,
} from "@/lib/store/store";
import {
  SUPPORT_TYPES,
  SUPPORT_ROLE_LABEL,
  STATUS_ORDER,
  STATUS_LABEL,
  supportMeta,
  type AccommodationRequest,
  type DocStatus,
  type RequestStatus,
  type SupportType,
} from "@/lib/store/types";

const STATUS_COLOR: Record<RequestStatus, string> = {
  requested: "var(--color-textbook)",
  approved: "var(--color-scribe)",
  assigned: "var(--color-brand)",
  ready: "var(--color-teacher)",
  completed: "var(--color-muted)",
};

export default function ManagePage() {
  const { state, createRequest } = useWortLaut();
  const [selectedId, setSelectedId] = useState<string | null>(
    state.requests[0]?.id ?? null,
  );
  const [creating, setCreating] = useState(false);

  const selected =
    state.requests.find((r) => r.id === selectedId) ?? state.requests[0] ?? null;

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[320px_1fr]">
      {/* List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{
              background: "color-mix(in srgb, var(--color-brand) 12%, transparent)",
              color: "var(--color-brand)",
            }}
          >
            <ClipboardList size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Accommodation Manager</h1>
            <p className="text-xs text-muted">Request → approve → assign → checklist</p>
          </div>
        </div>

        <button
          onClick={() => {
            setCreating(true);
          }}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          style={{ background: "var(--color-brand)" }}
        >
          <Plus size={16} /> New accommodation request
        </button>

        <ul className="space-y-2">
          {state.requests.map((r) => {
            const cand = candidate(r.candidateId);
            const active = r.id === selected?.id && !creating;
            return (
              <li key={r.id}>
                <button
                  onClick={() => {
                    setSelectedId(r.id);
                    setCreating(false);
                  }}
                  className={`w-full rounded-2xl border bg-surface p-3 text-left shadow-sm transition-colors ${
                    active ? "border-brand" : "border-line hover:border-brand"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold">{cand.name}</p>
                    <StatusPill status={r.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {flagEmoji(candidateCountry(r.candidateId))} {getPaper(r.paperId).title}
                  </p>
                </button>
              </li>
            );
          })}
          {state.requests.length === 0 && (
            <li className="rounded-2xl border border-line bg-surface p-4 text-center text-sm text-muted">
              No requests yet.
            </li>
          )}
        </ul>
      </div>

      {/* Detail / Create */}
      <div className="min-w-0">
        {creating ? (
          <CreateForm
            onCancel={() => setCreating(false)}
            onCreate={(input) => {
              const id = createRequest(input);
              setSelectedId(id);
              setCreating(false);
            }}
          />
        ) : selected ? (
          <RequestDetail key={selected.id} req={selected} />
        ) : (
          <div className="grid min-h-64 place-items-center rounded-3xl border border-line bg-surface p-6 text-center text-muted shadow-sm">
            Create a request to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
      style={{ background: STATUS_COLOR[status] }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ------------------------------- Detail ----------------------------------- */

function RequestDetail({ req }: { req: AccommodationRequest }) {
  const { deleteRequest } = useWortLaut();
  const cand = candidate(req.candidateId);
  const paper = getPaper(req.paperId);
  const country = candidateCountry(req.candidateId);
  const policy = getPolicy(country);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold">{cand.name}</p>
            <p className="text-sm text-muted">
              {paper.title} · grade {paper.grade} · {cand.institution}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {flagEmoji(country)} {getCountry(country)?.name} · exam {cand.examDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={req.status} />
            <button
              onClick={() => deleteRequest(req.id)}
              aria-label="Delete request"
              className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-ink"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Pipeline */}
        <div className="mt-4 flex items-center gap-1">
          {STATUS_ORDER.map((s, i) => {
            const reached = STATUS_ORDER.indexOf(req.status) >= i;
            return (
              <div key={s} className="flex flex-1 items-center gap-1">
                <div
                  className="flex-1 rounded-full py-1 text-center text-[10px] font-semibold uppercase tracking-wide"
                  style={
                    reached
                      ? { background: STATUS_COLOR[req.status], color: "white" }
                      : { background: "var(--color-bg)", color: "var(--color-muted)", border: "1px solid var(--color-line)" }
                  }
                >
                  {STATUS_LABEL[s]}
                </div>
              </div>
            );
          })}
        </div>

        {req.notes && <p className="mt-3 text-sm text-muted">{req.notes}</p>}

        {/* Country policy */}
        <div className="mt-3 rounded-2xl border border-line bg-bg p-3 text-xs">
          <p className="flex items-center gap-1.5 font-bold">
            <ShieldCheck size={14} style={{ color: "var(--color-brand)" }} />
            {getCountry(country)?.name} rules
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={
                policy.verified
                  ? { background: "var(--color-teacher)", color: "white" }
                  : { border: "1px solid var(--color-line)", color: "var(--color-muted)" }
              }
            >
              {policy.verified ? "Verified" : "CRPD default"}
            </span>
          </p>
          <p className="mt-1 text-muted">
            Appointed by {policy.appointedBy}. Extra time: {policy.extraTime}.
            {policy.recordingRequired && (
              <span className="font-semibold text-ink"> Session recording is mandatory.</span>
            )}
          </p>
        </div>
      </div>

      <ApprovePanel req={req} />
      {req.approvedSupports.length > 0 && <AssignPanel req={req} />}
      {req.assignment && neededHumanRoles(req).length > 0 && <BookingPanel req={req} />}
      <DocsPanel req={req} />
      <ChecklistPanel req={req} />
    </div>
  );
}

/* ------------------------------ Approve ----------------------------------- */

function ApprovePanel({ req }: { req: AccommodationRequest }) {
  const { approveRequest } = useWortLaut();
  const initial = req.approvedSupports.length ? req.approvedSupports : req.requestedSupports;
  const [picked, setPicked] = useState<Set<SupportType>>(new Set(initial));

  function toggle(t: SupportType) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <Panel icon={<FileCheck2 size={16} />} title="1 · Approve support types">
      <p className="text-xs text-muted">
        Requested: {req.requestedSupports.map((s) => supportMeta(s).label).join(", ")}
      </p>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {SUPPORT_TYPES.map((m) => {
          const on = picked.has(m.id);
          const requested = req.requestedSupports.includes(m.id);
          return (
            <label
              key={m.id}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                on ? "border-brand" : "border-line"
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(m.id)}
                className="size-4 accent-current"
              />
              <span className="font-medium">{m.label}</span>
              {requested && (
                <span className="ml-auto text-[10px] font-semibold uppercase text-muted">
                  requested
                </span>
              )}
            </label>
          );
        })}
      </div>
      <button
        onClick={() => approveRequest(req.id, [...picked])}
        disabled={picked.size === 0}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        style={{ background: "var(--color-brand)" }}
      >
        <Check size={15} /> {req.approvedSupports.length ? "Update approval" : "Approve supports"}
      </button>
    </Panel>
  );
}

/* ------------------------------ Assign ------------------------------------ */

function AssignPanel({ req }: { req: AccommodationRequest }) {
  const { assignRequest } = useWortLaut();
  const cand = candidate(req.candidateId);
  const toolTypes = neededTools(req);

  const [room, setRoom] = useState(req.assignment?.room ?? "");
  const [date, setDate] = useState(req.assignment?.date ?? cand.examDate);
  const [startTime, setStartTime] = useState(req.assignment?.startTime ?? "09:00");
  const [tools, setTools] = useState<Set<SupportType>>(
    new Set(req.assignment?.tools ?? toolTypes),
  );

  function toggleTool(t: SupportType) {
    setTools((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <Panel icon={<DoorOpen size={16} />} title="2 · Assign room, time & tools">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="block text-xs font-semibold text-muted">Room</label>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g. Room A-12 (separate)"
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted">Start</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted">Duration</label>
          <p className="mt-1 rounded-xl border border-line bg-bg px-3 py-2 text-sm text-muted">
            {getPaper(req.paperId).durationMin}
            {req.approvedSupports.includes("extra_time") ? " → +25%" : " min"}
          </p>
        </div>
      </div>

      {toolTypes.length > 0 && (
        <>
          <p className="mt-3 text-xs font-semibold text-muted">Assistive technology to ready</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {toolTypes.map((t) => {
              const on = tools.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTool(t)}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={
                    on
                      ? { background: "var(--color-brand)", color: "white", borderColor: "var(--color-brand)" }
                      : { borderColor: "var(--color-line)", color: "var(--color-muted)" }
                  }
                >
                  {on && <Check size={12} />} {supportMeta(t).label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <button
        onClick={() => assignRequest(req.id, { room, date, startTime, tools: [...tools] })}
        disabled={!room || !date || !startTime}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        style={{ background: "var(--color-brand)" }}
      >
        <Check size={15} /> {req.assignment ? "Update assignment" : "Save assignment"}
      </button>
    </Panel>
  );
}

/* ------------------------------ Booking ----------------------------------- */

function BookingPanel({ req }: { req: AccommodationRequest }) {
  const { state, bookPerson, cancelBooking } = useWortLaut();
  const [error, setError] = useState<string | null>(null);
  const roles = neededHumanRoles(req);
  const booking = state.bookings.find((b) => b.id === req.assignment?.bookingId);
  const bookedPerson = booking ? state.people.find((p) => p.id === booking.personId) : null;

  return (
    <Panel icon={<UserCheck size={16} />} title="3 · Book human support">
      {bookedPerson && booking ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-bg p-3">
          <div>
            <p className="text-sm font-bold">
              {bookedPerson.name}{" "}
              <span className="font-normal text-muted">· {SUPPORT_ROLE_LABEL[booking.role]}</span>
            </p>
            <p className="text-xs text-muted">
              {booking.date} · {booking.startTime} · grade {bookedPerson.grade} · ★ {bookedPerson.rating.toFixed(1)}
            </p>
          </div>
          <button
            onClick={() => cancelBooking(booking.id)}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
          >
            <X size={13} /> Cancel booking
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted">
            Eligible {roles.map((r) => SUPPORT_ROLE_LABEL[r].toLowerCase()).join(" / ")} — sorted by
            fit. The grade rule, training, language and date conflicts are checked automatically.
          </p>
          {error && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
              <CircleAlert size={13} /> {error}
            </p>
          )}
          <ul className="mt-2 space-y-1.5">
            {eligiblePeople(state, req, roles[0])
              .slice(0, 8)
              .map(({ person, conflicts }) => {
                const blocked = conflicts.length > 0;
                return (
                  <li
                    key={person.id}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                      blocked ? "border-line opacity-70" : "border-line"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {person.name}{" "}
                        <span className="font-normal text-muted">
                          · grade {person.grade} · {person.city} · ★ {person.rating.toFixed(1)}
                        </span>
                      </p>
                      {blocked && (
                        <p className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-accent)" }}>
                          <Ban size={12} /> {conflicts.join(" · ")}
                        </p>
                      )}
                    </div>
                    <button
                      disabled={blocked}
                      onClick={() => {
                        const res = bookPerson(req.id, person.id, roles[0]);
                        setError(res.ok ? null : res.error ?? "Could not book.");
                      }}
                      className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                      style={{ background: "var(--color-scribe)" }}
                    >
                      Book
                    </button>
                  </li>
                );
              })}
          </ul>
        </>
      )}
    </Panel>
  );
}

/* -------------------------------- Docs ------------------------------------ */

const DOC_STATUSES: DocStatus[] = ["missing", "submitted", "verified"];
const DOC_LABEL: Record<DocStatus, string> = {
  missing: "Missing",
  submitted: "Submitted",
  verified: "Verified",
};

function DocsPanel({ req }: { req: AccommodationRequest }) {
  const { setDoc } = useWortLaut();
  return (
    <Panel icon={<FileCheck2 size={16} />} title="4 · Documentation">
      <ul className="space-y-1.5">
        {req.docs.map((d) => (
          <li key={d.key} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm">{d.label}</span>
            <select
              value={d.status}
              onChange={(e) => setDoc(req.id, d.key, e.target.value as DocStatus)}
              className="rounded-lg border border-line bg-bg px-2.5 py-1 text-xs font-semibold outline-none"
              style={
                d.status === "verified"
                  ? { color: "var(--color-teacher)" }
                  : d.status === "missing"
                    ? { color: "var(--color-accent)" }
                    : undefined
              }
            >
              {DOC_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {DOC_LABEL[s]}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------ Checklist --------------------------------- */

function ChecklistPanel({ req }: { req: AccommodationRequest }) {
  const { state, markReady } = useWortLaut();
  const [error, setError] = useState<string | null>(null);
  const items = buildChecklist(state, req);
  const complete = checklistComplete(state, req);
  const aiApproved = req.approvedSupports.includes("ai_assistant");

  return (
    <Panel icon={<ListChecks size={16} />} title="5 · Exam-day checklist">
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it.key} className="flex items-start gap-2">
            <span
              className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full"
              style={
                it.done
                  ? { background: "var(--color-teacher)", color: "white" }
                  : { border: `1.5px solid ${it.required ? "var(--color-accent)" : "var(--color-line)"}` }
              }
            >
              {it.done && <Check size={11} />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {it.label}
                {!it.required && <span className="ml-1 text-xs text-muted">(optional)</span>}
              </p>
              {it.detail && <p className="text-xs text-muted">{it.detail}</p>}
            </div>
          </li>
        ))}
      </ul>

      {error && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
          <CircleAlert size={13} /> {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {req.status !== "ready" && req.status !== "completed" && (
          <button
            onClick={() => {
              const res = markReady(req.id);
              setError(res.ok ? null : res.error ?? null);
            }}
            disabled={!complete}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--color-teacher)" }}
          >
            <Check size={15} /> Mark ready for exam day
          </button>
        )}
        {(req.status === "ready" || req.status === "completed") && aiApproved && (
          <Link
            href="/exam"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--color-brand)" }}
          >
            <Mic size={15} /> Open in Exam Room <ArrowRight size={15} />
          </Link>
        )}
      </div>

      {req.audit && (
        <div className="mt-3 rounded-xl border border-line bg-bg p-3 text-xs">
          <p className="font-bold">Audit / provenance report attached</p>
          <p className="mt-0.5 text-muted">
            {req.audit.events} events · {req.audit.integrityFlags} integrity flag
            {req.audit.integrityFlags === 1 ? "" : "s"} · exported{" "}
            {new Date(req.audit.exportedAt).toLocaleString()}
          </p>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------- Shell ------------------------------------ */

function Panel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
      <h2 className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--color-brand)" }}>
        {icon}
        <span className="text-ink">{title}</span>
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* ------------------------------ Create form ------------------------------- */

function CreateForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (input: {
    candidateId: string;
    paperId: string;
    requestedSupports: SupportType[];
    notes: string;
  }) => void;
}) {
  const [candidateId, setCandidateId] = useState(STUDENTS[0].id);
  const [paperId, setPaperId] = useState(PAPERS[0].id);
  const [supports, setSupports] = useState<Set<SupportType>>(
    new Set<SupportType>(["ai_assistant", "extra_time"]),
  );
  const [notes, setNotes] = useState("");

  const cand = useMemo(() => candidate(candidateId), [candidateId]);

  function toggle(t: SupportType) {
    setSupports((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">New accommodation request</h2>
        <button onClick={onCancel} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-ink">
          <X size={14} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-muted">Candidate</label>
          <select
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
          >
            {STUDENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — grade {s.grade}, {s.city} ({s.accommodation})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted">Exam paper</label>
          <select
            value={paperId}
            onChange={(e) => setPaperId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
          >
            {PAPERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — grade {p.grade}, {p.durationMin} min
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-xs font-semibold text-muted">
        Requested supports for {cand.name}
      </p>
      <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
        {SUPPORT_TYPES.map((m) => {
          const on = supports.has(m.id);
          return (
            <label
              key={m.id}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                on ? "border-brand" : "border-line"
              }`}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(m.id)} className="size-4 accent-current" />
              <span className="font-medium">{m.label}</span>
            </label>
          );
        })}
      </div>

      <label className="mt-3 block text-xs font-semibold text-muted">Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Context for the exam office…"
        className="mt-1 w-full resize-none rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
      />

      <div className="mt-4 flex gap-2">
        <button
          onClick={() =>
            onCreate({ candidateId, paperId, requestedSupports: [...supports], notes })
          }
          disabled={supports.size === 0}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--color-brand)" }}
        >
          <Plus size={15} /> Create request
        </button>
        <button
          onClick={onCancel}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
