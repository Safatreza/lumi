/**
 * Voice → text with OpenAI's Whisper running fully in the browser via
 * transformers.js (@huggingface/transformers). Open-source, on-device, no API
 * key, works for many languages. Lazy-loaded + cached as a singleton.
 *
 * This is the accessibility / low-literacy path: a student speaks their
 * question instead of typing it.
 *
 * Demo tip: the model (~tiny) downloads on first use. Open the mic once before
 * presenting to warm the cache so it's instant on stage.
 */

type AsrResult = { text?: string };
type AsrPipeline = (audio: Float32Array) => Promise<AsrResult>;

let asrPipe: AsrPipeline | null = null;
let loading: Promise<AsrPipeline> | null = null;

export type ProgressCb = (info: { status?: string; progress?: number }) => void;

export async function loadWhisper(onProgress?: ProgressCb): Promise<AsrPipeline> {
  if (asrPipe) return asrPipe;
  if (loading) return loading;

  loading = (async () => {
    const { pipeline } = await import("@huggingface/transformers");
    const pipe = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny",
      { progress_callback: onProgress as never },
    );
    asrPipe = pipe as unknown as AsrPipeline;
    return asrPipe;
  })();

  return loading;
}

export function whisperReady(): boolean {
  return asrPipe !== null;
}

/** Transcribe a recorded audio blob to text. */
export async function transcribe(
  blob: Blob,
  onProgress?: ProgressCb,
): Promise<string> {
  const pipe = await loadWhisper(onProgress);
  const audio = await blobToMono16k(blob);
  const out = await pipe(audio);
  return (out.text ?? "").trim();
}

async function blobToMono16k(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new Ctx({ sampleRate: 16000 });
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  const channel = decoded.getChannelData(0);
  await ctx.close();
  return channel;
}

/** Simple mic recorder wrapper around MediaRecorder. */
export class MicRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];

  static supported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof MediaRecorder !== "undefined"
    );
  }

  async start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.recorder = new MediaRecorder(stream);
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start();
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const rec = this.recorder;
      if (!rec) {
        reject(new Error("Recorder not started"));
        return;
      }
      rec.onstop = () => {
        const blob = new Blob(this.chunks, { type: rec.mimeType || "audio/webm" });
        rec.stream.getTracks().forEach((t) => t.stop());
        resolve(blob);
      };
      rec.stop();
    });
  }
}
