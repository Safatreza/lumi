"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Users } from "lucide-react";
import { MODES } from "@/lib/modes";
import Logo from "./Logo";

const ICONS = {
  Mic,
  Users,
} as const;

/** Sticky top navigation shared by all three mode pages. */
export default function ModeNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:px-5">
        <Logo />
        <nav className="flex items-center gap-1">
          {MODES.map((mode) => {
            const Icon = ICONS[mode.icon];
            const active = pathname === mode.href;
            return (
              <Link
                key={mode.id}
                href={mode.href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "text-white"
                    : "text-muted hover:bg-brand-soft hover:text-ink"
                }`}
                style={active ? { background: mode.color } : undefined}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={2.4} />
                <span className="hidden sm:inline">{mode.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
