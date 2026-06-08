"use client";

import { useState } from "react";
import {
  Presentation,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Wand2,
} from "lucide-react";
import Markdown from "@/components/Markdown";
import LanguageSelect from "@/components/LanguageSelect";
import { streamPost } from "@/lib/stream-client";

const CONTENT_TYPES = [
  { id: "lesson", label: "Lesson plan" },
  { id: "quiz", label: "Quiz" },
  { id: "worksheet", label: "Worksheet" },
  { id: "flashcards", label: "Flashcards" },
  { id: "explain", label: "Simple explanation" },
];

const GRADES = [
  "primary school",
  "middle school",
  "secondary school",
  "university",
];

export default function TeacherPage() {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("middle school");
  const [language, setLanguage] = useState("en");
  const [contentType, setContentType] = useState("lesson");
  const [region, setRegion] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!topic.trim() || loading) return;
    setOutput("");
    setLoading(true);
    try {
      await streamPost(
        "/api/generate",
        { topic, grade, language, contentType, region },
        (_chunk, full) => setOutput(full),
      );
    } catch (err) {
      setOutput(`⚠️ ${err instanceof Error ? err.message : "Failed."}`);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[360px_1fr]">
      {/* Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{
              background: "color-mix(in srgb, var(--color-teacher) 12%, transparent)",
              color: "var(--color-teacher)",
            }}
          >
            <Presentation size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Teacher</h1>
            <p className="text-xs text-muted">Localized materials in seconds</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <label className="block text-xs font-semibold text-muted">Topic</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            placeholder="e.g. The water cycle"
            className="mt-1 w-full resize-none rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none focus:border-teal-500"
          />

          <label className="mt-3 block text-xs font-semibold text-muted">
            What to make
          </label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {CONTENT_TYPES.map((c) => (
              <button
                key={c.id}
                onClick={() => setContentType(c.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  contentType === c.id
                    ? "text-white"
                    : "border border-line bg-bg text-muted hover:text-ink"
                }`}
                style={
                  contentType === c.id
                    ? { background: "var(--color-teacher)" }
                    : undefined
                }
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="mt-3 block text-xs font-semibold text-muted">
            Grade level
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] capitalize outline-none"
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <label className="mt-3 block text-xs font-semibold text-muted">
            Region / context{" "}
            <span className="font-normal">(optional)</span>
          </label>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. rural Kenya"
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
          />

          <div className="mt-4 flex items-center justify-between gap-2">
            <LanguageSelect value={language} onChange={setLanguage} />
            <button
              onClick={generate}
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-teacher)" }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Wand2 size={16} />
              )}
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
        {output ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Generated material
              </span>
              <button
                onClick={copy}
                className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted hover:text-ink"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <Markdown>{output}</Markdown>
            {loading && <span className="lumi-caret" />}
          </>
        ) : (
          <div className="grid h-full min-h-64 place-items-center text-center">
            <div>
              <Sparkles
                className="mx-auto mb-3"
                style={{ color: "var(--color-teacher)" }}
              />
              <p className="font-semibold">Your material appears here</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                Pick a topic and what to make. Lumi writes it in your chosen
                language with locally relevant examples.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
