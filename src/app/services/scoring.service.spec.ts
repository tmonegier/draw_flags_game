import { TestBed } from '@angular/core/testing';
import { ScoringService } from './scoring.service';
import { CANVAS_BACKGROUND } from '../drawing/drawing-canvas';

const BG = (() => {
  const n = parseInt(CANVAS_BACKGROUND.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
})();

describe('ScoringService', () => {
  let service: ScoringService;
  let originalImage: typeof Image;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringService);
    originalImage = window.Image;
  });

  afterEach(() => {
    (window as any).Image = originalImage;
  });

  /** Mock Image class whose src setter triggers onload or onerror asynchronously. */
  function makeMockImage(shouldLoad: boolean) {
    return class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_v: string) {
        queueMicrotask(() => (shouldLoad ? this.onload : this.onerror)?.());
      }
    };
  }

  // ── Error cases ───────────────────────────────────────────────────────────────

  it('resolves 0 when the flag image fails to load', async () => {
    (window as any).Image = makeMockImage(false);
    const score = await service.computeScore('data:x', 'test.svg', 2, 2);
    expect(score).toBe(0);
  });

  it('resolves 0 when the user image fails to load', async () => {
    // First Image created (flag) succeeds; second (user) fails.
    let instanceCount = 0;
    (window as any).Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_v: string) {
        const n = ++instanceCount;
        queueMicrotask(() => (n === 1 ? this.onload : this.onerror)?.());
      }
    };
    // drawImage would throw because our mock is not an HTMLImageElement
    spyOn(CanvasRenderingContext2D.prototype, 'drawImage').and.callFake(() => {});
    const score = await service.computeScore('data:x', 'test.svg', 2, 2);
    expect(score).toBe(0);
  });

  it('builds the flag URL with the /flags/ prefix', async () => {
    let capturedSrc = '';
    (window as any).Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(v: string) {
        capturedSrc = v;
        queueMicrotask(() => this.onerror?.());
      }
    };
    await service.computeScore('data:x', 'france.svg', 2, 2);
    expect(capturedSrc).toBe('/flags/france.svg');
  });

  // ── Pixel comparison logic ────────────────────────────────────────────────────
  //
  // The service calls drawImage(flagImg, …) with our mock Image instance.
  // Chrome rejects non-HTMLImageElement objects in drawImage, so we stub it out.
  // getImageData is also stubbed to return controlled pixel data.

  function setupCanvasSpies(getImageDataImpl: () => ImageData): void {
    spyOn(CanvasRenderingContext2D.prototype, 'drawImage').and.callFake(() => {});
    spyOn(CanvasRenderingContext2D.prototype, 'getImageData').and.callFake(getImageDataImpl);
  }

  it('returns 1000 when both images render identically (same pixel data)', async () => {
    (window as any).Image = makeMockImage(true);
    const w = 2, h = 2;
    const allWhite = new Uint8ClampedArray(w * h * 4).fill(255);
    setupCanvasSpies(() => ({ data: allWhite, width: w, height: h, colorSpace: 'srgb' } as ImageData));
    const score = await service.computeScore('data:x', 'test.svg', w, h);
    expect(score).toBe(1000);
  });

  it('returns 0 when all pixels exceed tolerance (white vs black)', async () => {
    (window as any).Image = makeMockImage(true);
    const w = 1, h = 1;
    let call = 0;
    setupCanvasSpies(() => {
      const data = call++ === 0
        ? new Uint8ClampedArray([255, 255, 255, 255]) // ref: white
        : new Uint8ClampedArray([  0,   0,   0, 255]); // user: black — diff 255 > 60
      return { data, width: w, height: h, colorSpace: 'srgb' } as ImageData;
    });
    const score = await service.computeScore('data:x', 'test.svg', w, h);
    expect(score).toBe(0);
  });

  it('returns 500 when exactly half the pixels match', async () => {
    (window as any).Image = makeMockImage(true);
    const w = 2, h = 1;
    let call = 0;
    setupCanvasSpies(() => {
      // ref: 2 white pixels; user: 1 white + 1 black → 1/2 match
      const data = call++ === 0
        ? new Uint8ClampedArray([255, 255, 255, 255, 255, 255, 255, 255])
        : new Uint8ClampedArray([255, 255, 255, 255,   0,   0,   0, 255]);
      return { data, width: w, height: h, colorSpace: 'srgb' } as ImageData;
    });
    const score = await service.computeScore('data:x', 'test.svg', w, h);
    expect(score).toBe(500);
  });

  it('counts a pixel as matching when every channel diff equals tolerance (60)', async () => {
    (window as any).Image = makeMockImage(true);
    const w = 1, h = 1;
    let call = 0;
    setupCanvasSpies(() => {
      const data = call++ === 0
        ? new Uint8ClampedArray([100, 100, 100, 255])
        : new Uint8ClampedArray([160, 160, 160, 255]); // diff = 60 on each channel → match
      return { data, width: w, height: h, colorSpace: 'srgb' } as ImageData;
    });
    const score = await service.computeScore('data:x', 'test.svg', w, h);
    expect(score).toBe(1000);
  });

  it('counts a pixel as non-matching when red channel diff is tolerance+1 (61)', async () => {
    (window as any).Image = makeMockImage(true);
    const w = 1, h = 1;
    let call = 0;
    setupCanvasSpies(() => {
      const data = call++ === 0
        ? new Uint8ClampedArray([100, 100, 100, 255])
        : new Uint8ClampedArray([161, 100, 100, 255]); // red diff = 61 → no match
      return { data, width: w, height: h, colorSpace: 'srgb' } as ImageData;
    });
    const score = await service.computeScore('data:x', 'test.svg', w, h);
    expect(score).toBe(0);
  });

  it('does not count unfilled canvas pixels even when the flag region is white', async () => {
    (window as any).Image = makeMockImage(true);
    const w = 2, h = 1;
    let call = 0;
    setupCanvasSpies(() => {
      // ref: 2 white pixels; user: 1 white + 1 unfilled-canvas-grey
      const data = call++ === 0
        ? new Uint8ClampedArray([255, 255, 255, 255, 255, 255, 255, 255])
        : new Uint8ClampedArray([255, 255, 255, 255, BG[0], BG[1], BG[2], 255]);
      return { data, width: w, height: h, colorSpace: 'srgb' } as ImageData;
    });
    const score = await service.computeScore('data:x', 'test.svg', w, h);
    // 1 of 2 pixels matches → 500, despite grey being within tolerance of white
    expect(score).toBe(500);
  });

  it('score is always in the range [0, 1000]', async () => {
    (window as any).Image = makeMockImage(true);
    const w = 4, h = 4;
    const data = new Uint8ClampedArray(w * h * 4).fill(128);
    setupCanvasSpies(() => ({ data, width: w, height: h, colorSpace: 'srgb' } as ImageData));
    const score = await service.computeScore('data:x', 'test.svg', w, h);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1000);
  });

  it('passes width and height to canvas operations', async () => {
    (window as any).Image = makeMockImage(true);
    const w = 3, h = 7;
    const data = new Uint8ClampedArray(w * h * 4).fill(0);
    spyOn(CanvasRenderingContext2D.prototype, 'drawImage').and.callFake(() => {});
    const getImageDataSpy = spyOn(CanvasRenderingContext2D.prototype, 'getImageData').and.returnValue(
      { data, width: w, height: h, colorSpace: 'srgb' } as ImageData
    );
    await service.computeScore('data:x', 'test.svg', w, h);
    expect(getImageDataSpy).toHaveBeenCalledWith(0, 0, w, h);
  });
});
