/**
 * Languages offered across the app. `nllb` is the FLORES-200 code used by
 * Meta's NLLB-200 translation model (via the HF Inference API). The list
 * deliberately leans toward lower-resource languages — that's the whole point
 * of tackling the "language barrier" axis of education inequality.
 */
export interface Language {
  /** Human label shown in the UI */
  label: string;
  /** Native name */
  native: string;
  /** BCP-47-ish short code, used for prompts + speech APIs */
  code: string;
  /** NLLB-200 / FLORES-200 code for the translation model */
  nllb: string;
}

export const LANGUAGES: Language[] = [
  { label: "English", native: "English", code: "en", nllb: "eng_Latn" },
  { label: "Spanish", native: "Español", code: "es", nllb: "spa_Latn" },
  { label: "French", native: "Français", code: "fr", nllb: "fra_Latn" },
  { label: "Arabic", native: "العربية", code: "ar", nllb: "arb_Arab" },
  { label: "Hindi", native: "हिन्दी", code: "hi", nllb: "hin_Deva" },
  { label: "Bengali", native: "বাংলা", code: "bn", nllb: "ben_Beng" },
  { label: "Swahili", native: "Kiswahili", code: "sw", nllb: "swh_Latn" },
  { label: "Portuguese", native: "Português", code: "pt", nllb: "por_Latn" },
  { label: "Urdu", native: "اردو", code: "ur", nllb: "urd_Arab" },
  { label: "Yoruba", native: "Yorùbá", code: "yo", nllb: "yor_Latn" },
  { label: "Hausa", native: "Hausa", code: "ha", nllb: "hau_Latn" },
  { label: "Indonesian", native: "Bahasa Indonesia", code: "id", nllb: "ind_Latn" },
  { label: "German", native: "Deutsch", code: "de", nllb: "deu_Latn" },
  { label: "Chinese", native: "中文", code: "zh", nllb: "zho_Hans" },
  { label: "Amharic", native: "አማርኛ", code: "am", nllb: "amh_Ethi" },
  { label: "Nepali", native: "नेपाली", code: "ne", nllb: "npi_Deva" },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];

export function getLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? DEFAULT_LANGUAGE;
}
