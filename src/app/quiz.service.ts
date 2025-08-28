import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Answer, Question, Quiz } from './models';

// Interface for the evaluation of a question
export interface QuestionEvaluation {
  question: Question;
  selectedAnswers: Answer[];
  isCorrect: boolean;
  correctAnswers: Answer[];
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private _quiz = signal<Quiz | null>(null);
  private _index = signal(0); // 0-based
  private _answers = signal<Record<string, string[]>>({}); // questionId -> [answerId1, answerId2, ...]

  // derived values
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
      // Check if all selected answers are correct and all correct answers were selected
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

    // Validation: 2-4 answers per question and at least 1 correct
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
      
      // If the answer is already selected, remove it
      if (currentAnswers.includes(answer.id)) {
        return {
          ...map,
          [question.id]: currentAnswers.filter(id => id !== answer.id)
        };
      }
      
      // Otherwise add the answer
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

  // Method for evaluating all questions
  getQuestionEvaluations(): QuestionEvaluation[] {
    const quiz = this._quiz();
    const answers = this._answers();
    
    if (!quiz) return [];
    
    return quiz.questions.map(question => {
      const selectedIds = answers[question.id] || [];
      const selectedAnswers = question.answers.filter(a => selectedIds.includes(a.id));
      const correctAnswers = question.answers.filter(a => a.correct);
      
      // Check if all selected answers are correct and all correct answers were selected
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
