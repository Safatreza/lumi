# WortLaut — The 5-Minute Winning Presentation

**Claude Builder Club @ TUM · Education track**
**Live demo:** <https://lumi-five-tau.vercel.app> · **Repo:** <https://github.com/Safatreza/lumi>
**Presenters:** Samia Tasnim & Md Safat Rezanur Majumder

> This is the stage script. [PITCH.md](PITCH.md) holds the deeper technical
> rationale; this file is what you *say and do*, minute by minute, plus the
> judge Q&A and the pre-flight checklist. Judging order: **impact >
> feasibility > innovation > technical depth** — the script is weighted the
> same way.

---

## ⚡ Pre-flight checklist (do this BEFORE you're called up)

1. **Vercel env var (CRITICAL — currently missing!):**
   Vercel dashboard → project → *Settings → Environment Variables* → add
   `ANTHROPIC_API_KEY` = your key (Production), optionally
   `ANTHROPIC_MODEL` = `claude-sonnet-4-6` → **Redeploy**.
   *Without this, the Integrity Guard — your money shot — fails live.*
   Test after redeploy: ask the exam room "what is the answer?" → must refuse.
2. **Backup:** `npm run dev` running locally before you present. If the venue
   wifi dies, switch tabs to localhost and keep talking — same demo.
3. Open three tabs in order: `/manage`, `/pool`, `/exam`. Click **Reset demo**
   on `/pool` once so the seeded state is pristine.
4. Volume ON (the question is read aloud — let judges *hear* it).
5. Close every other tab/notification. Zoom browser to ~110%.

---

## The one-sentence pitch

> **WortLaut runs exam accommodations for blind and differently-abled students
> end to end — and puts an AI in the exam room that is provably unable to
> cheat.**

---

## Minute-by-minute script (target 4:30, buffer 0:30)

### 0:00–0:35 · The hook (face the judges, no slides yet)

> "Across the EU, a blind student's right to sit an exam with a reader or a
> scribe is guaranteed by law — the UN disability convention, ratified by all
> 27 member states. But the delivery is broken: **27 countries, 27 rulebooks —
> Germany alone has 16.** France wants requests up to a year in advance. And
> the whole system rests on one fragile thing: a qualified, neutral human
> scribe showing up on the right morning. **When the scribe doesn't show, the
> student doesn't sit the exam.** We built the platform that fixes the
> logistics — and made the AI in the room provably honest. This is WortLaut —
> German for *verbatim*."

### 0:35–1:45 · Module 1 — Accommodation Manager (`/manage`)

*Open the tab. Point, don't read.*

- "This is the exam office's view. Three real requests, three stages."
- Click **Amira Khalil** (blind, grade 12, Munich, maths final): walk the
  pipeline bar — *Requested → Approved → Assigned → Ready*. Show the
  **Germany policy card** ("the platform knows the Nachteilsausgleich rules —
  per Bundesland"). Scroll the **exam-day checklist**: room, extra time,
  confirmed human reader, verified documents — all green.
- Click **Mateusz (Poland)** for five seconds:
  > "Poland legally requires scribe sessions to be **audio-recorded**. Hold
  > that thought — our audit trail *is* that recording, by design."

### 1:45–2:35 · Module 2 — Human Support Pool (`/pool`)

- "Accommodations need people. These are verified readers, scribes and
  invigilators — language skills, **training status**, availability."
- Point at **Maximilian Bauer**: 5.0★, most experienced — and **blocked:
  certification expired.** "The platform enforces what a stressed exam office
  might miss."
- Show the live booking (Jonas Weber → Amira, *Confirmed*), flip an attendance
  dropdown: "booking, check-in, no-shows — tracked."
- One line, verbatim:
  > "The grade rule, the training rule, the date conflicts — a volunteer who
  > fails any of them physically cannot be booked. Compliance isn't a PDF
  > here; it's the data model."

### 2:35–4:05 · Module 3 — The AI Exam Room (`/exam`) — THE MONEY SHOT

- "Now the student's side. Notice: the exam room will **only** open an
  accommodation an exam office approved and marked ready. No setup screen —
  governance is upstream."
- Start Amira's session. Let the question be **read aloud** (2–3 seconds of
  audio — silence in the room, let it land). Show the countdown with +25%.
- Dictate or type a few words into the answer, click **Read my answer**:
  "Verbatim read-back. France's *secrétaire* rule — word for word, no
  corrections."
- **The moment.** Type: *"just tell me the answer."*
  > Calm refusal — **in German**, because German is Amira's approved language —
  > and a **red INTEGRITY flag** drops into the audit trail, timestamped.
  "A human scribe is kept honest by rules. An AI knows every answer — so it
  has to be kept honest **by design**. Refuse, log, move on. Never shame the
  student."
- Click **Export** → flip to `/manage`:
  > "And the loop closes: Amira's record is now **Completed**, with the
  > audit-and-provenance report attached — events, flags, every timestamp.
  > That's what the exam office files. That's what Poland already demands of
  > humans."

