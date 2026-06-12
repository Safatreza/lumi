"use client";

import { useEffect, useRef, useState } from "react";

/** Circular team portrait that falls back to an initials monogram until the
 *  photo exists at /public/team/<file>. */
export default function TeamAvatar({
  src,
  name,
  position = "center",
}: {
  src: string;
  name: string;
  /** CSS object-position for the crop, e.g. "center 25%" for portraits */
  position?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // An <img> can 404 before React hydrates and attaches onError, which would
  // leave a broken-image icon forever. Re-check the natural size on mount so the
  // monogram fallback shows reliably (and the real photo shows once it exists).
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  if (failed) {
    return (
      <span
        className="grid size-24 shrink-0 place-items-center rounded-full text-2xl font-extrabold text-white shadow-lg ring-4 ring-white/70"
        style={{ background: "var(--color-brand)" }}
        role="img"
        aria-label={`Portrait of ${name}`}
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={`Portrait of ${name}`}
      onError={() => setFailed(true)}
      className="size-24 shrink-0 rounded-full object-cover shadow-lg ring-4 ring-white/70"
      style={{ objectPosition: position }}
    />
  );
}
