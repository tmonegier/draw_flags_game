import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService, scoreToGrade } from '../services/game-state.service';
import { ScoringService } from '../services/scoring.service';
import { ratioToCssAspect } from '../utils/ratio';
import { AspectRatioPipe } from '../utils/aspect-ratio.pipe';

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

  get currentCountry() { return this.gameState.currentCountry(); }
  get userDrawing() { return this.gameState.drawingDataUrl(); }

  get flagUrl(): string {
    const f = this.currentCountry?.svgFile;
    return f ? `/flags/${f}` : '';
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
        this.gameState.addRoundScore({
          country: country.name,
          code: country.code,
          score: s,
          grade: g,
          drawingDataUrl: drawing,
          svgFile: country.svgFile,
          ratio: country.ratio,
        });
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

  getScoreMessage(): string {
    const s = this.score();
    if (s === null) return '';
    if (s >= 900) return '🎉 Outstanding! Near-perfect match!';
    if (s >= 700) return '👍 Great job! Mostly correct.';
    if (s >= 500) return '😊 Not bad! Room for improvement.';
    if (s >= 300) return '😅 Keep practicing!';
    return '😬 Better luck next time!';
  }
}
