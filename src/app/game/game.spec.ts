import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { GameComponent } from './game';
import { GameStateService } from '../services/game-state.service';
import { FlagElement } from '../drawing/flag-elements';

const MOCK_ELEMENT: FlagElement = {
  id: 'test-star',
  name: 'Star',
  flagOf: 'Test',
  category: 'symbols',
  defaultColor: '#ffffff',
  svgContent: '<circle cx="50" cy="50" r="40" fill="currentColor"/>',
};

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let router: Router;
  let gameState: GameStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [provideRouter([]), provideLocationMocks()],
    }).compileComponents();

    gameState = TestBed.inject(GameStateService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;

    // Start a game so currentCountry is set and DrawingCanvas renders correctly.
    gameState.startGame('easy');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('drawingCanvas ViewChild is populated after init', () => {
    expect(component.drawingCanvas).toBeDefined();
  });

  // ── Signal defaults ───────────────────────────────────────────────────────────

  it('activeColor is set to the first color of the shuffled palette after init', () => {
    const palette = component.allowedColors();
    expect(palette).not.toBeNull();
    expect(palette!.length).toBeGreaterThan(0);
    expect(component.activeColor()).toBe(palette![0]);
  });

  it('isElementsModalOpen defaults to false', () => {
    expect(component.isElementsModalOpen()).toBeFalse();
  });

  // ── clearMode computed signal ─────────────────────────────────────────────────

  it('clearMode is "cancel" on easy mode', () => {
    expect(component.clearMode()).toBe('cancel');
  });

  it('clearMode is "clear" on hard mode', () => {
    gameState.startGame('hard');
    fixture.detectChanges();
    expect(component.clearMode()).toBe('clear');
  });

  it('clearMode is "clear" on free mode', () => {
    gameState.startGame('free');
    fixture.detectChanges();
    expect(component.clearMode()).toBe('clear');
  });

  // ── showElements computed signal ──────────────────────────────────────────────

  it('showElements is false on easy mode', () => {
    expect(component.showElements()).toBeFalse();
  });

  it('showElements is true on hard mode', () => {
    gameState.startGame('hard');
    fixture.detectChanges();
    expect(component.showElements()).toBeTrue();
  });

  it('showElements is false on free mode', () => {
    gameState.startGame('free');
    fixture.detectChanges();
    expect(component.showElements()).toBeFalse();
  });

  // ── drawingMode computed signal ───────────────────────────────────────────────

  it('drawingMode is "fill" on easy mode', () => {
    expect(component.drawingMode()).toBe('fill');
  });

  it('drawingMode is "fill" on hard mode', () => {
    gameState.startGame('hard');
    fixture.detectChanges();
    expect(component.drawingMode()).toBe('fill');
  });

  it('drawingMode is "pen" on free mode', () => {
    gameState.startGame('free');
    fixture.detectChanges();
    expect(component.drawingMode()).toBe('pen');
  });

  // ── showPenSize computed signal ───────────────────────────────────────────────

  it('showPenSize is false on easy mode', () => {
    expect(component.showPenSize()).toBeFalse();
  });

  it('showPenSize is false on hard mode', () => {
    gameState.startGame('hard');
    fixture.detectChanges();
    expect(component.showPenSize()).toBeFalse();
  });

  it('showPenSize is true on free mode', () => {
    gameState.startGame('free');
    fixture.detectChanges();
    expect(component.showPenSize()).toBeTrue();
  });

  // ── penSize signal ────────────────────────────────────────────────────────────

  it('penSize defaults to 4', () => {
    expect(component.penSize()).toBe(4);
  });

  it('onPenSizeChange updates penSize', () => {
    component.onPenSizeChange(12);
    expect(component.penSize()).toBe(12);
  });

  it('onPenSizeChange stores the exact value', () => {
    component.onPenSizeChange(1);
    expect(component.penSize()).toBe(1);
  });

  // ── onColorChange ─────────────────────────────────────────────────────────────

  it('onColorChange updates activeColor', () => {
    component.onColorChange('#ff0000');
    expect(component.activeColor()).toBe('#ff0000');
  });

  it('onColorChange stores the exact string provided', () => {
    component.onColorChange('#abc123');
    expect(component.activeColor()).toBe('#abc123');
  });

  // ── onClearCanvas ─────────────────────────────────────────────────────────────

  it('onClearCanvas calls clearCanvas', () => {
    spyOn(component.drawingCanvas, 'clearCanvas');
    spyOn(component.drawingCanvas, 'applyHints');
    component.onClearCanvas();
    expect(component.drawingCanvas.clearCanvas).toHaveBeenCalledTimes(1);
  });

  it('onClearCanvas re-applies hints on easy mode', () => {
    spyOn(component.drawingCanvas, 'clearCanvas');
    spyOn(component.drawingCanvas, 'applyHints');
    component.onClearCanvas();
    const country = gameState.currentCountry()!;
    expect(component.drawingCanvas.applyHints).toHaveBeenCalledWith(country.hints);
  });

  it('onClearCanvas does not re-apply hints on hard mode', () => {
    gameState.startGame('hard');
    fixture.detectChanges();
    spyOn(component.drawingCanvas, 'clearCanvas');
    spyOn(component.drawingCanvas, 'applyHints');
    component.onClearCanvas();
    expect(component.drawingCanvas.applyHints).not.toHaveBeenCalled();
  });

  // ── onOpenElements ────────────────────────────────────────────────────────────

  it('onOpenElements sets isElementsModalOpen to true', () => {
    component.onOpenElements();
    expect(component.isElementsModalOpen()).toBeTrue();
  });

  // ── onElementSelected ─────────────────────────────────────────────────────────

  it('onElementSelected closes the elements modal', () => {
    component.isElementsModalOpen.set(true);
    spyOn(component.drawingCanvas, 'startElementPlacement');
    component.onElementSelected({ element: MOCK_ELEMENT, size: 80 });
    expect(component.isElementsModalOpen()).toBeFalse();
  });

  it('onElementSelected calls startElementPlacement when element has no autoPlace', () => {
    component.activeColor.set('#ff0000');
    spyOn(component.drawingCanvas, 'startElementPlacement');
    component.onElementSelected({ element: MOCK_ELEMENT, size: 80 });
    expect(component.drawingCanvas.startElementPlacement)
      .toHaveBeenCalledWith(MOCK_ELEMENT, 80, '#ff0000');
  });

  it('onElementSelected passes the current active color, not a cached one', () => {
    component.activeColor.set('#00ff00');
    spyOn(component.drawingCanvas, 'startElementPlacement');
    component.onElementSelected({ element: MOCK_ELEMENT, size: 80 });
    expect(component.drawingCanvas.startElementPlacement)
      .toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), '#00ff00');
  });

  it('onElementSelected calls placeElementDirectly when element has autoPlace', () => {
    const autoElement: FlagElement = {
      ...MOCK_ELEMENT,
      autoPlace: { xCenter: 0.5, yCenter: 0.55, sizeFraction: 0.78 },
    };
    component.activeColor.set('#000000');
    spyOn(component.drawingCanvas, 'placeElementDirectly');
    spyOn(component.drawingCanvas, 'startElementPlacement');
    component.onElementSelected({ element: autoElement, size: 80 });
    expect(component.drawingCanvas.placeElementDirectly)
      .toHaveBeenCalledWith(autoElement, '#000000', 0.5, 0.55, 0.78);
    expect(component.drawingCanvas.startElementPlacement).not.toHaveBeenCalled();
  });

  it('onElementSelected with autoPlace also closes the modal', () => {
    const autoElement: FlagElement = {
      ...MOCK_ELEMENT,
      autoPlace: { xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.5 },
    };
    component.isElementsModalOpen.set(true);
    spyOn(component.drawingCanvas, 'placeElementDirectly');
    component.onElementSelected({ element: autoElement, size: 80 });
    expect(component.isElementsModalOpen()).toBeFalse();
  });

  // ── onSplitsSelected ──────────────────────────────────────────────────────────

  it('onSplitsSelected closes the elements modal', () => {
    component.isElementsModalOpen.set(true);
    spyOn(component.drawingCanvas, 'applySplits');
    component.onSplitsSelected({ direction: 'horizontal', ratios: [1, 1] });
    expect(component.isElementsModalOpen()).toBeFalse();
  });

  it('onSplitsSelected calls applySplits with direction and ratios', () => {
    spyOn(component.drawingCanvas, 'applySplits');
    component.onSplitsSelected({ direction: 'vertical', ratios: [1, 2, 1] });
    expect(component.drawingCanvas.applySplits).toHaveBeenCalledWith('vertical', [1, 2, 1]);
  });

  // ── onPlacementCancelled ──────────────────────────────────────────────────────

  it('onPlacementCancelled does not throw', () => {
    expect(() => component.onPlacementCancelled()).not.toThrow();
  });

  // ── goHome ────────────────────────────────────────────────────────────────────

  it('goHome navigates to /', () => {
    component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  // ── submit ────────────────────────────────────────────────────────────────────

  it('submit navigates to /compare', () => {
    spyOn(component.drawingCanvas, 'getDrawingDataUrl').and.returnValue('data:image/png;base64,abc');
    component.submit();
    expect(router.navigate).toHaveBeenCalledWith(['/compare']);
  });

  it('submit stores the drawing data URL in game state', () => {
    spyOn(component.drawingCanvas, 'getDrawingDataUrl').and.returnValue('data:image/png;base64,xyz');
    component.submit();
    expect(gameState.drawingDataUrl()).toBe('data:image/png;base64,xyz');
  });

  it('submit cancels active element placement before capturing', () => {
    component.drawingCanvas.isPlacingElement.set(true);
    spyOn(component.drawingCanvas, 'cancelPlacement');
    spyOn(component.drawingCanvas, 'getDrawingDataUrl').and.returnValue('data:x');
    component.submit();
    expect(component.drawingCanvas.cancelPlacement).toHaveBeenCalled();
  });

  it('submit does not call cancelPlacement when not placing', () => {
    component.drawingCanvas.isPlacingElement.set(false);
    spyOn(component.drawingCanvas, 'cancelPlacement');
    spyOn(component.drawingCanvas, 'getDrawingDataUrl').and.returnValue('data:x');
    component.submit();
    expect(component.drawingCanvas.cancelPlacement).not.toHaveBeenCalled();
  });

  it('submit stores canvas width in game state', () => {
    spyOn(component.drawingCanvas, 'getDrawingDataUrl').and.returnValue('data:x');
    component.submit();
    expect(gameState.drawingWidth()).toBe(component.drawingCanvas.canvasWidth());
  });

  it('submit stores canvas height in game state', () => {
    spyOn(component.drawingCanvas, 'getDrawingDataUrl').and.returnValue('data:x');
    component.submit();
    expect(gameState.drawingHeight()).toBe(component.drawingCanvas.canvasHeight());
  });
});

