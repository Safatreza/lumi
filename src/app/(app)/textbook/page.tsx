"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Camera,
  ClipboardPaste,
  Loader2,
  Send,
  Sparkles,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import Markdown from "@/components/Markdown";
import LanguageSelect from "@/components/LanguageSelect";
import { streamPost } from "@/lib/stream-client";
import { runOCR } from "@/lib/ml/ocr";
import { extractPdfText } from "@/lib/ml/pdf";
import {
  embed,
  chunkText,
  topK,
  type Chunk,
} from "@/lib/ml/embeddings";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

type Tab = "paste" | "pdf" | "photo";

export default function TextbookPage() {
  const [tab, setTab] = useState<Tab>("paste");
  const [rawText, setRawText] = useState("");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  async function onPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setStatus("Extracting PDF text…");
      const text = await extractPdfText(file, (p) =>
        setStatus(`Extracting PDF text… ${p}%`),
      );
      setRawText((prev) => (prev ? prev + "\n\n" : "") + text);
      setStatus(null);
    } catch {
      setStatus("Couldn't read that PDF.");
      setTimeout(() => setStatus(null), 2500);
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setStatus("Reading photo…");
      const text = await runOCR(file, (p) => setStatus(`Reading photo… ${p}%`));
      setRawText((prev) => (prev ? prev + "\n\n" : "") + text);
      setStatus(null);
    } catch {
      setStatus("Couldn't read that photo.");
      setTimeout(() => setStatus(null), 2500);
    }
  }

  async function indexMaterial() {
    if (!rawText.trim() || busy) return;
    setBusy(true);
    setMessages([]);
    try {
      const pieces = chunkText(rawText);
      setStatus(`Understanding material… (0/${pieces.length})`);
      const vectors = await embed(pieces, (info) => {
        if (info.status === "progress" && info.progress) {
          setStatus(`Loading reading model… ${Math.round(info.progress)}%`);
        }
      });
      const built: Chunk[] = pieces.map((text, i) => ({
        text,
        vector: vectors[i],
      }));
      setChunks(built);
      setStatus(null);
    } catch (err) {
      setStatus(
        `Indexing failed: ${err instanceof Error ? err.message : "error"}`,
      );
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setBusy(false);
    }
  }

  async function ask(text?: string) {
    const q = (text ?? question).trim();
    if (!q || streaming || chunks.length === 0) return;
    setQuestion("");

    // Retrieve the most relevant passages for this question (client-side RAG).
    const [qVec] = await embed([q]);
    const relevant = topK(qVec, chunks, 4);
    const context = relevant.map((r) => r.text).join("\n\n---\n\n");

    const history = messages.slice(-6);
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      await streamPost(
        "/api/textbook",
        { task: "answer", question: q, context, language, history },
        (_c, full) => {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: full };
            return copy;
          });
        },
      );
    } catch (err) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "Failed."}`,
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  async function makeQuiz() {
    if (streaming || chunks.length === 0) return;
    const context = chunks.map((c) => c.text).join("\n\n");
    const next: Msg[] = [
      ...messages,
      { role: "user", content: "📝 Make me a quiz on this material" },
    ];
    setMessages([...next, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      await streamPost(
        "/api/textbook",
        { task: "quiz", context, language },
        (_c, full) => {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: full };
            return copy;
          });
        },
      );
    } catch (err) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "Failed."}`,
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  const indexed = chunks.length > 0;

  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[380px_1fr]">
      {/* Source panel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{
              background:
                "color-mix(in srgb, var(--color-textbook) 14%, transparent)",
              color: "var(--color-textbook)",
            }}
          >
            <BookOpen size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Textbook</h1>
            <p className="text-xs text-muted">Study from your own material</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3 shadow-sm">
          <div className="flex gap-1.5">
            {(
              [
                { id: "paste", label: "Paste", icon: ClipboardPaste },
                { id: "pdf", label: "PDF", icon: FileText },
                { id: "photo", label: "Photo", icon: Camera },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                  tab === id
                    ? "text-white"
                    : "bg-bg text-muted hover:text-ink"
                }`}
                style={tab === id ? { background: "var(--color-textbook)" } : undefined}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            {tab === "paste" && (
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                placeholder="Paste textbook text, notes, or an article here…"
                className="w-full resize-none rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none"
              />
            )}
            {tab === "pdf" && (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-bg px-3 py-8 text-center text-sm text-muted hover:border-amber-500">
                <FileText size={24} />
                <span>Tap to choose a PDF</span>
                <input type="file" accept="application/pdf" className="hidden" onChange={onPdf} />
              </label>
            )}
            {tab === "photo" && (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-bg px-3 py-8 text-center text-sm text-muted hover:border-amber-500">
                <Camera size={24} />
                <span>Tap to photograph a page</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={onPhoto}
                />
              </label>
            )}
          </div>

          {rawText && (
            <p className="mt-2 text-xs text-muted">
              {rawText.length.toLocaleString()} characters loaded
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <LanguageSelect value={language} onChange={setLanguage} />
            <button
              onClick={indexMaterial}
              disabled={busy || !rawText.trim()}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-textbook)" }}
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : indexed ? (
                <CheckCircle2 size={15} />
              ) : (
                <Sparkles size={15} />
              )}
              {indexed ? "Re-index" : "Understand it"}
            </button>
          </div>

          {status && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted">
              <Loader2 size={12} className="animate-spin" /> {status}
            </p>
          )}
          {indexed && !status && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-teacher)" }}>
              <CheckCircle2 size={13} /> Ready — {chunks.length} passages indexed
            </p>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex min-h-[60vh] flex-col rounded-3xl border border-line bg-surface shadow-sm">
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto p-4"
          style={{ maxHeight: "calc(100dvh - 230px)" }}
        >
          {!indexed ? (
            <div className="grid h-full min-h-64 place-items-center text-center">
              <div>
                <BookOpen
                  className="mx-auto mb-3"
                  style={{ color: "var(--color-textbook)" }}
                />
                <p className="font-semibold">Add your material, then ask away</p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                  Lumi reads your textbook on your device, finds the relevant
                  passages, and answers from them.
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center">
              <p className="text-sm text-muted">
                Ask a question about your material, or generate a quiz.
              </p>
              <button
                onClick={makeQuiz}
                className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold transition-colors hover:text-ink"
                style={{ color: "var(--color-textbook)" }}
              >
                <ListChecks size={15} /> Generate a quiz
              </button>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[15px] ${
                    m.role === "user"
                      ? "text-white"
                      : "border border-line bg-bg text-ink"
                  }`}
                  style={m.role === "user" ? { background: "var(--color-textbook)" } : undefined}
                >
                  {m.role === "assistant" ? (
                    m.content ? (
                      <Markdown>{m.content}</Markdown>
                    ) : (
                      <span className="inline-flex gap-1 py-1">
                        <span className="lumi-dot" />
                        <span className="lumi-dot" style={{ animationDelay: "0.2s" }} />
                        <span className="lumi-dot" style={{ animationDelay: "0.4s" }} />
                      </span>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {indexed && (
          <div className="border-t border-line p-3">
            <div className="flex items-end gap-2">
              <button
                onClick={makeQuiz}
                disabled={streaming}
                title="Generate a quiz"
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-muted hover:text-ink disabled:opacity-40"
              >
                <ListChecks size={18} />
              </button>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask();
                  }
                }}
                rows={1}
                placeholder="Ask about your material…"
                className="max-h-28 flex-1 resize-none rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none"
              />
              <button
                onClick={() => ask()}
                disabled={streaming || !question.trim()}
                className="grid size-10 shrink-0 place-items-center rounded-xl text-white transition-opacity disabled:opacity-40"
                style={{ background: "var(--color-textbook)" }}
              >
                {streaming ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
