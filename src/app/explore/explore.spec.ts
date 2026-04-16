import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { ExploreComponent } from './explore';
import { GameStateService } from '../services/game-state.service';

/**
 * Minimal SVG with two paths and one microstate marker:
 *   - fr:  drawable <path>    (in FREE_MODE_COUNTRIES)
 *   - zz:  unknown <path>     (must be ignored on click)
 *   - mc:  drawable <circle>  (microstate marker — Monaco)
 */
const FAKE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
  <path data-code="fr" data-name="France" d="M0,0h1v1h-1z"/>
  <path data-code="zz" data-name="Nowhere" d="M2,2h1v1h-1z"/>
  <circle class="marker" data-code="mc" data-name="Monaco" cx="5" cy="5" r="1"/>
</svg>`;

describe('ExploreComponent', () => {
  let component: ExploreComponent;
  let fixture: ComponentFixture<ExploreComponent>;
  let router: Router;
  let gameState: GameStateService;

  beforeEach(async () => {
    spyOn(window, 'fetch').and.callFake(() => Promise.resolve(new Response(FAKE_SVG, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' },
    })));

    await TestBed.configureTestingModule({
      imports: [ExploreComponent],
      providers: [provideRouter([]), provideLocationMocks()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    gameState = TestBed.inject(GameStateService);
    spyOn(router, 'navigate');
    fixture.detectChanges();
    // Wait for the fetch/innerHTML injection triggered by Angular's ngAfterViewInit
    // to resolve; awaiting a fresh ngAfterViewInit works because callFake returns
    // a new Response each call.
    await component.ngAfterViewInit();
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('injects the map SVG and marks drawable shapes (paths and markers)', () => {
    const host: HTMLElement = fixture.nativeElement;
    const fr = host.querySelector<SVGPathElement>('path[data-code="fr"]');
    const zz = host.querySelector<SVGPathElement>('path[data-code="zz"]');
    const mc = host.querySelector<SVGCircleElement>('circle[data-code="mc"]');
    expect(fr?.classList.contains('drawable')).toBeTrue();
    expect(zz?.classList.contains('drawable')).toBeFalse();
    expect(mc?.classList.contains('drawable')).toBeTrue();
  });

  it('click on a microstate marker <circle> navigates like any country path', () => {
    const mc = (fixture.nativeElement as HTMLElement).querySelector<SVGCircleElement>('circle[data-code="mc"]')!;
    component.onClick({ target: mc } as unknown as MouseEvent);
    expect(gameState.difficulty()).toBe('free');
    expect(router.navigate).toHaveBeenCalledWith(['/game', 'mc']);
  });

  it('click on a drawable path navigates to /game/:code with free difficulty and explore entry', () => {
    const fr = (fixture.nativeElement as HTMLElement).querySelector<SVGPathElement>('path[data-code="fr"]')!;
    component.onClick({ target: fr } as unknown as MouseEvent);
    expect(gameState.difficulty()).toBe('free');
    expect(gameState.entry()).toBe('explore');
    expect(router.navigate).toHaveBeenCalledWith(['/game', 'fr']);
  });

  it('click on a non-drawable path is ignored', () => {
    const zz = (fixture.nativeElement as HTMLElement).querySelector<SVGPathElement>('path[data-code="zz"]')!;
    component.onClick({ target: zz } as unknown as MouseEvent);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('click off-map is ignored', () => {
    component.onClick({ target: document.createElement('div') } as unknown as MouseEvent);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('hovering a drawable path sets hoveredName', () => {
    const fr = (fixture.nativeElement as HTMLElement).querySelector<SVGPathElement>('path[data-code="fr"]')!;
    component.onPointerMove({ target: fr } as unknown as PointerEvent);
    expect(component.hoveredName()).toBe('France');
  });

  it('hovering a non-drawable path clears hoveredName', () => {
    component.hoveredName.set('France');
    const zz = (fixture.nativeElement as HTMLElement).querySelector<SVGPathElement>('path[data-code="zz"]')!;
    component.onPointerMove({ target: zz } as unknown as PointerEvent);
    expect(component.hoveredName()).toBe('');
  });

  it('goHome navigates to /', () => {
    component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  // ── Zoom & pan ─────────────────────────────────────────────────────────────

  describe('zoom & pan', () => {
    it('zoomIn increases the scale', () => {
      const before = component.scale();
      component.zoomIn();
      expect(component.scale()).toBeGreaterThan(before);
    });

    it('zoomOut never drops below MIN_SCALE (1)', () => {
      for (let i = 0; i < 10; i++) component.zoomOut();
      expect(component.scale()).toBe(1);
    });

    it('resetZoom restores scale=1 and the full viewBox', () => {
      component.zoomIn(); component.zoomIn();
      component.resetZoom();
      expect(component.scale()).toBe(1);
      const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
      // resetZoom writes the base viewBox back — the fake SVG is "0 0 10 10".
      expect(svg.getAttribute('viewBox')).toBe('0 0 10 10');
    });

    it('zoomIn rewrites the SVG viewBox so paths stay vector-crisp', () => {
      const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
      component.zoomIn();
      const [, , w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number);
      expect(w).toBeLessThan(10);
      expect(h).toBeLessThan(10);
    });

    it('wheel up (deltaY < 0) zooms in', () => {
      const before = component.scale();
      component.onWheel({ deltaY: -100, clientX: 0, clientY: 0, preventDefault: () => {} } as unknown as WheelEvent);
      expect(component.scale()).toBeGreaterThan(before);
    });

    it('wheel down (deltaY > 0) zooms out toward MIN_SCALE', () => {
      component.zoomIn(); component.zoomIn();
      const before = component.scale();
      component.onWheel({ deltaY: 100, clientX: 0, clientY: 0, preventDefault: () => {} } as unknown as WheelEvent);
      expect(component.scale()).toBeLessThan(before);
    });

    it('pointer drag beyond threshold suppresses a subsequent click', () => {
      const fr = (fixture.nativeElement as HTMLElement).querySelector<SVGPathElement>('path[data-code="fr"]')!;
      component.onPointerDown({ pointerId: 1, clientX: 0, clientY: 0, target: fr } as unknown as PointerEvent);
      component.onPointerMove({ pointerId: 1, clientX: 50, clientY: 50, target: fr } as unknown as PointerEvent);
      component.onPointerUp({ pointerId: 1 } as unknown as PointerEvent);
      component.onClick({ target: fr } as unknown as MouseEvent);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('pointer tap (no drag) still navigates on click', () => {
      const fr = (fixture.nativeElement as HTMLElement).querySelector<SVGPathElement>('path[data-code="fr"]')!;
      component.onPointerDown({ pointerId: 1, clientX: 10, clientY: 10, target: fr } as unknown as PointerEvent);
      component.onPointerMove({ pointerId: 1, clientX: 11, clientY: 11, target: fr } as unknown as PointerEvent);
      component.onPointerUp({ pointerId: 1 } as unknown as PointerEvent);
      component.onClick({ target: fr } as unknown as MouseEvent);
      expect(router.navigate).toHaveBeenCalledWith(['/game', 'fr']);
    });
  });
});

describe('ExploreComponent — fetch failure', () => {
  beforeEach(() => {
    spyOn(window, 'fetch').and.callFake(() => Promise.resolve(new Response('nope', { status: 500 })));
  });

  it('surfaces loadError when the map cannot be fetched', async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreComponent],
      providers: [provideRouter([]), provideLocationMocks()],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExploreComponent);
    fixture.detectChanges();
    await fixture.componentInstance.ngAfterViewInit();
    expect(fixture.componentInstance.loadError()).toContain('500');
  });
});
