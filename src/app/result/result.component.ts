import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../quiz.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="center">
      <h2>Ergebnis</h2>
      <p class="score">{{ correct() }} von {{ total() }} korrekt</p>
      <div class="actions">
        <button class="btn" (click)="again()">Nochmal spielen</button>
        <button class="btn" (click)="home()">Zur Startseite</button>
      </div>
    </section>
  `,
  styles: [`
    .center { text-align: center; }
    .score { font-size: 20px; margin: 8px 0 12px; }
    .actions { display: flex; gap: 10px; justify-content: center; }
    .btn { padding: 8px 14px; border-radius: 8px; border: 0; cursor: pointer; }
  `]
})
export class ResultComponent {
  total = computed(() => this.quiz.total());
  correct = computed(() => this.quiz.correctCount());

  constructor(private quiz: QuizService, private router: Router) {}

  again(): void {
    this.quiz.restart();
    this.router.navigateByUrl('/quiz');
  }

  home(): void { this.router.navigateByUrl('/'); }
}