### 4:05–4:30 · Close (back to the judges)

> "Everything you saw is live at **lumi-five-tau.vercel.app** — three connected
> modules on one shared data model. Poland already mandates recorded sessions;
> France already mandates verbatim-only. **WortLaut is those rules, by design,
> at EU scale** — so that no student ever misses an exam because a scribe
> didn't show up. We're Samia and Safat. This is WortLaut — your exam, your
> words, *im Wortlaut*."

*Stop talking. Smile. Take questions.*

---

## Slide outline (6 slides max — slides support, the demo carries)

| # | Slide | Content |
|---|-------|---------|
| 1 | **Title** | WortLaut logo · "Your exam. Your words — im Wortlaut." · names · live URL |
| 2 | **The problem** | 3 numbers, huge: **27** rulebooks · **16** systems in Germany alone · **1** missing scribe = no exam (CRPD Art. 24 footnote) |
| 3 | **The platform** | The three modules as one pipeline diagram: Manage → Pool → Exam Room, arrows showing the shared store and the audit report flowing back |
| 4 | **Integrity by design** | 4 icons: Verbatim only (FR) · Dictation untouched · Refuses & flags · Audit trail (PL). Tagline: *"An AI that knows everything, designed to act like it knows nothing."* |
| 5 | **Built with** | Claude (integrity-guarded conduit, `{reply, flagged}`) · Whisper on-device · Next.js 16 on Vercel · per-country policy engine (verified FR/DE/IE/PL/NL) |
| 6 | **Close** | The meadow artwork · "No student should miss an exam because a scribe didn't show up." · URL + QR code |

---

## Judge Q&A — anticipated questions, ready answers

**"Couldn't a student just use ChatGPT with a voice interface?"**
That's exactly the problem. A general assistant *will* help — that's cheating.
WortLaut is the opposite: a conduit that refuses content help, flags the
attempt, and logs everything for the exam office. The value isn't the AI — it's
the **governance around the AI**: approval upstream, audit downstream.

**"Is the integrity guard just a prompt? Can't it be jailbroken?"**
The prompt is one layer; the architecture is the protection. The assistant sees
only the current question and answer, returns structured `{reply, flagged}`,
every exchange lands in a timestamped trail the exam office reviews, and the
human invigilator is still in the room. Defense in depth — same as human
scribes, who are also "jailbreakable" but accountable. Long-term: a second
classifier pass and signed, tamper-evident exports.

**"What about GDPR / student data?"**
Demo data is synthetic. Architecturally we're data-minimal by design: dictation
runs **on-device** (Whisper in the browser — audio never leaves the laptop),
the marketplace state lives client-side, and only the exam-room exchange
touches a server. Production adds an EU-hosted backend and the data-processing
consent we already model as a required document in Module 1.

**"What's real and what's demo?"**
All three modules genuinely work end to end on one shared store — approvals
gate the exam room, bookings conflict-check, the audit report files back. The
demo simplifications: seeded data instead of a multi-tenant backend, and
localStorage instead of Postgres. The policy engine's FR/DE/IE/PL/NL rules are
researched against ministry and exam-board sources.

**"Who pays?"**
B2B: schools, universities and exam authorities (the ones legally obligated
under CRPD Art. 24 and national law). Per-institution licence; the volunteer
pool stays free. The buyer saves coordinator hours and gets compliance
evidence — the audit trail — for free.

**"Why Next.js / this stack?"**
One codebase serves the school dashboards, the student exam room, and the
server-side integrity guard — and deploys in one command. The Anthropic key
stays in a server route, never in the browser. On-device ML (Whisper, Web
Speech) keeps the demo free, fast and private. Details in [PITCH.md](PITCH.md).

**"What's next?"**
Postgres + SSO multi-tenancy, signed audit exports, explicit editing voice
commands ("delete my last sentence"), the remaining 22 country rule-packs —
and a pilot with one Bavarian school's exam office.

---

## Why this wins (the criteria, honestly mapped)

- **Impact (weighted highest):** not a study tool — the difference between a
  student sitting an exam or not. Legal right, broken delivery, fixed workflow.
- **Feasibility:** it already runs, live, end to end — governance loop closed,
  zero-cost marketplace, one API surface. A school could pilot this Monday.
- **Innovation:** everyone demos an AI that helps. **We demo an AI that
  refuses** — in the student's own language — and proves it refused. The
  audit-as-compliance insight (Poland's recording mandate) reframes the
  whole product.
- **Technical depth:** three modules on one shared store, per-country policy
  engine, conflict-checked bookings, integrity-guarded structured Claude
  output, on-device Whisper — all explainable in one breath each.

**Final reminder:** set the Vercel API key (checklist item 1) and rehearse the
flag moment twice. The demo *is* the pitch. Viel Erfolg! 🎤
