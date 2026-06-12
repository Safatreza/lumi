# WortLaut — your exam, your words, verbatim

> **Wortlaut** (German): *the exact wording* — „im Wortlaut" means **verbatim**.
> The name is the product: your voice becomes your words, word for word,
> and never anyone else's. Built in Munich at TUM.

> Exam access for blind and differently-abled students in Europe.
> Built for the **Claude Builder Club @ TUM** hackathon (Education track).

Across the EU, exam accommodations — readers, scribes, screen readers,
speech-to-text, extra time, separate rooms — are **legally recognized**
(UN CRPD Art. 24, ratified by the EU and all 27 member states). But arranging
them is fragmented and institution-dependent: 27 countries, 27 rulebooks
(Germany alone has 16), year-ahead deadlines, and a chronic shortage of
qualified, neutral human scribes.

**WortLaut helps schools and universities manage verified human support and
assistive technology — then adds an exam-safe AI assistant that reads
questions, transcribes dictated answers, follows approved voice commands,
supports multilingual interaction, and produces a full audit trail, without
giving academic help.**

## The two halves

| Mode | What it does |
| --- | --- |
| 🎙️ **Exam Room** (`/exam`) | The exam-safe AI assistant: reads questions aloud (repeat / slower on command), takes **dictated answers verbatim** (Whisper, on-device), approved voice commands, multilingual (24 EU languages), countdown with extra time — and an **Integrity Guard** that refuses any request for academic help, flags it, and logs everything to an exportable audit trail. |
| 🤝 **Support Finder** (`/scribe`) | A marketplace for verified volunteer scribes & readers across **all 27 EU countries**: radius search, institute and subject filters, language matching — governed by a **per-country policy engine** (verified rules for FR, DE, IE, PL, NL; CRPD defaults elsewhere) plus WortLaut's one-grade-below volunteer policy. |

## Integrity by design

A human scribe is kept honest by rules; an AI knows more than any scribe, so it
must be kept honest **by design** — modeled on the strictest real regulations:

- **Verbatim only** — France's *secrétaire* rule: read word-for-word, no commentary.
- **Dictation untouched** — no corrections to grammar, syntax, or word choice.
- **Refuses & flags** — academic-help requests get a calm refusal + an integrity flag.
- **Full audit trail** — Poland already mandates recorded scribe sessions; WortLaut timestamps and exports every event.

## Powered by Claude + open-source on-device AI

- **Claude** (`@anthropic-ai/sdk`) — the integrity-guarded assistant and content generation. Model: `claude-opus-4-8` (configurable).
- **Whisper** (`@huggingface/transformers`) — dictation, in the browser.
- **Web Speech API** — question reading & read-back (free, offline).
- **Tesseract.js / pdf.js / MiniLM** — power the included Lumi learning tools (`/tutor`, `/teacher`, `/textbook`).

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # paste your ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Environment variables (see `.env.example`):

- `ANTHROPIC_API_KEY` **(required)**
- `ANTHROPIC_MODEL` *(optional)* — defaults to `claude-opus-4-8`; use `claude-sonnet-4-6` for snappier demo responses.
- `HF_TOKEN` *(optional)* — NLLB-200 translation for the Lumi tools.

## Deploy

```bash
npm i -g vercel
vercel --prod
```

Set `ANTHROPIC_API_KEY` in Vercel → Project → Settings → Environment Variables.

## Team

Created by **Samia Tasnim** and **Md Safat Rezanur Majumder**.

---

Made with ❤️, Claude, and the conviction that no student should miss an exam
because a scribe didn't show up.
