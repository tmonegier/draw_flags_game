import { Component, ViewChild, AfterViewInit, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  readonly gameState = inject(GameStateService);

  activeColor = signal<string>('#000000');
  isElementsModalOpen = signal(false);
  penSize = signal<number>(4);

  /** Restrict the palette to a shuffled copy of the current flag's colors in all modes. */
  readonly allowedColors = computed<string[] | null>(() => {
    const colors = this.gameState.currentCountry()?.colors;
    if (!colors) return null;
    const arr = [...colors];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  /** Label for the toolbar's clear button: restore hints on easy, full clear on hard/free. */
  readonly clearLabel = computed<string>(() => {
    return this.gameState.difficulty() === 'easy' ? '↩️ Cancel Changes' : '🗑️ Clear';
  });

  /** Elements picker is only available in hard mode. */
  readonly showElements = computed<boolean>(() => this.gameState.difficulty() === 'hard');

  /** Pen size slider is only shown in free mode. */
  readonly showPenSize = computed<boolean>(() => this.gameState.difficulty() === 'free');

  /** Pen mode for free drawing; flood-fill for all other modes. */
  readonly drawingMode = computed<'fill' | 'pen'>(() =>
    this.gameState.difficulty() === 'free' ? 'pen' : 'fill'
  );

  ngAfterViewInit(): void {
    const countryCode = this.route.snapshot.paramMap.get('countryCode');
    if (countryCode) {
      const found = this.gameState.startGameWithCountry(countryCode, this.gameState.difficulty());
      if (!found) {
        this.router.navigate(['/']);
        return;
      }
    }

    const country = this.gameState.currentCountry();
    const difficulty = this.gameState.difficulty();
    if (!country) return;

    if (difficulty === 'easy') {
      // Defer one tick so DrawingCanvasComponent.ngAfterViewInit runs first.
      setTimeout(() => {
        this.drawingCanvas.applyHints(country.hints);
      });
    }
    // free mode: blank canvas, pen drawing only — no hints applied.

    const palette = this.allowedColors();
    if (palette && palette.length > 0) this.activeColor.set(palette[0]);
  }

  onColorChange(color: string): void {
    this.activeColor.set(color);
  }

  onPenSizeChange(size: number): void {
    this.penSize.set(size);
  }

  onClearCanvas(): void {
    this.drawingCanvas.clearCanvas();
    if (this.gameState.difficulty() === 'easy') {
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
