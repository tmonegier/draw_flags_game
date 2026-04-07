import { Component, ViewChild, AfterViewInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { DrawingCanvasComponent } from '../drawing/drawing-canvas';
import { ToolbarComponent } from '../drawing/toolbar';
import { ElementsModalComponent, ElementSelection } from '../drawing/elements-modal';
import { SplitConfig, CrossConfig } from '../drawing/toolbar';

@Component({
  selector: 'app-game',
  templateUrl: './game.html',
  styleUrl: './game.css',
  imports: [DrawingCanvasComponent, ToolbarComponent, ElementsModalComponent],
})
export class GameComponent implements AfterViewInit {
  @ViewChild(DrawingCanvasComponent) drawingCanvas!: DrawingCanvasComponent;

  private readonly router = inject(Router);
  readonly gameState = inject(GameStateService);

  activeColor = signal<string>('#000000');
  isElementsModalOpen = signal(false);

  /** In easy mode, restrict the palette to a shuffled copy of the current flag's colors. */
  readonly allowedColors = computed<string[] | null>(() => {
    if (this.gameState.difficulty() === 'easy') {
      const colors = this.gameState.currentCountry()?.colors;
      if (!colors) return null;
      const arr = [...colors];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    return null;
  });

  /** Label for the toolbar's clear button: restore hints on easy/medium, full clear on hard. */
  readonly clearLabel = computed<string>(() =>
    this.gameState.difficulty() === 'hard' ? '🗑️ Clear' : '↩️ Cancel Changes'
  );

  /** Elements picker is only available in hard mode. */
  readonly showElements = computed<boolean>(() => this.gameState.difficulty() === 'hard');

  ngAfterViewInit(): void {
    const country = this.gameState.currentCountry();
    const difficulty = this.gameState.difficulty();
    if (!country) return;

    if (difficulty === 'easy' || difficulty === 'medium') {
      // Defer one tick so DrawingCanvasComponent.ngAfterViewInit runs first.
      setTimeout(() => {
        this.drawingCanvas.applyHints(country.hints);
      });
    }

    if (difficulty === 'easy') {
      const palette = this.allowedColors();
      if (palette && palette.length > 0) this.activeColor.set(palette[0]);
    }
  }

  onColorChange(color: string): void {
    this.activeColor.set(color);
  }

  onClearCanvas(): void {
    this.drawingCanvas.clearCanvas();
    const difficulty = this.gameState.difficulty();
    if (difficulty === 'easy' || difficulty === 'medium') {
      const country = this.gameState.currentCountry();
      if (country) this.drawingCanvas.applyHints(country.hints);
    }
  }

  onOpenElements(): void {
    this.isElementsModalOpen.set(true);
  }

  onElementSelected(selection: ElementSelection): void {
    this.isElementsModalOpen.set(false);
    const { element } = selection;
    if (element.autoPlace) {
      const { xCenter, yCenter, sizeFraction } = element.autoPlace;
      this.drawingCanvas.placeElementDirectly(element, this.activeColor(), xCenter, yCenter, sizeFraction);
    } else {
      this.drawingCanvas.startElementPlacement(element, selection.size, this.activeColor());
    }
  }

  onSplitsSelected(config: SplitConfig): void {
    this.isElementsModalOpen.set(false);
    this.drawingCanvas.applySplits(config.direction, config.ratios);
  }

  onCrossSelected(config: CrossConfig): void {
    this.isElementsModalOpen.set(false);
    this.drawingCanvas.applyNordicCross(config);
  }

  onPlacementCancelled(): void {
    // canvas already cleaned up; nothing extra needed here
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  submit(): void {
    if (this.drawingCanvas.isPlacingElement()) {
      this.drawingCanvas.cancelPlacement();
    }
    const dataUrl = this.drawingCanvas.getDrawingDataUrl();
    this.gameState.submitDrawing(dataUrl, this.drawingCanvas.canvasWidth(), this.drawingCanvas.canvasHeight);
    this.router.navigate(['/compare']);
  }
}
