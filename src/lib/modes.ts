/** The three WortLaut modules, in workflow order: a school sets up an
 *  accommodation, draws on the human support pool, and the student sits the
 *  exam with the AI assistant. The Lumi learning tools (tutor/teacher/textbook)
 *  remain available at their routes but are no longer in the primary nav. */
export type ModeId = "manage" | "pool" | "exam" | "tutor" | "teacher" | "textbook";

export interface Mode {
  id: ModeId;
  name: string;
  /** Short label for the top nav. */
  short: string;
  href: string;
  tagline: string;
  blurb: string;
  /** lucide-react icon name */
  icon: "ClipboardList" | "Users" | "Mic";
  /** CSS color var name from globals.css */
  color: string;
}

export const MODES: Mode[] = [
  {
    id: "manage",
    name: "Accommodation Manager",
    short: "Manage",
    href: "/manage",
    tagline: "For schools & universities",
    blurb:
      "Request an accommodation, approve the support types, assign room, time, person and tools, track documentation, and generate the exam-day checklist — under each country's rules.",
    icon: "ClipboardList",
    color: "var(--color-brand)",
  },
  {
    id: "pool",
    name: "Human Support Pool",
    short: "Support Pool",
    href: "/pool",
    tagline: "Verified readers, scribes & invigilators",
    blurb:
      "A roster of verified support people across the EU — roles, language skills, training status and availability — with automatic conflict checks, booking and attendance tracking.",
    icon: "Users",
    color: "var(--color-scribe)",
  },
  {
    id: "exam",
    name: "AI Exam Access Assistant",
    short: "Exam Room",
    href: "/exam",
    tagline: "For the student, during the exam",
    blurb:
      "Reads approved exam content aloud, transcribes dictated answers verbatim, follows navigation commands, refuses any explanation or answer, supports 24 EU languages, and produces an audit/provenance report.",
    icon: "Mic",
    color: "var(--color-teacher)",
  },
];

export function getMode(id: ModeId): Mode {
  return MODES.find((m) => m.id === id) as Mode;
}
