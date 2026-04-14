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
