import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
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

  it('activeTool defaults to fill', () => {
    expect(component.activeTool()).toBe('fill');
  });

  it('activeColor is set to the first flag color in easy mode after init', () => {
    const country = gameState.currentCountry()!;
    expect(country.colors.length).toBeGreaterThan(0);
    expect(component.activeColor()).toBe(country.colors[0]);
  });

  it('isElementsModalOpen defaults to false', () => {
    expect(component.isElementsModalOpen()).toBeFalse();
  });

  // ── onToolChange ──────────────────────────────────────────────────────────────

  it('onToolChange updates activeTool to eraser', () => {
    component.onToolChange('eraser');
    expect(component.activeTool()).toBe('eraser');
  });

  it('onToolChange can switch back to fill', () => {
    component.onToolChange('eraser');
    component.onToolChange('fill');
    expect(component.activeTool()).toBe('fill');
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

  it('onClearCanvas delegates to drawingCanvas.clearCanvas()', () => {
    spyOn(component.drawingCanvas, 'clearCanvas');
    component.onClearCanvas();
    expect(component.drawingCanvas.clearCanvas).toHaveBeenCalledTimes(1);
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

  it('onElementSelected calls startElementPlacement with element, size and active color', () => {
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
    expect(gameState.drawingHeight()).toBe(component.drawingCanvas.canvasHeight);
  });
});
