/**
 * Scribe marketplace data layer.
 *
 * EU-wide demo database: all 27 member states, all 24 official EU languages,
 * exam candidates in grades 10–12 and volunteer scribes. The one hard rule —
 * mirrored from real exam-board scribe regulations — is that a scribe must
 * study at least ONE grade below the candidate, so the knowledge asymmetry
 * always favors the candidate and the scribe stays a pure transcription aid.
 */

/* ---------------------------------- Languages ---------------------------- */

export interface EULanguage {
  code: string;
  label: string;
  native: string;
}

/** The 24 official languages of the European Union. */
export const EU_LANGUAGES: EULanguage[] = [
  { code: "bg", label: "Bulgarian", native: "български" },
  { code: "hr", label: "Croatian", native: "Hrvatski" },
  { code: "cs", label: "Czech", native: "Čeština" },
  { code: "da", label: "Danish", native: "Dansk" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "en", label: "English", native: "English" },
  { code: "et", label: "Estonian", native: "Eesti" },
  { code: "fi", label: "Finnish", native: "Suomi" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "el", label: "Greek", native: "Ελληνικά" },
  { code: "hu", label: "Hungarian", native: "Magyar" },
  { code: "ga", label: "Irish", native: "Gaeilge" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "lv", label: "Latvian", native: "Latviešu" },
  { code: "lt", label: "Lithuanian", native: "Lietuvių" },
  { code: "mt", label: "Maltese", native: "Malti" },
  { code: "pl", label: "Polish", native: "Polski" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ro", label: "Romanian", native: "Română" },
  { code: "sk", label: "Slovak", native: "Slovenčina" },
  { code: "sl", label: "Slovenian", native: "Slovenščina" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "sv", label: "Swedish", native: "Svenska" },
];

export function getEULanguage(code: string): EULanguage {
  return EU_LANGUAGES.find((l) => l.code === code) ?? EU_LANGUAGES[5]; // en
}

/* ---------------------------------- Countries ---------------------------- */

export interface EUCountry {
  /** ISO 3166-1 alpha-2 */
  code: string;
  name: string;
  /** Official EU language(s) of the country */
  languages: string[];
}

/** All 27 EU member states. */
export const EU_COUNTRIES: EUCountry[] = [
  { code: "AT", name: "Austria", languages: ["de"] },
  { code: "BE", name: "Belgium", languages: ["nl", "fr", "de"] },
  { code: "BG", name: "Bulgaria", languages: ["bg"] },
  { code: "HR", name: "Croatia", languages: ["hr"] },
  { code: "CY", name: "Cyprus", languages: ["el"] },
  { code: "CZ", name: "Czechia", languages: ["cs"] },
  { code: "DK", name: "Denmark", languages: ["da"] },
  { code: "EE", name: "Estonia", languages: ["et"] },
  { code: "FI", name: "Finland", languages: ["fi", "sv"] },
  { code: "FR", name: "France", languages: ["fr"] },
  { code: "DE", name: "Germany", languages: ["de"] },
  { code: "GR", name: "Greece", languages: ["el"] },
  { code: "HU", name: "Hungary", languages: ["hu"] },
  { code: "IE", name: "Ireland", languages: ["en", "ga"] },
  { code: "IT", name: "Italy", languages: ["it"] },
  { code: "LV", name: "Latvia", languages: ["lv"] },
  { code: "LT", name: "Lithuania", languages: ["lt"] },
  { code: "LU", name: "Luxembourg", languages: ["fr", "de"] },
  { code: "MT", name: "Malta", languages: ["mt", "en"] },
  { code: "NL", name: "Netherlands", languages: ["nl"] },
  { code: "PL", name: "Poland", languages: ["pl"] },
  { code: "PT", name: "Portugal", languages: ["pt"] },
  { code: "RO", name: "Romania", languages: ["ro"] },
  { code: "SK", name: "Slovakia", languages: ["sk"] },
  { code: "SI", name: "Slovenia", languages: ["sl"] },
  { code: "ES", name: "Spain", languages: ["es"] },
  { code: "SE", name: "Sweden", languages: ["sv"] },
];

export function getCountry(code: string): EUCountry | undefined {
  return EU_COUNTRIES.find((c) => c.code === code);
}

/** ISO country code → emoji flag (regional indicator symbols). */
export function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

/* ----------------------------------- Cities ------------------------------ */

export interface City {
  name: string;
  /** ISO country code */
  country: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { name: "Vienna", country: "AT", lat: 48.208, lng: 16.373 },
  { name: "Brussels", country: "BE", lat: 50.85, lng: 4.352 },
  { name: "Sofia", country: "BG", lat: 42.698, lng: 23.322 },
  { name: "Zagreb", country: "HR", lat: 45.815, lng: 15.982 },
  { name: "Nicosia", country: "CY", lat: 35.186, lng: 33.382 },
  { name: "Prague", country: "CZ", lat: 50.075, lng: 14.437 },
  { name: "Copenhagen", country: "DK", lat: 55.676, lng: 12.568 },
  { name: "Tallinn", country: "EE", lat: 59.437, lng: 24.754 },
  { name: "Helsinki", country: "FI", lat: 60.17, lng: 24.938 },
  { name: "Paris", country: "FR", lat: 48.857, lng: 2.352 },
  { name: "Munich", country: "DE", lat: 48.137, lng: 11.575 },
  { name: "Augsburg", country: "DE", lat: 48.371, lng: 10.898 },
  { name: "Freising", country: "DE", lat: 48.403, lng: 11.749 },
  { name: "Nuremberg", country: "DE", lat: 49.454, lng: 11.077 },
  { name: "Berlin", country: "DE", lat: 52.52, lng: 13.405 },
  { name: "Athens", country: "GR", lat: 37.984, lng: 23.728 },
  { name: "Budapest", country: "HU", lat: 47.498, lng: 19.04 },
  { name: "Dublin", country: "IE", lat: 53.349, lng: -6.26 },
  { name: "Rome", country: "IT", lat: 41.893, lng: 12.483 },
  { name: "Riga", country: "LV", lat: 56.95, lng: 24.105 },
  { name: "Vilnius", country: "LT", lat: 54.687, lng: 25.28 },
  { name: "Luxembourg City", country: "LU", lat: 49.612, lng: 6.13 },
  { name: "Valletta", country: "MT", lat: 35.899, lng: 14.514 },
  { name: "Amsterdam", country: "NL", lat: 52.367, lng: 4.904 },
  { name: "Warsaw", country: "PL", lat: 52.23, lng: 21.012 },
  { name: "Lisbon", country: "PT", lat: 38.722, lng: -9.139 },
  { name: "Bucharest", country: "RO", lat: 44.427, lng: 26.103 },
  { name: "Bratislava", country: "SK", lat: 48.149, lng: 17.107 },
  { name: "Ljubljana", country: "SI", lat: 46.056, lng: 14.506 },
  { name: "Madrid", country: "ES", lat: 40.417, lng: -3.703 },
  { name: "Stockholm", country: "SE", lat: 59.329, lng: 18.069 },
];

export function getCity(name: string): City {
  return CITIES.find((c) => c.name === name) as City;
}

/* ---------------------------------- Profiles ----------------------------- */

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Literature",
  "Economics",
  "Computer Science",
] as const;

