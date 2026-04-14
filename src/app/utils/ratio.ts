/** Country flag ratio strings use Wikipedia's "height:width" convention
 *  (e.g. "2:3" means height=2, width=3). */
export interface Ratio { h: number; w: number; }

export function parseRatio(ratio: string): Ratio {
  const [h, w] = ratio.split(':').map(Number);
  return { h, w };
}

/** Converts an "h:w" ratio string to a CSS `aspect-ratio` value ("w/h"). */
export function ratioToCssAspect(ratio: string): string {
  const { h, w } = parseRatio(ratio);
  return `${w}/${h}`;
}

/** Converts a ratio array into N-1 cumulative pixel positions (rounded).
 *  Used for placing band guide lines and cross arms within a fixed total. */
export function ratioToPositions(ratios: number[], total: number): number[] {
  const sum = ratios.reduce((a, b) => a + b, 0);
  const positions: number[] = [];
  let acc = 0;
  for (let i = 0; i < ratios.length - 1; i++) {
    acc += ratios[i];
    positions.push(Math.round(acc / sum * total));
  }
  return positions;
}
