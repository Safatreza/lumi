/** The three product modes. One scaffold, three framings — pick whichever
 *  matches the revealed challenge track on the day. */
export type ModeId = "tutor" | "teacher" | "textbook";

export interface Mode {
  id: ModeId;
  name: string;
  href: string;
  tagline: string;
  blurb: string;
  /** lucide-react icon name */
  icon: "GraduationCap" | "Presentation" | "BookOpen";
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
];

export function getMode(id: ModeId): Mode {
  return MODES.find((m) => m.id === id) as Mode;
}
