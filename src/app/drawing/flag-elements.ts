export type ElementCategory = 'maps' | 'coat_of_arms' | 'animals' | 'plants' | 'symbols';

export interface FlagElement {
  id: string;
  name: string;
  /** Country or flag this element comes from */
  flagOf: string;
  category: ElementCategory;
  /** Suggested hex color as used on the real flag */
  defaultColor: string;
  /** SVG shape elements for viewBox="0 0 100 100". Uses currentColor for fill/stroke. */
  svgContent: string;
}

export const FLAG_ELEMENTS: FlagElement[] = [
  // Elements will be added here
];
