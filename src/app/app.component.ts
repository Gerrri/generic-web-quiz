import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header class="container">
      <h1 class="title">Quiz</h1>
    </header>
    <main class="container">
      <router-outlet />
    </main>
    <footer class="container footer">© {{year}}</footer>
  `,
  styles: [`
    .title { margin: 0 0 8px; font-weight: 700; }
    .footer { opacity: .6; font-size: 12px; margin-top: 24px; }
  `]
})
export class AppComponent {
  year = new Date().getFullYear();
}
