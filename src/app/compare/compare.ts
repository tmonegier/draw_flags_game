import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService, scoreToGrade } from '../services/game-state.service';
import { ScoringService } from '../services/scoring.service';
import { ratioToCssAspect } from '../utils/ratio';
import { AspectRatioPipe } from '../utils/aspect-ratio.pipe';
import { getFlagUrl } from '../utils/flag-url';
import { SCORE_MESSAGES } from '../scoring-config';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.html',
  styleUrl: './compare.css',
  imports: [AspectRatioPipe],
})
export class CompareComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly gameState = inject(GameStateService);
  private readonly scoringService = inject(ScoringService);

  score = signal<number | null>(null);
  grade = signal<string>('');
  isScoring = signal(true);
  scoringError = signal<string | null>(null);

  /** Cached message that only re-runs when `score` changes (vs every CD tick). */
  readonly scoreMessage = computed<string>(() => {
    const s = this.score();
    if (s === null) return '';
    return SCORE_MESSAGES.find(m => s >= m.min)?.message ?? '';
  });

  get currentCountry() { return this.gameState.currentCountry(); }
  get userDrawing() { return this.gameState.drawingDataUrl(); }

  get flagUrl(): string {
    const f = this.currentCountry?.svgFile;
    return f ? getFlagUrl(f) : '';
  }

  /** CSS aspect-ratio string (width/height) derived from the country ratio (height:width). */
  get flagAspectRatio(): string {
    return ratioToCssAspect(this.currentCountry?.ratio ?? '2:3');
  }

  get hasMore() { return this.gameState.queue().length > 0; }

  ngOnInit(): void {
    const country = this.currentCountry;
    const drawing = this.userDrawing;

    if (!country || !drawing) {
      this.router.navigate(['/']);
      return;
    }

    this.scoringService
      .computeScore(drawing, country.svgFile, this.gameState.drawingWidth(), this.gameState.drawingHeight())
      .then(s => {
        this.score.set(s);
        const g = scoreToGrade(s);
        this.grade.set(g);
        this.isScoring.set(false);
        this.gameState.addRoundScore({ country, score: s, grade: g, drawingDataUrl: drawing });
      })
      .catch(err => {
        // Surface the failure instead of leaving the spinner running forever.
        // The round is still recorded with a 0 score so the user can move on.
        this.scoringError.set(err?.message ?? 'Scoring failed.');
        this.score.set(0);
        this.grade.set('F');
        this.isScoring.set(false);
        this.gameState.addRoundScore({ country, score: 0, grade: 'F', drawingDataUrl: drawing });
      });
  }

  next(): void {
    const hasNext = this.gameState.nextCountry();
    if (hasNext) {
      this.router.navigate(['/game']);
    } else {
      this.router.navigate(['/end']);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

}
