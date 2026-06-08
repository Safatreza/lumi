"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Camera,
  Mic,
  Square,
  Volume2,
  Loader2,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import Markdown from "@/components/Markdown";
import LanguageSelect from "@/components/LanguageSelect";
import { streamPost } from "@/lib/stream-client";
import { runOCR } from "@/lib/ml/ocr";
import { MicRecorder, transcribe } from "@/lib/ml/speech";
import { speak, stopSpeaking, ttsSupported } from "@/lib/tts";
import { getLanguage } from "@/lib/languages";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "Explain photosynthesis like I'm 12",
  "Help me solve: 3x + 5 = 20",
  "Why do we have seasons?",
  "Give me a study plan for fractions",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [level, setLevel] = useState("auto");
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const recorderRef = useRef<MicRecorder | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    stopSpeaking();
    setInput("");

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      await streamPost(
        "/api/chat",
        { messages: next, language, level },
        (_chunk, full) => {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: full };
            return copy;
          });
        },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${msg}` };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setStatus("Reading your photo…");
      const text = await runOCR(file, (pct) =>
        setStatus(`Reading your photo… ${pct}%`),
      );
      setStatus(null);
      if (text) {
        setInput((prev) =>
          (prev ? prev + "\n\n" : "") +
          `Here is my homework from a photo:\n"""${text}"""\n\nCan you help me with this?`,
        );
      } else {
        setStatus("Couldn't read any text — try a clearer photo.");
        setTimeout(() => setStatus(null), 2500);
      }
    } catch {
      setStatus("Photo reading failed. Try again.");
      setTimeout(() => setStatus(null), 2500);
    }
  }

  async function toggleVoice() {
    if (recording) {
      setRecording(false);
      setStatus("Transcribing…");
      try {
        const blob = await recorderRef.current!.stop();
        const text = await transcribe(blob, (info) => {
          if (info.status === "progress" && info.progress) {
            setStatus(`Loading voice model… ${Math.round(info.progress)}%`);
          } else {
            setStatus("Transcribing…");
          }
        });
        setStatus(null);
        if (text) setInput((prev) => (prev ? prev + " " : "") + text);
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
      recorderRef.current = new MicRecorder();
      await recorderRef.current.start();
      setRecording(true);
    } catch {
      setStatus("Microphone permission denied.");
      setTimeout(() => setStatus(null), 2500);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 sm:px-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-tutor/10 text-tutor" style={{ background: "color-mix(in srgb, var(--color-tutor) 12%, transparent)", color: "var(--color-tutor)" }}>
            <GraduationCap size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Tutor</h1>
            <p className="text-xs text-muted">Patient help in your language</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium shadow-sm outline-none"
          >
            <option value="auto">Auto level</option>
            <option value="primary school">Primary</option>
            <option value="secondary school">Secondary</option>
            <option value="university">University</option>
          </select>
          <LanguageSelect value={language} onChange={setLanguage} />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto pb-4"
        style={{ maxHeight: "calc(100dvh - 220px)" }}
      >
        {empty ? (
          <div className="mt-6 rounded-3xl border border-line bg-surface p-6 text-center shadow-sm">
            <Sparkles className="mx-auto mb-3 text-tutor" />
            <h2 className="text-lg font-bold">Hi, I&apos;m Lumi 👋</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Ask me anything — type it, say it with the mic, or snap a photo of
              your homework. I&apos;ll help you understand it step by step.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-bg px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-tutor hover:text-tutor"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] shadow-sm ${
                  m.role === "user"
                    ? "bg-tutor text-white"
                    : "border border-line bg-surface text-ink"
                }`}
                style={m.role === "user" ? { background: "var(--color-tutor)" } : undefined}
              >
                {m.role === "assistant" ? (
                  <>
                    {m.content ? (
                      <Markdown>{m.content}</Markdown>
                    ) : (
                      <span className="inline-flex gap-1 py-1">
                        <span className="lumi-dot" style={{ animationDelay: "0s" }} />
                        <span className="lumi-dot" style={{ animationDelay: "0.2s" }} />
                        <span className="lumi-dot" style={{ animationDelay: "0.4s" }} />
                      </span>
                    )}
                    {streaming && i === messages.length - 1 && m.content && (
                      <span className="lumi-caret" />
                    )}
                    {m.content && ttsSupported() && (
                      <button
                        onClick={() => speak(m.content, getLanguage(language).code)}
                        className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted hover:text-tutor"
                      >
                        <Volume2 size={13} /> Read aloud
                      </button>
                    )}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 border-t border-line bg-bg/95 pb-4 pt-3 backdrop-blur">
        {status && (
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
            <Loader2 size={13} className="animate-spin" /> {status}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm">
          <label className="grid size-10 cursor-pointer place-items-center rounded-xl text-muted transition-colors hover:bg-brand-soft hover:text-tutor" title="Snap a photo of your homework">
            <Camera size={20} />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onPhoto}
            />
          </label>
          <button
            onClick={toggleVoice}
            title={recording ? "Stop recording" : "Ask by voice"}
            className={`grid size-10 place-items-center rounded-xl transition-colors ${
              recording
                ? "bg-accent text-white"
                : "text-muted hover:bg-brand-soft hover:text-tutor"
            }`}
            style={recording ? { background: "var(--color-accent)" } : undefined}
          >
            {recording ? <Square size={18} /> : <Mic size={20} />}
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask Lumi anything…"
            className="max-h-32 flex-1 resize-none bg-transparent py-2 text-[15px] outline-none"
          />
          <button
            onClick={() => send()}
            disabled={streaming || !input.trim()}
            className="grid size-10 place-items-center rounded-xl bg-tutor text-white transition-opacity disabled:opacity-40"
            style={{ background: "var(--color-tutor)" }}
            title="Send"
          >
            {streaming ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