export type StudentGrade = 10 | 11 | 12;

export interface ScribeProfile {
  id: string;
  name: string;
  /** School grade the scribe currently studies in */
  grade: number;
  institution: string;
  city: string;
  languages: string[];
  subjects: string[];
  rating: number;
  sessions: number;
  verified: boolean;
}

export type Accommodation =
  | "blind"
  | "low vision"
  | "motor impairment"
  | "dysgraphia";

export interface StudentProfile {
  id: string;
  name: string;
  grade: StudentGrade;
  institution: string;
  city: string;
  languages: string[];
  accommodation: Accommodation;
  examSubject: string;
  examDate: string;
}

/** Demo exam candidates (grades 10–12) across the EU. */
export const STUDENTS: StudentProfile[] = [
  { id: "s1", name: "Amira Khalil", grade: 12, institution: "Maria-Theresia-Gymnasium", city: "Munich", languages: ["de", "en"], accommodation: "blind", examSubject: "Mathematics", examDate: "2026-07-02" },
  { id: "s2", name: "Felix Brandt", grade: 11, institution: "Heinrich-Hertz-Gymnasium", city: "Berlin", languages: ["de"], accommodation: "low vision", examSubject: "History", examDate: "2026-07-06" },
  { id: "s3", name: "Chiara Moretti", grade: 10, institution: "Liceo Classico Visconti", city: "Rome", languages: ["it", "en"], accommodation: "motor impairment", examSubject: "Literature", examDate: "2026-06-29" },
  { id: "s4", name: "Mateusz Wiśniewski", grade: 12, institution: "XIV LO im. Staszica", city: "Warsaw", languages: ["pl", "en"], accommodation: "blind", examSubject: "Physics", examDate: "2026-07-10" },
  { id: "s5", name: "Inés Romero", grade: 11, institution: "IES San Isidro", city: "Madrid", languages: ["es", "en"], accommodation: "dysgraphia", examSubject: "Economics", examDate: "2026-07-01" },
  { id: "s6", name: "Yusuf Demir", grade: 10, institution: "Barlaeus Gymnasium", city: "Amsterdam", languages: ["nl", "en"], accommodation: "low vision", examSubject: "Economics", examDate: "2026-07-08" },
  { id: "s7", name: "Margaux Petit", grade: 12, institution: "Lycée Henri-IV", city: "Paris", languages: ["fr"], accommodation: "blind", examSubject: "Biology", examDate: "2026-06-30" },
  { id: "s8", name: "Sofia Andersson", grade: 11, institution: "Norra Real", city: "Stockholm", languages: ["sv", "en"], accommodation: "motor impairment", examSubject: "Chemistry", examDate: "2026-07-03" },
  { id: "s9", name: "Niamh O'Connor", grade: 10, institution: "Loreto College", city: "Dublin", languages: ["en", "ga"], accommodation: "blind", examSubject: "Geography", examDate: "2026-07-07" },
  { id: "s10", name: "Stefan Ionescu", grade: 12, institution: "Colegiul Sf. Sava", city: "Bucharest", languages: ["ro", "en"], accommodation: "low vision", examSubject: "Computer Science", examDate: "2026-07-09" },
];

