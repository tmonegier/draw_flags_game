/** Pure pixel-buffer utilities used by the drawing canvas. None of these touch
 *  the DOM — they operate on raw `Uint8ClampedArray` buffers (canvas
 *  `ImageData.data`) so they can be unit-tested without canvas mocks. */

export type Rgba = [number, number, number, number];

export function hexToRgba(hex: string): Rgba {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff, 255];
}

export function getPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number): Rgba {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

export function setPixelColor(
  data: Uint8ClampedArray, x: number, y: number, width: number, color: Rgba,
): void {
  const i = (y * width + x) * 4;
  data[i] = color[0]; data[i + 1] = color[1]; data[i + 2] = color[2]; data[i + 3] = color[3];
}

export function colorMatch(a: Rgba, b: Rgba, tol = 20): boolean {
  return Math.abs(a[0] - b[0]) <= tol
      && Math.abs(a[1] - b[1]) <= tol
      && Math.abs(a[2] - b[2]) <= tol;
}

/** Iterative 4-neighbour flood fill on a pixel buffer. `splitsData` defines
 *  boundary pixels (any pixel with alpha > 0 blocks propagation but is itself
 *  painted with the fill colour). Mutates `data` in place.
 *
 *  Tolerance asymmetry: the no-op guard below uses *exact* RGB equality so
 *  re-clicking the same colour is a true no-op even when adjacent regions
 *  blend within the propagation tolerance. Within the fill loop we still use
 *  `colorMatch` (default 20/255 per channel) to bridge anti-aliased seams
 *  inside one logical region. The scoring service applies a wider tolerance
 *  (PIXEL_TOLERANCE = 60/255) — that's intentional: drawings score against the
 *  reference flag perceptually, but flood-fill needs tight region boundaries. */
export function floodFillPixels(
  data: Uint8ClampedArray,
  splitsData: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  fillColor: Rgba,
): void {
  // Don't fill if the click landed on a split line
  if (splitsData[(startY * width + startX) * 4 + 3] > 0) return;

  const targetColor = getPixelColor(data, startX, startY, width);
  if (
    targetColor[0] === fillColor[0] &&
    targetColor[1] === fillColor[1] &&
    targetColor[2] === fillColor[2]
  ) return;

  const stack: Array<[number, number]> = [[startX, startY]];
  const visited = new Uint8Array(width * height);
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;
    if (splitsData[idx * 4 + 3] > 0) {
      setPixelColor(data, x, y, width, fillColor);
      continue;
    }
    const c = getPixelColor(data, x, y, width);
    if (!colorMatch(c, targetColor)) continue;
    setPixelColor(data, x, y, width, fillColor);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}
