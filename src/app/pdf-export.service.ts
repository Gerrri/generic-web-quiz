import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  constructor() {}

  /**
   * Prüft, ob der PDF-Export im aktuellen Browser unterstützt wird
   */
  isPdfExportSupported(): boolean {
    // Prüfen, ob die notwendigen Browser-Features unterstützt werden
    const hasBlob = typeof Blob !== 'undefined';
    const hasURL = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    const hasAnchor = typeof document !== 'undefined' && typeof document.createElement === 'function';
    
    return hasBlob && hasURL && hasAnchor;
  }

  /**
   * Exportiert ein HTML-Element als PDF
   * @param element Das HTML-Element, das als PDF exportiert werden soll
   * @param filename Der Name der PDF-Datei
   */
  exportToPdf(element: HTMLElement, filename: string = 'quiz-ergebnis.pdf'): void {
    // Prüfen, ob der PDF-Export unterstützt wird
    if (!this.isPdfExportSupported()) {
      this.handleUnsupportedBrowser(element);
      return;
    }

    // Temporäre Styles für den PDF-Export hinzufügen
    const originalStyles = document.head.innerHTML;
    const pdfStyles = document.createElement('style');
    pdfStyles.innerHTML = `
      @page {
        margin: 10mm;
      }
      body {
        font-family: Arial, sans-serif;
      }
      .question-evaluation {
        margin-bottom: 15mm;
        page-break-inside: avoid;
      }
      .actions {
        display: none;
      }
    `;
    document.head.appendChild(pdfStyles);

    // Browser-spezifische Optionen erhalten
    const options = this.getBrowserSpecificOptions(filename);

    // PDF generieren und dann die temporären Styles entfernen
    html2pdf().from(element).set(options).save().then(() => {
      document.head.innerHTML = originalStyles;
    }).catch(error => {
      console.error('Fehler beim PDF-Export:', error);
      document.head.innerHTML = originalStyles;
      alert('Beim PDF-Export ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder verwenden Sie einen anderen Browser.');
    });
  }

  /**
   * Fallback für Browser, die den PDF-Export nicht unterstützen
   */
  private handleUnsupportedBrowser(element: HTMLElement): void {
    // Dem Nutzer eine Nachricht anzeigen
    alert('Der PDF-Export wird in Ihrem Browser leider nicht unterstützt. ' +
          'Bitte versuchen Sie es mit einem aktuellen Chrome, Firefox, Safari oder Edge Browser.');
    
    // Optional: Druckdialog öffnen als Alternative
    if (confirm('Möchten Sie die Seite stattdessen drucken?')) {
      window.print();
    }
  }

  /**
   * Gibt browser-spezifische Optionen für html2pdf zurück
   */
  private getBrowserSpecificOptions(filename: string): any {
    const options = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Browser-spezifische Anpassungen
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Safari-spezifische Anpassungen
    if (userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1) {
      options.html2canvas.scale = 3; // Höhere Auflösung für Safari
    }
    
    // Firefox-spezifische Anpassungen
    if (userAgent.indexOf('firefox') !== -1) {
      // Verwende Type Assertion, um die Eigenschaft hinzuzufügen
      (options.html2canvas as any).textRendering = true;
      // Alternativ könnten wir auch die Skalierung für Firefox anpassen
      options.html2canvas.scale = 2.5;
    }

    return options;
  }

  /**
   * Druckt die Ergebnisse als Fallback-Lösung
   */
  printResults(): void {
    window.print();
  }
}