import {
  Component, ElementRef, HostListener, ViewChild,
  AfterViewInit, AfterViewChecked,
  computed, input, output, signal
} from '@angular/core';
import { DrawingTool } from './toolbar';
import { FlagElement } from './flag-elements';

export const CANVAS_HEIGHT = 400;

interface Point { x: number; y: number; }

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.html',
  styleUrl: './drawing-canvas.css',
})
export class DrawingCanvasComponent implements AfterViewInit, AfterViewChecked {
  @ViewChild('baseCanvas') baseCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('splitsCanvas') splitsCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvasRef!: ElementRef<HTMLCanvasElement>;

  tool = input<DrawingTool>('fill');
  color = input<string>('#000000');
  /** height:width ratio string, e.g. "2:3" or "1:2" */
  ratio = input<string>('2:3');

  readonly placementCancelled = output<void>();

  readonly canvasHeight = CANVAS_HEIGHT;
  readonly canvasWidth = computed(() => {
    const [h, w] = this.ratio().split(':').map(Number);
    return Math.round(CANVAS_HEIGHT * w / h);
  });
  readonly isPlacingElement = signal(false);

  private baseCtx!: CanvasRenderingContext2D;
  private splitsCtx!: CanvasRenderingContext2D;
  private overlayCtx!: CanvasRenderingContext2D;

  private isDrawing = false;

  private placementImg: HTMLImageElement | null = null;
  private pendingSize = 80;

  private lastRenderedWidth = 0;

  ngAfterViewInit(): void {
    this.baseCtx = this.baseCanvasRef.nativeElement.getContext('2d')!;
    this.splitsCtx = this.splitsCanvasRef.nativeElement.getContext('2d')!;
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
    this.placementImg = null;
    this.isPlacingElement.set(true);
    const content = element.svgContent.replace(/currentColor/g, color);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${content}</svg>`;
    const img = new Image();
    img.onload = () => { this.placementImg = img; };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
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
    temp.getContext('2d')!.drawImage(this.baseCanvasRef.nativeElement, 0, 0);
    return temp.toDataURL('image/png');
  }

  clearCanvas(): void {
    const W = this.canvasWidth();
    const H = this.canvasHeight;
    this.baseCtx.fillStyle = '#ffffff';
    this.baseCtx.fillRect(0, 0, W, H);
    this.splitsCtx.clearRect(0, 0, W, H);
    this.overlayCtx.clearRect(0, 0, W, H);
  }

  applySplits(direction: 'horizontal' | 'vertical', ratios: number[]): void {
    const W = this.canvasWidth();
    const H = this.canvasHeight;
    const total = ratios.reduce((s, r) => s + r, 0);
    const ctx = this.splitsCtx;
    ctx.clearRect(0, 0, W, H);
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

  private getPos(event: MouseEvent): Point {
    const rect = this.overlayCanvasRef.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasWidth() / rect.width;
    const scaleY = this.canvasHeight / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    if (this.isPlacingElement()) {
      if (event.button === 2) { this.cancelPlacement(); return; }
      const pos = this.getPos(event);
      if (this.placementImg) {
        const s = this.pendingSize;
        this.baseCtx.drawImage(this.placementImg, pos.x - s / 2, pos.y - s / 2, s, s);
      }
      return;
    }
    const pos = this.getPos(event);
    const tool = this.tool();
    if (tool === 'eraser') {
      this.isDrawing = true;
      this.configureEraser();
      this.baseCtx.beginPath();
      this.baseCtx.moveTo(pos.x, pos.y);
    } else if (tool === 'fill') {
      this.floodFill(Math.round(pos.x), Math.round(pos.y));
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPlacingElement()) {
      const pos = this.getPos(event);
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
    if (!this.isDrawing) return;
    event.preventDefault();
    const pos = this.getPos(event);
    this.configureEraser();
    this.baseCtx.lineTo(pos.x, pos.y);
    this.baseCtx.stroke();
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.isDrawing) return;
    event.preventDefault();
    this.baseCtx.closePath();
    this.isDrawing = false;
  }

  onMouseLeave(): void {
    if (this.isDrawing) this.onMouseUp(new MouseEvent('mouseup'));
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private configureEraser(): void {
    this.baseCtx.globalCompositeOperation = 'source-over';
    this.baseCtx.strokeStyle = '#ffffff';
    this.baseCtx.lineWidth = 12;
    this.baseCtx.lineCap = 'round';
    this.baseCtx.lineJoin = 'round';
  }

  private floodFill(startX: number, startY: number): void {
    const canvas = this.baseCanvasRef.nativeElement;
    const ctx = this.baseCtx;
    const splitsData = this.splitsCtx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Don't fill if the click landed on a split line
    if (splitsData[(startY * canvas.width + startX) * 4 + 3] > 0) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = this.getPixelColor(data, startX, startY, canvas.width);
    const fillColor = this.hexToRgba(this.color());
    if (targetColor[0] === fillColor[0] && targetColor[1] === fillColor[1] && targetColor[2] === fillColor[2]) return;

    const stack: Point[] = [{ x: startX, y: startY }];
    const visited = new Uint8Array(canvas.width * canvas.height);
    while (stack.length) {
      const { x, y } = stack.pop()!;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      const idx = y * canvas.width + x;
      if (visited[idx]) continue;
      visited[idx] = 1;
      // Split line pixel: paint it with the fill color but don't propagate through it
      if (splitsData[idx * 4 + 3] > 0) {
        this.setPixelColor(data, x, y, canvas.width, fillColor);
        continue;
      }
      const c = this.getPixelColor(data, x, y, canvas.width);
      if (!this.colorMatch(c, targetColor)) continue;
      this.setPixelColor(data, x, y, canvas.width, fillColor);
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
    }
    ctx.putImageData(imageData, 0, 0);
  }

  private getPixelColor(data: Uint8ClampedArray, x: number, y: number, w: number): [number, number, number, number] {
    const i = (y * w + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  }

  private setPixelColor(data: Uint8ClampedArray, x: number, y: number, w: number, color: [number, number, number, number]): void {
    const i = (y * w + x) * 4;
    data[i] = color[0]; data[i + 1] = color[1]; data[i + 2] = color[2]; data[i + 3] = color[3];
  }

  private colorMatch(a: [number, number, number, number], b: [number, number, number, number], tol = 20): boolean {
    return Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
  }

  private hexToRgba(hex: string): [number, number, number, number] {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff, 255];
  }
}
