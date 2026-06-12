/**
 * Per-country exam-accommodation policy engine.
 *
 * Education is a member-state competence — there is no single EU exam
 * regulation. The shared umbrella is UN CRPD Art. 24 ("reasonable
 * accommodation", exams on equal terms), ratified by the EU and all 27
 * member states. Below, countries researched against primary sources are
 * marked verified; the rest carry the CRPD default until verified, and the
 * UI says so honestly.
 */

export interface CountryPolicy {
  /** ISO country code */
  country: string;
  /** Who appoints/approves human support for official exams */
  appointedBy: string;
  /** Key rules, shown as bullets */
  rules: string[];
  /** Whether the session must be recorded (audit requirement) */
  recordingRequired: boolean;
  /** Extra-time practice, short label */
  extraTime: string;
  /** Researched against primary sources (ministry/exam-board documents) */
  verified: boolean;
}

const DEFAULT_RULES = [
  "UN CRPD Art. 24 applies: reasonable accommodation so candidates sit exams on equal terms.",
  "Accommodations (extra time, adapted formats, reader/scribe) are approved and appointed by the school or national exam authority.",
  "Support persons are bound to neutrality and a verbatim role.",
];

export const POLICIES: Record<string, CountryPolicy> = {
  FR: {
    country: "FR",
    appointedBy: "Exam-organizing authority (académie)",
    rules: [
      "Candidates unable to read or write are assisted by a secrétaire scripteur/lecteur.",
      "The scribe reads the paper verbatim — no commentary, no explanations.",
      "Writes under dictation without correcting syntax, grammar, or word choice.",
      "Neutrality required: no family ties or compromising professional position.",
      "The scribe's knowledge must match the exam's discipline and level.",
      "Requests filed early — up to a year before the exam session.",
    ],
    recordingRequired: false,
    extraTime: "Usually +1/3 time (tiers temps)",
    verified: true,
  },
  DE: {
    country: "DE",
    appointedBy: "School supervisory authority (per Bundesland)",
    rules: [
      "Nachteilsausgleich (disadvantage compensation), regulated separately by each of the 16 Bundesländer.",
      "Blind candidates receive modified central exam papers (e.g. Abitur).",
      "Assistive technology and readers (Vorlesekräfte) provided; personal writing assistance in individual cases.",
      "Academic standards stay unchanged — accommodation compensates access, not performance.",
    ],
    recordingRequired: false,
    extraTime: "Zeitzuschlag set case-by-case",
    verified: true,
  },
  IE: {
    country: "IE",
    appointedBy: "State Examinations Commission (RACE scheme), via the school",
    rules: [
      "RACE scheme: the school applies on the candidate's behalf with evidence (e.g. written-work samples).",
      "The scribe writes down exactly what the candidate says — no other help allowed.",
      "Scribes need language competence for language subjects.",
      "Extra time is granted when a scribe is used (dictation overhead).",
    ],
    recordingRequired: false,
    extraTime: "Additional time with scribe use",
    verified: true,
  },
  PL: {
    country: "PL",
    appointedBy: "School exam team under CKE adaptation rules",
    rules: [
      "A supporting teacher (nauczyciel wspomagający) reads tasks and writes answers for blind candidates.",
      "May not explain tasks or suggest answers; may only re-read on request.",
      "The session must be audio-recorded — a mandatory audit trail.",
    ],
    recordingRequired: true,
    extraTime: "Extended time per CKE adaptation tables",
    verified: true,
  },
  NL: {
    country: "NL",
    appointedBy: "School board under the Eindexamenbesluit (Art. 55)",
    rules: [
      "Exams may be taken 'op aangepaste wijze' (in adapted manner).",
      "Technology-first practice: adapted digital papers, text-to-speech formats.",
      "Standard extra time (typically up to 30 minutes).",
    ],
    recordingRequired: false,
    extraTime: "Up to +30 minutes",
    verified: true,
  },
};

const POLICY_DEFAULT: Omit<CountryPolicy, "country"> = {
  appointedBy: "School or national exam authority",
  rules: DEFAULT_RULES,
  recordingRequired: false,
  extraTime: "Per national accommodation rules",
  verified: false,
};

export function getPolicy(countryCode: string): CountryPolicy {
  return (
    POLICIES[countryCode] ?? { country: countryCode, ...POLICY_DEFAULT }
  );
}
