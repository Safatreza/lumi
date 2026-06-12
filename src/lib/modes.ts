/** OwnVoice product modes. The Lumi learning tools (tutor/teacher/textbook)
 *  remain available at their routes but are no longer in the primary nav. */
export type ModeId = "exam" | "scribe" | "tutor" | "teacher" | "textbook";

export interface Mode {
  id: ModeId;
  name: string;
  href: string;
  tagline: string;
  blurb: string;
  /** lucide-react icon name */
  icon: "Mic" | "Users";
  /** CSS color var name from globals.css */
  color: string;
}

export const MODES: Mode[] = [
  {
    id: "exam",
    name: "Exam Room",
    href: "/exam",
    tagline: "The exam-safe AI assistant",
    blurb:
      "Reads questions aloud, repeats on command, transcribes dictated answers verbatim, and refuses academic help — every event on a timestamped audit trail.",
    icon: "Mic",
    color: "var(--color-brand)",
  },
  {
    id: "scribe",
    name: "Support Finder",
    href: "/scribe",
    tagline: "Verified human support, rule-compliant",
    blurb:
      "Source verified volunteer scribes and readers across all 27 EU countries and 24 languages — matched under each country's accommodation rules.",
    icon: "Users",
    color: "var(--color-scribe)",
  },
];

export function getMode(id: ModeId): Mode {
  return MODES.find((m) => m.id === id) as Mode;
}
