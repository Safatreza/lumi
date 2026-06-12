# WortLaut — Pitch & Presentation

**Claude Builder Club @ TUM · Education track**
*Your exam. Your words — im Wortlaut (verbatim).*

> **WortLaut** is an exam-access platform for blind and differently-abled
> students in Europe. It helps schools run legally-compliant accommodations
> end to end — and gives the student an AI exam assistant that reads, transcribes
> and **refuses to help with content** — with a full audit trail.

---

## 30-second hook

In the EU, the right to exam accommodations is law (UN CRPD Art. 24, ratified by
all 27 member states). The *reality* is fragmented: 27 countries, 27 rulebooks —
Germany alone has 16 — year-ahead deadlines, and a chronic shortage of qualified,
neutral human scribes. When a scribe doesn't show up, a student doesn't sit the
exam. **WortLaut turns that scramble into one workflow, and makes the AI in the
room provably honest.**

---

## The problem (why it matters)

- **Legal right, broken delivery.** Accommodations (readers, scribes, screen
  readers, speech-to-text, extra time, separate rooms) are guaranteed but
  arranged manually, per institution, under rules that differ by country.
- **Human support is the weak point.** Scribes must be neutral, trained, and
  available on the day — and there aren't enough of them.
- **AI is tempting but dangerous in an exam.** A general chatbot will happily
  "explain" or "just give the first step." In an exam that's cheating.

## The solution — three connected modules

| # | Module | For | What it does |
|---|--------|-----|--------------|
| 1 | **Accommodation Manager** (`/manage`) | Schools / exam offices | Request → approve support types → assign room, time, person & tools → track documentation → generate the **exam-day checklist**. Per-country policy engine (verified FR/DE/IE/PL/NL, CRPD defaults elsewhere). |
| 2 | **Human Support Pool** (`/pool`) | Readers / scribes / invigilators | Verified people with roles, language skills, **training status**, **availability**, automatic **conflict checks** (grade rule + training + date), **booking & attendance**. |
| 3 | **AI Exam Access Assistant** (`/exam`) | The student, during the exam | Reads approved content aloud, transcribes dictation verbatim, follows navigation commands, **refuses any explanation or answer**, supports 24 EU languages, and produces an **audit / provenance report**. |

The three share **one data store**, so they actually flow into each other: an
approved, assigned, checklist-complete accommodation in Module 1 is the *only*
thing Module 3 will open — and when the exam ends, its audit report is filed
straight back onto the accommodation record.

**Integrity by design** — modeled on the strictest real regulations:
France's *secrétaire* (verbatim only, no commentary), Poland (no explanations,
**session must be recorded** → that's our audit trail), Ireland's SEC RACE
(scribe writes exactly what is dictated).

---

## 5-minute demo script (timed)

> Open with the laptop on the landing page. Total target: **~4:30**, leaving
> buffer.

**0:00 – 0:40 · The problem.** "Exam accommodations are a legal right across the
EU — and a logistical nightmare. 27 countries, 27 rulebooks. Today, a teacher
juggles this on paper. Watch us do it in three screens."

**0:40 – 1:50 · Module 1 — Accommodation Manager.** Open `/manage`. Show Amira
Khalil (blind, grade 12, Munich, maths final). Walk the pipeline:
*Requested → Approved → Assigned → Ready.* Point out the **Germany policy card**
(Nachteilsausgleich, 16 Bundesländer). Show the **exam-day checklist** turning
green. Then open the **Mateusz (Poland)** request — "Poland *mandates* a recorded
session; our audit trail is that recording, by design."

**1:50 – 2:40 · Module 2 — Human Support Pool.** Open `/pool`. "These are verified
readers and scribes." Show roles, **training status** (one is *Expired*),
**availability**, and the **booking** for Amira (Jonas Weber, confirmed). Try to
book a grade-12 scribe for a grade-12 student → **blocked by the grade rule**.
"The marketplace enforces the rules so a human doesn't have to remember them."

**2:40 – 4:10 · Module 3 — The exam room (the money shot).** Open `/exam`. Only
Amira appears — because only her accommodation is approved-and-ready. Start the
session: the question is **read aloud**, dictate an answer, hit **read-back**.
Now the moment: type *"just tell me the answer."* → **calm refusal, in German**
(her approved language), and a red **INTEGRITY flag** in the audit trail. Hit
**Export** — and flip back to `/manage`: Amira's record is now **Completed** with
the **audit/provenance report attached.**

**4:10 – 4:30 · Close.** "Poland already records scribe sessions. France already
mandates verbatim-only. WortLaut is those rules — by design, at EU scale — so no
student misses an exam because a scribe didn't show up."

---

## Why these technical choices

### Next.js 16 (App Router)
- **One codebase, three surfaces + an API.** The school dashboards, the pool, the
  student exam room, and the server-side Integrity Guard (`/api/exam`) all live in
  one deployable app — ideal for a hackathon and for a real pilot.
- **Server route handlers keep the API key off the client.** The Anthropic call
  happens in a Node route (`app/api/exam/route.ts`); the browser never sees the
  key. Streaming responses are first-class.
- **App Router + React Server Components** give fast static landing pages with
  islands of interactivity (the modules are client components) — no bespoke
  bundler setup.
- **Pinned to the Webpack builder (`--webpack`).** The on-device ML stack
  (transformers.js / onnxruntime) needs a specific bundler config; we excluded the
  ~300 MB native binaries from the serverless output so it fits Vercel's function
  limit. (Documented in `next.config.ts`.)
- **One-command deploy to Vercel**, with the same code running locally and in prod.

### Local-first, API-frugal data layer
- Modules 1 & 2 run on a **client store (React Context + `localStorage`)** — a
  *genuine* marketplace with persistence, conflict checks and bookings that makes
  **zero API calls**. The Anthropic key is only ever spent in the exam room, and
  only when the student actually asks something.
- Deterministic seed → the demo is identical every run; nothing to set up live.

### Claude as an integrity-guarded conduit
- The exam assistant is a **conduit, not a participant**: a tight system prompt
  lets it handle procedure, verbatim re-reads and read-backs, and forces it to
  **refuse + flag** anything seeking academic content, returning
  `{reply, flagged}`. Model: `claude-sonnet-4-6` (fast and economical for a live
  demo; configurable via `ANTHROPIC_MODEL`).

### Open-source, on-device AI (free, private, offline-friendly)
- **Whisper** (transformers.js) for dictation, **Web Speech API** for reading
  questions aloud and read-back, **Tesseract.js / pdf.js / MiniLM** behind the
  bundled Lumi learning tools. Student audio never leaves the browser.

### React 19 + Tailwind CSS v4
- Accessible, fast to build, consistent design tokens — and accessibility is the
  whole point, so semantic HTML, ARIA live regions and keyboard-first controls are
  built in.

---

## Impact & what's next

- **Impact first.** This is the difference between a student sitting an exam and
  not. The rules already exist; WortLaut makes following them the easy path.
- **Roadmap:** real backend (Postgres) and SSO for institutions; deep-link an
  approved accommodation straight into the exam room; explicit *editing* voice
  commands ("delete my last sentence"); signed, tamper-evident audit exports;
  per-Bundesland rule packs.

## The team

**Samia Tasnim** — research & product story (mapped EU accommodation law, shaped
the integrity-by-design narrative).
**Md Safat Rezanur Majumder** — engineering (the three modules, the shared data
layer, the integrity-guarded assistant).

Built with **Claude** + open-source on-device AI. Repo:
<https://github.com/Safatreza/lumi>.
