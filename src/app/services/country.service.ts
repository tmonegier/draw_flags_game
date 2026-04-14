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
 * Used for easy mode to show complex symbols like the Albanian eagle.
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
  /** Guided-mode hints. Empty for free-mode-only entries. */
  hints: DrawingHint[];
  colors: string[];
}

export type Difficulty = 'easy' | 'hard' | 'free';

// All flags drawable with rectangular bands and/or a Nordic/centered cross.
const ALL_COUNTRIES: Country[] = [
  // ── Vertical tricolors ───────────────────────────────────────────────────────
  { name: 'France',      code: 'fr', ratio: '2:3',   svgFile: 'france.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#CE1126', '#FFFFFF', '#002654'] },

  { name: 'Ireland',     code: 'ie', ratio: '1:2',   svgFile: 'ireland.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#FF883E', '#169B62', '#FFFFFF'] },

  { name: 'Belgium',     code: 'be', ratio: '13:15', svgFile: 'belgium.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#EF3340', '#FDDA25', '#000000'] },

  { name: 'Romania',     code: 'ro', ratio: '2:3',   svgFile: 'romania.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#FCD116', '#CE1126', '#002B7F'] },

  { name: 'Guinea',      code: 'gn', ratio: '2:3',   svgFile: 'guinea.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#009460', '#CE1126', '#FCD116'] },

  { name: 'Mali',        code: 'ml', ratio: '2:3',   svgFile: 'mali.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#14B53A', '#CE1126', '#FCD116'] },

  { name: 'Chad',        code: 'td', ratio: '2:3',   svgFile: 'chad.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#C60C30', '#FECB00', '#002664'] },

  { name: 'Nigeria',     code: 'ng', ratio: '1:2',   svgFile: 'nigeria.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#FFFFFF', '#008751'] },

  { name: 'Peru',        code: 'pe', ratio: '2:3',   svgFile: 'peru.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#FFFFFF', '#D91023'] },

  { name: 'Andorra',     code: 'ad', ratio: '7:10',  svgFile: 'andorra.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#D0103A', '#0018A8', '#FEDF00'] },

  { name: 'Guatemala',   code: 'gt', ratio: '5:8',   svgFile: 'guatemala.svg',
    hints: [{ kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] }],
    colors: ['#FFFFFF', '#4997D0'] },

  // ── Horizontal tricolors ─────────────────────────────────────────────────────
  { name: 'Netherlands', code: 'nl', ratio: '2:3',   svgFile: 'netherlands.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#21468B', '#AE1C28', '#FFFFFF'] },

  { name: 'Austria',     code: 'at', ratio: '2:3',   svgFile: 'austria.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#FFFFFF', '#C8102E'] },

  { name: 'Russia',      code: 'ru', ratio: '2:3',   svgFile: 'russia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#0039A6', '#D52B1E', '#FFFFFF'] },

  { name: 'Armenia',     code: 'am', ratio: '1:2',   svgFile: 'armenia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#D90012', '#F2A800', '#0033A0'] },

  { name: 'Bulgaria',    code: 'bg', ratio: '3:5',   svgFile: 'bulgaria.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#00966E', '#FFFFFF', '#D62612'] },

  { name: 'Luxembourg',  code: 'lu', ratio: '3:5',   svgFile: 'luxembourg.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#EF3340', '#FFFFFF', '#00A3E0'] },

  { name: 'Sierra Leone', code: 'sl', ratio: '2:3',  svgFile: 'sierra_leone.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#FFFFFF', '#1EB53A', '#0072C6'] },

  { name: 'Yemen',       code: 'ye', ratio: '2:3',   svgFile: 'yemen.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#CE1126', '#000000', '#FFFFFF'] },

  { name: 'Serbia',      code: 'rs', ratio: '2:3',   svgFile: 'serbia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#FFFFFF', '#0C4076', '#C6363C'] },

  { name: 'Gabon',       code: 'ga', ratio: '3:4',   svgFile: 'gabon.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#009E60', '#FCD116', '#3A75C4'] },

  // ── Element-based flags ───────────────────────────────────────────────────────
  // Albania: solid red background with a centered black double-headed eagle.
  // Easy: eagle pre-drawn via element hint. Hard: eagle in elements panel.
  { name: 'Albania',     code: 'al', ratio: '5:7',   svgFile: 'albania.svg',
    hints: [{ kind: 'element', elementId: 'albania-eagle', color: '#000000', xCenter: 0.5, yCenter: 0.55, sizeFraction: 0.78 }],
    colors: ['#FF0000', '#000000'] },

  // Canada: vertical 1:2:1 bands with a centered red maple leaf.
  // Easy: band guides + leaf pre-drawn. Hard: bands + leaf in elements panel.
  { name: 'Canada',      code: 'ca', ratio: '1:2',   svgFile: 'canada.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 2, 1] },
      { kind: 'element', elementId: 'canada-maple-leaf', color: '#d52b1e', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.924 },
    ],
    colors: ['#D52B1E', '#FFFFFF'] },

  // Slovenia: horizontal tricolor with coat of arms in upper-left quadrant.
  // Easy: band guides + coat of arms pre-drawn.
  { name: 'Slovenia',    code: 'si', ratio: '1:2',   svgFile: 'slovenia.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'slovenia-coat-of-arms', color: '#0000ff', xCenter: 0.25, yCenter: 0.338, sizeFraction: 0.350 },
    ],
    colors: ['#0000FF', '#FFFFFF', '#FF0000'] },

  // Slovakia: horizontal tricolor with coat of arms slightly left of center.
  // Easy: band guides + coat of arms pre-drawn.
  { name: 'Slovakia',    code: 'sk', ratio: '2:3',   svgFile: 'slovakia.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'slovakia-coat-of-arms', color: '#ed1c24', xCenter: 0.3, yCenter: 0.5, sizeFraction: 0.532 },
    ],
    colors: ['#ED1C24', '#254AA5', '#FFFFFF'] },

  // Morocco: solid red background with a centered green pentagram outline.
  // Easy: star pre-drawn via element hint.
  { name: 'Morocco',     code: 'ma', ratio: '2:3',   svgFile: 'morocco.svg',
    hints: [
      { kind: 'element', elementId: 'morocco-star', color: '#006233', xCenter: 0.5, yCenter: 0.4798, sizeFraction: 0.4474 },
    ],
    colors: ['#006233', '#C1272D'] },

  // Algeria: vertical green-white bicolor with a red crescent and star.
  // Easy: band guide + crescent-star pre-drawn.
  { name: 'Algeria',     code: 'dz', ratio: '2:3',   svgFile: 'algeria.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 1] },
      { kind: 'element', elementId: 'algeria-crescent-star', color: '#d21034', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.525 },
    ],
    colors: ['#006633', '#FFFFFF', '#D21034'] },

  // Tunisia: solid red background with a centered white-disk crescent-star emblem.
  // Easy: emblem pre-drawn via element hint.
  { name: 'Tunisia',     code: 'tn', ratio: '2:3',   svgFile: 'tunisia.svg',
    hints: [
      { kind: 'element', elementId: 'tunisia-crescent-star', color: '#e70013', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.625 },
    ],
    colors: ['#E70013', '#FFFFFF'] },

  // Turkey: solid red background with a white crescent and star.
  // Easy: crescent-star pre-drawn via element hint.
  { name: 'Turkey',      code: 'tr', ratio: '2:3',   svgFile: 'turkey.svg',
    hints: [
      { kind: 'element', elementId: 'turkey-crescent-star', color: '#ffffff', xCenter: 0.39, yCenter: 0.5, sizeFraction: 0.71 },
    ],
    colors: ['#E30A17', '#FFFFFF'] },

  // Vietnam: solid red background with centered yellow star.
  { name: 'Vietnam',     code: 'vn', ratio: '2:3',   svgFile: 'vietnam.svg',
    hints: [
      { kind: 'element', elementId: 'vietnam-star', color: '#ffff00', xCenter: 0.5, yCenter: 0.471, sizeFraction: 0.6 },
    ],
    colors: ['#DA251D', '#FFFF00'] },

  // China: solid red background with a large yellow star (upper-left) + 4 small stars.
  { name: 'China',       code: 'cn', ratio: '2:3',   svgFile: 'china.svg',
    hints: [
      { kind: 'element', elementId: 'china-star', color: '#ffff00', xCenter: 0.25, yCenter: 0.275, sizeFraction: 0.5833 },
    ],
    colors: ['#FFFF00', '#EE1C25'] },

  // Mongolia: vertical red-blue-red tricolor with the gold Soyombo in the left band.
  { name: 'Mongolia',    code: 'mn', ratio: '1:2',   svgFile: 'mongolia.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'mongolia-soyombo', color: '#ffd300', xCenter: 0.167, yCenter: 0.475, sizeFraction: 0.75 },
    ],
    colors: ['#DA2031', '#FFD300', '#0066B2'] },

  // Nepal: non-rectangular double-pennant flag (treated as 4:3 canvas).
  // Upper pennant has white moon symbol; lower pennant has white sun.
  { name: 'Nepal',       code: 'np', ratio: '4:3',   svgFile: 'nepal.svg',
    hints: [
      { kind: 'element', elementId: 'nepal-moon', color: '#ffffff', xCenter: 0.246, yCenter: 0.386, sizeFraction: 0.344 },
      { kind: 'element', elementId: 'nepal-sun',  color: '#ffffff', xCenter: 0.246, yCenter: 0.727, sizeFraction: 0.344 },
    ],
    colors: ['#003893', '#FFFFFF', '#DC143C'] },

  // Liechtenstein: horizontal blue-red bicolor with a gold crown in the upper-left.
  { name: 'Liechtenstein', code: 'li', ratio: '3:5', svgFile: 'liechtenstein.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
      { kind: 'element', elementId: 'liechtenstein-crown', color: '#ffd83d', xCenter: 0.222, yCenter: 0.237, sizeFraction: 0.337 },
    ],
    colors: ['#002B7F', '#FFD83D', '#CE1126'] },

  // Bhutan: diagonal yellow/orange split with a white dragon.
  { name: 'Bhutan',      code: 'bt', ratio: '2:3',   svgFile: 'bhutan.svg',
    hints: [
      { kind: 'element', elementId: 'bhutan-dragon', color: '#ffffff', xCenter: 0.55, yCenter: 0.554, sizeFraction: 0.743 },
    ],
    colors: ['#FFCD00', '#FF671F', '#FFFFFF'] },

  // Vatican: vertical yellow-white bicolor with simplified coat of arms in the white half.
  { name: 'Vatican',     code: 'va', ratio: '1:1',   svgFile: 'vatican_city.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 1] },
      { kind: 'element', elementId: 'vatican-coat-of-arms', color: '#ffe000', xCenter: 0.75, yCenter: 0.5, sizeFraction: 0.55 },
    ],
    colors: ['#FFE000', '#FFFFFF'] },

  // ── Bicolors ─────────────────────────────────────────────────────────────────
  { name: 'Monaco',      code: 'mc', ratio: '4:5',   svgFile: 'monaco.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1] }],
    colors: ['#FFFFFF', '#CE1126'] },

  { name: 'Haiti',       code: 'ht', ratio: '3:5',   svgFile: 'haiti.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1] }],
    colors: ['#00209F', '#D21034'] },

  // ── Non-equal or complex band ratios ─────────────────────────────────────────
  { name: 'Estonia',     code: 'ee', ratio: '7:11',  svgFile: 'estonia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#000000', '#FFFFFF', '#0072CE'] },

  { name: 'Latvia',      code: 'lv', ratio: '1:2',   svgFile: 'latvia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [2, 1, 2] }],
    colors: ['#FFFFFF', '#9D2235'] },

  { name: 'Spain',       code: 'es', ratio: '2:3',   svgFile: 'spain.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 2, 1] }],
    colors: ['#FFC400', '#C60B1E'] },

  { name: 'Argentina',   code: 'ar', ratio: '5:8',   svgFile: 'argentina.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] }],
    colors: ['#74ACDF', '#FFFFFF'] },

  { name: 'Costa Rica',  code: 'cr', ratio: '3:5',   svgFile: 'costa_rica.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [1, 1, 2, 1, 1] }],
    colors: ['#FFFFFF', '#DA291C', '#001489'] },

  { name: 'Botswana',    code: 'bw', ratio: '2:3',   svgFile: 'botswana.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [9, 1, 4, 1, 9] }],
    colors: ['#6DA9D2', '#FFFFFF', '#000000'] },

  { name: 'The Gambia',  code: 'gm', ratio: '2:3',   svgFile: 'the_gambia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [6, 1, 4, 1, 6] }],
    colors: ['#3A7728', '#FFFFFF', '#0C1C8C', '#CE1126'] },

  // ── Multi-axis layouts ────────────────────────────────────────────────────────
  { name: 'Benin',       code: 'bj', ratio: '2:3',   svgFile: 'benin.svg',
    hints: [
      { kind: 'bands', direction: 'vertical',   ratios: [2, 3] },
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
    ],
    colors: ['#008751', '#FCD116', '#E8112D'] },

  { name: 'United Arab Emirates', code: 'ae', ratio: '1:2', svgFile: 'united_arab_emirates.svg',
    hints: [
      { kind: 'bands', direction: 'vertical',   ratios: [1, 3] },
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
    ],
    colors: ['#FFFFFF', '#000000', '#00843D', '#C8102E'] },

  { name: 'Madagascar',  code: 'mg', ratio: '2:3',   svgFile: 'madagascar.svg',
    hints: [
      { kind: 'bands', direction: 'vertical',   ratios: [1, 2] },
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
    ],
    colors: ['#F9423A', '#00843D', '#FFFFFF'] },

  // ── Simple Nordic cross ───────────────────────────────────────────────────────
  { name: 'Denmark',     code: 'dk', ratio: '28:37', svgFile: 'denmark.svg',
    hints: [{ kind: 'cross', variant: 'simple', widthRatios: [12, 4, 21], heightRatios: [12, 4, 12] }],
    colors: ['#C8102E', '#FFFFFF'] },

  { name: 'Sweden',      code: 'se', ratio: '5:8',   svgFile: 'sweden.svg',
    hints: [{ kind: 'cross', variant: 'simple', widthRatios: [5, 2, 9], heightRatios: [4, 2, 4] }],
    colors: ['#FECB00', '#005293'] },

  { name: 'Finland',     code: 'fi', ratio: '11:18', svgFile: 'finland.svg',
    hints: [{ kind: 'cross', variant: 'simple', widthRatios: [5, 3, 10], heightRatios: [4, 3, 4] }],
    colors: ['#002F6C', '#FFFFFF'] },

  // Swiss cross: centered, NOT touching flag edges.
  // widthRatios [6,7,6,7,6] (sum 32) → outer edge at 6/32, arm at 13/32, 19/32, outer at 26/32.
  // Draws a plus-sign outline on baseCanvas; background fills red with one click.
  { name: 'Switzerland', code: 'ch', ratio: '1:1',   svgFile: 'switzerland.svg',
    hints: [{ kind: 'crossOutline', widthRatios: [6, 7, 6, 7, 6], heightRatios: [6, 7, 6, 7, 6] }],
    colors: ['#FFFFFF', '#DA291C'] },

  // ── Double Nordic cross ───────────────────────────────────────────────────────
  { name: 'Norway',      code: 'no', ratio: '8:11',  svgFile: 'norway.svg',
    hints: [{ kind: 'cross', variant: 'double', widthRatios: [6, 1, 2, 1, 12], heightRatios: [6, 1, 2, 1, 6] }],
    colors: ['#00205B', '#FFFFFF', '#BA0C2F'] },

  { name: 'Iceland',     code: 'is', ratio: '18:25', svgFile: 'iceland.svg',
    hints: [{ kind: 'cross', variant: 'double', widthRatios: [7, 1, 2, 1, 14], heightRatios: [7, 1, 2, 1, 7] }],
    colors: ['#02529C', '#DC1E35', '#FFFFFF'] },

  // ── Mixed bands + cross ───────────────────────────────────────────────────────
  // Greece: 9 equal horizontal bands guide the stripes. The canton cross must be
  // added manually (Elements panel) — cross guide lines would span the full canvas
  // and break the band structure.
  { name: 'Greece',      code: 'gr', ratio: '2:3',   svgFile: 'greece.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
    ],
    colors: ['#FFFFFF', '#0D5EAF'] },

  // ── New additions ─────────────────────────────────────────────────────────────
  // Angola: red over black with centered yellow emblem (half-gear, machete, star).
  { name: 'Angola',      code: 'ao', ratio: '2:3',   svgFile: 'angola.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
      { kind: 'element', elementId: 'angola-emblem', color: '#ffcb00', xCenter: 0.5176, yCenter: 0.5069, sizeFraction: 0.653 },
    ],
    colors: ['#000000', '#CC092F', '#FFCB00'] },

  // Singapore: red over white with white crescent + 5-star pentagon in upper-left.
  { name: 'Singapore',   code: 'sg', ratio: '2:3',   svgFile: 'singapore.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
      { kind: 'element', elementId: 'singapore-crescent-stars', color: '#ffffff', xCenter: 0.2335, yCenter: 0.2653, sizeFraction: 0.4350 },
    ],
    colors: ['#ED2939', '#FFFFFF'] },

  // Honduras: blue-white-blue horizontal tricolor with 5 blue stars in a quincunx.
  { name: 'Honduras',    code: 'hn', ratio: '1:2',   svgFile: 'honduras.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'honduras-stars', color: '#0d3b99', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.711 },
    ],
    colors: ['#FFFFFF', '#0D3B99'] },

  // Colombia: horizontal bands yellow (50%), blue (25%), red (25%).
  { name: 'Colombia',    code: 'co', ratio: '2:3',   svgFile: 'colombia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [2, 1, 1] }],
    colors: ['#003893', '#CE1126', '#FCD116'] },

  // Venezuela: yellow-blue-red horizontal tricolor with 8 white stars arcing in the blue band.
  { name: 'Venezuela',   code: 've', ratio: '2:3',   svgFile: 'venezuela.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'venezuela-stars', color: '#ffffff', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.66 },
    ],
    colors: ['#FFFFFF', '#FFCC00', '#00247D', '#CF142B'] },

  // Aruba: light blue field with two yellow stripes near the bottom and a red/white 4-point star.
  { name: 'Aruba',       code: 'aw', ratio: '2:3',   svgFile: 'aruba.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [9, 1, 1, 1] },
      { kind: 'element', elementId: 'aruba-star', color: '#CF142B', xCenter: 0.2, yCenter: 0.3, sizeFraction: 0.22 },
    ],
    colors: ['#418FDE', '#FBD116', '#FFFFFF', '#CF142B'] },

  // Panama: quartered white/red/blue/white with a blue star (upper-left) and red star (lower-right).
  { name: 'Panama',      code: 'pa', ratio: '2:3',   svgFile: 'panama.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
      { kind: 'bands', direction: 'vertical',   ratios: [1, 1] },
      { kind: 'element', elementId: 'panama-star', color: '#072357', xCenter: 0.25, yCenter: 0.25, sizeFraction: 0.22 },
      { kind: 'element', elementId: 'panama-star', color: '#D21034', xCenter: 0.75, yCenter: 0.75, sizeFraction: 0.22 },
    ],
    colors: ['#FFFFFF', '#072357', '#DA121A'] },

  // Montenegro: red field with thick gold border and a centered gold double-headed eagle.
  // Border is drawn in the SVG for scoring; not representable as a band hint.
  { name: 'Montenegro',  code: 'me', ratio: '1:2',   svgFile: 'montenegro.svg',
    hints: [
      { kind: 'element', elementId: 'montenegro-eagle', color: '#D5A937', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.7 },
    ],
    colors: ['#D5A937', '#C40308'] },

  // Pakistan: white 1/4 hoist + green 3/4 with white crescent and star in the green band.
  { name: 'Pakistan',    code: 'pk', ratio: '2:3',   svgFile: 'pakistan.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 3] },
      { kind: 'element', elementId: 'pakistan-crescent-star', color: '#ffffff', xCenter: 0.625, yCenter: 0.5, sizeFraction: 0.6 },
    ],
    colors: ['#01411C', '#FFFFFF'] },
];

