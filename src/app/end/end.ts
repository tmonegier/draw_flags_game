import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { AspectRatioPipe } from '../utils/aspect-ratio.pipe';

@Component({
  selector: 'app-end',
  templateUrl: './end.html',
  styleUrl: './end.css',
  imports: [AspectRatioPipe],
})
export class EndComponent {
  private readonly router = inject(Router);
  readonly gameState = inject(GameStateService);

  gradeColor(grade: string): string {
    const map: Record<string, string> = { A: '#68d391', B: '#63b3ed', C: '#f6e05e', D: '#f6ad55', F: '#fc8181' };
    return map[grade] ?? '#888';
  }

  playAgain(): void {
    this.router.navigate(['/']);
  }
}