/** Demo volunteer scribes — at least one per EU member state, plus a Bavaria
 *  cluster so the radius search has something to find around Munich. */
export const SCRIBES: ScribeProfile[] = [
  // Bavaria cluster (radius-search demo around Munich)
  { id: "c1", name: "Jonas Weber", grade: 11, institution: "Wilhelmsgymnasium München", city: "Munich", languages: ["de", "en"], subjects: ["Mathematics", "Physics"], rating: 4.9, sessions: 23, verified: true },
  { id: "c2", name: "Lena Fischer", grade: 9, institution: "Luisengymnasium München", city: "Munich", languages: ["de", "en", "fr"], subjects: ["Literature", "History"], rating: 4.8, sessions: 17, verified: true },
  { id: "c3", name: "Maximilian Bauer", grade: 12, institution: "Maximiliansgymnasium München", city: "Munich", languages: ["de", "en"], subjects: ["Mathematics", "Computer Science"], rating: 5.0, sessions: 31, verified: true },
  { id: "c4", name: "Sofia Krüger", grade: 10, institution: "Gymnasium bei St. Anna", city: "Augsburg", languages: ["de"], subjects: ["Chemistry", "Biology"], rating: 4.6, sessions: 9, verified: true },
  { id: "c5", name: "Elias Wagner", grade: 8, institution: "Camerloher-Gymnasium", city: "Freising", languages: ["de", "en"], subjects: ["Geography", "Biology"], rating: 4.5, sessions: 6, verified: true },
  { id: "c6", name: "Hannah Schmidt", grade: 11, institution: "Melanchthon-Gymnasium", city: "Nuremberg", languages: ["de", "en"], subjects: ["Economics", "Mathematics"], rating: 4.7, sessions: 14, verified: true },
  // One per remaining member state
  { id: "c7", name: "Lukas Hofer", grade: 11, institution: "Akademisches Gymnasium Wien", city: "Vienna", languages: ["de", "en"], subjects: ["History", "Economics"], rating: 4.8, sessions: 19, verified: true },
  { id: "c8", name: "Noor Peeters", grade: 10, institution: "Atheneum Brussel", city: "Brussels", languages: ["nl", "fr", "en"], subjects: ["Mathematics", "Literature"], rating: 4.7, sessions: 12, verified: true },
  { id: "c9", name: "Viktor Dimitrov", grade: 9, institution: "Sofia High School of Mathematics", city: "Sofia", languages: ["bg", "en"], subjects: ["Mathematics", "Physics"], rating: 4.6, sessions: 8, verified: true },
  { id: "c10", name: "Petra Kovač", grade: 10, institution: "V. gimnazija Zagreb", city: "Zagreb", languages: ["hr", "en"], subjects: ["Biology", "Chemistry"], rating: 4.5, sessions: 7, verified: true },
  { id: "c11", name: "Andreas Georgiou", grade: 9, institution: "Pancyprian Gymnasium", city: "Nicosia", languages: ["el", "en"], subjects: ["History", "Geography"], rating: 4.4, sessions: 5, verified: true },
  { id: "c12", name: "Tereza Nováková", grade: 11, institution: "Gymnázium Jana Keplera", city: "Prague", languages: ["cs", "en"], subjects: ["Physics", "Mathematics"], rating: 4.9, sessions: 26, verified: true },
  { id: "c13", name: "Freja Nielsen", grade: 10, institution: "Ørestad Gymnasium", city: "Copenhagen", languages: ["da", "en"], subjects: ["Economics", "Geography"], rating: 4.6, sessions: 11, verified: true },
  { id: "c14", name: "Karl Tamm", grade: 9, institution: "Tallinna Reaalkool", city: "Tallinn", languages: ["et", "en"], subjects: ["Computer Science", "Mathematics"], rating: 4.7, sessions: 10, verified: true },
  { id: "c15", name: "Aino Korhonen", grade: 11, institution: "Ressun lukio", city: "Helsinki", languages: ["fi", "sv", "en"], subjects: ["Chemistry", "Biology"], rating: 4.8, sessions: 16, verified: true },
  { id: "c16", name: "Camille Laurent", grade: 10, institution: "Lycée Louis-le-Grand", city: "Paris", languages: ["fr", "en"], subjects: ["Biology", "Literature"], rating: 4.8, sessions: 21, verified: true },
  { id: "c17", name: "Eleni Papadopoulou", grade: 10, institution: "Varvakeio Model School", city: "Athens", languages: ["el", "en"], subjects: ["Literature", "History"], rating: 4.5, sessions: 9, verified: true },
  { id: "c18", name: "Bence Tóth", grade: 9, institution: "Fazekas Mihály Gimnázium", city: "Budapest", languages: ["hu", "en"], subjects: ["Mathematics", "Physics"], rating: 4.6, sessions: 13, verified: true },
  { id: "c19", name: "Saoirse Murphy", grade: 11, institution: "St. Patrick's Grammar", city: "Dublin", languages: ["en", "ga"], subjects: ["Geography", "Literature"], rating: 4.9, sessions: 24, verified: true },
  { id: "c20", name: "Giulia Ricci", grade: 9, institution: "Liceo Scientifico Righi", city: "Rome", languages: ["it", "en"], subjects: ["Literature", "History"], rating: 4.7, sessions: 15, verified: true },
  { id: "c21", name: "Elīna Ozola", grade: 9, institution: "Riga State Gymnasium No.1", city: "Riga", languages: ["lv", "en"], subjects: ["Mathematics", "Economics"], rating: 4.5, sessions: 6, verified: true },
  { id: "c22", name: "Mantas Kazlauskas", grade: 10, institution: "Vilniaus licėjus", city: "Vilnius", languages: ["lt", "en"], subjects: ["Physics", "Computer Science"], rating: 4.3, sessions: 3, verified: false },
  { id: "c23", name: "Léa Schmit", grade: 9, institution: "Athénée de Luxembourg", city: "Luxembourg City", languages: ["fr", "de", "en"], subjects: ["Economics", "Mathematics"], rating: 4.6, sessions: 8, verified: true },
  { id: "c24", name: "Matteo Borg", grade: 10, institution: "Junior College Msida", city: "Valletta", languages: ["mt", "en"], subjects: ["Biology", "Chemistry"], rating: 4.4, sessions: 5, verified: true },
  { id: "c25", name: "Daan de Vries", grade: 9, institution: "Vossius Gymnasium", city: "Amsterdam", languages: ["nl", "en"], subjects: ["Economics", "Geography"], rating: 4.7, sessions: 18, verified: true },
  { id: "c26", name: "Zofia Kowalska", grade: 11, institution: "LO im. Kopernika", city: "Warsaw", languages: ["pl", "en"], subjects: ["Physics", "Mathematics"], rating: 4.8, sessions: 20, verified: true },
  { id: "c27", name: "Tiago Silva", grade: 9, institution: "Escola Secundária Camões", city: "Lisbon", languages: ["pt", "en"], subjects: ["History", "Geography"], rating: 4.5, sessions: 7, verified: true },
  { id: "c28", name: "Ana Popescu", grade: 11, institution: "Colegiul Gheorghe Lazăr", city: "Bucharest", languages: ["ro", "en"], subjects: ["Computer Science", "Mathematics"], rating: 4.8, sessions: 22, verified: true },
  { id: "c29", name: "Marek Horváth", grade: 9, institution: "Gymnázium Grösslingová", city: "Bratislava", languages: ["sk", "en"], subjects: ["Mathematics", "Chemistry"], rating: 4.4, sessions: 4, verified: true },
  { id: "c30", name: "Nika Zupan", grade: 10, institution: "Gimnazija Bežigrad", city: "Ljubljana", languages: ["sl", "en"], subjects: ["Biology", "Literature"], rating: 4.6, sessions: 10, verified: true },
  { id: "c31", name: "Lucía García", grade: 11, institution: "IES Ramiro de Maeztu", city: "Madrid", languages: ["es", "en"], subjects: ["Economics", "Literature"], rating: 4.9, sessions: 27, verified: true },
  { id: "c32", name: "Elsa Lindqvist", grade: 10, institution: "Kungsholmens gymnasium", city: "Stockholm", languages: ["sv", "en"], subjects: ["Chemistry", "Physics"], rating: 4.7, sessions: 12, verified: true },
];

