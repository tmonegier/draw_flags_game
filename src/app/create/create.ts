import { ChangeDetectionStrategy, Component, ViewChild, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingCanvasComponent } from '../drawing/drawing-canvas';
import { ToolbarComponent } from '../drawing/toolbar';
import { ElementsModalComponent, ElementSelection } from '../drawing/elements-modal';
import { SplitConfig, CrossConfig } from '../drawing/toolbar';

@Component({
  selector: 'app-create',
  templateUrl: './create.html',
  styleUrl: './create.css',
  imports: [DrawingCanvasComponent, ToolbarComponent, ElementsModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent {
  @ViewChild(DrawingCanvasComponent) drawingCanvas!: DrawingCanvasComponent;

  private readonly router = inject(Router);

  readonly ratioValues: readonly string[] = ['2:3', '1:2', '3:5', '5:8', '1:1', '3:4'];

  activeColor = signal<string>('#CE1126');
  isElementsModalOpen = signal(false);
  ratio = signal<string>('2:3');

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
    const { element } = selection;
    const auto = element.autoPlace;
    const xCenter = auto?.xCenter ?? 0.5;
    const yCenter = auto?.yCenter ?? 0.5;
    const sizeFraction = auto?.sizeFraction ?? 0.5;
    this.drawingCanvas.placeElementDirectly(element, this.activeColor(), xCenter, yCenter, sizeFraction);
  }

  onSplitsSelected(config: SplitConfig): void {
    this.isElementsModalOpen.set(false);
    this.drawingCanvas.applySplits(config.direction, config.ratios);
  }

  onCrossSelected(config: CrossConfig): void {
    this.isElementsModalOpen.set(false);
    this.drawingCanvas.applyNordicCross(config);
  }

  onRatioChange(value: string): void {
    this.ratio.set(value);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  download(): void {
    const width = this.drawingCanvas.canvasWidth();
    const height = this.drawingCanvas.canvasHeight();
    const pngDataUrl = this.drawingCanvas.getDrawingDataUrl();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${pngDataUrl}" width="${width}" height="${height}"/></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-flag-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
