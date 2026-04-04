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
    { key: 'easy', label: 'Easy', description: 'Well-known countries with simple flags', emoji: '🟢' },
    { key: 'medium', label: 'Medium', description: 'Countries with more complex designs', emoji: '🟡' },
    { key: 'hard', label: 'Hard', description: 'Challenging flags from around the world', emoji: '🔴' },
  ];

  select(difficulty: Difficulty): void {
    this.selected.set(difficulty);
  }

  startGame(): void {
    this.gameState.startGame(this.selected());
    this.router.navigate(['/game']);
  }
}
