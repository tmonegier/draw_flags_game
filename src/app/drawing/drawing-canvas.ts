import {
  Component, ElementRef, HostListener, ViewChild,
  AfterViewInit, AfterViewChecked,
  computed, input, output, signal
} from '@angular/core';
import { CrossConfig } from './toolbar';
import { DrawingHint, ElementHint } from '../services/country.service';
import { FlagElement, FLAG_ELEMENTS } from './flag-elements';
import { parseRatio, ratioToPositions } from '../utils/ratio';
import { floodFillPixels, hexToRgba } from '../utils/canvas-pixels';

export const CANVAS_HEIGHT = 400;
/** Neutral grey used for the unfilled canvas. Picked to be distinct from any
 *  flag colour (especially white) so unfilled regions visibly hurt the score. */
export const CANVAS_BACKGROUND = '#d4d4d8';

interface Point { x: number; y: number; }
interface PlacedElement {
  element: FlagElement;
  color: string;
  xCenter: number;   // fraction of canvas width
  yCenter: number;   // fraction of canvas height
  sizeFraction: number; // fraction of canvas height
}

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.html',
  styleUrl: './drawing-canvas.css',
})
export class DrawingCanvasComponent implements AfterViewInit, AfterViewChecked {
  @ViewChild('baseCanvas') baseCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('splitsCanvas') splitsCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('elementsCanvas') elementsCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvasRef!: ElementRef<HTMLCanvasElement>;

  color = input<string>('#000000');
  /** height:width ratio string, e.g. "2:3" or "1:2" */
  ratio = input<string>('2:3');
  /** Drawing mode: flood-fill on click, or freehand pen strokes. */
  drawingMode = input<'fill' | 'pen'>('fill');
  /** Pen radius in pixels (used in pen mode). */
  penSize = input<number>(4);

  readonly placementCancelled = output<void>();

  readonly canvasHeight = CANVAS_HEIGHT;
  readonly canvasWidth = computed(() => {
    const { h, w } = parseRatio(this.ratio());
    return Math.round(CANVAS_HEIGHT * w / h);
  });
  readonly isPlacingElement = signal(false);

  private baseCtx!: CanvasRenderingContext2D;
  private splitsCtx!: CanvasRenderingContext2D;
  private elementsCtx!: CanvasRenderingContext2D;
  private overlayCtx!: CanvasRenderingContext2D;

  private placedElements: PlacedElement[] = [];

  /** Generation counter for async element redraws. Bumped on every redraw or
   *  clear so stale Image.onload callbacks know to skip painting. */
  private redrawGeneration = 0;

  private placementImg: HTMLImageElement | null = null;
  private pendingSize = 80;
  private pendingElement: FlagElement | null = null;
  private pendingColor = '';

  private lastRenderedWidth = 0;

  private isPenDrawing = false;
  private lastPenPos: Point | null = null;

  ngAfterViewInit(): void {
    this.baseCtx = this.baseCanvasRef.nativeElement.getContext('2d')!;
    this.splitsCtx = this.splitsCanvasRef.nativeElement.getContext('2d')!;
    this.elementsCtx = this.elementsCanvasRef.nativeElement.getContext('2d')!;
    this.overlayCtx = this.overlayCanvasRef.nativeElement.getContext('2d')!;
    this.lastRenderedWidth = this.canvasWidth();
    this.clearCanvas();
  }

  ngAfterViewChecked(): void {
    const w = this.canvasWidth();
    if (w !== this.lastRenderedWidth && this.baseCtx) {
      this.lastRenderedWidth = w;
      this.clearCanvas();
    }
  }

  // ── Element placement ───────────────────────────────────────────────────────

  startElementPlacement(element: FlagElement, size: number, color: string): void {
    this.pendingSize = size;
    this.pendingElement = element;
    this.pendingColor = color;
    this.placementImg = null;
    this.isPlacingElement.set(true);
    const img = new Image();
    img.onload = () => { this.placementImg = img; };
    img.src = this.buildSvgDataUrl(element, color);
  }

