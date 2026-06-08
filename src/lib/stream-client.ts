/**
 * Posts JSON to a streaming route and invokes onChunk with each decoded text
 * delta as it arrives. Returns the full accumulated text when done.
 *
 * Works against any of our API routes, which all stream raw Claude token text.
 */
export async function streamPost(
  url: string,
  body: unknown,
  onChunk: (text: string, full: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    full += text;
    onChunk(text, full);
  }

  return full;
}
