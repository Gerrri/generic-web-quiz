import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService, QuestionEvaluation } from '../quiz.service';
import { PdfExportService } from '../pdf-export.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2 class="center">Ergebnis</h2>
      <p class="score center">{{ correct() }} von {{ total() }} korrekt</p>
      
      <!-- Container mit ID für PDF-Export -->
      <div id="quiz-results" class="question-evaluations">
        <!-- Zusammenfassung für PDF -->
        <div class="pdf-summary">
          <div *ngIf="userName" class="user-info">
            <p><strong>Name:</strong> {{ userName }}</p>
          </div>
          <div class="date-info">
            <p><strong>Datum:</strong> {{ currentDate }}</p>
          </div>
          <div class="summary-stats">
            <h3>Zusammenfassung</h3>
            <ul class="summary-list">
              <li><strong>Gesamtpunktzahl:</strong> {{ correct() }} von {{ total() }} ({{ getPercentage() }}%)</li>
              <li><strong>Richtige Antworten:</strong> {{ correct() }}</li>
              <li><strong>Falsche Antworten:</strong> {{ total() - correct() }}</li>
            </ul>
          </div>
        </div>
        <div *ngFor="let eval of evaluations(); let i = index" class="question-evaluation">
          <div class="question-header">
            <div class="question-number">Frage {{ i + 1 }}</div>
            <div [class.correct]="eval.isCorrect" [class.incorrect]="!eval.isCorrect" class="result-status">
              <span class="status-icon">{{ eval.isCorrect ? '✅' : '❌' }}</span>
              <span>{{ eval.isCorrect ? 'Richtig' : 'Falsch' }}</span>
            </div>
          </div>
          
          <h3>{{ eval.question.text }}</h3>
          
          <div class="answers-section">
            <div *ngIf="eval.selectedAnswers.length > 0">
              <h4>Deine Antwort{{ eval.selectedAnswers.length > 1 ? 'en' : '' }}:</h4>
              <ul class="answer-list">
                <li *ngFor="let answer of eval.selectedAnswers"
                    [class.correct-answer]="answer.correct"
                    [class.wrong-answer]="!answer.correct">
                  <span class="answer-icon">{{ answer.correct ? '✓' : '✗' }}</span>
                  {{ answer.text }}
                </li>
              </ul>
            </div>
            
            <div *ngIf="!eval.isCorrect">
              <h4>Richtige Antwort{{ eval.correctAnswers.length > 1 ? 'en' : '' }}:</h4>
              <ul class="answer-list">
                <li *ngFor="let answer of eval.correctAnswers" class="correct-answer">
                  <span class="answer-icon">✓</span>
                  {{ answer.text }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions center">
        <!-- PDF-Export-Button nur anzeigen, wenn unterstützt -->
        <button *ngIf="pdfExportSupported" class="btn export-btn" (click)="exportAsPdf()">
          Als PDF exportieren
        </button>
        <!-- Drucken-Button als Alternative anzeigen, wenn PDF-Export nicht unterstützt wird -->
        <button *ngIf="!pdfExportSupported" class="btn print-btn" (click)="printResults()">
          Ergebnisse drucken
        </button>
        <button class="btn" (click)="again()">Nochmal spielen</button>
        <button class="btn" (click)="home()">Zur Startseite</button>
      </div>
    </section>
  `,
  styles: [`
    .center { text-align: center; }
    .score { font-size: 20px; margin: 8px 0 20px; }
    .actions { display: flex; gap: 10px; justify-content: center; margin-top: 30px; }
    .btn { padding: 8px 14px; border-radius: 8px; border: 0; cursor: pointer; background-color: #1976d2; color: white; }
    .export-btn { background-color: #4caf50; margin-right: 5px; }
    .print-btn { background-color: #ff9800; margin-right: 5px; }
    
    /* Styles für die PDF-Zusammenfassung */
    .pdf-summary {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      border: 1px solid #ddd;
    }
    
    .user-info, .date-info {
      margin-bottom: 10px;
    }
    
    .summary-stats {
      margin-top: 10px;
    }
    
    .summary-list {
      list-style: none;
      padding-left: 0;
    }
    
    .summary-list li {
      padding: 5px 0;
      border-bottom: 1px solid #eee;
    }
    
    @media print {
      /* Styles für die Druckansicht, die auch für das PDF gelten */
      .actions {
        display: none;
      }
      
      body {
        padding: 20px;
      }
      
      .question-evaluation {
        page-break-inside: avoid;
      }
    }
    
    .question-evaluations {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 0 auto;
      max-width: 800px;
    }
    
    .question-evaluation {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background-color: #f9f9f9;
      margin-bottom: 20px;
    }
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .question-number {
      font-weight: 500;
      color: #555;
    }
    
    .result-status {
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .status-icon {
      font-size: 1.2em;
    }
    
    .correct {
      color: #2e7d32;
    }
    
    .incorrect {
      color: #c62828;
    }
    
    .answers-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .answer-list {
      list-style: none;
      padding-left: 10px;
    }
    
    .answer-list li {
      padding: 8px 10px;
      margin-bottom: 5px;
      border-radius: 4px;
      display: flex;
      align-items: center;
    }
    
    .answer-icon {
      margin-right: 8px;
      font-weight: bold;
    }
    
    .correct-answer {
      background-color: rgba(46, 125, 50, 0.1);
      border-left: 3px solid #2e7d32;
    }
    
    .wrong-answer {
      background-color: rgba(198, 40, 40, 0.1);
      border-left: 3px solid #c62828;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    h4 {
      margin-bottom: 8px;
      font-weight: 500;
    }
  `]
})
export class ResultComponent {
  total = computed(() => this.quiz.total());
  correct = computed(() => this.quiz.correctCount());
  evaluations = computed(() => this.quiz.getQuestionEvaluations());
  
  // Flag für die Unterstützung des PDF-Exports
  pdfExportSupported = true;
  
  // Benutzername für PDF
  userName: string = '';
  
  // Aktuelles Datum formatiert
  currentDate: string = new Date().toLocaleDateString('de-DE');

  constructor(
    private quiz: QuizService,
    private router: Router,
    private pdfExport: PdfExportService
  ) {
    // Prüfen, ob der PDF-Export unterstützt wird
    this.pdfExportSupported = this.pdfExport.isPdfExportSupported();
  }
  
  /**
   * Berechnet den Prozentsatz der korrekten Antworten
   */
  getPercentage(): number {
    if (this.total() === 0) return 0;
    return Math.round((this.correct() / this.total()) * 100);
  }

  again(): void {
    this.quiz.restart();
    this.router.navigateByUrl('/quiz');
  }

  home(): void {
    this.router.navigateByUrl('/');
  }
  
  /**
   * Exportiert die Quizergebnisse als PDF
   */
  exportAsPdf(): void {
    // Nach dem Namen fragen
    const name = prompt('Bitte geben Sie Ihren Namen ein:');
    
    if (name) {
      this.userName = name;
      
      // Kurze Verzögerung, damit Angular die Änderung rendern kann
      setTimeout(() => {
        // Das Element mit den Quizergebnissen auswählen
        const element = document.getElementById('quiz-results');
        if (element) {
          // Einen aussagekräftigen Dateinamen erstellen
          const filename = `quiz-ergebnis-${name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
          this.pdfExport.exportToPdf(element, filename);
        }
      }, 100);
    } else {
      alert('Bitte geben Sie einen Namen ein, um fortzufahren.');
    }
  }
  
  /**
   * Druckt die Ergebnisse als Fallback-Lösung
   */
  printResults(): void {
    this.pdfExport.printResults();
  }
}