  /**
   * Stamps an element onto elementsCanvas at the given fractional position
   * without entering interactive placement mode. Tracks the placement so the
   * element can be recolored later via a clean SVG re-render.
   */
  placeElementDirectly(element: FlagElement, color: string, xCenter: number, yCenter: number, sizeFraction: number): void {
    const pe: PlacedElement = { element, color, xCenter, yCenter, sizeFraction };
    this.placedElements.push(pe);
    this.renderPlacedElement(pe);
  }

  cancelPlacement(): void {
    this.isPlacingElement.set(false);
    this.placementImg = null;
    this.overlayCtx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight);
    this.placementCancelled.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isPlacingElement()) this.cancelPlacement();
  }

  // ── Public canvas methods ───────────────────────────────────────────────────

  getDrawingDataUrl(): string {
    const W = this.canvasWidth();
    const H = this.canvasHeight;
    const temp = document.createElement('canvas');
    temp.width = W;
    temp.height = H;
    const ctx = temp.getContext('2d')!;
    ctx.drawImage(this.baseCanvasRef.nativeElement, 0, 0);
    ctx.drawImage(this.elementsCanvasRef.nativeElement, 0, 0);
    return temp.toDataURL('image/png');
  }

  clearCanvas(): void {
    const W = this.canvasWidth();
    const H = this.canvasHeight;
    this.baseCtx.fillStyle = CANVAS_BACKGROUND;
    this.baseCtx.fillRect(0, 0, W, H);
    this.splitsCtx.clearRect(0, 0, W, H);
    this.elementsCtx.clearRect(0, 0, W, H);
    this.overlayCtx.clearRect(0, 0, W, H);
    this.placedElements = [];
    // Invalidate any in-flight element image loads so they don't paint over
    // the freshly cleared canvas.
    this.redrawGeneration++;
  }

  applyHints(hints: DrawingHint[]): void {
    for (const hint of hints) {
      if (hint.kind === 'bands') {
        this.applySplits(hint.direction, hint.ratios);
      } else if (hint.kind === 'cross') {
        this.applyNordicCross({ variant: hint.variant, widthRatios: hint.widthRatios, heightRatios: hint.heightRatios });
      } else if (hint.kind === 'crossOutline') {
        this.drawCrossOutline(hint.widthRatios, hint.heightRatios);
      } else if (hint.kind === 'element') {
        this.applyElementHint(hint);
      }
    }
  }

  private applyElementHint(hint: ElementHint): void {
    const element = FLAG_ELEMENTS.find(e => e.id === hint.elementId);
    if (!element) return;
    // Always place in black: the shape is a guide but the colour is for the
    // player to discover.
    this.placeElementDirectly(element, '#000000', hint.xCenter, hint.yCenter, hint.sizeFraction);
  }

  private buildSvgDataUrl(element: FlagElement, color: string): string {
    const content = element.svgContent.replace(/currentColor/g, color);
    // Set `color` on the outer SVG so that any residual `currentColor` keyword
    // in the inner SVG resolves to the intended colour rather than the browser
    // default (black).
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="color:${color}">${content}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  private renderPlacedElement(pe: PlacedElement, generation = this.redrawGeneration): void {
    const W = this.canvasWidth();
    const H = this.canvasHeight;
    const s = H * pe.sizeFraction;
    const x = W * pe.xCenter;
    const y = H * pe.yCenter;
    const img = new Image();
    img.onload = () => {
      // Drop the paint if a newer redraw has happened while this image was loading.
      if (generation !== this.redrawGeneration) return;
      this.elementsCtx.drawImage(img, x - s / 2, y - s / 2, s, s);
    };
    img.src = this.buildSvgDataUrl(pe.element, pe.color);
  }

  private redrawAllElements(): void {
    const generation = ++this.redrawGeneration;
    this.elementsCtx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight);
    for (const pe of this.placedElements) {
      this.renderPlacedElement(pe, generation);
    }
  }

  /** Finds the topmost placed element whose bounding box contains (x, y),
   *  updates its color, and redraws the elements canvas from SVG source. */
  private recolorElement(x: number, y: number): void {
    const W = this.canvasWidth();
    const H = this.canvasHeight;
    for (let i = this.placedElements.length - 1; i >= 0; i--) {
      const pe = this.placedElements[i];
      const cx = W * pe.xCenter;
      const cy = H * pe.yCenter;
      const s = H * pe.sizeFraction;
      if (x >= cx - s / 2 && x <= cx + s / 2 && y >= cy - s / 2 && y <= cy + s / 2) {
        this.placedElements[i] = { ...pe, color: this.color() };
        this.redrawAllElements();
        return;
      }
    }
  }

  /**
   * Draws a plus-sign outline on baseCanvas for flags whose cross does NOT extend
   * to the flag edges (e.g. Switzerland). The outline pixel color differs from
   * white so flood fill treats it as a boundary, leaving the background as one
   * connected fillable region.
   *
   * widthRatios / heightRatios must yield exactly 4 positions via toPositions():
   * [outer-left, inner-left, inner-right, outer-right].
   */
  drawCrossOutline(widthRatios: number[], heightRatios: number[]): void {
    const W = this.canvasWidth();
    const H = this.canvasHeight;

    const xPos = ratioToPositions(widthRatios, W);
    const yPos = ratioToPositions(heightRatios, H);
    if (xPos.length < 4 || yPos.length < 4) return;

    const [x0, x1, x2, x3] = xPos;
    const [y0, y1, y2, y3] = yPos;

    const ctx = this.baseCtx;
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // 12-vertex plus-sign polygon, clockwise from top-left of top arm
    ctx.moveTo(x1, y0);
    ctx.lineTo(x2, y0);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x3, y1);
    ctx.lineTo(x3, y2);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y3);
    ctx.lineTo(x1, y3);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x0, y2);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  applyNordicCross(config: CrossConfig): void {
    const W = this.canvasWidth();
    const H = this.canvasHeight;
    const ctx = this.splitsCtx;
    ctx.save();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const xPos = ratioToPositions(config.widthRatios, W);
    const yPos = ratioToPositions(config.heightRatios, H);

    // Each guide line at index i is paired with its symmetric counterpart: the
    // outer pair skips the full cross bar, the inner pair (double cross) skips only
    // the inner bar. This makes each cross-arm level a single flood-fill region.
    for (let i = 0; i < xPos.length; i++) {
      const p = Math.min(i, xPos.length - 1 - i);
      const x = xPos[i] + 0.5;
      const ySkip0 = yPos[p];
      const ySkip1 = yPos[yPos.length - 1 - p];
      ctx.beginPath(); ctx.moveTo(x, 0);       ctx.lineTo(x, ySkip0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, ySkip1);  ctx.lineTo(x, H);      ctx.stroke();
    }
    for (let i = 0; i < yPos.length; i++) {
      const p = Math.min(i, yPos.length - 1 - i);
      const y = yPos[i] + 0.5;
      const xSkip0 = xPos[p];
      const xSkip1 = xPos[xPos.length - 1 - p];
      ctx.beginPath(); ctx.moveTo(0,       y); ctx.lineTo(xSkip0, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xSkip1,  y); ctx.lineTo(W,      y); ctx.stroke();
    }

    ctx.restore();
  }

  applySplits(direction: 'horizontal' | 'vertical', ratios: number[]): void {
    const W = this.canvasWidth();
    const H = this.canvasHeight;
    const total = ratios.reduce((s, r) => s + r, 0);
    const ctx = this.splitsCtx;
    ctx.save();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = 'source-over';

    let accumulated = 0;
    for (let i = 0; i < ratios.length - 1; i++) {
      accumulated += ratios[i] / total;
      ctx.beginPath();
      if (direction === 'horizontal') {
        const y = Math.round(accumulated * H) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      } else {
        const x = Math.round(accumulated * W) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Mouse event handlers ────────────────────────────────────────────────────

  private getPos(event: { clientX: number; clientY: number }): Point {
    const rect = this.overlayCanvasRef.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasWidth() / rect.width;
    const scaleY = this.canvasHeight / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    const canvas = this.overlayCanvasRef.nativeElement;
    if (event.pointerId !== undefined && canvas.setPointerCapture) {
      try { canvas.setPointerCapture(event.pointerId); } catch { /* no-op */ }
    }
    if (this.isPlacingElement()) {
      if (event.button === 2) { this.cancelPlacement(); return; }
      const pos = this.getPos(event);
      if (this.placementImg && this.pendingElement) {
        const s = this.pendingSize;
        this.elementsCtx.drawImage(this.placementImg, pos.x - s / 2, pos.y - s / 2, s, s);
        this.placedElements.push({
          element: this.pendingElement,
          color: this.pendingColor,
          xCenter: pos.x / this.canvasWidth(),
          yCenter: pos.y / this.canvasHeight,
          sizeFraction: s / this.canvasHeight,
        });
      }
      return;
    }
    if (this.drawingMode() === 'pen') {
      this.isPenDrawing = true;
      const pos = this.getPos(event);
      this.lastPenPos = pos;
      this.penDot(pos);
      return;
    }
    const pos = this.getPos(event);
    const x = Math.round(pos.x);
    const y = Math.round(pos.y);
    // If the click lands on an element pixel, recolor via SVG re-render.
    // Otherwise, flood-fill the base canvas (bounded by split lines).
    const elemData = this.elementsCtx.getImageData(0, 0, this.canvasWidth(), this.canvasHeight).data;
    if (elemData[(y * this.canvasWidth() + x) * 4 + 3] > 0) {
      this.recolorElement(x, y);
    } else {
      this.floodFill(x, y);
    }
  }

  @HostListener('document:pointerup')
  @HostListener('document:pointercancel')
  onPointerUp(): void {
    this.isPenDrawing = false;
    this.lastPenPos = null;
  }

  private penDot(pos: Point): void {
    const ctx = this.baseCtx;
    ctx.save();
    ctx.fillStyle = this.color();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.penSize(), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private penStrokeTo(pos: Point): void {
    if (!this.lastPenPos) return;
    const ctx = this.baseCtx;
    ctx.save();
    ctx.strokeStyle = this.color();
    ctx.lineWidth = this.penSize() * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.lastPenPos.x, this.lastPenPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.restore();
  }

  /** Reads pixel buffers off the canvases and delegates to the pure
   *  flood-fill in `utils/canvas-pixels`. Kept as an instance method so the
   *  spec can drive it directly. */
  private floodFill(startX: number, startY: number): void {
    const canvas = this.baseCanvasRef.nativeElement;
    const ctx = this.baseCtx;
    const splitsData = this.splitsCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    floodFillPixels(
      imageData.data, splitsData, canvas.width, canvas.height,
      startX, startY, hexToRgba(this.color()),
    );
    ctx.putImageData(imageData, 0, 0);
  }


  onPointerMove(event: PointerEvent): void {
    if (this.isPenDrawing) event.preventDefault();
    const pos = this.getPos(event);
    if (this.isPlacingElement()) {
      const W = this.canvasWidth();
      const H = this.canvasHeight;
      this.overlayCtx.clearRect(0, 0, W, H);
      if (this.placementImg) {
        const s = this.pendingSize;
        this.overlayCtx.globalAlpha = 0.72;
        this.overlayCtx.drawImage(this.placementImg, pos.x - s / 2, pos.y - s / 2, s, s);
        this.overlayCtx.globalAlpha = 1;
      }
      return;
    }
    if (this.drawingMode() === 'pen' && this.isPenDrawing) {
      this.penStrokeTo(pos);
      this.lastPenPos = pos;
    }
  }
}
