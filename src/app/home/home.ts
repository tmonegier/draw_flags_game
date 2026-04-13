import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { Difficulty } from '../services/country.service';
import { TutorialModalComponent } from './tutorial-modal';

type ModePage = 'free' | 'guided';

export const SWIPE_THRESHOLD_PX = 40;
export const LAST_PAGE_KEY = 'home-last-page';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [TutorialModalComponent],
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly gameState = inject(GameStateService);

  private readonly initialPage: ModePage = this.readLastPage();
  selected = signal<Difficulty>(this.initialPage === 'free' ? 'free' : 'easy');
  showTutorial = signal(false);
  page = signal<ModePage>(this.initialPage);

  private touchStartX: number | null = null;

  readonly guidedDifficulties: { key: Difficulty; label: string; description: string; emoji: string }[] = [
    { key: 'easy', label: 'Pre-fill Flags', description: 'Bands pre-drawn — pick from flag colors only',     emoji: '🟢' },
    { key: 'hard', label: 'Free Canvas',    description: 'Blank canvas — draw everything from scratch',      emoji: '🔴' },
  ];

  readonly freeDifficulty = { key: 'free' as Difficulty, label: 'Free Drawing', description: 'Freehand pen — draw freely with the flag\'s colors', emoji: '✏️' };

  select(difficulty: Difficulty): void {
    this.selected.set(difficulty);
  }

  showPage(page: ModePage): void {
    this.page.set(page);
    if (page === 'free') {
      this.selected.set('free');
    } else if (this.selected() === 'free') {
      this.selected.set('easy');
    }
  }

  nextPage(): void {
    this.showPage(this.page() === 'free' ? 'guided' : 'free');
  }

  prevPage(): void {
    this.showPage(this.page() === 'guided' ? 'free' : 'guided');
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? this.touchStartX;
    const dx = endX - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (dx < 0) this.nextPage();
    else this.prevPage();
  }

  startGame(difficulty?: Difficulty): void {
    if (difficulty) this.selected.set(difficulty);
    this.rememberPageFor(this.selected());
    this.gameState.startGame(this.selected());
    if (this.hasTutorialBeenSeen(this.selected())) {
      this.router.navigate(['/game']);
    } else {
      this.showTutorial.set(true);
    }
  }

  onTutorialClosed(): void {
    this.markTutorialSeen(this.selected());
    this.showTutorial.set(false);
    this.router.navigate(['/game']);
  }

  private hasTutorialBeenSeen(difficulty: Difficulty): boolean {
    return localStorage.getItem(`tutorial-seen-${difficulty}`) === '1';
  }

  private markTutorialSeen(difficulty: Difficulty): void {
    localStorage.setItem(`tutorial-seen-${difficulty}`, '1');
  }

  private readLastPage(): ModePage {
    return localStorage.getItem(LAST_PAGE_KEY) === 'guided' ? 'guided' : 'free';
  }

  private rememberPageFor(difficulty: Difficulty): void {
    localStorage.setItem(LAST_PAGE_KEY, difficulty === 'free' ? 'free' : 'guided');
  }
}
