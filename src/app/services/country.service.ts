import { Injectable } from '@angular/core';

export interface BandHint {
  kind: 'bands';
  direction: 'horizontal' | 'vertical';
  ratios: number[];
}

export interface CrossHint {
  kind: 'cross';
  variant: 'simple' | 'double';
  widthRatios: number[];
  heightRatios: number[];
}

/**
 * Draws a centered plus-sign outline on the base canvas rather than a full-canvas
 * guide line. Use for flags whose cross does not extend to the flag edges (e.g.
 * Switzerland). Needs exactly 5 ratio segments so that `toPositions` yields 4
 * pixel positions: [outer-left, inner-left, inner-right, outer-right].
 */
export interface CrossOutlineHint {
  kind: 'crossOutline';
  widthRatios: number[];  // 5 parts: [margin, arm-depth, bar, arm-depth, margin]
  heightRatios: number[];
}

/**
 * Pre-draws a flag element (from FLAG_ELEMENTS) onto the base canvas.
 * Used for easy/medium mode to show complex symbols like the Albanian eagle.
 * Position and size are expressed as fractions of the canvas dimensions.
 */
export interface ElementHint {
  kind: 'element';
  /** ID matching a FlagElement in FLAG_ELEMENTS */
  elementId: string;
  /** Fill color (hex) */
  color: string;
  /** Horizontal center as a fraction of canvas width (0–1) */
  xCenter: number;
  /** Vertical center as a fraction of canvas height (0–1) */
  yCenter: number;
  /** Element size as a fraction of canvas height */
  sizeFraction: number;
}

export type DrawingHint = BandHint | CrossHint | CrossOutlineHint | ElementHint;

export interface Country {
  name: string;
  code: string;
  ratio: string;    // height:width, e.g. "2:3"
  svgFile: string;  // filename in /flags/, e.g. "ireland.svg"
  hints: DrawingHint[];
  colors: string[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';

// All flags drawable with rectangular bands and/or a Nordic/centered cross.
const ALL_COUNTRIES: Country[] = [
  // ── Vertical tricolors ───────────────────────────────────────────────────────
  { name: 'France',      code: 'fr', ratio: '2:3',   svgFile: 'france.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#002654', '#ffffff', '#CE1126'] },

  { name: 'Ireland',     code: 'ie', ratio: '1:2',   svgFile: 'ireland.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#169b62', '#ffffff', '#ff883e'] },

