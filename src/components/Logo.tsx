import Link from "next/link";
import { Mic } from "lucide-react";

/** WortLaut wordmark + mic mark. */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span
        className="grid place-items-center rounded-xl bg-brand text-white shadow-sm transition-transform group-hover:scale-105"
        style={{ width: size + 8, height: size + 8, background: "var(--color-brand)" }}
        aria-hidden
      >
        <Mic size={size * 0.6} strokeWidth={2.4} />
      </span>
      <span className="text-xl font-extrabold tracking-tight">
        Wort<span style={{ color: "var(--color-brand)" }}>Laut</span>
      </span>
    </Link>
  );
}
