import { Component, ViewChild, inject, signal } from '@angular/core';
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
export class GameComponent {
  @ViewChild(DrawingCanvasComponent) drawingCanvas!: DrawingCanvasComponent;

  private readonly router = inject(Router);
  readonly gameState = inject(GameStateService);

  activeTool = signal<DrawingTool>('fill');
  activeColor = signal<string>('#000000');
  isElementsModalOpen = signal(false);

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
    this.drawingCanvas.applyNordicCross(config.variant);
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
