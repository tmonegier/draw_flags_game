import {
  Rgba, colorMatch, floodFillPixels, getPixelColor, hexToRgba, setPixelColor,
} from './canvas-pixels';

describe('hexToRgba', () => {
  it('converts #ff0000 to [255, 0, 0, 255]', () => {
    expect(hexToRgba('#ff0000')).toEqual([255, 0, 0, 255]);
  });
  it('converts #000000 to [0, 0, 0, 255]', () => {
    expect(hexToRgba('#000000')).toEqual([0, 0, 0, 255]);
  });
  it('converts #ffffff to [255, 255, 255, 255]', () => {
    expect(hexToRgba('#ffffff')).toEqual([255, 255, 255, 255]);
  });
  it('works without the # prefix', () => {
    expect(hexToRgba('00ff00')).toEqual([0, 255, 0, 255]);
  });
});

describe('colorMatch', () => {
  it('returns true for identical colours', () => {
    expect(colorMatch([200, 100, 50, 255], [200, 100, 50, 255])).toBeTrue();
  });
  it('returns true when every channel diff is within tolerance (20)', () => {
    expect(colorMatch([100, 100, 100, 255], [120, 120, 120, 255])).toBeTrue();
  });
  it('returns false when any channel diff exceeds tolerance (20)', () => {
    expect(colorMatch([100, 100, 100, 255], [121, 100, 100, 255])).toBeFalse();
  });
  it('boundary: diff = 20 on every channel → true', () => {
    expect(colorMatch([0, 0, 0, 255], [20, 20, 20, 255])).toBeTrue();
  });
  it('boundary: diff = 21 on one channel → false', () => {
    expect(colorMatch([0, 0, 0, 255], [21, 0, 0, 255])).toBeFalse();
  });
  it('respects a custom tolerance', () => {
    expect(colorMatch([0, 0, 0, 255], [50, 0, 0, 255], 60)).toBeTrue();
    expect(colorMatch([0, 0, 0, 255], [50, 0, 0, 255], 40)).toBeFalse();
  });
});

describe('getPixelColor / setPixelColor', () => {
  it('round-trips a colour at (x, y)', () => {
    const w = 4, h = 3;
    const data = new Uint8ClampedArray(w * h * 4);
    setPixelColor(data, 2, 1, w, [10, 20, 30, 255]);
    expect(getPixelColor(data, 2, 1, w)).toEqual([10, 20, 30, 255]);
  });
  it('writes only the targeted pixel', () => {
    const w = 2, h = 2;
    const data = new Uint8ClampedArray(w * h * 4);
    setPixelColor(data, 1, 0, w, [99, 0, 0, 255]);
    expect(getPixelColor(data, 0, 0, w)).toEqual([0, 0, 0, 0]);
    expect(getPixelColor(data, 1, 0, w)).toEqual([99, 0, 0, 255]);
  });
});

describe('floodFillPixels', () => {
  const W = 4, H = 3;
  const fillColor: Rgba = [255, 0, 0, 255];

  function blank(): Uint8ClampedArray {
    return new Uint8ClampedArray(W * H * 4);
  }

  it('paints the entire connected region of the seed colour', () => {
    const data = blank(); // every pixel is (0,0,0,0)
    const splits = blank();
    floodFillPixels(data, splits, W, H, 0, 0, fillColor);
    for (let i = 0; i < W * H; i++) {
      expect([data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]])
        .toEqual([255, 0, 0, 255]);
    }
  });

  it('does not cross opaque split-line pixels (but paints them)', () => {
    const data = blank();
    const splits = blank();
    // Vertical split at x=2 across all rows
    for (let y = 0; y < H; y++) setPixelColor(splits, 2, y, W, [0, 0, 0, 255]);
    floodFillPixels(data, splits, W, H, 0, 0, fillColor);
    // Left of split: filled. Split column: filled (boundary itself painted).
    // Right of split: untouched.
    expect(getPixelColor(data, 0, 0, W)).toEqual([255, 0, 0, 255]);
    expect(getPixelColor(data, 1, 0, W)).toEqual([255, 0, 0, 255]);
    expect(getPixelColor(data, 2, 0, W)).toEqual([255, 0, 0, 255]);
    expect(getPixelColor(data, 3, 0, W)).toEqual([0, 0, 0, 0]);
  });

  it('is a no-op when the seed pixel sits on a split line', () => {
    const data = blank();
    const splits = blank();
    setPixelColor(splits, 1, 1, W, [0, 0, 0, 255]);
    floodFillPixels(data, splits, W, H, 1, 1, fillColor);
    // Nothing painted on data
    for (let i = 0; i < W * H; i++) expect(data[i * 4 + 3]).toBe(0);
  });

  it('is a no-op when the fill colour already matches the target', () => {
    const data = blank();
    const splits = blank();
    for (let i = 0; i < W * H; i++) setPixelColor(data, i % W, Math.floor(i / W), W, fillColor);
    const before = data.slice();
    floodFillPixels(data, splits, W, H, 0, 0, fillColor);
    expect(data).toEqual(before);
  });
});
