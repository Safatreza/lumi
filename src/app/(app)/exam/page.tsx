"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Mic,
  Square,
  Volume2,
  Repeat,
  SkipBack,
  SkipForward,
  Timer,
  Download,
  ShieldCheck,
  TriangleAlert,
  Send,
  Loader2,
  Play,
  ScrollText,
  CircleDot,
} from "lucide-react";
import { speak, stopSpeaking, ttsSupported } from "@/lib/tts";
import { MicRecorder, transcribe } from "@/lib/ml/speech";
import { PAPERS, getPaper } from "@/lib/exam/data";
import { getPolicy } from "@/lib/exam/policy";
import {
  STUDENTS,
  EU_LANGUAGES,
  getCity,
  getCountry,
  getEULanguage,
  flagEmoji,
} from "@/lib/scribe/data";

interface LogEntry {
  t: string;
  type: "info" | "dictation" | "command" | "assistant" | "flag";
  text: string;
}

/** Extra time applied on top of the paper duration (accommodation). */
const EXTRA_TIME = 0.25;

/** Map a transcribed utterance to an approved voice command. */
function matchCommand(
  text: string,
): "repeat" | "slower" | "next" | "prev" | "readback" | "time" | null {
  const t = text.toLowerCase();
  if (/(slow|langsam)/.test(t)) return "slower";
  if (/(repeat|again|wiederhol|noch ?mal|re-?read)/.test(t)) return "repeat";
  if (/(next|nächste|weiter)/.test(t)) return "next";
  if (/(previous|back|zurück|vorherige)/.test(t)) return "prev";
  if (/(my answer|read.*answer|antwort.*vorlesen|vorlesen.*antwort)/.test(t))
    return "readback";
  if (/(time|zeit|how long|wie lange)/.test(t)) return "time";
  return null;
}

