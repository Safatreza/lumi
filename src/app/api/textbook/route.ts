import { streamClaude, type ChatMessage } from "@/lib/anthropic";
import { getLanguage } from "@/lib/languages";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  task?: "answer" | "quiz";
  question?: string;
  context?: string;
  language?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { task = "answer", question, context = "", language = "en", history = [] } = body;
  const lang = getLanguage(language);

  if (!context.trim()) {
    return new Response("No textbook material provided", { status: 400 });
  }

  if (task === "quiz") {
    const system = `You are Lumi, a study coach. Using ONLY the textbook material below, write a 6-question quiz in ${lang.label} (${lang.native}): a mix of multiple-choice and short-answer, ordered easy to hard. Then add an "Answer key" with one-line explanations. Output clean Markdown only.

=== TEXTBOOK MATERIAL ===
${context.slice(0, 12000)}
=== END MATERIAL ===`;
    return streamClaude({
      system,
      messages: [{ role: "user", content: "Create the quiz now." }],
      maxTokens: 2500,
    });
  }

  if (!question || !question.trim()) {
    return new Response("question is required", { status: 400 });
  }

  const system = `You are Lumi, a study companion helping a student understand their textbook.

Answer in ${lang.label} (${lang.native}).

Use the textbook excerpts below as your source of truth:
- Base your answer on the excerpts. If the answer isn't in them, say honestly that the material doesn't cover it, then offer your best general guidance clearly marked as such.
- Explain in a clear, encouraging way that builds understanding — not just a definition.
- Keep it concise and well-formatted for a small screen.

=== TEXTBOOK EXCERPTS ===
${context.slice(0, 12000)}
=== END EXCERPTS ===`;

  const messages: ChatMessage[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: question.trim() },
  ];

  return streamClaude({ system, messages, maxTokens: 1500 });
}