// ── GameComponent — route param (:countryCode) ────────────────────────────────

async function createGameWithParam(countryCode: string | null): Promise<{
  fixture: ComponentFixture<GameComponent>;
  component: GameComponent;
  router: Router;
  gameState: GameStateService;
}> {
  await TestBed.configureTestingModule({
    imports: [GameComponent],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: { get: (key: string) => key === 'countryCode' ? countryCode : null } },
        },
      },
    ],
  }).compileComponents();

  const gameState = TestBed.inject(GameStateService);
  const router    = TestBed.inject(Router);
  spyOn(router, 'navigate');
  gameState.startGame('easy');

  const fixture   = TestBed.createComponent(GameComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, component, router, gameState };
}

describe('GameComponent with countryCode route param', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads the specified country when countryCode param is present', async () => {
    const { gameState } = await createGameWithParam('fr');
    expect(gameState.currentCountry()?.code).toBe('fr');
  });

  it('sets queue to empty for a single-country game via route param', async () => {
    const { gameState } = await createGameWithParam('fr');
    expect(gameState.queue()).toEqual([]);
  });

  it('navigates to / when countryCode param is unknown', async () => {
    const { router } = await createGameWithParam('xx');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('does not call startGameWithCountry when no countryCode param', async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (_: string) => null } } },
        },
      ],
    }).compileComponents();

    const gameState = TestBed.inject(GameStateService);
    gameState.startGame('easy');
    spyOn(gameState, 'startGameWithCountry').and.callThrough();

    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(gameState.startGameWithCountry).not.toHaveBeenCalled();
  });
});
