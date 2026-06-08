import { getClient, MODEL } from "@/lib/anthropic";
import { getLanguage } from "@/lib/languages";

export const runtime = "nodejs";
export const maxDuration = 30;

interface Body {
  text?: string;
  source?: string;
  target?: string;
}

/**
 * Translates text using Meta's open-source NLLB-200 via the HuggingFace
 * Inference API (200 languages, strong on low-resource ones). If no HF_TOKEN
 * is configured, or the model is cold/unavailable, it transparently falls back
 * to Claude so the feature always works.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, source = "en", target = "en" } = body;
  if (!text || !text.trim()) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const src = getLanguage(source);
  const tgt = getLanguage(target);

  // 1) Try NLLB-200 via HuggingFace (the open-source model showcase)
  const hfToken = process.env.HF_TOKEN;
  if (hfToken) {
    try {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: text,
            parameters: { src_lang: src.nllb, tgt_lang: tgt.nllb },
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        const translated =
          Array.isArray(data) && data[0]?.translation_text
            ? data[0].translation_text
            : null;
        if (translated) {
          return Response.json({ text: translated, engine: "nllb-200" });
        }
      }
    } catch {
      // fall through to Claude
    }
  }

  // 2) Fallback: Claude
  try {
    const client = getClient();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: `Translate the user's text from ${src.label} to ${tgt.label}. Output ONLY the translation, no notes.`,
      messages: [{ role: "user", content: text }],
    });
    const out = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return Response.json({ text: out, engine: "claude" });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Translation failed" },
      { status: 500 },
    );
  }
}
