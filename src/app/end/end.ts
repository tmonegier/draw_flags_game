import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService, scoreToGrade } from '../services/game-state.service';

@Component({
  selector: 'app-end',
  templateUrl: './end.html',
  styleUrl: './end.css',
})
export class EndComponent {
  private readonly router = inject(Router);
  readonly gameState = inject(GameStateService);

  gradeColor(grade: string): string {
    const map: Record<string, string> = { A: '#68d391', B: '#63b3ed', C: '#f6e05e', D: '#f6ad55', F: '#fc8181' };
    return map[grade] ?? '#888';
  }

  /** Convert "h:w" ratio string to CSS aspect-ratio "w/h". */
  aspectRatio(ratio: string): string {
    const [h, w] = ratio.split(':').map(Number);
    return `${w}/${h}`;
  }

  playAgain(): void {
    this.router.navigate(['/']);
  }
}
