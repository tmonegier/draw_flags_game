import { Injectable, computed, inject, signal } from '@angular/core';
import { Country, CountryService, Difficulty } from './country.service';
import { GRADE_THRESHOLDS } from '../scoring-config';

export interface RoundScore {
  country: Country;
  score: number;
  grade: string;
  drawingDataUrl: string;
}

export function scoreToGrade(score: number): string {
  for (const { grade, min } of GRADE_THRESHOLDS) {
    if (score >= min) return grade;
  }
  return 'F';
}

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly countryService = inject(CountryService);

  readonly difficulty = signal<Difficulty>('easy');
  readonly queue = signal<Country[]>([]);
  readonly currentCountry = signal<Country | null>(null);
  readonly drawingDataUrl = signal<string>('');
  readonly drawingWidth = signal<number>(600);
  readonly drawingHeight = signal<number>(400);
  readonly roundScores = signal<RoundScore[]>([]);

  readonly isGameOver = computed(() => this.queue().length === 0 && this.currentCountry() !== null);

  readonly averageScore = computed(() => {
    const scores = this.roundScores();
    if (!scores.length) return 0;
    return Math.round(scores.reduce((sum, r) => sum + r.score, 0) / scores.length);
  });

  readonly overallGrade = computed(() => scoreToGrade(this.averageScore()));

  startGame(difficulty: Difficulty): void {
    this.difficulty.set(difficulty);
    this.roundScores.set([]);
    const source = difficulty === 'free'
      ? this.countryService.getFreeModeCountries()
      : this.countryService.getCountries();
    const all = this.countryService.shuffle(source);
    const [first, ...rest] = all.slice(0, 10);
    this.currentCountry.set(first);
    this.queue.set(rest);
    this.drawingDataUrl.set('');
  }

  /**
   * Start a single-country game for the given country code.
   * Returns false if the code is not found in the country list.
   */
  startGameWithCountry(countryCode: string, difficulty: Difficulty): boolean {
    const source = difficulty === 'free'
      ? this.countryService.getFreeModeCountries()
      : this.countryService.getCountries();
    const country = source.find(c => c.code === countryCode);
    if (!country) return false;
    this.difficulty.set(difficulty);
    this.roundScores.set([]);
    this.currentCountry.set(country);
    this.queue.set([]);
    this.drawingDataUrl.set('');
    return true;
  }

  submitDrawing(dataUrl: string, width: number, height: number): void {
    this.drawingDataUrl.set(dataUrl);
    this.drawingWidth.set(width);
    this.drawingHeight.set(height);
  }

  addRoundScore(roundScore: RoundScore): void {
    this.roundScores.update(scores => [...scores, roundScore]);
  }

  /** Returns true if there is a next country, false if game is over */
  nextCountry(): boolean {
    const q = this.queue();
    if (q.length === 0) {
      return false;
    }
    const [next, ...rest] = q;
    this.currentCountry.set(next);
    this.queue.set(rest);
    this.drawingDataUrl.set('');
    return true;
  }
}
