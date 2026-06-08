# Lumi — learning for everyone, in every language

> Quality learning for **every** student, in **every** language.
> Built for the **Builders Club @ TUM** hackathon (Education track).

Lumi is an AI learning companion that meets students where they are — in their
own language, from a photo of a textbook, or just by speaking. It tackles the
three axes of education inequality head-on:

- **Geography** — works on a cheap phone and a weak connection.
- **Wealth** — a patient tutor, free, no expensive private tutoring.
- **Language** — teaches in the language a student actually thinks in.

## Three modes, one app

| Mode | What it does |
| --- | --- |
| 🎓 **Tutor** | A Socratic AI tutor. Ask by text, **voice**, or a **photo** of your homework. Replies in your language and reads answers aloud. |
| 👩‍🏫 **Teacher** | Generate localized lesson plans, quizzes, worksheets, and flashcards for any topic, grade, and language — with culturally relevant examples. |
| 📖 **Textbook** | Paste / upload a PDF / photograph textbook pages. Lumi reads them **on-device**, answers questions grounded in the material (RAG), and builds quizzes. |

## Powered by Claude + open-source on-device AI

- **Claude** (`@anthropic-ai/sdk`, streaming) — the tutoring brain, content
  generation, and grounded answers. Model: `claude-opus-4-8` (configurable).
- **Whisper** (`@huggingface/transformers`) — voice → text, in the browser.
- **Tesseract.js** — OCR, photo of a textbook → text, in the browser.
- **all-MiniLM-L6-v2** (`@huggingface/transformers`) — embeddings for Textbook
  RAG, in the browser.
- **NLLB-200** (Meta, via HuggingFace Inference API) — 200-language translation,
  with automatic Claude fallback.
- **Web Speech API** — text-to-speech read-aloud (free, offline).

The heavy ML models run **client-side** (or via HF's API), so the app deploys
cleanly to Vercel's serverless platform with no GPU needed.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # then paste your ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Environment variables (see `.env.example`):

- `ANTHROPIC_API_KEY` **(required)** — from https://console.anthropic.com/
- `ANTHROPIC_MODEL` *(optional)* — defaults to `claude-opus-4-8`; set to
  `claude-sonnet-4-6` for faster/cheaper demo responses.
- `HF_TOKEN` *(optional)* — enables NLLB-200 translation; otherwise Claude
  handles translation.

## Deploy

Push to GitHub and import into [Vercel](https://vercel.com/new), or:

```bash
npm i -g vercel
vercel              # link & deploy a preview
vercel --prod       # production
```

Set `ANTHROPIC_API_KEY` in **Vercel → Project → Settings → Environment
Variables**, then redeploy.

---

Made with ❤️ and Claude.
