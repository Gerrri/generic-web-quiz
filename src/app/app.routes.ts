import { Routes } from '@angular/router';
import { StartComponent } from './start/start.component';
import { QuizComponent } from './quiz/quiz.component';
import { ResultComponent } from './result/result.component';

export const routes: Routes = [
  { path: '', component: StartComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'result', component: ResultComponent },
  { path: '**', redirectTo: '' }
];
