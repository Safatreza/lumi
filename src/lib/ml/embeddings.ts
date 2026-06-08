/**
 * Semantic embeddings with sentence-transformers all-MiniLM-L6-v2 running in
 * the browser via transformers.js. Open-source, on-device. Powers the Textbook
 * mode's retrieval: we embed textbook chunks + the student's question, then
 * pull the most relevant passages to ground Claude's answer (RAG).
 */

type Tensor = { tolist: () => number[][] };
type FeatureExtractor = (
  texts: string | string[],
  opts: { pooling: "mean"; normalize: boolean },
) => Promise<Tensor>;

let extractor: FeatureExtractor | null = null;
let loading: Promise<FeatureExtractor> | null = null;

export type ProgressCb = (info: { status?: string; progress?: number }) => void;

export async function loadEmbedder(
  onProgress?: ProgressCb,
): Promise<FeatureExtractor> {
  if (extractor) return extractor;
  if (loading) return loading;
  loading = (async () => {
    const { pipeline } = await import("@huggingface/transformers");
    const pipe = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      { progress_callback: onProgress as never },
    );
    extractor = pipe as unknown as FeatureExtractor;
    return extractor;
  })();
  return loading;
}

/** Embed an array of strings into normalized vectors. */
export async function embed(
  texts: string[],
  onProgress?: ProgressCb,
): Promise<number[][]> {
  const pipe = await loadEmbedder(onProgress);
  const out = await pipe(texts, { pooling: "mean", normalize: true });
  return out.tolist();
}

/** Cosine similarity of two equal-length, already-normalized vectors. */
export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export interface Chunk {
  text: string;
  vector: number[];
}

/** Split long text into overlapping chunks suitable for embedding. */
export function chunkText(text: string, size = 700, overlap = 120): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= size) return clean ? [clean] : [];
  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    chunks.push(clean.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}

/** Return the top-k most relevant chunks for a query embedding. */
export function topK(
  queryVec: number[],
  chunks: Chunk[],
  k = 4,
): { text: string; score: number }[] {
  return chunks
    .map((c) => ({ text: c.text, score: cosine(queryVec, c.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
