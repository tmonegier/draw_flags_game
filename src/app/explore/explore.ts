import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, AfterViewInit, ViewEncapsulation, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CountryService } from '../services/country.service';
import { GameStateService } from '../services/game-state.service';

const MIN_SCALE = 1;
const MAX_SCALE = 12;
const WHEEL_ZOOM_STEP = 1.15;
const BUTTON_ZOOM_STEP = 1.4;
/** Pixels of pointer movement required before a drag suppresses the click. */
const DRAG_THRESHOLD_PX = 5;

interface Pointer { id: number; x: number; y: number; }

@Component({
  selector: 'app-explore',
  templateUrl: './explore.html',
  styleUrl: './explore.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Disabled because we inject world-map.svg via innerHTML and need CSS to
  // reach its <path> children — ::ng-deep would work but is deprecated.
  encapsulation: ViewEncapsulation.None,
})
export class ExploreComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private readonly router = inject(Router);
  private readonly countryService = inject(CountryService);
  private readonly gameState = inject(GameStateService);

  private readonly drawableCodes = new Set(this.countryService.getFreeModeCountries().map(c => c.code));

  readonly hoveredName = signal<string>('');
  readonly loadError = signal<string | null>(null);
  /** Exposed to the template for the zoom buttons' disabled states. */
  readonly scale = signal<number>(1);

  private svgEl: SVGSVGElement | null = null;
  /** SVG's native viewBox (0 0 baseW baseH) — the "zoomed-all-the-way-out" state. */
  private baseW = 0;
  private baseH = 0;
  /** Current view rect in viewBox coordinates. Mutated in place and rewritten onto
   *  the SVG's viewBox attribute so the browser re-rasterizes at the new scale. */
  private vx = 0;
  private vy = 0;
  private vw = 0;
  private vh = 0;

  /** Active pointers tracked for one-finger pan and two-finger pinch. */
  private readonly pointers = new Map<number, Pointer>();
  /** Distance between the two pointers at the start of a pinch. */
  private pinchStartDist = 0;
  private pinchStartScale = 1;
  /** Has the current gesture exceeded the drag threshold? Used to suppress click. */
  private didDrag = false;
  private dragStartX = 0;
  private dragStartY = 0;

  async ngAfterViewInit(): Promise<void> {
    try {
      const res = await fetch('/world-map.svg');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const svgText = await res.text();
      this.mapContainer.nativeElement.innerHTML = svgText;
      this.svgEl = this.mapContainer.nativeElement.querySelector('svg');
      if (this.svgEl) {
        const vb = this.svgEl.viewBox.baseVal;
        this.baseW = vb.width || 1000;
        this.baseH = vb.height || 500;
        this.vx = 0;
        this.vy = 0;
        this.vw = this.baseW;
        this.vh = this.baseH;
      }
      this.markDrawable();
    } catch (err) {
      this.loadError.set(err instanceof Error ? err.message : 'Failed to load map');
    }
  }

  private markDrawable(): void {
    // Both <path> countries and <circle> markers (for microstates too small to
    // click at base zoom) carry data-code/data-name — treat them uniformly.
    const shapes = this.mapContainer.nativeElement.querySelectorAll<SVGElement>('[data-code]');
    shapes.forEach(el => {
      if (this.drawableCodes.has(el.dataset['code'] ?? '')) {
        el.classList.add('drawable');
      }
    });
  }

  /** Push the current view rect onto the SVG's viewBox attribute. Unlike CSS
   *  transform: scale(), the browser re-rasterizes at the new size so paths
   *  stay crisp at any zoom level. */
  private applyViewBox(): void {
    if (!this.svgEl) return;
    this.svgEl.setAttribute('viewBox', `${this.vx} ${this.vy} ${this.vw} ${this.vh}`);
  }

  /** Clamp the view rect so the map can't be panned past the SVG edges at the
   *  current zoom, and can't be zoomed out further than the base viewBox. */
  private clampView(): void {
    // Width/height: at scale=1 the full base viewBox is shown.
    this.vw = Math.min(this.baseW, Math.max(this.baseW / MAX_SCALE, this.vw));
    this.vh = Math.min(this.baseH, Math.max(this.baseH / MAX_SCALE, this.vh));
    this.vx = Math.max(0, Math.min(this.baseW - this.vw, this.vx));
    this.vy = Math.max(0, Math.min(this.baseH - this.vh, this.vy));
  }

  /** Convert a container-pixel point into viewBox coordinates. */
  private pxToViewBox(px: number, py: number): { x: number; y: number } {
    const rect = this.mapContainer.nativeElement.getBoundingClientRect();
    return {
      x: this.vx + (px / rect.width) * this.vw,
      y: this.vy + (py / rect.height) * this.vh,
    };
  }

  /** Zoom toward a specific point in container-local coordinates. */
  private zoomTo(newScale: number, focusPx: number, focusPy: number): void {
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    const focus = this.pxToViewBox(focusPx, focusPy);
    const newVw = this.baseW / clamped;
    const newVh = this.baseH / clamped;
    const rect = this.mapContainer.nativeElement.getBoundingClientRect();
    // Solve for vx,vy so that focusPx/py still maps to focus.{x,y}:
    //   focus.x = newVx + (focusPx / rect.width) * newVw  →  newVx = focus.x - (focusPx/rect.width) * newVw
    this.vx = focus.x - (focusPx / rect.width) * newVw;
    this.vy = focus.y - (focusPy / rect.height) * newVh;
    this.vw = newVw;
    this.vh = newVh;
    this.clampView();
    this.scale.set(clamped);
    this.applyViewBox();
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.mapContainer.nativeElement.getBoundingClientRect();
    const focusX = event.clientX - rect.left;
    const focusY = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? WHEEL_ZOOM_STEP : 1 / WHEEL_ZOOM_STEP;
    this.zoomTo(this.scale() * factor, focusX, focusY);
  }

  zoomIn(): void {
    const rect = this.mapContainer.nativeElement.getBoundingClientRect();
    this.zoomTo(this.scale() * BUTTON_ZOOM_STEP, rect.width / 2, rect.height / 2);
  }

  zoomOut(): void {
    const rect = this.mapContainer.nativeElement.getBoundingClientRect();
    this.zoomTo(this.scale() / BUTTON_ZOOM_STEP, rect.width / 2, rect.height / 2);
  }

  resetZoom(): void {
    this.vx = 0;
    this.vy = 0;
    this.vw = this.baseW;
    this.vh = this.baseH;
    this.scale.set(1);
    this.applyViewBox();
  }

  // ── Pointer handling: single-pointer pan, two-pointer pinch ──────────────

  onPointerDown(event: PointerEvent): void {
    this.pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
    (event.target as Element).setPointerCapture?.(event.pointerId);

    if (this.pointers.size === 1) {
      this.didDrag = false;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
    } else if (this.pointers.size === 2) {
      const [p1, p2] = Array.from(this.pointers.values());
      this.pinchStartDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      this.pinchStartScale = this.scale();
      this.didDrag = true; // a pinch always suppresses the click
    }
  }

  onPointerMove(event: PointerEvent): void {
    const prev = this.pointers.get(event.pointerId);
    if (!prev) {
      this.updateHoverName(event.target);
      return;
    }
    const next: Pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };

    if (this.pointers.size === 1) {
      // Pan: translate screen-pixel delta into viewBox-unit delta.
      const dxPx = next.x - prev.x;
      const dyPx = next.y - prev.y;
      if (!this.didDrag && Math.hypot(next.x - this.dragStartX, next.y - this.dragStartY) > DRAG_THRESHOLD_PX) {
        this.didDrag = true;
      }
      if (this.didDrag) {
        const rect = this.mapContainer.nativeElement.getBoundingClientRect();
        this.vx -= (dxPx / rect.width) * this.vw;
        this.vy -= (dyPx / rect.height) * this.vh;
        this.clampView();
        this.applyViewBox();
      }
      this.pointers.set(event.pointerId, next);
    } else if (this.pointers.size === 2) {
      // Pinch zoom centered between the two fingers.
      this.pointers.set(event.pointerId, next);
      const [p1, p2] = Array.from(this.pointers.values());
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (this.pinchStartDist > 0) {
        const rect = this.mapContainer.nativeElement.getBoundingClientRect();
        const focusX = (p1.x + p2.x) / 2 - rect.left;
        const focusY = (p1.y + p2.y) / 2 - rect.top;
        this.zoomTo(this.pinchStartScale * (dist / this.pinchStartDist), focusX, focusY);
      }
    }
  }

  onPointerUp(event: PointerEvent): void {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) this.pinchStartDist = 0;
  }

  onClick(event: MouseEvent): void {
    // A pan or pinch that moved past the drag threshold suppresses the click —
    // otherwise the user's intent to drag would accidentally start a round.
    if (this.didDrag) {
      this.didDrag = false;
      return;
    }
    const code = this.codeFrom(event.target);
    if (!code || !this.drawableCodes.has(code)) return;
    this.gameState.difficulty.set('free');
    this.gameState.entry.set('explore');
    this.router.navigate(['/game', code]);
  }

  /** Reads a drawable country's ISO-2 code off the clicked/hovered element.
   *  Handles both <path> borders and <circle> microstate markers uniformly. */
  private codeFrom(target: EventTarget | null): string | null {
    if (!(target instanceof SVGElement)) return null;
    return target.dataset['code'] ?? null;
  }

  private updateHoverName(target: EventTarget | null): void {
    if (!(target instanceof SVGElement)) {
      this.hoveredName.set('');
      return;
    }
    const code = target.dataset['code'];
    if (code && this.drawableCodes.has(code)) {
      this.hoveredName.set(target.dataset['name'] ?? '');
    } else {
      this.hoveredName.set('');
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
