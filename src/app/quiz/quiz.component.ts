import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../quiz.service';
import { Answer, Question } from '../models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="question(); else doneTpl">
      <div class="progress">Frage {{ idx() + 1 }} / {{ total() }}</div>
      <h2 class="q">{{ question()?.text }}</h2>
      <p class="hint">Wählen Sie eine oder mehrere Antworten aus:</p>

      <ul class="answers">
        <li *ngFor="let a of question()?.answers">
          <label class="answer-label">
            <input type="checkbox"
                   [disabled]="isConfirmed()"
                   [checked]="isSelected(a.id)"
                   (change)="select(a)">
            <span class="answer-text">{{ a.text }}</span>
          </label>
        </li>
      </ul>

      <div class="actions">
        <button *ngIf="!isConfirmed() && hasSelectedAnswers()"
                class="btn confirm"
                (click)="confirmAnswers()">Antworten bestätigen</button>
        
        <div *ngIf="isConfirmed()" class="feedback">
          <p [class.ok]="isCorrect()" [class.nok]="!isCorrect()">
            {{ isCorrect() ? 'Richtig!' : 'Leider falsch.' }}
          </p>
          <button class="btn" (click)="goNext()">
            {{ isLast() ? 'Zum Ergebnis' : 'Weiter' }}
          </button>
        </div>
      </div>
    </ng-container>

    <ng-template #doneTpl>
      <div class="center">
        <p>Alles beantwortet.</p>
        <button class="btn" (click)="toResult()">Ergebnis anzeigen</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .progress { opacity: .7; margin-bottom: 8px; }
    .q { margin: 8px 0 12px; }
    .hint { margin-bottom: 12px; font-style: italic; }
    .answers { list-style: none; padding: 0; display: grid; gap: 8px; }
    .answer-label { display: flex; align-items: center; padding: 10px 12px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer; }
    .answer-label:hover { background-color: #f5f5f5; }
    .answer-text { margin-left: 10px; }
    .actions { margin-top: 16px; }
    .feedback { margin-top: 12px; display: flex; align-items: center; gap: 12px; }
    .ok { color: #2e7d32; }
    .nok { color: #c62828; }
    .btn { padding: 8px 14px; border-radius: 8px; border: 0; cursor: pointer; background-color: #1976d2; color: white; }
    .btn.confirm { background-color: #388e3c; }
    .center { text-align: center; }
  `]
})
export class QuizComponent {
  question = computed<Question | null>(() => this.quiz.current());
  idx = computed<number>(() => this.quiz.index());
  total = computed<number>(() => this.quiz.total());
  isLast = computed<boolean>(() => this.idx() + 1 >= this.total());

  selectedIds = signal<string[]>([]);
  confirmed = signal(false);

  constructor(private quiz: QuizService, private router: Router) {}

  select(a: Answer): void {
    if (!this.question() || this.isConfirmed()) return;
    this.quiz.chooseAnswer(a);
    
    // Update the local selection
    const currentIds = this.selectedIds();
    if (currentIds.includes(a.id)) {
      this.selectedIds.set(currentIds.filter(id => id !== a.id));
    } else {
      this.selectedIds.set([...currentIds, a.id]);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  hasSelectedAnswers(): boolean {
    return this.selectedIds().length > 0;
  }

  isConfirmed(): boolean {
    return this.confirmed();
  }

  confirmAnswers(): void {
    this.confirmed.set(true);
  }

  isCorrect(): boolean {
    const q = this.question();
    if (!q) return false;
    
    // Check if all selected answers are correct and all correct answers were selected
    const correctAnswers = q.answers.filter(a => a.correct);
    const selectedAnswers = q.answers.filter(a => this.selectedIds().includes(a.id));
    
    const allSelectedAreCorrect = selectedAnswers.every(a => a.correct);
    const allCorrectAreSelected = correctAnswers.every(a => this.selectedIds().includes(a.id));
    
    return allSelectedAreCorrect && allCorrectAreSelected;
  }

  goNext(): void {
    if (this.isLast()) {
      this.router.navigateByUrl('/result');
    } else {
      this.quiz.next();
      this.selectedIds.set([]);
      this.confirmed.set(false);
    }
  }

  toResult(): void { this.router.navigateByUrl('/result'); }
}
