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

      <ul class="answers">
        <li *ngFor="let a of question()?.answers">
          <button class="answer"
                  [disabled]="selectedId() !== ''"
                  (click)="select(a)">{{ a.text }}</button>
        </li>
      </ul>

      <div *ngIf="selectedId() !== ''" class="feedback">
        <p [class.ok]="isCorrect()" [class.nok]="!isCorrect()">
          {{ isCorrect() ? 'Richtig!' : 'Leider falsch.' }}
        </p>
        <button class="btn" (click)="goNext()">
          {{ isLast() ? 'Zum Ergebnis' : 'Weiter' }}
        </button>
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
    .answers { list-style: none; padding: 0; display: grid; gap: 8px; }
    .answer { width: 100%; text-align: left; padding: 10px 12px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer; }
    .feedback { margin-top: 12px; display: flex; align-items: center; gap: 12px; }
    .ok { color: #2e7d32; }
    .nok { color: #c62828; }
    .btn { padding: 8px 14px; border-radius: 8px; border: 0; cursor: pointer; }
    .center { text-align: center; }
  `]
})
export class QuizComponent {
  question = computed<Question | null>(() => this.quiz.current());
  idx = computed<number>(() => this.quiz.index());
  total = computed<number>(() => this.quiz.total());
  isLast = computed<boolean>(() => this.idx() + 1 >= this.total());

  selectedId = signal('');

  constructor(private quiz: QuizService, private router: Router) {}

  select(a: Answer): void {
    if (!this.question()) return;
    this.quiz.chooseAnswer(a);
    this.selectedId.set(a.id);
  }

  isCorrect(): boolean {
    const q = this.question();
    if (!q) return false;
    const chosen = q.answers.find(a => a.id === this.selectedId());
    return !!chosen?.correct;
  }

  goNext(): void {
    if (this.isLast()) {
      this.router.navigateByUrl('/result');
    } else {
      this.quiz.next();
      this.selectedId.set('');
    }
  }

  toResult(): void { this.router.navigateByUrl('/result'); }
}
