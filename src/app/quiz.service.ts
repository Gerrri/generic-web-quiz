import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Answer, Question, Quiz } from './models';

// Interface für die Auswertung einer Frage
export interface QuestionEvaluation {
  question: Question;
  selectedAnswers: Answer[];
  isCorrect: boolean;
  correctAnswers: Answer[];
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private _quiz = signal<Quiz | null>(null);
  private _index = signal(0); // 0-basiert
  private _answers = signal<Record<string, string[]>>({}); // questionId -> [answerId1, answerId2, ...]

  // abgeleitete Werte
  quiz = computed(() => this._quiz());
  index = computed(() => this._index());
  current = computed<Question | null>(() => {
    const q = this._quiz();
    const i = this._index();
    return q ? q.questions[i] ?? null : null;
  });
  total = computed(() => this._quiz()?.questions.length ?? 0);

  correctCount = computed(() => {
    const q = this._quiz();
    if (!q) return 0;
    return q.questions.reduce((acc, question) => {
      const chosenIds = this._answers()[question.id] || [];
      // Prüfen, ob alle ausgewählten Antworten korrekt sind und alle korrekten Antworten ausgewählt wurden
      const correctAnswers = question.answers.filter(a => a.correct);
      const chosenAnswers = question.answers.filter(a => chosenIds.includes(a.id));
      
      const allChosenAreCorrect = chosenAnswers.every(a => a.correct);
      const allCorrectAreChosen = correctAnswers.every(a => chosenIds.includes(a.id));
      
      return acc + (allChosenAreCorrect && allCorrectAreChosen ? 1 : 0);
    }, 0);
  });

  constructor(private http: HttpClient) {}

  async loadQuestions(path = 'assets/questions.json'): Promise<void> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    const data = await firstValueFrom(this.http.get<Quiz>(path, { headers }));

    if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Keine Fragen gefunden.');
    }

    // Validierung: 2–4 Antworten je Frage und mindestens 1 korrekt
    data.questions.forEach((q, idx) => {
      const len = q.answers?.length ?? 0;
      if (len < 2 || len > 4) {
        throw new Error(`Frage #${idx + 1} hat ${len} Antworten (erlaubt 2–4).`);
      }
      const corrects = q.answers.filter(a => a.correct).length;
      if (corrects < 1) {
        throw new Error(`Frage #${idx + 1} muss mindestens 1 korrekte Antwort haben (aktuell ${corrects}).`);
      }
    });

    this._quiz.set(data);
    this._index.set(0);
    this._answers.set({});
  }

  chooseAnswer(answer: Answer): void {
    const question = this.current();
    if (!question) return;
    
    this._answers.update(map => {
      const currentAnswers = map[question.id] || [];
      
      // Wenn die Antwort bereits ausgewählt ist, entferne sie
      if (currentAnswers.includes(answer.id)) {
        return {
          ...map,
          [question.id]: currentAnswers.filter(id => id !== answer.id)
        };
      }
      
      // Sonst füge die Antwort hinzu
      return {
        ...map,
        [question.id]: [...currentAnswers, answer.id]
      };
    });
  }

  next(): void {
    const i = this._index();
    const t = this.total();
    if (i + 1 < t) {
      this._index.set(i + 1);
    }
  }

  isFinished(): boolean {
    return this._index() >= (this.total() - 1) && !!this.current();
  }

  restart(): void {
    this._index.set(0);
    this._answers.set({});
  }

  // Methode zur Auswertung aller Fragen
  getQuestionEvaluations(): QuestionEvaluation[] {
    const quiz = this._quiz();
    const answers = this._answers();
    
    if (!quiz) return [];
    
    return quiz.questions.map(question => {
      const selectedIds = answers[question.id] || [];
      const selectedAnswers = question.answers.filter(a => selectedIds.includes(a.id));
      const correctAnswers = question.answers.filter(a => a.correct);
      
      // Prüfen, ob alle ausgewählten Antworten korrekt sind und alle korrekten Antworten ausgewählt wurden
      const allSelectedAreCorrect = selectedAnswers.every(a => a.correct);
      const allCorrectAreSelected = correctAnswers.every(a => selectedIds.includes(a.id));
      const isCorrect = allSelectedAreCorrect && allCorrectAreSelected;
      
      return {
        question,
        selectedAnswers,
        isCorrect,
        correctAnswers
      };
    });
  }
}
