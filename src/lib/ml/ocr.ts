/**
 * Client-side OCR with Tesseract.js (open-source, runs entirely in the browser
 * — no server, no API key). Lazy-loaded on first use so it never bloats the
 * initial bundle or the Vercel build.
 *
 * This is the "photo of a textbook / homework" path: a student with a cheap
 * phone snaps a picture, we turn it into text, then Claude works from it.
 */
export async function runOCR(
  image: File | Blob | string,
  onProgress?: (pct: number) => void,
  langs = "eng",
): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const result = await Tesseract.recognize(image, langs, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  return result.data.text.trim();
}