  { name: 'Belgium',     code: 'be', ratio: '13:15', svgFile: 'belgium.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#000000', '#FDDA25', '#EF3340'] },

  { name: 'Romania',     code: 'ro', ratio: '2:3',   svgFile: 'romania.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#002B7F', '#FCD116', '#CE1126'] },

  { name: 'Guinea',      code: 'gn', ratio: '2:3',   svgFile: 'guinea.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#CE1126', '#FCD116', '#009460'] },

  { name: 'Mali',        code: 'ml', ratio: '2:3',   svgFile: 'mali.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#14B53A', '#FCD116', '#CE1126'] },

  { name: 'Chad',        code: 'td', ratio: '2:3',   svgFile: 'chad.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#002664', '#FECB00', '#C60C30'] },

  { name: 'Nigeria',     code: 'ng', ratio: '1:2',   svgFile: 'nigeria.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#008751', '#ffffff'] },

  { name: 'Peru',        code: 'pe', ratio: '2:3',   svgFile: 'peru.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#D91023', '#ffffff'] },

  { name: 'Andorra',     code: 'ad', ratio: '7:10',  svgFile: 'andorra.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#0018A8', '#FEDF00', '#D0103A'] },

  { name: 'Guatemala',   code: 'gt', ratio: '5:8',   svgFile: 'guatemala.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#4997D0', '#ffffff'] },

  // ── Horizontal tricolors ─────────────────────────────────────────────────────
  { name: 'Netherlands', code: 'nl', ratio: '2:3',   svgFile: 'netherlands.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#AE1C28', '#ffffff', '#21468B'] },

  { name: 'Austria',     code: 'at', ratio: '2:3',   svgFile: 'austria.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#C8102E', '#ffffff'] },

  { name: 'Russia',      code: 'ru', ratio: '2:3',   svgFile: 'russia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#ffffff', '#0039A6', '#D52B1E'] },

  { name: 'Armenia',     code: 'am', ratio: '1:2',   svgFile: 'armenia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#D90012', '#0033A0', '#F2A800'] },

  { name: 'Bulgaria',    code: 'bg', ratio: '3:5',   svgFile: 'bulgaria.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#ffffff', '#00966E', '#D62612'] },

  { name: 'Luxembourg',  code: 'lu', ratio: '3:5',   svgFile: 'luxembourg.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#EF3340', '#ffffff', '#00A3E0'] },

  { name: 'Sierra Leone', code: 'sl', ratio: '2:3',  svgFile: 'sierra_leone.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#1EB53A', '#ffffff', '#0072C6'] },

  { name: 'Yemen',       code: 'ye', ratio: '2:3',   svgFile: 'yemen.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#CE1126', '#ffffff', '#000000'] },

  { name: 'Serbia',      code: 'rs', ratio: '2:3',   svgFile: 'serbia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#C6363C', '#0C4076', '#ffffff'] },

  { name: 'Gabon',       code: 'ga', ratio: '3:4',   svgFile: 'gabon.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#009E60', '#FCD116', '#3A75C4'] },

  // ── Element-based flags ───────────────────────────────────────────────────────
  // Albania: solid red background with a centered black double-headed eagle.
  // Easy/medium: eagle pre-drawn via element hint. Hard: eagle in elements panel.
  { name: 'Albania',     code: 'al', ratio: '5:7',   svgFile: 'albania.svg',
    hints: [{ kind: 'element', elementId: 'albania-eagle', color: '#000000', xCenter: 0.5, yCenter: 0.55, sizeFraction: 0.78 }],
    colors: ['#FF0000', '#000000'] },

  // Canada: vertical 1:2:1 bands with a centered red maple leaf.
  // Easy/medium: band guides + leaf pre-drawn. Hard: bands + leaf in elements panel.
  { name: 'Canada',      code: 'ca', ratio: '1:2',   svgFile: 'canada.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 2, 1] },
      { kind: 'element', elementId: 'canada-maple-leaf', color: '#d52b1e', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.88 },
    ],
    colors: ['#d52b1e', '#ffffff'] },

  // Slovenia: horizontal tricolor with coat of arms in upper-left quadrant.
  // Easy/medium: band guides + coat of arms pre-drawn.
  { name: 'Slovenia',    code: 'si', ratio: '1:2',   svgFile: 'slovenia.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'slovenia-coat-of-arms', color: '#0000ff', xCenter: 0.25, yCenter: 0.346, sizeFraction: 0.35 },
    ],
    colors: ['#ffffff', '#0000ff', '#ff0000'] },

  // Slovakia: horizontal tricolor with coat of arms slightly left of center.
  // Easy/medium: band guides + coat of arms pre-drawn.
  { name: 'Slovakia',    code: 'sk', ratio: '2:3',   svgFile: 'slovakia.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'slovakia-coat-of-arms', color: '#ed1c24', xCenter: 0.3, yCenter: 0.5, sizeFraction: 0.52 },
    ],
    colors: ['#ffffff', '#254aa5', '#ed1c24'] },

  // ── Bicolors ─────────────────────────────────────────────────────────────────
  { name: 'Monaco',      code: 'mc', ratio: '4:5',   svgFile: 'monaco.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1] }],
    colors: ['#CE1126', '#ffffff'] },

  { name: 'Haiti',       code: 'ht', ratio: '3:5',   svgFile: 'haiti.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1] }],
    colors: ['#00209F', '#D21034'] },

  // ── Non-equal or complex band ratios ─────────────────────────────────────────
  { name: 'Estonia',     code: 'ee', ratio: '7:11',  svgFile: 'estonia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#0072CE', '#000000', '#ffffff'] },

  { name: 'Latvia',      code: 'lv', ratio: '1:2',   svgFile: 'latvia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [2, 1, 2] }],
    colors: ['#9D2235', '#ffffff'] },

  { name: 'Spain',       code: 'es', ratio: '2:3',   svgFile: 'spain.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 2, 1] }],
    colors: ['#C60B1E', '#FFC400'] },

  { name: 'Argentina',   code: 'ar', ratio: '5:8',   svgFile: 'argentina.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#74ACDF', '#ffffff'] },

  { name: 'Costa Rica',  code: 'cr', ratio: '3:5',   svgFile: 'costa_rica.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 2, 1, 1] }],
    colors: ['#001489', '#ffffff', '#DA291C'] },

  { name: 'Botswana',    code: 'bw', ratio: '2:3',   svgFile: 'botswana.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [9, 1, 4, 1, 9] }],
    colors: ['#6DA9D2', '#ffffff', '#000000'] },

  { name: 'The Gambia',  code: 'gm', ratio: '2:3',   svgFile: 'the_gambia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [6, 1, 4, 1, 6] }],
    colors: ['#CE1126', '#ffffff', '#0C1C8C', '#3A7728'] },

  // ── Multi-axis layouts ────────────────────────────────────────────────────────
  { name: 'Benin',       code: 'bj', ratio: '2:3',   svgFile: 'benin.svg',
    hints: [
      { kind: 'bands', direction: 'vertical',   ratios: [2, 3] },
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
    ],
    colors: ['#008751', '#fcd116', '#e8112d'] },

  { name: 'United Arab Emirates', code: 'ae', ratio: '1:2', svgFile: 'united_arab_emirates.svg',
    hints: [
      { kind: 'bands', direction: 'vertical',   ratios: [1, 3] },
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
    ],
    colors: ['#c8102e', '#00843d', '#ffffff', '#000000'] },

  { name: 'Madagascar',  code: 'mg', ratio: '2:3',   svgFile: 'madagascar.svg',
    hints: [
      { kind: 'bands', direction: 'vertical',   ratios: [1, 2] },
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
    ],
    colors: ['#ffffff', '#f9423a', '#00843D'] },

  // ── Simple Nordic cross ───────────────────────────────────────────────────────
  { name: 'Denmark',     code: 'dk', ratio: '28:37', svgFile: 'denmark.svg',
    hints: [{ kind: 'cross', variant: 'simple', widthRatios: [12, 4, 21], heightRatios: [12, 4, 12] }],
    colors: ['#C8102E', '#ffffff'] },

  { name: 'Sweden',      code: 'se', ratio: '5:8',   svgFile: 'sweden.svg',
    hints: [{ kind: 'cross', variant: 'simple', widthRatios: [5, 2, 9], heightRatios: [4, 2, 4] }],
    colors: ['#005293', '#FECB00'] },

  { name: 'Finland',     code: 'fi', ratio: '11:18', svgFile: 'finland.svg',
    hints: [{ kind: 'cross', variant: 'simple', widthRatios: [5, 3, 10], heightRatios: [4, 3, 4] }],
    colors: ['#002F6C', '#ffffff'] },

  // Swiss cross: centered, NOT touching flag edges.
  // widthRatios [6,7,6,7,6] (sum 32) → outer edge at 6/32, arm at 13/32, 19/32, outer at 26/32.
  // Draws a plus-sign outline on baseCanvas; background fills red with one click.
  { name: 'Switzerland', code: 'ch', ratio: '1:1',   svgFile: 'switzerland.svg',
    hints: [{ kind: 'crossOutline', widthRatios: [6, 7, 6, 7, 6], heightRatios: [6, 7, 6, 7, 6] }],
    colors: ['#DA291C', '#ffffff'] },

  // ── Double Nordic cross ───────────────────────────────────────────────────────
  { name: 'Norway',      code: 'no', ratio: '8:11',  svgFile: 'norway.svg',
    hints: [{ kind: 'cross', variant: 'double', widthRatios: [6, 1, 2, 1, 12], heightRatios: [6, 1, 2, 1, 6] }],
    colors: ['#BA0C2F', '#ffffff', '#00205B'] },

  { name: 'Iceland',     code: 'is', ratio: '18:25', svgFile: 'iceland.svg',
    hints: [{ kind: 'cross', variant: 'double', widthRatios: [7, 1, 2, 1, 14], heightRatios: [7, 1, 2, 1, 7] }],
    colors: ['#02529C', '#ffffff', '#DC1E35'] },

  // ── Mixed bands + cross ───────────────────────────────────────────────────────
  // Greece: 9 equal horizontal bands guide the stripes. The canton cross must be
  // added manually (Elements panel) — cross guide lines would span the full canvas
  // and break the band structure.
  { name: 'Greece',      code: 'gr', ratio: '2:3',   svgFile: 'greece.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
    ],
    colors: ['#0D5EAF', '#ffffff'] },
];

@Injectable({ providedIn: 'root' })
export class CountryService {
  getCountries(): Country[] {
    return [...ALL_COUNTRIES];
  }

  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
