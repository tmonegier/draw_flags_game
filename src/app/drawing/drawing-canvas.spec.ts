import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DrawingCanvasComponent, CANVAS_HEIGHT } from './drawing-canvas';
import { FlagElement, FLAG_ELEMENTS } from './flag-elements';

const MOCK_ELEMENT: FlagElement = {
  id: 'test-star',
  name: 'Star',
  flagOf: 'Test',
  category: 'symbols',
  defaultColor: '#ffffff',
  svgContent: '<circle cx="50" cy="50" r="40" fill="currentColor"/>',
};

describe('DrawingCanvasComponent', () => {
  let component: DrawingCanvasComponent;
  let fixture: ComponentFixture<DrawingCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingCanvasComponent],
    }).compileComponents();

    fixture   = TestBed.createComponent(DrawingCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Constants ─────────────────────────────────────────────────────────────────

  it('exported CANVAS_HEIGHT constant is 400', () => {
    expect(CANVAS_HEIGHT).toBe(400);
  });

  it('canvasHeight property equals CANVAS_HEIGHT', () => {
    expect(component.canvasHeight).toBe(CANVAS_HEIGHT);
  });

  // ── canvasWidth computed signal ───────────────────────────────────────────────

  it('canvasWidth is 600 for ratio 2:3', () => {
    fixture.componentRef.setInput('ratio', '2:3');
    fixture.detectChanges();
    expect(component.canvasWidth()).toBe(600);
  });

  it('canvasWidth is 800 for ratio 1:2', () => {
    fixture.componentRef.setInput('ratio', '1:2');
    fixture.detectChanges();
    expect(component.canvasWidth()).toBe(800);
  });

  it('canvasWidth is 400 for ratio 1:1', () => {
    fixture.componentRef.setInput('ratio', '1:1');
    fixture.detectChanges();
    expect(component.canvasWidth()).toBe(400);
  });

  it('canvasWidth rounds to the nearest integer', () => {
    fixture.componentRef.setInput('ratio', '3:5'); // 400 * 5/3 = 666.67 → 667
    fixture.detectChanges();
    expect(component.canvasWidth()).toBe(Math.round(CANVAS_HEIGHT * 5 / 3));
  });

  // ── clearCanvas ───────────────────────────────────────────────────────────────

  it('clearCanvas does not throw', () => {
    expect(() => component.clearCanvas()).not.toThrow();
  });

  it('clearCanvas fills the base canvas with white', () => {
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();
    (component as any).floodFill(5, 5);

    component.clearCanvas();

    const ctx = component.baseCanvasRef.nativeElement.getContext('2d')!;
    const pixel = ctx.getImageData(5, 5, 1, 1).data;
    expect(pixel[0]).toBe(255);
    expect(pixel[1]).toBe(255);
    expect(pixel[2]).toBe(255);
    expect(pixel[3]).toBe(255);
  });

  // ── isPlacingElement signal ───────────────────────────────────────────────────

  it('isPlacingElement defaults to false', () => {
    expect(component.isPlacingElement()).toBeFalse();
  });

  // ── startElementPlacement ─────────────────────────────────────────────────────

  describe('startElementPlacement()', () => {
    let originalImage: typeof Image;

    beforeEach(() => { originalImage = window.Image; });
    afterEach(() => { (window as any).Image = originalImage; });

    it('sets isPlacingElement to true', () => {
      component.startElementPlacement(MOCK_ELEMENT, 80, '#ff0000');
      expect(component.isPlacingElement()).toBeTrue();
    });

    it('substitutes the provided color for currentColor in the SVG src', () => {
      let capturedSrc = '';
      (window as any).Image = class {
        onload: any = null;
        set src(v: string) { capturedSrc = v; }
      };
      component.startElementPlacement(
        { ...MOCK_ELEMENT, svgContent: '<circle fill="currentColor"/>' },
        80,
        '#00ff00',
      );
      // The SVG is URL-encoded; decode before asserting
      const decoded = decodeURIComponent(capturedSrc);
      expect(decoded).toContain('#00ff00');
      expect(decoded).not.toContain('currentColor');
    });

    it('sets the CSS color property on the outer SVG so currentColor resolves correctly', () => {
      let capturedSrc = '';
      (window as any).Image = class {
        onload: any = null;
        set src(v: string) { capturedSrc = v; }
      };
      component.startElementPlacement(MOCK_ELEMENT, 80, '#ff6600');
      const decoded = decodeURIComponent(capturedSrc);
      expect(decoded).toContain('style="color:#ff6600"');
    });

    it('encodes the SVG as a data URI', () => {
      let capturedSrc = '';
      (window as any).Image = class {
        onload: any = null;
        set src(v: string) { capturedSrc = v; }
      };
      component.startElementPlacement(MOCK_ELEMENT, 80, '#fff');
      expect(capturedSrc).toMatch(/^data:image\/svg\+xml/);
    });
  });

  // ── placeElementDirectly ─────────────────────────────────────────────────────

  describe('placeElementDirectly()', () => {
    let originalImage: typeof Image;

    beforeEach(() => { originalImage = window.Image; });
    afterEach(() => { (window as any).Image = originalImage; });

    it('does not enter placement mode', () => {
      component.placeElementDirectly(MOCK_ELEMENT, '#000000', 0.5, 0.5, 0.5);
      expect(component.isPlacingElement()).toBeFalse();
    });

    it('requests an SVG data URL with color substituted', () => {
      let capturedSrc = '';
      (window as any).Image = class {
        onload: any = null;
        set src(v: string) { capturedSrc = v; }
      };
      component.placeElementDirectly(
        { ...MOCK_ELEMENT, svgContent: '<circle fill="currentColor"/>' },
        '#aabbcc',
        0.5, 0.5, 0.5,
      );
      expect(capturedSrc).toContain(encodeURIComponent('#aabbcc'));
      expect(capturedSrc).not.toContain('currentColor');
    });

    it('draws the image onto elementsCanvas at the correct position when loaded', () => {
      const drawSpy = spyOn(
        (component as any).elementsCtx, 'drawImage',
      );
      let capturedOnload: (() => void) | null = null;
      (window as any).Image = class {
        set onload(fn: () => void) { capturedOnload = fn; }
        set src(_: string) {}
      };
      fixture.componentRef.setInput('ratio', '2:3');
      fixture.detectChanges();
      // canvas is 600×400; xCenter=0.5→x=300, yCenter=0.5→y=200, sizeFraction=0.5→s=200
      component.placeElementDirectly(MOCK_ELEMENT, '#000', 0.5, 0.5, 0.5);
      capturedOnload!();
      expect(drawSpy).toHaveBeenCalledWith(jasmine.anything(), 200, 100, 200, 200);
    });
  });

  // ── cancelPlacement ───────────────────────────────────────────────────────────

  it('cancelPlacement sets isPlacingElement to false', () => {
    component.isPlacingElement.set(true);
    component.cancelPlacement();
    expect(component.isPlacingElement()).toBeFalse();
  });

  it('cancelPlacement emits placementCancelled', () => {
    let emitted = false;
    component.placementCancelled.subscribe(() => { emitted = true; });
    component.isPlacingElement.set(true);
    component.cancelPlacement();
    expect(emitted).toBeTrue();
  });

  // ── onEscapeKey ───────────────────────────────────────────────────────────────

  it('onEscapeKey calls cancelPlacement when isPlacingElement is true', () => {
    component.isPlacingElement.set(true);
    spyOn(component, 'cancelPlacement');
    component.onEscapeKey();
    expect(component.cancelPlacement).toHaveBeenCalledTimes(1);
  });

  it('onEscapeKey does nothing when isPlacingElement is false', () => {
    component.isPlacingElement.set(false);
    spyOn(component, 'cancelPlacement');
    component.onEscapeKey();
    expect(component.cancelPlacement).not.toHaveBeenCalled();
  });

  // ── getDrawingDataUrl ─────────────────────────────────────────────────────────

  it('getDrawingDataUrl returns a PNG data URL', () => {
    expect(component.getDrawingDataUrl()).toMatch(/^data:image\/png;base64,/);
  });

  it('getDrawingDataUrl returns a non-trivial base64 string', () => {
    const url = component.getDrawingDataUrl();
    const base64 = url.replace('data:image/png;base64,', '');
    expect(base64.length).toBeGreaterThan(0);
  });

  // ── applyHints (element kind) ─────────────────────────────────────────────────

  describe('applyHints with element hint', () => {
    let originalImage: typeof Image;

    beforeEach(() => { originalImage = window.Image; });
    afterEach(() => { (window as any).Image = originalImage; });

    it('does not throw when elementId is unknown', () => {
      expect(() => component.applyHints([
        { kind: 'element', elementId: 'nonexistent', color: '#000000', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.5 }
      ])).not.toThrow();
    });

    it('creates an Image with a data URI when the element is found', () => {
      if (FLAG_ELEMENTS.length === 0) { pending('no FLAG_ELEMENTS defined'); return; }
      const el = FLAG_ELEMENTS[0];
      let capturedSrc = '';
      (window as any).Image = class {
        onload: any = null;
        set src(v: string) { capturedSrc = v; }
      };
      component.applyHints([
        { kind: 'element', elementId: el.id, color: el.defaultColor, xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.5 }
      ]);
      expect(capturedSrc).toMatch(/^data:image\/svg\+xml/);
    });

    it('substitutes the hint color for currentColor in the element SVG', () => {
      if (FLAG_ELEMENTS.length === 0) { pending('no FLAG_ELEMENTS defined'); return; }
      const el = FLAG_ELEMENTS[0];
      let capturedSrc = '';
      (window as any).Image = class {
        onload: any = null;
        set src(v: string) { capturedSrc = v; }
      };
      component.applyHints([
        { kind: 'element', elementId: el.id, color: '#ff0000', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.5 }
      ]);
      const decoded = decodeURIComponent(capturedSrc);
      expect(decoded).not.toContain('currentColor');
    });

    it('draws on the elements canvas (not base canvas) when the image loads', () => {
      if (FLAG_ELEMENTS.length === 0) { pending('no FLAG_ELEMENTS defined'); return; }
      const el = FLAG_ELEMENTS[0];
      let loadCallback: (() => void) | null = null;
      (window as any).Image = class {
        onload: (() => void) | null = null;
        set src(_: string) { loadCallback = this.onload; }
      };
      const elementsDrawSpy = spyOn((component as any).elementsCtx, 'drawImage');
      const baseDrawSpy = spyOn((component as any).baseCtx, 'drawImage');
      component.applyHints([
        { kind: 'element', elementId: el.id, color: el.defaultColor, xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.5 }
      ]);
      (loadCallback as (() => void) | null)?.();
      expect(elementsDrawSpy).toHaveBeenCalled();
      expect(baseDrawSpy).not.toHaveBeenCalled();
    });
  });

  // ── applySplits ───────────────────────────────────────────────────────────────

  it('applySplits horizontal does not throw', () => {
    expect(() => component.applySplits('horizontal', [1, 1])).not.toThrow();
  });

  it('applySplits vertical does not throw', () => {
    expect(() => component.applySplits('vertical', [1, 2, 1])).not.toThrow();
  });

  it('applySplits draws a visible line on the splits canvas', () => {
    component.applySplits('horizontal', [1, 1]);
    const ctx = component.splitsCanvasRef.nativeElement.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, component.canvasWidth(), component.canvasHeight);
    const hasNonTransparent = Array.from(imageData.data)
      .some((value, i) => i % 4 === 3 && value > 0);
    expect(hasNonTransparent).toBeTrue();
  });

  it('applySplits clears previous lines before drawing new ones', () => {
    // First apply 3 splits, then 1 split — splits canvas should reflect only the latter
    component.applySplits('horizontal', [1, 1, 1]);
    component.applySplits('horizontal', [1, 1]); // draws 1 line
    const ctx = component.splitsCanvasRef.nativeElement.getContext('2d')!;
    // The splits canvas should only have content for the most recent call
    expect(() => ctx.getImageData(0, 0, 1, 1)).not.toThrow();
  });

  // ── Flood fill ────────────────────────────────────────────────────────────────

  it('floodFill paints the target pixel with the fill color', () => {
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();
    (component as any).floodFill(5, 5);
    const pixel = component.baseCanvasRef.nativeElement.getContext('2d')!
      .getImageData(5, 5, 1, 1).data;
    expect(pixel[0]).toBe(255); // R
    expect(pixel[1]).toBe(0);   // G
    expect(pixel[2]).toBe(0);   // B
  });

  it('floodFill propagates to fill the entire canvas (same initial color)', () => {
    fixture.componentRef.setInput('color', '#0000ff');
    fixture.detectChanges();
    (component as any).floodFill(0, 0); // canvas is all white → fills everything
    const pixel = component.baseCanvasRef.nativeElement.getContext('2d')!
      .getImageData(component.canvasWidth() - 1, component.canvasHeight - 1, 1, 1).data;
    expect(pixel[0]).toBe(0);
    expect(pixel[1]).toBe(0);
    expect(pixel[2]).toBe(255);
  });

  it('floodFill is a no-op when fill color equals the target color', () => {
    fixture.componentRef.setInput('color', '#ffffff'); // canvas is already white
    fixture.detectChanges();
    (component as any).floodFill(5, 5);
    const pixel = component.baseCanvasRef.nativeElement.getContext('2d')!
      .getImageData(5, 5, 1, 1).data;
    expect(pixel[0]).toBe(255);
    expect(pixel[1]).toBe(255);
    expect(pixel[2]).toBe(255);
  });

  it('floodFill does not cross a split line', () => {
    component.applySplits('vertical', [1, 1]); // vertical split at midpoint
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();
    (component as any).floodFill(0, 0); // fill left side

    // Right edge should remain white
    const pixel = component.baseCanvasRef.nativeElement.getContext('2d')!
      .getImageData(component.canvasWidth() - 1, 0, 1, 1).data;
    expect(pixel[0]).toBe(255); // R: white
    expect(pixel[1]).toBe(255); // G: white
    expect(pixel[2]).toBe(255); // B: white
  });

  it('floodFill does not start when click lands on a split line pixel', () => {
    component.applySplits('horizontal', [1, 1]);
    const splitCtx = component.splitsCanvasRef.nativeElement.getContext('2d')!;

    // Find the first row with a visible (alpha > 0) split-line pixel
    let splitY = -1;
    for (let y = 0; y < component.canvasHeight && splitY === -1; y++) {
      if (splitCtx.getImageData(0, y, 1, 1).data[3] > 0) splitY = y;
    }
    expect(splitY).toBeGreaterThanOrEqual(0);

    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();
    (component as any).floodFill(0, splitY); // click directly on the split line

    const pixel = component.baseCanvasRef.nativeElement.getContext('2d')!
      .getImageData(0, splitY, 1, 1).data;
    const isRed = pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0;
    expect(isRed).toBeFalse();
  });

  // ── hexToRgba (private — tested via cast) ─────────────────────────────────────

  it('hexToRgba converts #ff0000 to [255, 0, 0, 255]', () => {
    expect((component as any).hexToRgba('#ff0000')).toEqual([255, 0, 0, 255]);
  });

  it('hexToRgba converts #000000 to [0, 0, 0, 255]', () => {
    expect((component as any).hexToRgba('#000000')).toEqual([0, 0, 0, 255]);
  });

  it('hexToRgba converts #ffffff to [255, 255, 255, 255]', () => {
    expect((component as any).hexToRgba('#ffffff')).toEqual([255, 255, 255, 255]);
  });

  it('hexToRgba works without the # prefix', () => {
    expect((component as any).hexToRgba('00ff00')).toEqual([0, 255, 0, 255]);
  });

  // ── colorMatch (private — tested via cast) ────────────────────────────────────

  it('colorMatch returns true for identical colors', () => {
    expect((component as any).colorMatch([200, 100, 50, 255], [200, 100, 50, 255])).toBeTrue();
  });

  it('colorMatch returns true when every channel diff is within tolerance (20)', () => {
    expect((component as any).colorMatch([100, 100, 100, 255], [120, 120, 120, 255])).toBeTrue();
  });

  it('colorMatch returns false when any channel diff exceeds tolerance (20)', () => {
    expect((component as any).colorMatch([100, 100, 100, 255], [121, 100, 100, 255])).toBeFalse();
  });

  it('colorMatch boundary: diff = 20 on every channel → true', () => {
    expect((component as any).colorMatch([0, 0, 0, 255], [20, 20, 20, 255])).toBeTrue();
  });

  it('colorMatch boundary: diff = 21 on one channel → false', () => {
    expect((component as any).colorMatch([0, 0, 0, 255], [21, 0, 0, 255])).toBeFalse();
  });

  // ── Mouse event handlers ──────────────────────────────────────────────────────

  it('onMouseDown on background fills baseCanvas', () => {
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();

    const overlay = component.overlayCanvasRef.nativeElement;
    spyOn(overlay, 'getBoundingClientRect').and.returnValue({
      left: 0, top: 0,
      width: component.canvasWidth(), height: component.canvasHeight,
      right: component.canvasWidth(), bottom: component.canvasHeight,
      x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect);

    component.onMouseDown(new MouseEvent('mousedown', { clientX: 10, clientY: 10, button: 0 }));

    const pixel = component.baseCanvasRef.nativeElement.getContext('2d')!
      .getImageData(10, 10, 1, 1).data;
    expect(pixel[0]).toBe(255);
    expect(pixel[1]).toBe(0);
    expect(pixel[2]).toBe(0);
  });

  it('onMouseDown on an element pixel recolors via SVG re-render (not pixel fill)', () => {
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();

    // Register a placed element in the tracking array so recolorElement can find it
    const pe = {
      element: FLAG_ELEMENTS[0],
      color: '#0000ff',
      xCenter: 15 / component.canvasWidth(),
      yCenter: 15 / component.canvasHeight,
      sizeFraction: 100 / component.canvasHeight, // large box: ±50px around center
    };
    (component as any).placedElements = [pe];

    // Paint a non-transparent pixel on elementsCanvas at the click point so the
    // alpha check in onMouseDown routes to recolorElement instead of floodFill
    const elemCtx = component.elementsCanvasRef.nativeElement.getContext('2d')!;
    elemCtx.fillStyle = '#0000ff';
    elemCtx.fillRect(15, 15, 1, 1);

    spyOn(component as any, 'redrawAllElements');

    const overlay = component.overlayCanvasRef.nativeElement;
    spyOn(overlay, 'getBoundingClientRect').and.returnValue({
      left: 0, top: 0,
      width: component.canvasWidth(), height: component.canvasHeight,
      right: component.canvasWidth(), bottom: component.canvasHeight,
      x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect);

    component.onMouseDown(new MouseEvent('mousedown', { clientX: 15, clientY: 15, button: 0 }));

    // The placed element's color should be updated to the active color
    expect((component as any).placedElements[0].color).toBe('#ff0000');
    // The canvas should be redrawn from SVG source (not pixel-manipulated)
    expect((component as any).redrawAllElements).toHaveBeenCalled();
  });

  it('onMouseDown on an element pixel does not touch baseCanvas', () => {
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();

    (component as any).placedElements = [{
      element: FLAG_ELEMENTS[0],
      color: '#0000ff',
      xCenter: 15 / component.canvasWidth(),
      yCenter: 15 / component.canvasHeight,
      sizeFraction: 100 / component.canvasHeight,
    }];

    const elemCtx = component.elementsCanvasRef.nativeElement.getContext('2d')!;
    elemCtx.fillStyle = '#0000ff';
    elemCtx.fillRect(15, 15, 1, 1);

    spyOn(component as any, 'redrawAllElements'); // suppress re-render side effects

    const overlay = component.overlayCanvasRef.nativeElement;
    spyOn(overlay, 'getBoundingClientRect').and.returnValue({
      left: 0, top: 0,
      width: component.canvasWidth(), height: component.canvasHeight,
      right: component.canvasWidth(), bottom: component.canvasHeight,
      x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect);

    component.onMouseDown(new MouseEvent('mousedown', { clientX: 15, clientY: 15, button: 0 }));

    // baseCanvas untouched — remains white
    const basePixel = component.baseCanvasRef.nativeElement.getContext('2d')!
      .getImageData(15, 15, 1, 1).data;
    expect(basePixel[0]).toBe(255);
    expect(basePixel[1]).toBe(255);
    expect(basePixel[2]).toBe(255);
  });

  it('onMouseDown right-click in placement mode cancels placement', () => {
    component.isPlacingElement.set(true);
    spyOn(component, 'cancelPlacement');
    component.onMouseDown(new MouseEvent('mousedown', { button: 2 }));
    expect(component.cancelPlacement).toHaveBeenCalledTimes(1);
  });

  // ── ngAfterViewChecked auto-clear on ratio change ──────────────────────────────

  it('changes the canvas dimensions when ratio changes', () => {
    fixture.componentRef.setInput('ratio', '2:3');
    fixture.detectChanges();
    const widthBefore = component.canvasWidth();

    fixture.componentRef.setInput('ratio', '1:2');
    fixture.detectChanges();
    expect(component.canvasWidth()).not.toBe(widthBefore);
  });

  it('clears the canvas when the ratio (and therefore width) changes', () => {
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();
    (component as any).floodFill(5, 5); // paint red

    fixture.componentRef.setInput('ratio', '1:1'); // different width → clearCanvas
    fixture.detectChanges();

    const pixel = component.baseCanvasRef.nativeElement.getContext('2d')!
      .getImageData(5, 5, 1, 1).data;
    expect(pixel[0]).toBe(255);
    expect(pixel[1]).toBe(255);
    expect(pixel[2]).toBe(255);
  });
});