/* ---------------------------------- Matching ----------------------------- */

/** Great-circle distance in km between two coordinates. */
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * THE rule: a scribe must study at least one grade below the candidate.
 * Guarantees the scribe can't meaningfully improve the candidate's answers.
 */
export function isEligible(scribeGrade: number, studentGrade: number): boolean {
  return scribeGrade <= studentGrade - 1;
}

export interface SearchFilters {
  grade: StudentGrade;
  /** EU language code, or "any" */
  language: string;
  /** Search center; when null, radius is ignored (EU-wide search) */
  center: { lat: number; lng: number } | null;
  /** Radius in km; 0 means EU-wide */
  radiusKm: number;
  /** Case-insensitive substring match on institution name */
  institute: string;
  /** Subject name, or "any" */
  subject: string;
}

export interface SearchResult {
  scribe: ScribeProfile;
  /** Distance from the search center, when one is set */
  distanceKm: number | null;
  eligible: boolean;
}

/**
 * Runs the marketplace search. The grade rule is evaluated for every scribe so
 * the UI can show *why* someone is blocked instead of silently hiding them;
 * all other filters narrow the result set. Eligible results sort first, then
 * by distance, then by rating.
 */
export function searchScribes(filters: SearchFilters): SearchResult[] {
  const institute = filters.institute.trim().toLowerCase();

  return SCRIBES.filter((s) => {
    if (filters.language !== "any" && !s.languages.includes(filters.language))
      return false;
    if (filters.subject !== "any" && !s.subjects.includes(filters.subject))
      return false;
    if (institute && !s.institution.toLowerCase().includes(institute))
      return false;
    return true;
  })
    .map((scribe) => {
      const city = getCity(scribe.city);
      const distanceKm = filters.center
        ? haversineKm(filters.center.lat, filters.center.lng, city.lat, city.lng)
        : null;
      return {
        scribe,
        distanceKm,
        eligible: isEligible(scribe.grade, filters.grade),
      };
    })
    .filter(
      (r) =>
        !filters.center ||
        filters.radiusKm === 0 ||
        (r.distanceKm ?? 0) <= filters.radiusKm,
    )
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      if (a.distanceKm !== null && b.distanceKm !== null && a.distanceKm !== b.distanceKm)
        return a.distanceKm - b.distanceKm;
      return b.scribe.rating - a.scribe.rating;
    });
}