// Full sovereign-state list (UN members + observers + partially recognized).
// Used only by free-drawing mode — guided modes stay on ALL_COUNTRIES.
// No hints: free mode draws on a blank canvas.
const FREE_MODE_COUNTRIES: Country[] = [
  { name: 'Abkhazia', code: 'ab', ratio: '1:2', svgFile: 'abkhazia.svg', hints: [], colors: ['#FFFFFF', '#C8312A', '#00993E'] },
  { name: 'Afghanistan', code: 'af', ratio: '1:2', svgFile: 'afghanistan.svg', hints: [], colors: ['#000000', '#FFFFFF'] },
  { name: 'Albania', code: 'al', ratio: '5:7', svgFile: 'albania.svg', hints: [], colors: ['#FF0000', '#000000'] },
  { name: 'Algeria', code: 'dz', ratio: '2:3', svgFile: 'algeria.svg', hints: [], colors: ['#006633', '#FFFFFF', '#D21034'] },
  { name: 'Andorra', code: 'ad', ratio: '7:10', svgFile: 'andorra.svg', hints: [], colors: ['#D0103A', '#0018A8', '#FEDF00'] },
  { name: 'Angola', code: 'ao', ratio: '2:3', svgFile: 'angola.svg', hints: [], colors: ['#000000', '#CC092F', '#FFCB00'] },
  { name: 'Antigua and Barbuda', code: 'ag', ratio: '2:3', svgFile: 'antigua_and_barbuda.svg', hints: [], colors: ['#0072C6', '#FFFFFF', '#CE1126', '#000000', '#FCD116'] },
  { name: 'Argentina', code: 'ar', ratio: '5:8', svgFile: 'argentina.svg', hints: [], colors: ['#74ACDF', '#FFFFFF'] },
  { name: 'Armenia', code: 'am', ratio: '1:2', svgFile: 'armenia.svg', hints: [], colors: ['#D90012', '#F2A800', '#0033A0'] },
  { name: 'Artsakh', code: 'xa', ratio: '1:2', svgFile: 'artsakh.svg', hints: [], colors: ['#FFFFFF', '#0033A0', '#D90012', '#F2A800'] },
  { name: 'Australia', code: 'au', ratio: '1:2', svgFile: 'australia.svg', hints: [], colors: ['#FFFFFF', '#012169', '#E4002B'] },
  { name: 'Austria', code: 'at', ratio: '2:3', svgFile: 'austria.svg', hints: [], colors: ['#FFFFFF', '#C8102E'] },
  { name: 'Azerbaijan', code: 'az', ratio: '1:2', svgFile: 'azerbaijan.svg', hints: [], colors: ['#EF3340', '#FFFFFF', '#00B5E2', '#509E2F'] },
  { name: 'Bahamas', code: 'bs', ratio: '1:2', svgFile: 'bahamas.svg', hints: [], colors: ['#000000', '#00778B', '#FFC72C'] },
  { name: 'Bahrain', code: 'bh', ratio: '3:5', svgFile: 'bahrain.svg', hints: [], colors: ['#FFFFFF', '#DA291C'] },
  { name: 'Bangladesh', code: 'bd', ratio: '3:5', svgFile: 'bangladesh.svg', hints: [], colors: ['#006747', '#DA291C'] },
  { name: 'Barbados', code: 'bb', ratio: '2:3', svgFile: 'barbados.svg', hints: [], colors: ['#000000', '#FFC726', '#00267F'] },
  { name: 'Belarus', code: 'by', ratio: '1:2', svgFile: 'belarus.svg', hints: [], colors: ['#007C30', '#FFFFFF', '#CE1720'] },
  { name: 'Belgium', code: 'be', ratio: '13:15', svgFile: 'belgium.svg', hints: [], colors: ['#EF3340', '#FDDA25', '#000000'] },
  { name: 'Belize', code: 'bz', ratio: '3:5', svgFile: 'belize.svg', hints: [], colors: ['#006600', '#FFFFFF', '#D90F19', '#171696'] },
  { name: 'Benin', code: 'bj', ratio: '2:3', svgFile: 'benin.svg', hints: [], colors: ['#008751', '#FCD116', '#E8112D'] },
  { name: 'Bhutan', code: 'bt', ratio: '2:3', svgFile: 'bhutan.svg', hints: [], colors: ['#FFCD00', '#FF671F', '#FFFFFF'] },
  { name: 'Bolivia', code: 'bo', ratio: '15:22', svgFile: 'bolivia.svg', hints: [], colors: ['#D52B1E', '#007934', '#F9E300'] },
  { name: 'Bosnia and Herzegovina', code: 'ba', ratio: '1:2', svgFile: 'bosnia_and_herzegovina.svg', hints: [], colors: ['#FFFFFF', '#002395', '#FECB00'] },
  { name: 'Botswana', code: 'bw', ratio: '2:3', svgFile: 'botswana.svg', hints: [], colors: ['#6DA9D2', '#FFFFFF', '#000000'] },
  { name: 'Brazil', code: 'br', ratio: '7:10', svgFile: 'brazil.svg', hints: [], colors: ['#FFFFFF', '#302681', '#FFCB00', '#009440'] },
  { name: 'Brunei', code: 'bn', ratio: '1:2', svgFile: 'brunei.svg', hints: [], colors: ['#FFFFFF', '#000000', '#F7E017', '#CF1126'] },
  { name: 'Bulgaria', code: 'bg', ratio: '3:5', svgFile: 'bulgaria.svg', hints: [], colors: ['#00966E', '#FFFFFF', '#D62612'] },
  { name: 'Burkina Faso', code: 'bf', ratio: '2:3', svgFile: 'burkina_faso.svg', hints: [], colors: ['#EF2B2D', '#009E49', '#FCD116'] },
  { name: 'Burundi', code: 'bi', ratio: '3:5', svgFile: 'burundi.svg', hints: [], colors: ['#C8102E', '#43B02A', '#FFFFFF'] },
  { name: 'Cambodia', code: 'kh', ratio: '16:25', svgFile: 'cambodia.svg', hints: [], colors: ['#FFFFFF', '#032EA1', '#E00025'] },
  { name: 'Cameroon', code: 'cm', ratio: '2:3', svgFile: 'cameroon.svg', hints: [], colors: ['#FCD116', '#007A5E', '#CE1126'] },
  { name: 'Canada', code: 'ca', ratio: '1:2', svgFile: 'canada.svg', hints: [], colors: ['#D52B1E', '#FFFFFF'] },
  { name: 'Cape Verde', code: 'cv', ratio: '10:17', svgFile: 'cape_verde.svg', hints: [], colors: ['#CF2027', '#FFFFFF', '#003893'] },
  { name: 'Central African Republic', code: 'cf', ratio: '2:3', svgFile: 'central_african_republic.svg', hints: [], colors: ['#D21034', '#FFFFFF', '#289728', '#FFCE00', '#003082'] },
  { name: 'Chad', code: 'td', ratio: '2:3', svgFile: 'chad.svg', hints: [], colors: ['#C60C30', '#FECB00', '#002664'] },
  { name: 'Chile', code: 'cl', ratio: '2:3', svgFile: 'chile.svg', hints: [], colors: ['#FFFFFF', '#DA291C', '#0032A0'] },
  { name: 'China', code: 'cn', ratio: '2:3', svgFile: 'china.svg', hints: [], colors: ['#FFFF00', '#EE1C25'] },
  { name: 'Colombia', code: 'co', ratio: '2:3', svgFile: 'colombia.svg', hints: [], colors: ['#003893', '#CE1126', '#FCD116'] },
  { name: 'Comoros', code: 'km', ratio: '3:5', svgFile: 'comoros.svg', hints: [], colors: ['#FFD100', '#FFFFFF', '#EF3340', '#009639', '#003DA5'] },
  { name: 'Cook Islands', code: 'ck', ratio: '1:2', svgFile: 'cook_islands.svg', hints: [], colors: ['#FFFFFF', '#C8102E', '#012169'] },
  { name: 'Costa Rica', code: 'cr', ratio: '3:5', svgFile: 'costa_rica.svg', hints: [], colors: ['#FFFFFF', '#DA291C', '#001489'] },
  { name: 'Croatia', code: 'hr', ratio: '1:2', svgFile: 'croatia.svg', hints: [], colors: ['#FF0000', '#171796', '#FFFFFF'] },
  { name: 'Cuba', code: 'cu', ratio: '1:2', svgFile: 'cuba.svg', hints: [], colors: ['#002A8F', '#FFFFFF', '#CB1515'] },
  { name: 'Cyprus', code: 'cy', ratio: '2:3', svgFile: 'cyprus.svg', hints: [], colors: ['#FFFFFF', '#4D5B2D', '#D67900'] },
  { name: 'Czech Republic', code: 'cz', ratio: '2:3', svgFile: 'czech_republic.svg', hints: [], colors: ['#11457E', '#D7141A', '#FFFFFF'] },
  { name: 'Democratic Republic of the Congo', code: 'cd', ratio: '3:4', svgFile: 'democratic_republic_of_the_congo.svg', hints: [], colors: ['#CE1021', '#F7D618', '#007FFF'] },
  { name: 'Denmark', code: 'dk', ratio: '28:37', svgFile: 'denmark.svg', hints: [], colors: ['#C8102E', '#FFFFFF'] },
  { name: 'Djibouti', code: 'dj', ratio: '2:3', svgFile: 'djibouti.svg', hints: [], colors: ['#D7141A', '#6AB2E7', '#12AD2B', '#FFFFFF'] },
  { name: 'Dominica', code: 'dm', ratio: '1:2', svgFile: 'dominica.svg', hints: [], colors: ['#FFCD00', '#046A38', '#000000', '#FFFFFF', '#D50032'] },
  { name: 'Dominican Republic', code: 'do', ratio: '2:3', svgFile: 'dominican_republic.svg', hints: [], colors: ['#FFFFFF', '#CE1126', '#002D62'] },
  { name: 'Ecuador', code: 'ec', ratio: '2:3', svgFile: 'ecuador.svg', hints: [], colors: ['#FFDD00', '#ED1C24', '#034EA2'] },
  { name: 'Egypt', code: 'eg', ratio: '2:3', svgFile: 'egypt.svg', hints: [], colors: ['#000000', '#C8102E', '#FFCD00', '#FFFFFF'] },
  { name: 'El Salvador', code: 'sv', ratio: '3:5', svgFile: 'el_salvador.svg', hints: [], colors: ['#FFFFFF', '#0047AB'] },
  { name: 'Equatorial Guinea', code: 'gq', ratio: '2:3', svgFile: 'equatorial_guinea.svg', hints: [], colors: ['#FFFFFF', '#E32118', '#0073CE', '#3E9A00'] },
  { name: 'Eritrea', code: 'er', ratio: '1:2', svgFile: 'eritrea.svg', hints: [], colors: ['#418FDE', '#E4002B', '#FFC72C', '#43B02A'] },
  { name: 'Estonia', code: 'ee', ratio: '7:11', svgFile: 'estonia.svg', hints: [], colors: ['#000000', '#FFFFFF', '#0072CE'] },
  { name: 'Eswatini', code: 'sz', ratio: '2:3', svgFile: 'eswatini.svg', hints: [], colors: ['#FFFFFF', '#000000', '#B10C0C', '#FFD900', '#3E5EB9'] },
  { name: 'Ethiopia', code: 'et', ratio: '1:2', svgFile: 'ethiopia.svg', hints: [], colors: ['#078930', '#FCDD09', '#0F47AF', '#DA121A'] },
  { name: 'Fiji', code: 'fj', ratio: '1:2', svgFile: 'fiji.svg', hints: [], colors: ['#FFFFFF', '#C8102E', '#62B5E5', '#012169'] },
  { name: 'Finland', code: 'fi', ratio: '11:18', svgFile: 'finland.svg', hints: [], colors: ['#002F6C', '#FFFFFF'] },
  { name: 'France', code: 'fr', ratio: '2:3', svgFile: 'france.svg', hints: [], colors: ['#CE1126', '#FFFFFF', '#002654'] },
  { name: 'Gabon', code: 'ga', ratio: '3:4', svgFile: 'gabon.svg', hints: [], colors: ['#009E60', '#FCD116', '#3A75C4'] },
  { name: 'Georgia', code: 'ge', ratio: '2:3', svgFile: 'georgia.svg', hints: [], colors: ['#FFFFFF', '#FF0000'] },
  { name: 'Germany', code: 'de', ratio: '3:5', svgFile: 'germany.svg', hints: [], colors: ['#DD0000', '#FFCE00', '#000000'] },
  { name: 'Ghana', code: 'gh', ratio: '2:3', svgFile: 'ghana.svg', hints: [], colors: ['#FCD116', '#006B3F', '#CE1126', '#000000'] },
  { name: 'Greece', code: 'gr', ratio: '2:3', svgFile: 'greece.svg', hints: [], colors: ['#FFFFFF', '#0D5EAF'] },
  { name: 'Grenada', code: 'gd', ratio: '3:5', svgFile: 'grenada.svg', hints: [], colors: ['#CE1126', '#FCD116', '#007A5E'] },
  { name: 'Guatemala', code: 'gt', ratio: '5:8', svgFile: 'guatemala.svg', hints: [], colors: ['#FFFFFF', '#4997D0'] },
  { name: 'Guinea', code: 'gn', ratio: '2:3', svgFile: 'guinea.svg', hints: [], colors: ['#009460', '#CE1126', '#FCD116'] },
  { name: 'Guinea-Bissau', code: 'gw', ratio: '1:2', svgFile: 'guinea-bissau.svg', hints: [], colors: ['#FCD116', '#CE1126', '#000000', '#009E49'] },
  { name: 'Guyana', code: 'gy', ratio: '3:5', svgFile: 'guyana.svg', hints: [], colors: ['#000000', '#2A936A', '#BE1E2D', '#FFFFFF', '#FFC20E'] },
  { name: 'Haiti', code: 'ht', ratio: '3:5', svgFile: 'haiti.svg', hints: [], colors: ['#00209F', '#D21034'] },
  { name: 'Honduras', code: 'hn', ratio: '1:2', svgFile: 'honduras.svg', hints: [], colors: ['#FFFFFF', '#0D3B99'] },
  { name: 'Hungary', code: 'hu', ratio: '1:2', svgFile: 'hungary.svg', hints: [], colors: ['#CE2939', '#477050', '#FFFFFF'] },
  { name: 'Iceland', code: 'is', ratio: '18:25', svgFile: 'iceland.svg', hints: [], colors: ['#02529C', '#DC1E35', '#FFFFFF'] },
  { name: 'India', code: 'in', ratio: '2:3', svgFile: 'india.svg', hints: [], colors: ['#046A38', '#07038D', '#FF6820', '#FFFFFF'] },
  { name: 'Indonesia', code: 'id', ratio: '2:3', svgFile: 'indonesia.svg', hints: [], colors: ['#FF0000', '#FFFFFF'] },
  { name: 'Iran', code: 'ir', ratio: '4:7', svgFile: 'iran.svg', hints: [], colors: ['#239F40', '#DA0000', '#FFFFFF'] },
  { name: 'Iraq', code: 'iq', ratio: '2:3', svgFile: 'iraq.svg', hints: [], colors: ['#FFFFFF', '#CD1125', '#000000', '#017B3D'] },
  { name: 'Ireland', code: 'ie', ratio: '1:2', svgFile: 'ireland.svg', hints: [], colors: ['#FF883E', '#169B62', '#FFFFFF'] },
  { name: 'Israel', code: 'il', ratio: '8:11', svgFile: 'israel.svg', hints: [], colors: ['#FFFFFF', '#0038B8'] },
  { name: 'Italy', code: 'it', ratio: '2:3', svgFile: 'italy.svg', hints: [], colors: ['#FFFFFF', '#CE2B37', '#009246'] },
  { name: 'Ivory Coast', code: 'ci', ratio: '2:3', svgFile: 'ivory_coast.svg', hints: [], colors: ['#009A44', '#FFFFFF', '#FF8200'] },
  { name: 'Jamaica', code: 'jm', ratio: '1:2', svgFile: 'jamaica.svg', hints: [], colors: ['#000000', '#FFB81C', '#007749'] },
  { name: 'Japan', code: 'jp', ratio: '2:3', svgFile: 'japan.svg', hints: [], colors: ['#BC002D', '#FFFFFF'] },
  { name: 'Jordan', code: 'jo', ratio: '1:2', svgFile: 'jordan.svg', hints: [], colors: ['#CE1126', '#FFFFFF', '#007A3D', '#000000'] },
  { name: 'Kazakhstan', code: 'kz', ratio: '1:2', svgFile: 'kazakhstan.svg', hints: [], colors: ['#FFEC2D', '#00ABC2'] },
  { name: 'Kenya', code: 'ke', ratio: '2:3', svgFile: 'kenya.svg', hints: [], colors: ['#006600', '#FFFFFF', '#000000', '#BB0000'] },
  { name: 'Kiribati', code: 'ki', ratio: '1:2', svgFile: 'kiribati.svg', hints: [], colors: ['#FFFFFF', '#F8D000', '#183070', '#C81010'] },
  { name: 'Kosovo', code: 'xk', ratio: '5:7', svgFile: 'kosovo.svg', hints: [], colors: ['#FFFFFF', '#244AA5', '#D0A650'] },
  { name: 'Kuwait', code: 'kw', ratio: '1:2', svgFile: 'kuwait.svg', hints: [], colors: ['#000000', '#FFFFFF', '#CE1126', '#007A3D'] },
  { name: 'Kyrgyzstan', code: 'kg', ratio: '3:5', svgFile: 'kyrgyzstan.svg', hints: [], colors: ['#FFFF00', '#FF0000'] },
  { name: 'Laos', code: 'la', ratio: '2:3', svgFile: 'laos.svg', hints: [], colors: ['#FFFFFF', '#CE1126', '#002868'] },
  { name: 'Latvia', code: 'lv', ratio: '1:2', svgFile: 'latvia.svg', hints: [], colors: ['#FFFFFF', '#9D2235'] },
  { name: 'Lebanon', code: 'lb', ratio: '2:3', svgFile: 'lebanon.svg', hints: [], colors: ['#008C3E', '#FFFFFF', '#D31624'] },
  { name: 'Lesotho', code: 'ls', ratio: '2:3', svgFile: 'lesotho.svg', hints: [], colors: ['#FFFFFF', '#000000', '#001489', '#009A44'] },
  { name: 'Liberia', code: 'lr', ratio: '10:19', svgFile: 'liberia.svg', hints: [], colors: ['#FFFFFF', '#CC1133', '#003377'] },
  { name: 'Libya', code: 'ly', ratio: '1:2', svgFile: 'libya.svg', hints: [], colors: ['#E70013', '#239E46', '#000000', '#FFFFFF'] },
  { name: 'Liechtenstein', code: 'li', ratio: '3:5', svgFile: 'liechtenstein.svg', hints: [], colors: ['#002B7F', '#FFD83D', '#CE1126'] },
  { name: 'Lithuania', code: 'lt', ratio: '3:5', svgFile: 'lithuania.svg', hints: [], colors: ['#006A44', '#C1272D', '#FDB913'] },
  { name: 'Luxembourg', code: 'lu', ratio: '3:5', svgFile: 'luxembourg.svg', hints: [], colors: ['#EF3340', '#FFFFFF', '#00A3E0'] },
  { name: 'Madagascar', code: 'mg', ratio: '2:3', svgFile: 'madagascar.svg', hints: [], colors: ['#F9423A', '#00843D', '#FFFFFF'] },
  { name: 'Malawi', code: 'mw', ratio: '2:3', svgFile: 'malawi.svg', hints: [], colors: ['#339E35', '#CE1126', '#000000'] },
  { name: 'Malaysia', code: 'my', ratio: '1:2', svgFile: 'malaysia.svg', hints: [], colors: ['#FFFFFF', '#FFCC00', '#000066', '#CC0000'] },
  { name: 'Maldives', code: 'mv', ratio: '2:3', svgFile: 'maldives.svg', hints: [], colors: ['#007E3A', '#FFFFFF', '#D21034'] },
  { name: 'Mali', code: 'ml', ratio: '2:3', svgFile: 'mali.svg', hints: [], colors: ['#14B53A', '#CE1126', '#FCD116'] },
  { name: 'Malta', code: 'mt', ratio: '2:3', svgFile: 'malta.svg', hints: [], colors: ['#FFFFFF', '#000000', '#CF142B'] },
  { name: 'Marshall Islands', code: 'mh', ratio: '10:19', svgFile: 'marshall_islands.svg', hints: [], colors: ['#DD7500', '#FFFFFF', '#003893'] },
  { name: 'Mauritania', code: 'mr', ratio: '2:3', svgFile: 'mauritania.svg', hints: [], colors: ['#FFD700', '#D01C1F', '#00A95C'] },
  { name: 'Mauritius', code: 'mu', ratio: '2:3', svgFile: 'mauritius.svg', hints: [], colors: ['#2D3359', '#F7B718', '#008658', '#D01C1F'] },
  { name: 'Mexico', code: 'mx', ratio: '4:7', svgFile: 'mexico.svg', hints: [], colors: ['#CE1126', '#006847', '#FFFFFF'] },
  { name: 'Micronesia', code: 'fm', ratio: '10:19', svgFile: 'micronesia.svg', hints: [], colors: ['#75B2DD', '#FFFFFF'] },
  { name: 'Moldova', code: 'md', ratio: '1:2', svgFile: 'moldova.svg', hints: [], colors: ['#FFD200', '#0046AE', '#CC092F'] },
  { name: 'Monaco', code: 'mc', ratio: '4:5', svgFile: 'monaco.svg', hints: [], colors: ['#FFFFFF', '#CE1126'] },
  { name: 'Mongolia', code: 'mn', ratio: '1:2', svgFile: 'mongolia.svg', hints: [], colors: ['#DA2031', '#FFD300', '#0066B2'] },
  { name: 'Montenegro', code: 'me', ratio: '1:2', svgFile: 'montenegro.svg', hints: [], colors: ['#D5A937', '#C40308'] },
  { name: 'Morocco', code: 'ma', ratio: '2:3', svgFile: 'morocco.svg', hints: [], colors: ['#006233', '#C1272D'] },
  { name: 'Mozambique', code: 'mz', ratio: '2:3', svgFile: 'mozambique.svg', hints: [], colors: ['#D21034', '#FCE100', '#FFFFFF', '#000000', '#007168'] },
  { name: 'Myanmar', code: 'mm', ratio: '2:3', svgFile: 'myanmar.svg', hints: [], colors: ['#EA2839', '#FECB00', '#FFFFFF', '#34B233'] },
  { name: 'Namibia', code: 'na', ratio: '2:3', svgFile: 'namibia.svg', hints: [], colors: ['#FFCD00', '#009A44', '#C8102E', '#FFFFFF', '#002F6C'] },
  { name: 'Nauru', code: 'nr', ratio: '1:2', svgFile: 'nauru.svg', hints: [], colors: ['#FFC61E', '#002B7F', '#FFFFFF'] },
  { name: 'Nepal', code: 'np', ratio: '89:73', svgFile: 'nepal.svg', hints: [], colors: ['#003893', '#FFFFFF', '#DC143C'] },
  { name: 'Netherlands', code: 'nl', ratio: '2:3', svgFile: 'netherlands.svg', hints: [], colors: ['#21468B', '#AE1C28', '#FFFFFF'] },
  { name: 'New Zealand', code: 'nz', ratio: '1:2', svgFile: 'new_zealand.svg', hints: [], colors: ['#012169', '#C8102E', '#FFFFFF'] },
  { name: 'Nicaragua', code: 'ni', ratio: '3:5', svgFile: 'nicaragua.svg', hints: [], colors: ['#0067C6', '#EDE71F', '#FFFFFF'] },
  { name: 'Niger', code: 'ne', ratio: '6:7', svgFile: 'niger.svg', hints: [], colors: ['#FFFFFF', '#0DB02B', '#E05206'] },
  { name: 'Nigeria', code: 'ng', ratio: '1:2', svgFile: 'nigeria.svg', hints: [], colors: ['#FFFFFF', '#008751'] },
  { name: 'Niue', code: 'nu', ratio: '1:2', svgFile: 'niue.svg', hints: [], colors: ['#C8102E', '#FEDD00', '#012169', '#FFFFFF'] },
  { name: 'North Korea', code: 'kp', ratio: '1:2', svgFile: 'north_korea.svg', hints: [], colors: ['#FFFFFF', '#034DA2', '#EC1D25'] },
  { name: 'North Macedonia', code: 'mk', ratio: '1:2', svgFile: 'north_macedonia.svg', hints: [], colors: ['#D82126', '#F8E92E'] },
  { name: 'Northern Cyprus', code: 'cy_n', ratio: '2:3', svgFile: 'northern_cyprus.svg', hints: [], colors: ['#E30A17', '#FFFFFF'] },
  { name: 'Norway', code: 'no', ratio: '8:11', svgFile: 'norway.svg', hints: [], colors: ['#00205B', '#FFFFFF', '#BA0C2F'] },
  { name: 'Oman', code: 'om', ratio: '4:7', svgFile: 'oman.svg', hints: [], colors: ['#FFFFFF', '#028002', '#DB171B'] },
  { name: 'Pakistan', code: 'pk', ratio: '2:3', svgFile: 'pakistan.svg', hints: [], colors: ['#01411C', '#FFFFFF'] },
  { name: 'Palau', code: 'pw', ratio: '5:8', svgFile: 'palau.svg', hints: [], colors: ['#0099FF', '#FFFF00'] },
  { name: 'Palestine', code: 'ps', ratio: '1:2', svgFile: 'palestine.svg', hints: [], colors: ['#009639', '#FFFFFF', '#000000', '#ED2E38'] },
  { name: 'Panama', code: 'pa', ratio: '2:3', svgFile: 'panama.svg', hints: [], colors: ['#FFFFFF', '#072357', '#DA121A'] },
  { name: 'Papua New Guinea', code: 'pg', ratio: '3:4', svgFile: 'papua_new_guinea.svg', hints: [], colors: ['#FFFFFF', '#FFCD00', '#C8102E', '#000000'] },
  { name: 'Paraguay', code: 'py', ratio: '11:20', svgFile: 'paraguay.svg', hints: [], colors: ['#FFFFFF', '#0038A8', '#D52B1E'] },
  { name: 'Peru', code: 'pe', ratio: '2:3', svgFile: 'peru.svg', hints: [], colors: ['#FFFFFF', '#D91023'] },
  { name: 'Philippines', code: 'ph', ratio: '1:2', svgFile: 'philippines.svg', hints: [], colors: ['#FFFFFF', '#0038A8', '#CE1126', '#FCD116'] },
  { name: 'Poland', code: 'pl', ratio: '5:8', svgFile: 'poland.svg', hints: [], colors: ['#FFFFFF', '#DC143C'] },
  { name: 'Portugal', code: 'pt', ratio: '2:3', svgFile: 'portugal.svg', hints: [], colors: ['#006035', '#FFFFFF', '#ED1C24', '#2E2C70', '#FFF200'] },
  { name: 'Qatar', code: 'qa', ratio: '6:25', svgFile: 'qatar.svg', hints: [], colors: ['#FFFFFF', '#8A1538'] },
  { name: 'Republic of the Congo', code: 'cg', ratio: '2:3', svgFile: 'republic_of_the_congo.svg', hints: [], colors: ['#FFD100', '#009739', '#DC241F'] },
  { name: 'Romania', code: 'ro', ratio: '2:3', svgFile: 'romania.svg', hints: [], colors: ['#FCD116', '#CE1126', '#002B7F'] },
  { name: 'Russia', code: 'ru', ratio: '2:3', svgFile: 'russia.svg', hints: [], colors: ['#0039A6', '#D52B1E', '#FFFFFF'] },
  { name: 'Rwanda', code: 'rw', ratio: '2:3', svgFile: 'rwanda.svg', hints: [], colors: ['#FAD201', '#00A3E0', '#20603D', '#E5BE01'] },
  { name: 'Saint Kitts and Nevis', code: 'kn', ratio: '2:3', svgFile: 'saint_kitts_and_nevis.svg', hints: [], colors: ['#FFCD00', '#FFFFFF', '#C8102E', '#009739', '#000000'] },
  { name: 'Saint Lucia', code: 'lc', ratio: '1:2', svgFile: 'saint_lucia.svg', hints: [], colors: ['#000000', '#66CCFF', '#FFFFFF', '#FCD116'] },
  { name: 'Saint Vincent and the Grenadines', code: 'vc', ratio: '2:3', svgFile: 'saint_vincent_and_the_grenadines.svg', hints: [], colors: ['#007C2E', '#002674', '#FCD022'] },
  { name: 'Samoa', code: 'ws', ratio: '1:2', svgFile: 'samoa.svg', hints: [], colors: ['#FFFFFF', '#002B7F', '#CE1126'] },
  { name: 'San Marino', code: 'sm', ratio: '3:4', svgFile: 'san_marino.svg', hints: [], colors: ['#FFFFFF', '#5EB6E4'] },
  { name: 'Saudi Arabia', code: 'sa', ratio: '2:3', svgFile: 'saudi_arabia.svg', hints: [], colors: ['#FFFFFF', '#005430'] },
  { name: 'Senegal', code: 'sn', ratio: '2:3', svgFile: 'senegal.svg', hints: [], colors: ['#E31B23', '#00853F', '#FDEF42'] },
  { name: 'Serbia', code: 'rs', ratio: '2:3', svgFile: 'serbia.svg', hints: [], colors: ['#FFFFFF', '#0C4076', '#C6363C'] },
  { name: 'Seychelles', code: 'sc', ratio: '1:2', svgFile: 'seychelles.svg', hints: [], colors: ['#FFFFFF', '#002F6C', '#D22730', '#FED141', '#007A33'] },
  { name: 'Sierra Leone', code: 'sl', ratio: '2:3', svgFile: 'sierra_leone.svg', hints: [], colors: ['#FFFFFF', '#1EB53A', '#0072C6'] },
  { name: 'Singapore', code: 'sg', ratio: '2:3', svgFile: 'singapore.svg', hints: [], colors: ['#ED2939', '#FFFFFF'] },
  { name: 'Slovakia', code: 'sk', ratio: '2:3', svgFile: 'slovakia.svg', hints: [], colors: ['#ED1C24', '#254AA5', '#FFFFFF'] },
  { name: 'Slovenia', code: 'si', ratio: '1:2', svgFile: 'slovenia.svg', hints: [], colors: ['#0000FF', '#FFFFFF', '#FF0000'] },
  { name: 'Solomon Islands', code: 'sb', ratio: '1:2', svgFile: 'solomon_islands.svg', hints: [], colors: ['#0051BA', '#215B33', '#FFFFFF', '#FCD116'] },
  { name: 'Somalia', code: 'so', ratio: '2:3', svgFile: 'somalia.svg', hints: [], colors: ['#418FDE', '#FFFFFF'] },
  { name: 'Somaliland', code: 'sl_sh', ratio: '1:2', svgFile: 'somaliland.svg', hints: [], colors: ['#DF0000', '#FFFFFF', '#006D21', '#000000'] },
  { name: 'South Africa', code: 'za', ratio: '2:3', svgFile: 'south_africa.svg', hints: [], colors: ['#001489', '#007749', '#FFFFFF', '#000000', '#FFB81C', '#E03C31'] },
  { name: 'South Korea', code: 'kr', ratio: '2:3', svgFile: 'south_korea.svg', hints: [], colors: ['#CD2E3A', '#000000', '#0047A0', '#FFFFFF'] },
  { name: 'South Ossetia', code: 'os', ratio: '1:2', svgFile: 'south_ossetia.svg', hints: [], colors: ['#FFFFFF', '#FFCE00', '#DD0000'] },
  { name: 'South Sudan', code: 'ss', ratio: '1:2', svgFile: 'south_sudan.svg', hints: [], colors: ['#E22028', '#FFFFFF', '#000000', '#00914C', '#00B6F2', '#FFE51A'] },
  { name: 'Spain', code: 'es', ratio: '2:3', svgFile: 'spain.svg', hints: [], colors: ['#FFC400', '#C60B1E'] },
  { name: 'Sri Lanka', code: 'lk', ratio: '1:2', svgFile: 'sri_lanka.svg', hints: [], colors: ['#EB7400', '#FFBE29', '#00534E', '#8D153A'] },
  { name: 'Sudan', code: 'sd', ratio: '1:2', svgFile: 'sudan.svg', hints: [], colors: ['#007229', '#000000', '#FFFFFF', '#D21034'] },
  { name: 'Suriname', code: 'sr', ratio: '2:3', svgFile: 'suriname.svg', hints: [], colors: ['#B40A2D', '#ECC81D', '#FFFFFF', '#377E3F'] },
  { name: 'Sweden', code: 'se', ratio: '5:8', svgFile: 'sweden.svg', hints: [], colors: ['#FECB00', '#005293'] },
  { name: 'Switzerland', code: 'ch', ratio: '1:1', svgFile: 'switzerland.svg', hints: [], colors: ['#FFFFFF', '#DA291C'] },
  { name: 'Syria', code: 'sy', ratio: '2:3', svgFile: 'syria.svg', hints: [], colors: ['#007A3D', '#000000', '#CE1126', '#FFFFFF'] },
  { name: 'São Tomé and Príncipe', code: 'st', ratio: '1:2', svgFile: 'são_tomé_and_príncipe.svg', hints: [], colors: ['#FFD100', '#EF3340', '#009739', '#000000'] },
  { name: 'Taiwan', code: 'tw', ratio: '2:3', svgFile: 'taiwan.svg', hints: [], colors: ['#000094', '#FE0000', '#FFFFFF'] },
  { name: 'Tajikistan', code: 'tj', ratio: '1:2', svgFile: 'tajikistan.svg', hints: [], colors: ['#FFFFFF', '#F7BF00', '#197B30', '#DC161D'] },
  { name: 'Tanzania', code: 'tz', ratio: '2:3', svgFile: 'tanzania.svg', hints: [], colors: ['#00A3DD', '#1EB53A', '#FCD116', '#000000'] },
  { name: 'Thailand', code: 'th', ratio: '2:3', svgFile: 'thailand.svg', hints: [], colors: ['#A51931', '#F4F5F8', '#2D2A4A'] },
  { name: 'The Gambia', code: 'gm', ratio: '2:3', svgFile: 'the_gambia.svg', hints: [], colors: ['#3A7728', '#FFFFFF', '#0C1C8C', '#CE1126'] },
  { name: 'Timor-Leste', code: 'tl', ratio: '1:2', svgFile: 'timor-leste.svg', hints: [], colors: ['#000000', '#FFFFFF', '#FFC72C', '#DA291C'] },
  { name: 'Togo', code: 'tg', ratio: '223:362', svgFile: 'togo.svg', hints: [], colors: ['#D21034', '#006A4E', '#FFFFFF', '#FFCE00'] },
  { name: 'Tonga', code: 'to', ratio: '1:2', svgFile: 'tonga.svg', hints: [], colors: ['#FFFFFF', '#C10000'] },
  { name: 'Transnistria', code: 'tr_pmr', ratio: '1:2', svgFile: 'transnistria.svg', hints: [], colors: ['#009933', '#FFD700', '#DD0000'] },
  { name: 'Trinidad and Tobago', code: 'tt', ratio: '3:5', svgFile: 'trinidad_and_tobago.svg', hints: [], colors: ['#000000', '#FFFFFF', '#DA1A35'] },
  { name: 'Tunisia', code: 'tn', ratio: '2:3', svgFile: 'tunisia.svg', hints: [], colors: ['#E70013', '#FFFFFF'] },
  { name: 'Turkey', code: 'tr', ratio: '2:3', svgFile: 'turkey.svg', hints: [], colors: ['#E30A17', '#FFFFFF'] },
  { name: 'Turkmenistan', code: 'tm', ratio: '2:3', svgFile: 'turkmenistan.svg', hints: [], colors: ['#00843D', '#FFC72C', '#FFFFFF', '#D22630'] },
  { name: 'Tuvalu', code: 'tv', ratio: '1:2', svgFile: 'tuvalu.svg', hints: [], colors: ['#009CDE', '#012169', '#FEDD00', '#FFFFFF', '#C8102E'] },
  { name: 'Uganda', code: 'ug', ratio: '2:3', svgFile: 'uganda.svg', hints: [], colors: ['#D90000', '#000000', '#FFFFFF', '#FCDC04'] },
  { name: 'Ukraine', code: 'ua', ratio: '2:3', svgFile: 'ukraine.svg', hints: [], colors: ['#0057B7', '#FFD700'] },
  { name: 'United Arab Emirates', code: 'ae', ratio: '1:2', svgFile: 'united_arab_emirates.svg', hints: [], colors: ['#FFFFFF', '#000000', '#00843D', '#C8102E'] },
  { name: 'United Kingdom', code: 'gb', ratio: '3:5', svgFile: 'united_kingdom.svg', hints: [], colors: ['#C8102E', '#FFFFFF', '#012169'] },
  { name: 'United States', code: 'us', ratio: '10:19', svgFile: 'united_states.svg', hints: [], colors: ['#FFFFFF', '#0A3161', '#B31942'] },
  { name: 'Uruguay', code: 'uy', ratio: '2:3', svgFile: 'uruguay.svg', hints: [], colors: ['#FCD116', '#0038A8', '#FFFFFF'] },
  { name: 'Uzbekistan', code: 'uz', ratio: '1:2', svgFile: 'uzbekistan.svg', hints: [], colors: ['#3081F7', '#EE162E', '#308738', '#FFFFFF'] },
  { name: 'Vanuatu', code: 'vu', ratio: '3:5', svgFile: 'vanuatu.svg', hints: [], colors: ['#D21034', '#009543', '#FDCE12', '#000000'] },
  { name: 'Vatican City', code: 'va', ratio: '1:1', svgFile: 'vatican_city.svg', hints: [], colors: ['#FFE000', '#FFFFFF'] },
  { name: 'Venezuela', code: 've', ratio: '2:3', svgFile: 'venezuela.svg', hints: [], colors: ['#FFFFFF', '#FFCC00', '#00247D', '#CF142B'] },
  { name: 'Vietnam', code: 'vn', ratio: '2:3', svgFile: 'vietnam.svg', hints: [], colors: ['#DA251D', '#FFFF00'] },
  { name: 'Western Sahara', code: 'eh', ratio: '1:2', svgFile: 'western_sahara.svg', hints: [], colors: ['#C4111B', '#007A3D', '#FFFFFF', '#000000'] },
  { name: 'Yemen', code: 'ye', ratio: '2:3', svgFile: 'yemen.svg', hints: [], colors: ['#CE1126', '#000000', '#FFFFFF'] },
  { name: 'Zambia', code: 'zm', ratio: '2:3', svgFile: 'zambia.svg', hints: [], colors: ['#000000', '#147F55', '#F99815', '#D40829'] },
  { name: 'Zimbabwe', code: 'zw', ratio: '1:2', svgFile: 'zimbabwe.svg', hints: [], colors: ['#FFD200', '#006400', '#000000', '#D40000', '#FFCC00', '#FFFFFF'] },
];

@Injectable({ providedIn: 'root' })
export class CountryService {
  getCountries(): Country[] {
    return [...ALL_COUNTRIES];
  }

  /** Full sovereign-state list — used only by free-drawing mode. */
  getFreeModeCountries(): Country[] {
    return [...FREE_MODE_COUNTRIES];
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
