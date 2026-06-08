import { streamClaude } from "@/lib/anthropic";
import { getLanguage } from "@/lib/languages";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  topic?: string;
  grade?: string;
  language?: string;
  contentType?: string;
  region?: string;
}

const CONTENT_INSTRUCTIONS: Record<string, string> = {
  lesson: `Produce a ready-to-teach LESSON PLAN with: learning objectives, a short list of needed materials (cheap/improvised where possible), a step-by-step lesson flow with timings, 2-3 worked examples, a quick formative check, and a homework idea.`,
  quiz: `Produce a QUIZ of 8 questions: a mix of multiple-choice and short-answer, increasing in difficulty. After all questions, add an "Answer key" section with brief explanations.`,
  worksheet: `Produce a printable WORKSHEET: a brief explanation box, 10 practice problems from easy to hard, and space markers for answers. Add a compact answer key at the end.`,
  flashcards: `Produce a set of 12 FLASHCARDS as a two-column markdown table (Front | Back). Keep each side short and memorable.`,
  explain: `Produce a SIMPLE EXPLANATION of the topic suitable to read aloud to the class, using a relatable analogy and a real-world example. Then list 3 key takeaways.`,
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const {
    topic,
    grade = "middle school",
    language = "en",
    contentType = "lesson",
    region,
  } = body;

  if (!topic || !topic.trim()) {
    return new Response("topic is required", { status: 400 });
  }

  const lang = getLanguage(language);
  const instruction =
    CONTENT_INSTRUCTIONS[contentType] ?? CONTENT_INSTRUCTIONS.lesson;
  const regionLine = region?.trim()
    ? `Use examples, names, currency, and contexts familiar to students in ${region.trim()}.`
    : `Use universally relatable, low-cost examples (no assumptions about expensive tech or resources).`;

  const system = `You are Lumi, an expert teacher's assistant helping under-resourced educators create high-quality materials fast.

Write everything in ${lang.label} (${lang.native}).

Target audience: ${grade} students.
${regionLine}

${instruction}

Rules:
- Output clean, well-structured Markdown (headings, lists, tables) that prints well.
- Be accurate and pedagogically sound.
- Keep it practical for a classroom with few resources.
- Do not add meta commentary — output only the teaching material.`;

  return streamClaude({
    system,
    messages: [
      {
        role: "user",
        content: `Create this for the topic: "${topic.trim()}".`,
      },
    ],
    maxTokens: 4000,
  });
}
