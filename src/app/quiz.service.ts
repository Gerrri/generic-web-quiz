import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Answer, Question, Quiz } from './models';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private _quiz = signal<Quiz | null>(null);
  private _index = signal(0); // 0-basiert
  private _answers = signal<Record<string, string>>({}); // questionId -> answerId

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
      const chosen = this._answers()[question.id];
      const chosenAnswer = question.answers.find(a => a.id === chosen);
      return acc + (chosenAnswer?.correct ? 1 : 0);
    }, 0);
  });

  constructor(private http: HttpClient) {}

  async loadQuestions(path = 'assets/questions.json'): Promise<void> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    const data = await firstValueFrom(this.http.get<Quiz>(path, { headers }));

    if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Keine Fragen gefunden.');
    }

    // Validierung: 2–4 Antworten je Frage und genau 1 korrekt
    data.questions.forEach((q, idx) => {
      const len = q.answers?.length ?? 0;
      if (len < 2 || len > 4) {
        throw new Error(`Frage #${idx + 1} hat ${len} Antworten (erlaubt 2–4).`);
      }
      const corrects = q.answers.filter(a => a.correct).length;
      if (corrects !== 1) {
        throw new Error(`Frage #${idx + 1} muss genau 1 korrekte Antwort haben (aktuell ${corrects}).`);
      }
    });

    this._quiz.set(data);
    this._index.set(0);
    this._answers.set({});
  }

  chooseAnswer(answer: Answer): void {
    const question = this.current();
    if (!question) return;
    this._answers.update(map => ({ ...map, [question.id]: answer.id }));
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
}
