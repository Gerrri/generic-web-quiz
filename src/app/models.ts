export interface Quiz {
  title?: string;
  questions: Question[];
}

export interface Question {
  id: string;       // z.B. "q1"
  text: string;
  answers: Answer[]; // 2-4 Antworten
}

export interface Answer {
  id: string;        // z.B. "a", "b", "c", "d"
  text: string;
  correct: boolean;  // exakt eine true empfohlen
}
