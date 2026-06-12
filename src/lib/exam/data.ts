/** Demo exam papers for the WortLaut exam room. */

export interface ExamQuestion {
  n: number;
  text: string;
  points: number;
}

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  grade: number;
  /** Language the paper is written in (EU language code) */
  language: string;
  durationMin: number;
  questions: ExamQuestion[];
}

export const PAPERS: ExamPaper[] = [
  {
    id: "math12-en",
    title: "Mathematics — Final Examination",
    subject: "Mathematics",
    grade: 12,
    language: "en",
    durationMin: 90,
    questions: [
      { n: 1, text: "Solve the equation 2x squared minus 8x plus 6 equals 0. State both solutions.", points: 6 },
      { n: 2, text: "A rectangle has a perimeter of 36 centimetres. Its length is twice its width. Calculate the area of the rectangle.", points: 6 },
      { n: 3, text: "Differentiate the function f of x equals 3x cubed minus 5x plus 2, and evaluate the derivative at x equals 1.", points: 8 },
      { n: 4, text: "A fair six-sided die is rolled twice. What is the probability that the sum of the two rolls equals 8?", points: 6 },
      { n: 5, text: "Explain, in your own words, what the mean value theorem states and give one everyday example of its idea.", points: 8 },
    ],
  },
  {
    id: "bio11-de",
    title: "Biologie — Abschlussprüfung",
    subject: "Biology",
    grade: 11,
    language: "de",
    durationMin: 60,
    questions: [
      { n: 1, text: "Beschreibe den Aufbau einer pflanzlichen Zelle und nenne drei Organellen mit ihrer Funktion.", points: 8 },
      { n: 2, text: "Erkläre den Unterschied zwischen Mitose und Meiose in höchstens fünf Sätzen.", points: 6 },
      { n: 3, text: "Was versteht man unter Fotosynthese? Gib die Wortgleichung an.", points: 6 },
      { n: 4, text: "Nenne zwei Beispiele für Anpassungen von Tieren an extreme Lebensräume und erkläre sie kurz.", points: 6 },
    ],
  },
];

export function getPaper(id: string): ExamPaper {
  return PAPERS.find((p) => p.id === id) ?? PAPERS[0];
}