export default function ExamPage() {
  // Setup
  const [studentId, setStudentId] = useState("s1");
  const [paperId, setPaperId] = useState(PAPERS[0].id);
  const [language, setLanguage] = useState("en");
  const [started, setStarted] = useState(false);

  // Session
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [dictating, setDictating] = useState(false);
  const [commandMode, setCommandMode] = useState(false);
  const [askInput, setAskInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [reply, setReply] = useState<{ text: string; flagged: boolean } | null>(
    null,
  );

  const recorderRef = useRef<MicRecorder | null>(null);
  const logRef = useRef<HTMLOListElement>(null);

  const student = STUDENTS.find((s) => s.id === studentId) ?? STUDENTS[0];
  const paper = getPaper(paperId);
  const country = getCity(student.city).country;
  const policy = getPolicy(country);
  const question = paper.questions[qIndex];
  const totalSeconds = Math.round(paper.durationMin * 60 * (1 + EXTRA_TIME));
  const flags = log.filter((l) => l.type === "flag").length;

  function addLog(type: LogEntry["type"], text: string) {
    setLog((prev) => [
      ...prev,
      { t: new Date().toISOString().slice(11, 19), type, text },
    ]);
  }

  // Countdown
  useEffect(() => {
    if (!started) return;
    const id = setInterval(
      () => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, [started]);

  // Keep the audit log scrolled to the latest entry
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  const minutesLeft = Math.ceil(secondsLeft / 60);
  const clock = `${String(Math.floor(secondsLeft / 3600)).padStart(2, "0")}:${String(
    Math.floor((secondsLeft % 3600) / 60),
  ).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  function begin() {
    setStarted(true);
    setSecondsLeft(totalSeconds);
    setQIndex(0);
    setAnswers({});
    setLog([]);
    addLog(
      "info",
      `Session started — ${student.name}, ${paper.title} (grade ${paper.grade}), ${getCountry(country)?.name} rules, +${EXTRA_TIME * 100}% extra time.`,
    );
    readQuestion(0, 0.98, true);
  }

  function readQuestion(index = qIndex, rate = 0.98, silentLog = false) {
    const q = paper.questions[index];
    const intro = `Question ${q.n}, ${q.points} points. ${q.text}`;
    if (ttsSupported()) speak(intro, getEULanguage(paper.language).code, rate);
    if (!silentLog) addLog("command", `Question ${q.n} read aloud${rate < 0.9 ? " (slower)" : ""}.`);
    else addLog("info", `Question ${q.n} read aloud.`);
  }

  function go(delta: number) {
    stopSpeaking();
    const next = Math.min(Math.max(qIndex + delta, 0), paper.questions.length - 1);
    if (next !== qIndex) {
      setQIndex(next);
      addLog("command", `Moved to question ${paper.questions[next].n}.`);
      readQuestion(next, 0.98, true);
    }
  }

  function readAnswerBack() {
    const a = answers[question.n]?.trim();
    if (!a) {
      speak("Your answer is still empty.", getEULanguage(language).code);
      addLog("command", `Read-back requested for question ${question.n} — answer empty.`);
      return;
    }
    speak(`Your answer so far: ${a}`, getEULanguage(paper.language).code);
    addLog("command", `Answer for question ${question.n} read back verbatim.`);
  }

  function sayTime() {
    speak(`${minutesLeft} minutes remaining.`, getEULanguage(language).code);
    addLog("command", `Time announced: ${minutesLeft} minutes remaining.`);
  }

  function runCommand(cmd: NonNullable<ReturnType<typeof matchCommand>>) {
    if (cmd === "repeat") readQuestion();
    else if (cmd === "slower") readQuestion(qIndex, 0.7);
    else if (cmd === "next") go(1);
    else if (cmd === "prev") go(-1);
    else if (cmd === "readback") readAnswerBack();
    else if (cmd === "time") sayTime();
  }

  /** Mic flow: dictation appends to the answer; command mode runs approved
   *  voice commands, falling back to the integrity-guarded assistant. */
  async function toggleMic(asCommand: boolean) {
    if (dictating) {
      setDictating(false);
      setStatus("Transcribing…");
      try {
        const blob = await recorderRef.current!.stop();
        const text = await transcribe(blob, (info) => {
          if (info.status === "progress" && info.progress)
            setStatus(`Loading voice model… ${Math.round(info.progress)}%`);
        });
        setStatus(null);
        if (!text) return;
        if (commandMode) {
          const cmd = matchCommand(text);
          if (cmd) {
            addLog("command", `Voice command: "${text}" → ${cmd}.`);
            runCommand(cmd);
          } else {
            addLog("command", `Voice request: "${text}" → sent to assistant.`);
            await ask(text);
          }
        } else {
          setAnswers((prev) => ({
            ...prev,
            [question.n]: (prev[question.n] ? prev[question.n] + " " : "") + text,
          }));
          addLog("dictation", `Q${question.n} dictation: "${text}"`);
        }
      } catch {
        setStatus("Couldn't transcribe — check mic permission.");
        setTimeout(() => setStatus(null), 2500);
      }
      return;
    }

    if (!MicRecorder.supported()) {
      setStatus("Voice input isn't supported on this browser.");
      setTimeout(() => setStatus(null), 2500);
      return;
    }
    try {
      stopSpeaking();
      recorderRef.current = new MicRecorder();
      await recorderRef.current.start();
      setCommandMode(asCommand);
      setDictating(true);
    } catch {
      setStatus("Microphone permission denied.");
      setTimeout(() => setStatus(null), 2500);
    }
  }

  async function ask(text?: string) {
    const utterance = (text ?? askInput).trim();
    if (!utterance || asking) return;
    setAskInput("");
    setAsking(true);
    setReply(null);
    if (!text) addLog("command", `Typed request: "${utterance}" → sent to assistant.`);
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utterance,
          language,
          question: `Question ${question.n} (${question.points} points): ${question.text}`,
          answer: answers[question.n] ?? "",
          minutesLeft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assistant unavailable");
      setReply({ text: data.reply, flagged: data.flagged });
      if (data.flagged) {
        addLog(
          "flag",
          `INTEGRITY: request for academic help refused — "${utterance}"`,
        );
      } else {
        addLog("assistant", `Assistant: ${data.reply}`);
      }
      if (ttsSupported()) speak(data.reply, getEULanguage(language).code);
    } catch (err) {
      setReply({
        text: err instanceof Error ? err.message : "Assistant unavailable.",
        flagged: false,
      });
    } finally {
      setAsking(false);
    }
  }

  function downloadLog() {
    const report = {
      platform: "WortLaut",
      session: {
        candidate: student.name,
        accommodation: student.accommodation,
        institution: student.institution,
        paper: paper.title,
        grade: paper.grade,
        countryRules: getCountry(country)?.name,
        extraTime: `+${EXTRA_TIME * 100}%`,
        integrityFlags: flags,
        exportedAt: new Date().toISOString(),
      },
      answers,
      auditTrail: log,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wortlaut-audit-${student.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("info", "Audit report exported.");
  }

  /* -------------------------------- Setup ------------------------------- */
  if (!started) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-6 sm:px-5">
        <div className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{
              background:
                "color-mix(in srgb, var(--color-brand) 12%, transparent)",
              color: "var(--color-brand)",
            }}
          >
            <Mic size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Exam room</h1>
            <p className="text-xs text-muted">
              The exam-safe AI assistant — reads, transcribes, never helps
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <label htmlFor="ex-candidate" className="block text-xs font-semibold text-muted">
            Candidate
          </label>
          <select
            id="ex-candidate"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          >
            {STUDENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — grade {s.grade}, {s.city} ({s.accommodation})
              </option>
            ))}
          </select>

          <label htmlFor="ex-paper" className="mt-3 block text-xs font-semibold text-muted">
            Exam paper
          </label>
          <select
            id="ex-paper"
            value={paperId}
            onChange={(e) => setPaperId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          >
            {PAPERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — grade {p.grade}, {p.durationMin} min (
                {getEULanguage(p.language).label})
              </option>
            ))}
          </select>

          <label htmlFor="ex-lang" className="mt-3 block text-xs font-semibold text-muted">
            Assistant language
          </label>
          <select
            id="ex-lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          >
            {EU_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label} · {l.native}
              </option>
            ))}
          </select>

          {/* Country policy card */}
          <div className="mt-4 rounded-2xl border border-line bg-bg p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <ShieldCheck size={16} style={{ color: "var(--color-brand)" }} />
              {flagEmoji(country)} {getCountry(country)?.name} exam rules
              {policy.verified ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                  style={{ background: "var(--color-teacher)" }}
                >
                  Verified
                </span>
              ) : (
                <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  CRPD default
                </span>
              )}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted">
              <li>Appointed by: {policy.appointedBy}</li>
              {policy.rules.slice(0, 3).map((r) => (
                <li key={r}>{r}</li>
              ))}
              <li>Extra time: {policy.extraTime}</li>
              {policy.recordingRequired && (
                <li className="font-semibold text-ink">
                  Session recording is mandatory — WortLaut logs every event.
                </li>
              )}
            </ul>
          </div>

          <button
            onClick={begin}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white shadow-md transition-transform hover:scale-[1.01]"
            style={{ background: "var(--color-brand)" }}
          >
            <Play size={18} /> Start exam session
          </button>
          <p className="mt-2 text-center text-xs text-muted">
            Every event is logged to a tamper-evident audit trail your exam
            office can review.
          </p>
        </div>
      </div>
    );
  }

  /* ------------------------------- Session ------------------------------ */
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[1fr_330px]">
      <div className="space-y-4">
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-sm">
          <p className="text-sm font-semibold">
            {student.name} · {paper.title}
          </p>
          <div className="flex items-center gap-3 text-sm">
            <span
              className="inline-flex items-center gap-1.5 font-semibold"
              role="status"
              aria-label="Audit trail active"
            >
              <CircleDot
                size={13}
                className="animate-pulse"
                style={{ color: "var(--color-accent)" }}
              />
              Audit on
            </span>
            {flags > 0 && (
              <span
                className="inline-flex items-center gap-1 font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                <TriangleAlert size={14} /> {flags}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-sm font-semibold tabular-nums">
              <Timer size={14} /> {clock}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Question {question.n} of {paper.questions.length} ·{" "}
              {question.points} points
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => go(-1)}
                disabled={qIndex === 0}
                aria-label="Previous question"
                className="grid size-9 place-items-center rounded-xl border border-line text-muted hover:text-ink disabled:opacity-40"
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={() => go(1)}
                disabled={qIndex === paper.questions.length - 1}
                aria-label="Next question"
                className="grid size-9 place-items-center rounded-xl border border-line text-muted hover:text-ink disabled:opacity-40"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
          <p className="mt-3 text-lg font-medium leading-relaxed">
            {question.text}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => readQuestion()}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--color-brand)" }}
            >
              <Volume2 size={15} /> Read question
            </button>
            <button
              onClick={() => readQuestion(qIndex, 0.7)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-brand"
            >
              <Repeat size={15} /> Slower
            </button>
            <button
              onClick={readAnswerBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-brand"
            >
              <ScrollText size={15} /> Read my answer
            </button>
            <button
              onClick={sayTime}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-brand"
            >
              <Timer size={15} /> Time left
            </button>
          </div>
        </div>

        {/* Answer */}
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <label
              htmlFor="answer"
              className="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Your answer — dictate or type
            </label>
            <span className="text-xs text-muted">
              {(answers[question.n] ?? "").trim()
                ? `${(answers[question.n] ?? "").trim().split(/\s+/).length} words`
                : "empty"}
            </span>
          </div>
          <textarea
            id="answer"
            value={answers[question.n] ?? ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [question.n]: e.target.value }))
            }
            rows={5}
            placeholder="Press the microphone and speak your answer…"
            className="mt-2 w-full resize-none rounded-xl border border-line bg-bg px-3 py-2 text-[15px] leading-relaxed outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleMic(false)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
                dictating && !commandMode ? "animate-pulse" : ""
              }`}
              style={{
                background:
                  dictating && !commandMode
                    ? "var(--color-accent)"
                    : "var(--color-brand)",
              }}
            >
              {dictating && !commandMode ? (
                <>
                  <Square size={15} /> Stop dictation
                </>
              ) : (
                <>
                  <Mic size={15} /> Dictate answer
                </>
              )}
            </button>
            <button
              onClick={() => toggleMic(true)}
              className={`inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-brand ${
                dictating && commandMode ? "animate-pulse" : ""
              }`}
              style={
                dictating && commandMode
                  ? { background: "var(--color-accent)", color: "white" }
                  : undefined
              }
            >
              {dictating && commandMode ? (
                <>
                  <Square size={15} /> Stop command
                </>
              ) : (
                <>
                  <Mic size={15} /> Voice command
                </>
              )}
            </button>
            {status && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                <Loader2 size={13} className="animate-spin" /> {status}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">
            Approved commands: “repeat”, “slower”, “next”, “back”, “read my
            answer”, “how much time”. Anything else goes to the
            integrity-guarded assistant.
          </p>
        </div>

        {/* Ask the assistant */}
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Ask WortLaut — procedure only, never content
          </p>
          <div className="mt-2 flex items-end gap-2">
            <textarea
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
              rows={1}
              placeholder='Try: "can you repeat the question?" — or "what is the answer?" to see the guard refuse'
              className="max-h-28 flex-1 resize-none rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
            />
            <button
              onClick={() => ask()}
              disabled={asking || !askInput.trim()}
              aria-label="Send to assistant"
              className="grid size-10 shrink-0 place-items-center rounded-xl text-white disabled:opacity-40"
              style={{ background: "var(--color-brand)" }}
            >
              {asking ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          {reply && (
            <div
              role="status"
              className="mt-3 rounded-xl border px-3 py-2.5 text-sm"
              style={
                reply.flagged
                  ? {
                      borderColor: "var(--color-accent)",
                      background:
                        "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                    }
                  : { borderColor: "var(--color-line)" }
              }
            >
              {reply.flagged && (
                <p
                  className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
                  style={{ color: "var(--color-accent)" }}
                >
                  <TriangleAlert size={13} /> Refused & logged — integrity guard
                </p>
              )}
              {reply.text}
            </div>
          )}
        </div>
      </div>

      {/* Audit trail */}
      <div className="flex min-h-[50vh] flex-col rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <ShieldCheck size={16} style={{ color: "var(--color-brand)" }} />
            Audit trail
          </p>
          <button
            onClick={downloadLog}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted hover:text-ink"
          >
            <Download size={12} /> Export
          </button>
        </div>
        <ol
          ref={logRef}
          aria-live="polite"
          className="flex-1 space-y-1.5 overflow-y-auto p-3 text-xs"
          style={{ maxHeight: "calc(100dvh - 220px)" }}
        >
          {log.map((entry, i) => (
            <li
              key={i}
              className={`rounded-lg border px-2.5 py-1.5 ${
                entry.type === "flag" ? "font-semibold" : ""
              }`}
              style={
                entry.type === "flag"
                  ? {
                      borderColor: "var(--color-accent)",
                      color: "var(--color-accent)",
                      background:
                        "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                    }
                  : entry.type === "dictation"
                    ? {
                        borderColor:
                          "color-mix(in srgb, var(--color-teacher) 40%, transparent)",
                      }
                    : { borderColor: "var(--color-line)" }
              }
            >
              <span className="mr-1.5 font-mono text-[10px] text-muted">
                {entry.t}
              </span>
              {entry.text}
            </li>
          ))}
        </ol>
        <p className="border-t border-line px-4 py-2 text-[11px] text-muted">
          {policy.recordingRequired
            ? `${getCountry(country)?.name} requires recorded scribe sessions — this log is that record.`
            : "Every read, dictation, command, and refusal is timestamped for the exam office."}
        </p>
      </div>
    </div>
  );
}
