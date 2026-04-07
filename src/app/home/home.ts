import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { Difficulty } from '../services/country.service';
import { TutorialModalComponent } from './tutorial-modal';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [TutorialModalComponent],
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly gameState = inject(GameStateService);

  selected = signal<Difficulty>('easy');
  showTutorial = signal(false);

  readonly difficulties: { key: Difficulty; label: string; description: string; emoji: string }[] = [
    { key: 'easy',   label: 'Easy',   description: 'Bands pre-drawn — pick from flag colors only', emoji: '🟢' },
    { key: 'medium', label: 'Medium', description: 'Bands pre-drawn — use any color you like',     emoji: '🟡' },
    { key: 'hard',   label: 'Hard',   description: 'Blank canvas — draw everything from scratch',  emoji: '🔴' },
  ];

  select(difficulty: Difficulty): void {
    this.selected.set(difficulty);
  }

  startGame(): void {
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
}
