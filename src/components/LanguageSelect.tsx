"use client";

import { Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";

export default function LanguageSelect({
  value,
  onChange,
  label = "Language",
}: {
  value: string;
  onChange: (code: string) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium shadow-sm">
      <Globe size={15} className="text-muted" />
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent pr-1 font-semibold outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}
