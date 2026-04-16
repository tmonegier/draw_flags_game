import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { Difficulty } from '../services/country.service';
import { TutorialModalComponent } from './tutorial-modal';

type ModePage = 'free' | 'guided' | 'create';

const PAGE_ORDER: ModePage[] = ['free', 'guided', 'create'];

export const SWIPE_THRESHOLD_PX = 40;
export const LAST_PAGE_KEY = 'home-last-page';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [TutorialModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly gameState = inject(GameStateService);

  private readonly initialPage: ModePage = this.readLastPage();
  selected = signal<Difficulty>(this.initialPage === 'free' ? 'free' : 'easy');
  showTutorial = signal(false);
  page = signal<ModePage>(this.initialPage);
  /** False during initial paint so the carousel jumps to the restored page
   *  without sliding through the default one. Flipped on after first render. */
  animated = signal(false);

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.animated.set(true));
  }

  private touchStartX: number | null = null;

  readonly guidedDifficulties: { key: Difficulty; label: string; description: string; emoji: string }[] = [
    { key: 'easy', label: 'Pre-fill Flags', description: 'Bands pre-drawn — pick from flag colors only',     emoji: '🟢' },
    { key: 'hard', label: 'Free Canvas',    description: 'Blank canvas — draw everything from scratch',      emoji: '🔴' },
  ];

  readonly freeDifficulty = { key: 'free' as Difficulty, label: '10 in a row', description: 'Draw 10 random flags freehand with each flag\'s colors', emoji: '✏️' };

  select(difficulty: Difficulty): void {
    this.selected.set(difficulty);
  }

  showPage(page: ModePage): void {
    this.page.set(page);
    if (page === 'free') {
      this.selected.set('free');
    } else if (page === 'guided' && this.selected() === 'free') {
      this.selected.set('easy');
    }
  }

  nextPage(): void {
    const i = PAGE_ORDER.indexOf(this.page());
    this.showPage(PAGE_ORDER[(i + 1) % PAGE_ORDER.length]);
  }

  prevPage(): void {
    const i = PAGE_ORDER.indexOf(this.page());
    this.showPage(PAGE_ORDER[(i - 1 + PAGE_ORDER.length) % PAGE_ORDER.length]);
  }

  startCreate(): void {
    this.rememberPage('create');
    this.router.navigate(['/create']);
  }

  startExplore(): void {
    this.rememberPage('free');
    this.router.navigate(['/explore']);
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
    this.rememberPage(this.selected() === 'free' ? 'free' : 'guided');
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
    const stored = localStorage.getItem(LAST_PAGE_KEY);
    return PAGE_ORDER.includes(stored as ModePage) ? (stored as ModePage) : 'free';
  }

  private rememberPage(page: ModePage): void {
    localStorage.setItem(LAST_PAGE_KEY, page);
  }
}
