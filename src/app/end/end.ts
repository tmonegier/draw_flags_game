import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { AspectRatioPipe } from '../utils/aspect-ratio.pipe';
import { FlagUrlPipe } from '../utils/flag-url.pipe';
import { GRADE_COLORS, Grade } from '../scoring-config';

@Component({
  selector: 'app-end',
  templateUrl: './end.html',
  styleUrl: './end.css',
  imports: [AspectRatioPipe, FlagUrlPipe],
})
export class EndComponent {
  private readonly router = inject(Router);
  readonly gameState = inject(GameStateService);

  gradeColor(grade: string): string {
    return GRADE_COLORS[grade as Grade] ?? '#888';
  }

  playAgain(): void {
    this.router.navigate(['/']);
  }
}
