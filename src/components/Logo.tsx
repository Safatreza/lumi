import Link from "next/link";

/** Lumi wordmark + spark mark. */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span
        className="grid place-items-center rounded-xl bg-brand text-white shadow-sm transition-transform group-hover:scale-105"
        style={{ width: size + 8, height: size + 8 }}
        aria-hidden
      >
        <svg
          width={size * 0.62}
          height={size * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* a spark / lightbulb of understanding */}
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          <circle cx="12" cy="12" r="3.6" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight">Lumi</span>
    </Link>
  );
}
