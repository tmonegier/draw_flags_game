import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { AspectRatioPipe } from '../utils/aspect-ratio.pipe';
import { FlagUrlPipe } from '../utils/flag-url.pipe';
import { GradeColorPipe } from '../utils/grade-color.pipe';

@Component({
  selector: 'app-end',
  templateUrl: './end.html',
  styleUrl: './end.css',
  imports: [AspectRatioPipe, FlagUrlPipe, GradeColorPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EndComponent {
  private readonly router = inject(Router);
  readonly gameState = inject(GameStateService);

  playAgain(): void {
    this.router.navigate(['/']);
  }
}
