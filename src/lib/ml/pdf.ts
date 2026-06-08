/**
 * Extract text from a PDF in the browser with pdf.js. The worker is loaded
 * from a CDN pinned to the exact installed version, which is the most reliable
 * setup across Next.js dev + Vercel without custom asset plumbing.
 */
export async function extractPdfText(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => (item as { str?: string }).str ?? "")
      .join(" ");
    text += pageText + "\n\n";
    onProgress?.(Math.round((i / doc.numPages) * 100));
  }
  return text.trim();
}
