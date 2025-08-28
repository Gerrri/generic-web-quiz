import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService } from '../quiz.service';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>{{ title }}</h2>
      <p class="muted">Die Fragen werden beim Start geladen.</p>

      <button class="btn" [disabled]="loading" (click)="start()">
        {{ loading ? 'Lade…' : 'Quiz starten' }}
      </button>

      <p class="error" *ngIf="error">{{ error }}</p>
    </section>
  `,
  styles: [`
    .btn { padding: 10px 16px; border: 0; border-radius: 8px; cursor: pointer; }
    .btn:disabled { opacity: .6; cursor: wait; }
    .muted { opacity: .7; }
    .error { color: #c62828; margin-top: 12px; }
  `]
})
export class StartComponent {
  title = 'Willkommen zum Quiz';
  loading = false;
  error = '';

  constructor(private quiz: QuizService, private router: Router) {}

  async start(): Promise<void> {
    this.loading = true; this.error = '';
    try {
      await this.quiz.loadQuestions();
      this.router.navigateByUrl('/quiz');
    } catch (e: any) {
      this.error = e?.message ?? 'Unbekannter Fehler beim Laden der Fragen.';
    } finally {
      this.loading = false;
    }
  }
}
