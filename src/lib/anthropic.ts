import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Anthropic client + streaming helper used by every API route.
 *
 * Model: defaults to claude-opus-4-8 (the current most-capable model).
 * Override with ANTHROPIC_MODEL — set it to claude-sonnet-4-6 for snappier,
 * cheaper responses during a live demo on slow conference wifi.
 */
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (local) or the Vercel project env (deploy).",
    );
  }
  return new Anthropic({ apiKey });
}

export type ChatMessage = Anthropic.MessageParam;

interface StreamArgs {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}

/**
 * Runs a streaming Claude request and returns a plain text/event ReadableStream
 * of raw token deltas. The browser reads it with a fetch() reader — no extra
 * client library needed, which keeps the bundle tiny and the path predictable.
 */
export function streamClaude({
  system,
  messages,
  maxTokens = 2048,
}: StreamArgs): Response {
  const client = getClient();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: MODEL,
          max_tokens: maxTokens,
          system,
          messages,
        });

        for await (const event of claudeStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error talking to Claude.";
        // Surface the error inline so the UI can show something useful.
        controller.enqueue(encoder.encode(`\n\n⚠️ ${message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
