import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { Difficulty } from '../services/country.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly gameState = inject(GameStateService);

  selected = signal<Difficulty>('easy');

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
    this.router.navigate(['/game']);
  }
}
