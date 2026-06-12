import { getClient, MODEL } from "@/lib/anthropic";
import { getEULanguage } from "@/lib/scribe/data";

export const runtime = "nodejs";
export const maxDuration = 30;

interface Body {
  utterance?: string;
  language?: string;
  question?: string;
  answer?: string;
  minutesLeft?: number;
}

/**
 * The OwnVoice Integrity Guard endpoint.
 *
 * The assistant is a conduit, never a participant: it may handle procedure,
 * navigation, verbatim re-reading, and read-back — and must refuse anything
 * that seeks academic content, flagging the attempt for the audit trail.
 * Mirrors the strictest human-scribe rules in the EU (France: verbatim, no
 * commentary; Poland: no explanations or suggestions, recorded session).
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { utterance, language = "en", question = "", answer = "", minutesLeft } = body;
  if (!utterance || !utterance.trim()) {
    return Response.json({ error: "utterance is required" }, { status: 400 });
  }

  const lang = getEULanguage(language);

  const system = `You are OwnVoice, an exam-integrity assistant sitting next to a blind or differently-abled candidate during an OFFICIAL EXAM. You are a conduit, never a participant. You follow the strictest EU scribe rules: verbatim only, no commentary, no academic help of any kind.

YOU MAY ONLY:
- Explain exam-room procedure (how to repeat a question, navigate, dictate, ask for time).
- Re-state the CURRENT QUESTION verbatim, or slower, if asked.
- Read back the candidate's CURRENT ANSWER verbatim, if asked.
- State the remaining time if asked.
- Offer calm reassurance ("take your time") without any content guidance.

YOU MUST REFUSE (flagged=true):
- Solving, hinting, defining, explaining, simplifying, or translating exam CONTENT.
- Checking whether an answer is right, complete, or could be improved.
- Spelling out content terms, giving formulas, examples, or "just the first step".
Refusal style: one warm, brief sentence in ${lang.label} — remind them you can re-read the question or take dictation, but cannot help with content. Never shame the candidate.

CONTEXT (verbatim, never alter):
Current question: """${question.slice(0, 1500)}"""
Candidate's current answer: """${answer.slice(0, 2000)}"""
Remaining time: ${typeof minutesLeft === "number" ? `${minutesLeft} minutes` : "unknown"}

Reply in ${lang.label} (${lang.native}).
Respond with ONLY valid JSON, no other text:
{"reply": "<your reply>", "flagged": <true if the request sought academic help, else false>}`;

  try {
    const client = getClient();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system,
      messages: [{ role: "user", content: utterance.trim() }],
    });
    const raw = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    try {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      const parsed = JSON.parse(raw.slice(start, end + 1));
      return Response.json({
        reply: String(parsed.reply ?? raw),
        flagged: Boolean(parsed.flagged),
      });
    } catch {
      // Model didn't return clean JSON — pass the text through, unflagged.
      return Response.json({ reply: raw, flagged: false });
    }
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Assistant unavailable" },
      { status: 500 },
    );
  }
}
