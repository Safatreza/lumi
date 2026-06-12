/** The product modes. One scaffold, several framings — pick whichever
 *  matches the revealed challenge track on the day. */
export type ModeId = "tutor" | "teacher" | "textbook" | "scribe";

export interface Mode {
  id: ModeId;
  name: string;
  href: string;
  tagline: string;
  blurb: string;
  /** lucide-react icon name */
  icon: "GraduationCap" | "Presentation" | "BookOpen" | "Users";
  /** CSS color var name from globals.css */
  color: string;
}

export const MODES: Mode[] = [
  {
    id: "tutor",
    name: "Tutor",
    href: "/tutor",
    tagline: "A patient tutor in your language",
    blurb:
      "Ask anything by text, voice, or a photo of your homework. Lumi guides you to the answer instead of just handing it over — in the language you think in.",
    icon: "GraduationCap",
    color: "var(--color-tutor)",
  },
  {
    id: "teacher",
    name: "Teacher",
    href: "/teacher",
    tagline: "Lesson plans & quizzes in seconds",
    blurb:
      "Generate localized lessons, worksheets, and quizzes for any topic, grade, and language — with culturally relevant examples for your classroom.",
    icon: "Presentation",
    color: "var(--color-teacher)",
  },
  {
    id: "textbook",
    name: "Textbook",
    href: "/textbook",
    tagline: "Turn any textbook into a study buddy",
    blurb:
      "Paste, upload, or photograph textbook pages. Lumi reads them, answers your questions from the material, and builds a quiz to test you.",
    icon: "BookOpen",
    color: "var(--color-textbook)",
  },
  {
    id: "scribe",
    name: "Scribe",
    href: "/scribe",
    tagline: "Exam scribes for blind & disabled students",
    blurb:
      "Find a verified volunteer scribe for your official exam — across all 27 EU countries and 24 languages, matched by the one-grade-below integrity rule, radius, and institute.",
    icon: "Users",
    color: "var(--color-scribe)",
  },
];

export function getMode(id: ModeId): Mode {
  return MODES.find((m) => m.id === id) as Mode;
}
