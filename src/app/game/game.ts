import { Component, ViewChild, AfterViewInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';
import { DrawingCanvasComponent } from '../drawing/drawing-canvas';
import { ToolbarComponent, DrawingTool } from '../drawing/toolbar';
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

  activeTool = signal<DrawingTool>('fill');
  activeColor = signal<string>('#000000');
  isElementsModalOpen = signal(false);

  /** In easy mode, restrict the palette to the current flag's colors. */
  readonly allowedColors = computed<string[] | null>(() => {
    if (this.gameState.difficulty() === 'easy') {
      return this.gameState.currentCountry()?.colors ?? null;
    }
    return null;
  });

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

    if (difficulty === 'easy' && country.colors.length > 0) {
      this.activeColor.set(country.colors[0]);
    }
  }

  onToolChange(tool: DrawingTool): void {
    this.activeTool.set(tool);
  }

  onColorChange(color: string): void {
    this.activeColor.set(color);
  }

  onClearCanvas(): void {
    this.drawingCanvas.clearCanvas();
  }

  onOpenElements(): void {
    this.isElementsModalOpen.set(true);
  }

  onElementSelected(selection: ElementSelection): void {
    this.isElementsModalOpen.set(false);
    this.drawingCanvas.startElementPlacement(selection.element, selection.size, this.activeColor());
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

  submit(): void {
    if (this.drawingCanvas.isPlacingElement()) {
      this.drawingCanvas.cancelPlacement();
    }
    const dataUrl = this.drawingCanvas.getDrawingDataUrl();
    this.gameState.submitDrawing(dataUrl, this.drawingCanvas.canvasWidth(), this.drawingCanvas.canvasHeight);
    this.router.navigate(['/compare']);
  }
}
