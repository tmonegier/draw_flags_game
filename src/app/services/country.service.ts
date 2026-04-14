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
    colors: ['#d52b1e', '#ffffff'] },

  // Slovenia: horizontal tricolor with coat of arms in upper-left quadrant.
  // Easy: band guides + coat of arms pre-drawn.
  { name: 'Slovenia',    code: 'si', ratio: '1:2',   svgFile: 'slovenia.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'slovenia-coat-of-arms', color: '#0000ff', xCenter: 0.25, yCenter: 0.338, sizeFraction: 0.350 },
    ],
    colors: ['#ffffff', '#0000ff', '#ff0000'] },

  // Slovakia: horizontal tricolor with coat of arms slightly left of center.
  // Easy: band guides + coat of arms pre-drawn.
  { name: 'Slovakia',    code: 'sk', ratio: '2:3',   svgFile: 'slovakia.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'slovakia-coat-of-arms', color: '#ed1c24', xCenter: 0.3, yCenter: 0.5, sizeFraction: 0.532 },
    ],
    colors: ['#ffffff', '#254aa5', '#ed1c24'] },

  // Morocco: solid red background with a centered green pentagram outline.
  // Easy: star pre-drawn via element hint.
  { name: 'Morocco',     code: 'ma', ratio: '2:3',   svgFile: 'morocco.svg',
    hints: [
      { kind: 'element', elementId: 'morocco-star', color: '#006233', xCenter: 0.5, yCenter: 0.4798, sizeFraction: 0.4474 },
    ],
    colors: ['#c1272d', '#006233'] },

  // Algeria: vertical green-white bicolor with a red crescent and star.
  // Easy: band guide + crescent-star pre-drawn.
  { name: 'Algeria',     code: 'dz', ratio: '2:3',   svgFile: 'algeria.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 1] },
      { kind: 'element', elementId: 'algeria-crescent-star', color: '#d21034', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.525 },
    ],
    colors: ['#006633', '#ffffff', '#d21034'] },

  // Tunisia: solid red background with a centered white-disk crescent-star emblem.
  // Easy: emblem pre-drawn via element hint.
  { name: 'Tunisia',     code: 'tn', ratio: '2:3',   svgFile: 'tunisia.svg',
    hints: [
      { kind: 'element', elementId: 'tunisia-crescent-star', color: '#e70013', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.625 },
    ],
    colors: ['#e70013', '#ffffff'] },

  // Turkey: solid red background with a white crescent and star.
  // Easy: crescent-star pre-drawn via element hint.
  { name: 'Turkey',      code: 'tr', ratio: '2:3',   svgFile: 'turkey.svg',
    hints: [
      { kind: 'element', elementId: 'turkey-crescent-star', color: '#ffffff', xCenter: 0.39, yCenter: 0.5, sizeFraction: 0.71 },
    ],
    colors: ['#e30a17', '#ffffff'] },

  // Vietnam: solid red background with centered yellow star.
  { name: 'Vietnam',     code: 'vn', ratio: '2:3',   svgFile: 'vietnam.svg',
    hints: [
      { kind: 'element', elementId: 'vietnam-star', color: '#ffff00', xCenter: 0.5, yCenter: 0.471, sizeFraction: 0.6 },
    ],
    colors: ['#da251d', '#ffff00'] },

  // China: solid red background with a large yellow star (upper-left) + 4 small stars.
  { name: 'China',       code: 'cn', ratio: '2:3',   svgFile: 'china.svg',
    hints: [
      { kind: 'element', elementId: 'china-star', color: '#ffff00', xCenter: 0.25, yCenter: 0.275, sizeFraction: 0.5833 },
    ],
    colors: ['#EE1C25', '#FFFF00'] },

  // Mongolia: vertical red-blue-red tricolor with the gold Soyombo in the left band.
  { name: 'Mongolia',    code: 'mn', ratio: '1:2',   svgFile: 'mongolia.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'mongolia-soyombo', color: '#ffd300', xCenter: 0.167, yCenter: 0.475, sizeFraction: 0.75 },
    ],
    colors: ['#da2031', '#0066b2', '#ffd300'] },

  // Nepal: non-rectangular double-pennant flag (treated as 4:3 canvas).
  // Upper pennant has white moon symbol; lower pennant has white sun.
  { name: 'Nepal',       code: 'np', ratio: '4:3',   svgFile: 'nepal.svg',
    hints: [
      { kind: 'element', elementId: 'nepal-moon', color: '#ffffff', xCenter: 0.246, yCenter: 0.386, sizeFraction: 0.344 },
      { kind: 'element', elementId: 'nepal-sun',  color: '#ffffff', xCenter: 0.246, yCenter: 0.727, sizeFraction: 0.344 },
    ],
    colors: ['#DC143C', '#003893', '#ffffff'] },

  // Liechtenstein: horizontal blue-red bicolor with a gold crown in the upper-left.
  { name: 'Liechtenstein', code: 'li', ratio: '3:5', svgFile: 'liechtenstein.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
      { kind: 'element', elementId: 'liechtenstein-crown', color: '#ffd83d', xCenter: 0.222, yCenter: 0.237, sizeFraction: 0.337 },
    ],
    colors: ['#002b7f', '#ce1126', '#ffd83d'] },

  // Bhutan: diagonal yellow/orange split with a white dragon.
  { name: 'Bhutan',      code: 'bt', ratio: '2:3',   svgFile: 'bhutan.svg',
    hints: [
      { kind: 'element', elementId: 'bhutan-dragon', color: '#ffffff', xCenter: 0.55, yCenter: 0.554, sizeFraction: 0.743 },
    ],
    colors: ['#ffcd00', '#ff671f', '#ffffff'] },

  // Vatican: vertical yellow-white bicolor with simplified coat of arms in the white half.
  { name: 'Vatican',     code: 'va', ratio: '1:1',   svgFile: 'vatican_city.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 1] },
      { kind: 'element', elementId: 'vatican-coat-of-arms', color: '#ffe000', xCenter: 0.75, yCenter: 0.5, sizeFraction: 0.55 },
    ],
    colors: ['#ffe000', '#ffffff'] },

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

  // ── New additions ─────────────────────────────────────────────────────────────
  // Angola: red over black with centered yellow emblem (half-gear, machete, star).
  { name: 'Angola',      code: 'ao', ratio: '2:3',   svgFile: 'angola.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
      { kind: 'element', elementId: 'angola-emblem', color: '#ffcb00', xCenter: 0.5176, yCenter: 0.5069, sizeFraction: 0.653 },
    ],
    colors: ['#cc092f', '#000000', '#ffcb00'] },

  // Singapore: red over white with white crescent + 5-star pentagon in upper-left.
  { name: 'Singapore',   code: 'sg', ratio: '2:3',   svgFile: 'singapore.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
      { kind: 'element', elementId: 'singapore-crescent-stars', color: '#ffffff', xCenter: 0.2335, yCenter: 0.2653, sizeFraction: 0.4350 },
    ],
    colors: ['#EF3340', '#ffffff'] },

  // Honduras: blue-white-blue horizontal tricolor with 5 blue stars in a quincunx.
  { name: 'Honduras',    code: 'hn', ratio: '1:2',   svgFile: 'honduras.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'honduras-stars', color: '#0d3b99', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.711 },
    ],
    colors: ['#0d3b99', '#ffffff'] },

  // Colombia: horizontal bands yellow (50%), blue (25%), red (25%).
  { name: 'Colombia',    code: 'co', ratio: '2:3',   svgFile: 'colombia.svg',
    hints: [{ kind: 'bands', direction: 'horizontal', ratios: [2, 1, 1] }],
    colors: ['#FCD116', '#003893', '#CE1126'] },

  // Venezuela: yellow-blue-red horizontal tricolor with 8 white stars arcing in the blue band.
  { name: 'Venezuela',   code: 've', ratio: '2:3',   svgFile: 'venezuela.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1, 1] },
      { kind: 'element', elementId: 'venezuela-stars', color: '#ffffff', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.66 },
    ],
    colors: ['#FCD116', '#00247D', '#CF142B', '#ffffff'] },

  // Aruba: light blue field with two yellow stripes near the bottom and a red/white 4-point star.
  { name: 'Aruba',       code: 'aw', ratio: '2:3',   svgFile: 'aruba.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [9, 1, 1, 1] },
      { kind: 'element', elementId: 'aruba-star', color: '#CF142B', xCenter: 0.2, yCenter: 0.3, sizeFraction: 0.22 },
    ],
    colors: ['#418FDE', '#FBD116', '#CF142B', '#ffffff'] },

  // Panama: quartered white/red/blue/white with a blue star (upper-left) and red star (lower-right).
  { name: 'Panama',      code: 'pa', ratio: '2:3',   svgFile: 'panama.svg',
    hints: [
      { kind: 'bands', direction: 'horizontal', ratios: [1, 1] },
      { kind: 'bands', direction: 'vertical',   ratios: [1, 1] },
      { kind: 'element', elementId: 'panama-star', color: '#072357', xCenter: 0.25, yCenter: 0.25, sizeFraction: 0.22 },
      { kind: 'element', elementId: 'panama-star', color: '#D21034', xCenter: 0.75, yCenter: 0.75, sizeFraction: 0.22 },
    ],
    colors: ['#D21034', '#072357', '#ffffff'] },

  // Montenegro: red field with thick gold border and a centered gold double-headed eagle.
  // Border is drawn in the SVG for scoring; not representable as a band hint.
  { name: 'Montenegro',  code: 'me', ratio: '1:2',   svgFile: 'montenegro.svg',
    hints: [
      { kind: 'element', elementId: 'montenegro-eagle', color: '#D5A937', xCenter: 0.5, yCenter: 0.5, sizeFraction: 0.7 },
    ],
    colors: ['#C40308', '#D5A937'] },

  // Pakistan: white 1/4 hoist + green 3/4 with white crescent and star in the green band.
  { name: 'Pakistan',    code: 'pk', ratio: '2:3',   svgFile: 'pakistan.svg',
    hints: [
      { kind: 'bands', direction: 'vertical', ratios: [1, 3] },
      { kind: 'element', elementId: 'pakistan-crescent-star', color: '#ffffff', xCenter: 0.625, yCenter: 0.5, sizeFraction: 0.6 },
    ],
    colors: ['#01411C', '#ffffff'] },
];

// Full sovereign-state list (UN members + observers + partially recognized).
// Used only by free-drawing mode — guided modes stay on ALL_COUNTRIES.
// No hints: free mode draws on a blank canvas.
const FREE_MODE_COUNTRIES: Country[] = [
  { name: 'Abkhazia', code: 'ab', ratio: '1:2', svgFile: 'abkhazia.svg', hints: [], colors: ['#009E49', '#FFFFFF', '#CE1126'] },
  { name: 'Afghanistan', code: 'af', ratio: '1:2', svgFile: 'afghanistan.svg', hints: [], colors: ['#000000', '#ffffff'] },
  { name: 'Albania', code: 'al', ratio: '5:7', svgFile: 'albania.svg', hints: [], colors: ['#E41E20', '#000000'] },
  { name: 'Algeria', code: 'dz', ratio: '2:3', svgFile: 'algeria.svg', hints: [], colors: ['#006233', '#ffffff', '#D21034'] },
  { name: 'Andorra', code: 'ad', ratio: '7:10', svgFile: 'andorra.svg', hints: [], colors: ['#10069F', '#FEDD00', '#D50032'] },
  { name: 'Angola', code: 'ao', ratio: '2:3', svgFile: 'angola.svg', hints: [], colors: ['#CC092F', '#000000', '#FFCB00'] },
  { name: 'Antigua and Barbuda', code: 'ag', ratio: '2:3', svgFile: 'antigua_and_barbuda.svg', hints: [], colors: ['#CF0921', '#FFFFFF', '#0061A8', '#000000', '#FCD116'] },
  { name: 'Argentina', code: 'ar', ratio: '5:8', svgFile: 'argentina.svg', hints: [], colors: ['#6CACE4', '#ffffff', '#F6B40E'] },
  { name: 'Armenia', code: 'am', ratio: '1:2', svgFile: 'armenia.svg', hints: [], colors: ['#D90012', '#0033A0', '#F2A800'] },
  { name: 'Artsakh', code: 'xa', ratio: '1:2', svgFile: 'artsakh.svg', hints: [], colors: ['#D90012', '#0033A0', '#FF9900', '#FFFFFF'] },
  { name: 'Australia', code: 'au', ratio: '1:2', svgFile: 'australia.svg', hints: [], colors: ['#012169', '#FFFFFF', '#E4002B'] },
  { name: 'Austria', code: 'at', ratio: '2:3', svgFile: 'austria.svg', hints: [], colors: ['#ED2939', '#ffffff'] },
  { name: 'Azerbaijan', code: 'az', ratio: '1:2', svgFile: 'azerbaijan.svg', hints: [], colors: ['#00B9E4', '#ED2939', '#509E2F', '#FFFFFF'] },
  { name: 'Bahamas', code: 'bs', ratio: '1:2', svgFile: 'bahamas.svg', hints: [], colors: ['#00778B', '#FFC72C', '#000000'] },
  { name: 'Bahrain', code: 'bh', ratio: '3:5', svgFile: 'bahrain.svg', hints: [], colors: ['#DA291C', '#FFFFFF'] },
  { name: 'Bangladesh', code: 'bd', ratio: '3:5', svgFile: 'bangladesh.svg', hints: [], colors: ['#006A4E', '#F42A41'] },
  { name: 'Barbados', code: 'bb', ratio: '2:3', svgFile: 'barbados.svg', hints: [], colors: ['#00267F', '#FFC726', '#000000'] },
  { name: 'Belarus', code: 'by', ratio: '1:2', svgFile: 'belarus.svg', hints: [], colors: ['#C8313E', '#007C30', '#FFFFFF'] },
  { name: 'Belgium', code: 'be', ratio: '13:15', svgFile: 'belgium.svg', hints: [], colors: ['#000000', '#FDDA24', '#EF3340'] },
  { name: 'Belize', code: 'bz', ratio: '3:5', svgFile: 'belize.svg', hints: [], colors: ['#CE1126', '#003F87', '#FFFFFF', '#007A33'] },
  { name: 'Benin', code: 'bj', ratio: '2:3', svgFile: 'benin.svg', hints: [], colors: ['#008751', '#FCD116', '#E8112D'] },
  { name: 'Bhutan', code: 'bt', ratio: '2:3', svgFile: 'bhutan.svg', hints: [], colors: ['#FFCC33', '#FF4E12', '#FFFFFF'] },
  { name: 'Bolivia', code: 'bo', ratio: '15:22', svgFile: 'bolivia.svg', hints: [], colors: ['#D52B1E', '#F9E300', '#007934'] },
  { name: 'Bosnia and Herzegovina', code: 'ba', ratio: '1:2', svgFile: 'bosnia_and_herzegovina.svg', hints: [], colors: ['#002395', '#FECB00', '#FFFFFF'] },
  { name: 'Botswana', code: 'bw', ratio: '2:3', svgFile: 'botswana.svg', hints: [], colors: ['#75AADB', '#FFFFFF', '#000000'] },
  { name: 'Brazil', code: 'br', ratio: '7:10', svgFile: 'brazil.svg', hints: [], colors: ['#009C3B', '#FFDF00', '#002776', '#FFFFFF'] },
  { name: 'Brunei', code: 'bn', ratio: '1:2', svgFile: 'brunei.svg', hints: [], colors: ['#F7E017', '#FFFFFF', '#000000', '#CF1126'] },
  { name: 'Bulgaria', code: 'bg', ratio: '3:5', svgFile: 'bulgaria.svg', hints: [], colors: ['#FFFFFF', '#00966E', '#D62612'] },
  { name: 'Burkina Faso', code: 'bf', ratio: '2:3', svgFile: 'burkina_faso.svg', hints: [], colors: ['#EF2B2D', '#009E49', '#FCD116'] },
  { name: 'Burundi', code: 'bi', ratio: '3:5', svgFile: 'burundi.svg', hints: [], colors: ['#CE1126', '#FFFFFF', '#1EB53A'] },
  { name: 'Cambodia', code: 'kh', ratio: '16:25', svgFile: 'cambodia.svg', hints: [], colors: ['#032EA1', '#E00025', '#FFFFFF'] },
  { name: 'Cameroon', code: 'cm', ratio: '2:3', svgFile: 'cameroon.svg', hints: [], colors: ['#007A5E', '#CE1126', '#FCD116'] },
  { name: 'Canada', code: 'ca', ratio: '1:2', svgFile: 'canada.svg', hints: [], colors: ['#FF0000', '#FFFFFF'] },
  { name: 'Cape Verde', code: 'cv', ratio: '10:17', svgFile: 'cape_verde.svg', hints: [], colors: ['#003893', '#CF2027', '#FFFFFF'] },
  { name: 'Central African Republic', code: 'cf', ratio: '2:3', svgFile: 'central_african_republic.svg', hints: [], colors: ['#003082', '#FFFFFF', '#289728', '#FFCE00', '#D21034'] },
  { name: 'Chad', code: 'td', ratio: '2:3', svgFile: 'chad.svg', hints: [], colors: ['#002664', '#FECB00', '#C60C30'] },
  { name: 'Chile', code: 'cl', ratio: '2:3', svgFile: 'chile.svg', hints: [], colors: ['#D52B1E', '#0039A6', '#FFFFFF'] },
  { name: 'China', code: 'cn', ratio: '2:3', svgFile: 'china.svg', hints: [], colors: ['#EE1C25', '#FFFF00'] },
  { name: 'Colombia', code: 'co', ratio: '2:3', svgFile: 'colombia.svg', hints: [], colors: ['#FCD116', '#003893', '#CE1126'] },
  { name: 'Comoros', code: 'km', ratio: '3:5', svgFile: 'comoros.svg', hints: [], colors: ['#FFC61E', '#FFFFFF', '#CE1126', '#3A75C4', '#3B7728'] },
  { name: 'Cook Islands', code: 'ck', ratio: '1:2', svgFile: 'cook_islands.svg', hints: [], colors: ['#012169', '#FFFFFF', '#CC0000'] },
  { name: 'Costa Rica', code: 'cr', ratio: '3:5', svgFile: 'costa_rica.svg', hints: [], colors: ['#002B7F', '#FFFFFF', '#CE1126'] },
  { name: 'Croatia', code: 'hr', ratio: '1:2', svgFile: 'croatia.svg', hints: [], colors: ['#171796', '#FFFFFF', '#FF0000'] },
  { name: 'Cuba', code: 'cu', ratio: '1:2', svgFile: 'cuba.svg', hints: [], colors: ['#002A8F', '#FFFFFF', '#CF142B'] },
  { name: 'Cyprus', code: 'cy', ratio: '2:3', svgFile: 'cyprus.svg', hints: [], colors: ['#FFFFFF', '#D47600', '#4E5B31'] },
  { name: 'Czech Republic', code: 'cz', ratio: '2:3', svgFile: 'czech_republic.svg', hints: [], colors: ['#FFFFFF', '#D7141A', '#11457E'] },
  { name: 'Democratic Republic of the Congo', code: 'cd', ratio: '3:4', svgFile: 'democratic_republic_of_the_congo.svg', hints: [], colors: ['#007FFF', '#F7D618', '#CE1021'] },
  { name: 'Denmark', code: 'dk', ratio: '28:37', svgFile: 'denmark.svg', hints: [], colors: ['#C8102E', '#FFFFFF'] },
  { name: 'Djibouti', code: 'dj', ratio: '2:3', svgFile: 'djibouti.svg', hints: [], colors: ['#6AB2E7', '#12AD2B', '#FFFFFF', '#D7141A'] },
  { name: 'Dominica', code: 'dm', ratio: '1:2', svgFile: 'dominica.svg', hints: [], colors: ['#006B3F', '#FCD116', '#000000', '#FFFFFF', '#D41C30'] },
  { name: 'Dominican Republic', code: 'do', ratio: '2:3', svgFile: 'dominican_republic.svg', hints: [], colors: ['#002D62', '#FFFFFF', '#CE1126'] },
  { name: 'Ecuador', code: 'ec', ratio: '2:3', svgFile: 'ecuador.svg', hints: [], colors: ['#FFDD00', '#034EA2', '#ED1C24'] },
  { name: 'Egypt', code: 'eg', ratio: '2:3', svgFile: 'egypt.svg', hints: [], colors: ['#CE1126', '#FFFFFF', '#000000', '#C09300'] },
  { name: 'El Salvador', code: 'sv', ratio: '3:5', svgFile: 'el_salvador.svg', hints: [], colors: ['#0047AB', '#FFFFFF'] },
  { name: 'Equatorial Guinea', code: 'gq', ratio: '2:3', svgFile: 'equatorial_guinea.svg', hints: [], colors: ['#3E9A00', '#FFFFFF', '#E32118', '#0073CE'] },
  { name: 'Eritrea', code: 'er', ratio: '1:2', svgFile: 'eritrea.svg', hints: [], colors: ['#418FDE', '#EA0437', '#239E46', '#FFC726'] },
  { name: 'Estonia', code: 'ee', ratio: '7:11', svgFile: 'estonia.svg', hints: [], colors: ['#0072CE', '#000000', '#FFFFFF'] },
  { name: 'Eswatini', code: 'sz', ratio: '2:3', svgFile: 'eswatini.svg', hints: [], colors: ['#3E5EB9', '#FFD900', '#B10C0C', '#FFFFFF', '#000000'] },
  { name: 'Ethiopia', code: 'et', ratio: '1:2', svgFile: 'ethiopia.svg', hints: [], colors: ['#078930', '#FCDD09', '#DA121A', '#0F47AF'] },
  { name: 'Fiji', code: 'fj', ratio: '1:2', svgFile: 'fiji.svg', hints: [], colors: ['#68BFE5', '#CF142B', '#FFFFFF', '#012169'] },
  { name: 'Finland', code: 'fi', ratio: '11:18', svgFile: 'finland.svg', hints: [], colors: ['#003580', '#FFFFFF'] },
  { name: 'France', code: 'fr', ratio: '2:3', svgFile: 'france.svg', hints: [], colors: ['#002654', '#FFFFFF', '#CE1126'] },
  { name: 'Gabon', code: 'ga', ratio: '3:4', svgFile: 'gabon.svg', hints: [], colors: ['#3A75C4', '#FCD116', '#009E60'] },
  { name: 'Georgia', code: 'ge', ratio: '2:3', svgFile: 'georgia.svg', hints: [], colors: ['#FFFFFF', '#FF0000'] },
  { name: 'Germany', code: 'de', ratio: '3:5', svgFile: 'germany.svg', hints: [], colors: ['#000000', '#DD0000', '#FFCE00'] },
  { name: 'Ghana', code: 'gh', ratio: '2:3', svgFile: 'ghana.svg', hints: [], colors: ['#CE1126', '#FCD116', '#006B3F', '#000000'] },
  { name: 'Greece', code: 'gr', ratio: '2:3', svgFile: 'greece.svg', hints: [], colors: ['#0D5EAF', '#FFFFFF'] },
  { name: 'Grenada', code: 'gd', ratio: '3:5', svgFile: 'grenada.svg', hints: [], colors: ['#CE1126', '#FCD116', '#007A5E'] },
  { name: 'Guatemala', code: 'gt', ratio: '5:8', svgFile: 'guatemala.svg', hints: [], colors: ['#4997D0', '#FFFFFF'] },
  { name: 'Guinea', code: 'gn', ratio: '2:3', svgFile: 'guinea.svg', hints: [], colors: ['#CE1126', '#FCD116', '#009460'] },
  { name: 'Guinea-Bissau', code: 'gw', ratio: '1:2', svgFile: 'guinea-bissau.svg', hints: [], colors: ['#CE1126', '#FCD116', '#009E49', '#000000'] },
  { name: 'Guyana', code: 'gy', ratio: '3:5', svgFile: 'guyana.svg', hints: [], colors: ['#009E49', '#FFFFFF', '#FCD116', '#000000', '#CE1126'] },
  { name: 'Haiti', code: 'ht', ratio: '3:5', svgFile: 'haiti.svg', hints: [], colors: ['#00209F', '#D21034'] },
  { name: 'Honduras', code: 'hn', ratio: '1:2', svgFile: 'honduras.svg', hints: [], colors: ['#0d3b99', '#FFFFFF'] },
  { name: 'Hungary', code: 'hu', ratio: '1:2', svgFile: 'hungary.svg', hints: [], colors: ['#CE2939', '#FFFFFF', '#477050'] },
  { name: 'Iceland', code: 'is', ratio: '18:25', svgFile: 'iceland.svg', hints: [], colors: ['#02529C', '#FFFFFF', '#DC1E35'] },
  { name: 'India', code: 'in', ratio: '2:3', svgFile: 'india.svg', hints: [], colors: ['#FF9933', '#FFFFFF', '#138808', '#000080'] },
  { name: 'Indonesia', code: 'id', ratio: '2:3', svgFile: 'indonesia.svg', hints: [], colors: ['#FF0000', '#FFFFFF'] },
  { name: 'Iran', code: 'ir', ratio: '4:7', svgFile: 'iran.svg', hints: [], colors: ['#239F40', '#FFFFFF', '#DA0000'] },
  { name: 'Iraq', code: 'iq', ratio: '2:3', svgFile: 'iraq.svg', hints: [], colors: ['#CE1126', '#FFFFFF', '#000000', '#007A3D'] },
  { name: 'Ireland', code: 'ie', ratio: '1:2', svgFile: 'ireland.svg', hints: [], colors: ['#169B62', '#FFFFFF', '#FF883E'] },
  { name: 'Israel', code: 'il', ratio: '8:11', svgFile: 'israel.svg', hints: [], colors: ['#FFFFFF', '#0038B8'] },
  { name: 'Italy', code: 'it', ratio: '2:3', svgFile: 'italy.svg', hints: [], colors: ['#009246', '#FFFFFF', '#CE2B37'] },
  { name: 'Ivory Coast', code: 'ci', ratio: '2:3', svgFile: 'ivory_coast.svg', hints: [], colors: ['#F77F00', '#FFFFFF', '#009E60'] },
  { name: 'Jamaica', code: 'jm', ratio: '1:2', svgFile: 'jamaica.svg', hints: [], colors: ['#009B3A', '#FED100', '#000000'] },
  { name: 'Japan', code: 'jp', ratio: '2:3', svgFile: 'japan.svg', hints: [], colors: ['#FFFFFF', '#BC002D'] },
  { name: 'Jordan', code: 'jo', ratio: '1:2', svgFile: 'jordan.svg', hints: [], colors: ['#000000', '#FFFFFF', '#007A3D', '#CE1126'] },
  { name: 'Kazakhstan', code: 'kz', ratio: '1:2', svgFile: 'kazakhstan.svg', hints: [], colors: ['#00AFCA', '#FEC50C'] },
  { name: 'Kenya', code: 'ke', ratio: '2:3', svgFile: 'kenya.svg', hints: [], colors: ['#000000', '#FFFFFF', '#BB0000', '#006600'] },
  { name: 'Kiribati', code: 'ki', ratio: '1:2', svgFile: 'kiribati.svg', hints: [], colors: ['#CE1126', '#FCD116', '#003F87', '#FFFFFF'] },
  { name: 'Kosovo', code: 'xk', ratio: '5:7', svgFile: 'kosovo.svg', hints: [], colors: ['#244AA5', '#D0A650', '#FFFFFF'] },
  { name: 'Kuwait', code: 'kw', ratio: '1:2', svgFile: 'kuwait.svg', hints: [], colors: ['#007A3D', '#FFFFFF', '#CE1126', '#000000'] },
  { name: 'Kyrgyzstan', code: 'kg', ratio: '3:5', svgFile: 'kyrgyzstan.svg', hints: [], colors: ['#E8112D', '#FFEF00'] },
  { name: 'Laos', code: 'la', ratio: '2:3', svgFile: 'laos.svg', hints: [], colors: ['#CE1126', '#002868', '#FFFFFF'] },
  { name: 'Latvia', code: 'lv', ratio: '1:2', svgFile: 'latvia.svg', hints: [], colors: ['#9E3039', '#FFFFFF'] },
  { name: 'Lebanon', code: 'lb', ratio: '2:3', svgFile: 'lebanon.svg', hints: [], colors: ['#ED1C24', '#FFFFFF', '#00A651'] },
  { name: 'Lesotho', code: 'ls', ratio: '2:3', svgFile: 'lesotho.svg', hints: [], colors: ['#00209F', '#FFFFFF', '#009543', '#000000'] },
  { name: 'Liberia', code: 'lr', ratio: '10:19', svgFile: 'liberia.svg', hints: [], colors: ['#BF0A30', '#FFFFFF', '#002868'] },
  { name: 'Libya', code: 'ly', ratio: '1:2', svgFile: 'libya.svg', hints: [], colors: ['#E70013', '#000000', '#239E46', '#FFFFFF'] },
  { name: 'Liechtenstein', code: 'li', ratio: '3:5', svgFile: 'liechtenstein.svg', hints: [], colors: ['#002B7F', '#CE1126', '#FFD83D', '#000000'] },
  { name: 'Lithuania', code: 'lt', ratio: '3:5', svgFile: 'lithuania.svg', hints: [], colors: ['#FDB913', '#006A44', '#C1272D'] },
  { name: 'Luxembourg', code: 'lu', ratio: '3:5', svgFile: 'luxembourg.svg', hints: [], colors: ['#ED2939', '#FFFFFF', '#00A1DE'] },
  { name: 'Madagascar', code: 'mg', ratio: '2:3', svgFile: 'madagascar.svg', hints: [], colors: ['#FFFFFF', '#FC3D32', '#007E3A'] },
  { name: 'Malawi', code: 'mw', ratio: '2:3', svgFile: 'malawi.svg', hints: [], colors: ['#000000', '#CE1126', '#339E35'] },
  { name: 'Malaysia', code: 'my', ratio: '1:2', svgFile: 'malaysia.svg', hints: [], colors: ['#CC0001', '#FFFFFF', '#010066', '#FFCC00'] },
  { name: 'Maldives', code: 'mv', ratio: '2:3', svgFile: 'maldives.svg', hints: [], colors: ['#D21034', '#007E3A', '#FFFFFF'] },
  { name: 'Mali', code: 'ml', ratio: '2:3', svgFile: 'mali.svg', hints: [], colors: ['#14B53A', '#FCD116', '#CE1126'] },
  { name: 'Malta', code: 'mt', ratio: '2:3', svgFile: 'malta.svg', hints: [], colors: ['#FFFFFF', '#CF142B', '#B8B6B6'] },
  { name: 'Marshall Islands', code: 'mh', ratio: '10:19', svgFile: 'marshall_islands.svg', hints: [], colors: ['#003893', '#FFFFFF', '#DD7500'] },
  { name: 'Mauritania', code: 'mr', ratio: '2:3', svgFile: 'mauritania.svg', hints: [], colors: ['#D01C1F', '#00A95C', '#FFD700'] },
  { name: 'Mauritius', code: 'mu', ratio: '2:3', svgFile: 'mauritius.svg', hints: [], colors: ['#EA2839', '#1A206D', '#FFD500', '#00A04D'] },
  { name: 'Mexico', code: 'mx', ratio: '4:7', svgFile: 'mexico.svg', hints: [], colors: ['#006847', '#FFFFFF', '#CE1126'] },
  { name: 'Micronesia', code: 'fm', ratio: '10:19', svgFile: 'micronesia.svg', hints: [], colors: ['#75B2DD', '#FFFFFF'] },
  { name: 'Moldova', code: 'md', ratio: '1:2', svgFile: 'moldova.svg', hints: [], colors: ['#003DA5', '#FFD200', '#CF0921'] },
  { name: 'Monaco', code: 'mc', ratio: '4:5', svgFile: 'monaco.svg', hints: [], colors: ['#CE1126', '#FFFFFF'] },
  { name: 'Mongolia', code: 'mn', ratio: '1:2', svgFile: 'mongolia.svg', hints: [], colors: ['#C4272F', '#015197', '#F9CF02'] },
  { name: 'Montenegro', code: 'me', ratio: '1:2', svgFile: 'montenegro.svg', hints: [], colors: ['#D4AF37', '#C40308'] },
  { name: 'Morocco', code: 'ma', ratio: '2:3', svgFile: 'morocco.svg', hints: [], colors: ['#C1272D', '#006233'] },
  { name: 'Mozambique', code: 'mz', ratio: '2:3', svgFile: 'mozambique.svg', hints: [], colors: ['#009739', '#000000', '#FFFFFF', '#FFD100', '#DA291C'] },
  { name: 'Myanmar', code: 'mm', ratio: '2:3', svgFile: 'myanmar.svg', hints: [], colors: ['#FECB00', '#34B233', '#EA2839', '#FFFFFF'] },
  { name: 'Namibia', code: 'na', ratio: '2:3', svgFile: 'namibia.svg', hints: [], colors: ['#003580', '#FFFFFF', '#D21034', '#009A3A', '#FFCE00'] },
  { name: 'Nauru', code: 'nr', ratio: '1:2', svgFile: 'nauru.svg', hints: [], colors: ['#002B7F', '#FFC61E', '#FFFFFF'] },
  { name: 'Nepal', code: 'np', ratio: '89:73', svgFile: 'nepal.svg', hints: [], colors: ['#DC143C', '#003893', '#FFFFFF'] },
  { name: 'Netherlands', code: 'nl', ratio: '2:3', svgFile: 'netherlands.svg', hints: [], colors: ['#AE1C28', '#FFFFFF', '#21468B'] },
  { name: 'New Zealand', code: 'nz', ratio: '1:2', svgFile: 'new_zealand.svg', hints: [], colors: ['#012169', '#FFFFFF', '#CC142B'] },
  { name: 'Nicaragua', code: 'ni', ratio: '3:5', svgFile: 'nicaragua.svg', hints: [], colors: ['#0067C6', '#FFFFFF', '#FFD700'] },
  { name: 'Niger', code: 'ne', ratio: '6:7', svgFile: 'niger.svg', hints: [], colors: ['#E05206', '#FFFFFF', '#0DB02B'] },
  { name: 'Nigeria', code: 'ng', ratio: '1:2', svgFile: 'nigeria.svg', hints: [], colors: ['#008751', '#FFFFFF'] },
  { name: 'Niue', code: 'nu', ratio: '1:2', svgFile: 'niue.svg', hints: [], colors: ['#FCD116', '#012169', '#FFFFFF', '#CC0000'] },
  { name: 'North Korea', code: 'kp', ratio: '1:2', svgFile: 'north_korea.svg', hints: [], colors: ['#024FA2', '#FFFFFF', '#ED1C27'] },
  { name: 'North Macedonia', code: 'mk', ratio: '1:2', svgFile: 'north_macedonia.svg', hints: [], colors: ['#D20000', '#FFE600'] },
  { name: 'Northern Cyprus', code: 'cy_n', ratio: '2:3', svgFile: 'northern_cyprus.svg', hints: [], colors: ['#FFFFFF', '#CF142B'] },
  { name: 'Norway', code: 'no', ratio: '8:11', svgFile: 'norway.svg', hints: [], colors: ['#EF2B2D', '#FFFFFF', '#002868'] },
  { name: 'Oman', code: 'om', ratio: '4:7', svgFile: 'oman.svg', hints: [], colors: ['#DB161B', '#FFFFFF', '#008000'] },
  { name: 'Pakistan', code: 'pk', ratio: '2:3', svgFile: 'pakistan.svg', hints: [], colors: ['#01411C', '#FFFFFF'] },
  { name: 'Palau', code: 'pw', ratio: '5:8', svgFile: 'palau.svg', hints: [], colors: ['#4AADD6', '#FFDE00'] },
  { name: 'Palestine', code: 'ps', ratio: '1:2', svgFile: 'palestine.svg', hints: [], colors: ['#000000', '#FFFFFF', '#007A3D', '#CE1126'] },
  { name: 'Panama', code: 'pa', ratio: '2:3', svgFile: 'panama.svg', hints: [], colors: ['#FFFFFF', '#005293', '#D21034'] },
  { name: 'Papua New Guinea', code: 'pg', ratio: '3:4', svgFile: 'papua_new_guinea.svg', hints: [], colors: ['#CE1126', '#000000', '#FCD116', '#FFFFFF'] },
  { name: 'Paraguay', code: 'py', ratio: '11:20', svgFile: 'paraguay.svg', hints: [], colors: ['#D52B1E', '#FFFFFF', '#0038A8'] },
  { name: 'Peru', code: 'pe', ratio: '2:3', svgFile: 'peru.svg', hints: [], colors: ['#D91023', '#FFFFFF'] },
  { name: 'Philippines', code: 'ph', ratio: '1:2', svgFile: 'philippines.svg', hints: [], colors: ['#0038A8', '#CE1126', '#FFFFFF', '#FCD116'] },
  { name: 'Poland', code: 'pl', ratio: '5:8', svgFile: 'poland.svg', hints: [], colors: ['#FFFFFF', '#DC143C'] },
  { name: 'Portugal', code: 'pt', ratio: '2:3', svgFile: 'portugal.svg', hints: [], colors: ['#006600', '#FF0000', '#FFFF00', '#FFFFFF', '#003399'] },
  { name: 'Qatar', code: 'qa', ratio: '6:25', svgFile: 'qatar.svg', hints: [], colors: ['#8A1538', '#FFFFFF'] },
  { name: 'Republic of the Congo', code: 'cg', ratio: '2:3', svgFile: 'republic_of_the_congo.svg', hints: [], colors: ['#009543', '#FBDE4A', '#DC241F'] },
  { name: 'Romania', code: 'ro', ratio: '2:3', svgFile: 'romania.svg', hints: [], colors: ['#002B7F', '#FCD116', '#CE1126'] },
  { name: 'Russia', code: 'ru', ratio: '2:3', svgFile: 'russia.svg', hints: [], colors: ['#FFFFFF', '#0039A6', '#D52B1E'] },
  { name: 'Rwanda', code: 'rw', ratio: '2:3', svgFile: 'rwanda.svg', hints: [], colors: ['#00A1DE', '#E5BE01', '#20603D', '#FAD201'] },
  { name: 'Saint Kitts and Nevis', code: 'kn', ratio: '2:3', svgFile: 'saint_kitts_and_nevis.svg', hints: [], colors: ['#009E49', '#FCD116', '#000000', '#FFFFFF', '#CE1126'] },
  { name: 'Saint Lucia', code: 'lc', ratio: '1:2', svgFile: 'saint_lucia.svg', hints: [], colors: ['#6CCEDD', '#FFFFFF', '#000000', '#FCD116'] },
  { name: 'Saint Vincent and the Grenadines', code: 'vc', ratio: '2:3', svgFile: 'saint_vincent_and_the_grenadines.svg', hints: [], colors: ['#0072C6', '#FCD116', '#009E60'] },
  { name: 'Samoa', code: 'ws', ratio: '1:2', svgFile: 'samoa.svg', hints: [], colors: ['#CE1126', '#002B7F', '#FFFFFF'] },
  { name: 'San Marino', code: 'sm', ratio: '3:4', svgFile: 'san_marino.svg', hints: [], colors: ['#FFFFFF', '#5EB6E4'] },
  { name: 'Saudi Arabia', code: 'sa', ratio: '2:3', svgFile: 'saudi_arabia.svg', hints: [], colors: ['#006C35', '#FFFFFF'] },
  { name: 'Senegal', code: 'sn', ratio: '2:3', svgFile: 'senegal.svg', hints: [], colors: ['#00853F', '#FDEF42', '#E31B23'] },
  { name: 'Serbia', code: 'rs', ratio: '2:3', svgFile: 'serbia.svg', hints: [], colors: ['#C6363C', '#0C4076', '#FFFFFF', '#EDB92E'] },
  { name: 'Seychelles', code: 'sc', ratio: '1:2', svgFile: 'seychelles.svg', hints: [], colors: ['#003F87', '#FCD856', '#D62828', '#FFFFFF', '#007A3D'] },
  { name: 'Sierra Leone', code: 'sl', ratio: '2:3', svgFile: 'sierra_leone.svg', hints: [], colors: ['#1EB53A', '#FFFFFF', '#0072C6'] },
  { name: 'Singapore', code: 'sg', ratio: '2:3', svgFile: 'singapore.svg', hints: [], colors: ['#EF3340', '#FFFFFF'] },
  { name: 'Slovakia', code: 'sk', ratio: '2:3', svgFile: 'slovakia.svg', hints: [], colors: ['#FFFFFF', '#0B4EA2', '#EE1C25'] },
  { name: 'Slovenia', code: 'si', ratio: '1:2', svgFile: 'slovenia.svg', hints: [], colors: ['#FFFFFF', '#0000FF', '#FF0000', '#FFDF00'] },
  { name: 'Solomon Islands', code: 'sb', ratio: '1:2', svgFile: 'solomon_islands.svg', hints: [], colors: ['#0051BA', '#FCD116', '#215B33', '#FFFFFF'] },
  { name: 'Somalia', code: 'so', ratio: '2:3', svgFile: 'somalia.svg', hints: [], colors: ['#4189DD', '#FFFFFF'] },
  { name: 'Somaliland', code: 'sl_sh', ratio: '1:2', svgFile: 'somaliland.svg', hints: [], colors: ['#12AD2B', '#FFFFFF', '#000000', '#CE1126'] },
  { name: 'South Africa', code: 'za', ratio: '2:3', svgFile: 'south_africa.svg', hints: [], colors: ['#E03C31', '#FFFFFF', '#007749', '#000000', '#FFB81C', '#002395'] },
  { name: 'South Korea', code: 'kr', ratio: '2:3', svgFile: 'south_korea.svg', hints: [], colors: ['#FFFFFF', '#000000', '#C60C30', '#003478'] },
  { name: 'South Ossetia', code: 'os', ratio: '1:2', svgFile: 'south_ossetia.svg', hints: [], colors: ['#FFFFFF', '#D21034', '#FFCE00'] },
  { name: 'South Sudan', code: 'ss', ratio: '1:2', svgFile: 'south_sudan.svg', hints: [], colors: ['#000000', '#FFFFFF', '#DA121A', '#078930', '#0F47AF', '#FCDD09'] },
  { name: 'Spain', code: 'es', ratio: '2:3', svgFile: 'spain.svg', hints: [], colors: ['#AA151B', '#F1BF00'] },
  { name: 'Sri Lanka', code: 'lk', ratio: '1:2', svgFile: 'sri_lanka.svg', hints: [], colors: ['#FFBE29', '#8D153A', '#00534E', '#FF8C00'] },
  { name: 'Sudan', code: 'sd', ratio: '1:2', svgFile: 'sudan.svg', hints: [], colors: ['#D21034', '#FFFFFF', '#000000', '#007229'] },
  { name: 'Suriname', code: 'sr', ratio: '2:3', svgFile: 'suriname.svg', hints: [], colors: ['#377E3F', '#FFFFFF', '#B40A2D', '#ECC81D'] },
  { name: 'Sweden', code: 'se', ratio: '5:8', svgFile: 'sweden.svg', hints: [], colors: ['#006AA7', '#FECC00'] },
  { name: 'Switzerland', code: 'ch', ratio: '1:1', svgFile: 'switzerland.svg', hints: [], colors: ['#D52B1E', '#FFFFFF'] },
  { name: 'Syria', code: 'sy', ratio: '2:3', svgFile: 'syria.svg', hints: [], colors: ['#CE1126', '#FFFFFF', '#000000', '#007A3D'] },
  { name: 'São Tomé and Príncipe', code: 'st', ratio: '1:2', svgFile: 'são_tomé_and_príncipe.svg', hints: [], colors: ['#12AD2B', '#FFCE00', '#D21034', '#000000'] },
  { name: 'Taiwan', code: 'tw', ratio: '2:3', svgFile: 'taiwan.svg', hints: [], colors: ['#FE0000', '#000095', '#FFFFFF'] },
  { name: 'Tajikistan', code: 'tj', ratio: '1:2', svgFile: 'tajikistan.svg', hints: [], colors: ['#CC0000', '#FFFFFF', '#006600', '#F8C300'] },
  { name: 'Tanzania', code: 'tz', ratio: '2:3', svgFile: 'tanzania.svg', hints: [], colors: ['#1EB53A', '#FCD116', '#000000', '#00A3DD'] },
  { name: 'Thailand', code: 'th', ratio: '2:3', svgFile: 'thailand.svg', hints: [], colors: ['#A51931', '#F4F5F8', '#2D2A4A'] },
  { name: 'The Gambia', code: 'gm', ratio: '2:3', svgFile: 'the_gambia.svg', hints: [], colors: ['#CE1126', '#FFFFFF', '#0C1C8C', '#3A7728'] },
  { name: 'Timor-Leste', code: 'tl', ratio: '1:2', svgFile: 'timor-leste.svg', hints: [], colors: ['#DC241F', '#FFC726', '#000000', '#FFFFFF'] },
  { name: 'Togo', code: 'tg', ratio: '223:362', svgFile: 'togo.svg', hints: [], colors: ['#006A4E', '#FFCE00', '#D21034', '#FFFFFF'] },
  { name: 'Tonga', code: 'to', ratio: '1:2', svgFile: 'tonga.svg', hints: [], colors: ['#C10000', '#FFFFFF'] },
  { name: 'Transnistria', code: 'tr_pmr', ratio: '1:2', svgFile: 'transnistria.svg', hints: [], colors: ['#CC0000', '#007A33', '#F7D311', '#FFFFFF'] },
  { name: 'Trinidad and Tobago', code: 'tt', ratio: '3:5', svgFile: 'trinidad_and_tobago.svg', hints: [], colors: ['#DA1A35', '#FFFFFF', '#000000'] },
  { name: 'Tunisia', code: 'tn', ratio: '2:3', svgFile: 'tunisia.svg', hints: [], colors: ['#E70013', '#FFFFFF'] },
  { name: 'Turkey', code: 'tr', ratio: '2:3', svgFile: 'turkey.svg', hints: [], colors: ['#E30A17', '#FFFFFF'] },
  { name: 'Turkmenistan', code: 'tm', ratio: '2:3', svgFile: 'turkmenistan.svg', hints: [], colors: ['#00853F', '#FFFFFF', '#D22630', '#FFC72C'] },
  { name: 'Tuvalu', code: 'tv', ratio: '1:2', svgFile: 'tuvalu.svg', hints: [], colors: ['#5B92E5', '#FCD116', '#012169', '#FFFFFF', '#C8102E'] },
  { name: 'Uganda', code: 'ug', ratio: '2:3', svgFile: 'uganda.svg', hints: [], colors: ['#000000', '#FCDC04', '#D90000', '#FFFFFF'] },
  { name: 'Ukraine', code: 'ua', ratio: '2:3', svgFile: 'ukraine.svg', hints: [], colors: ['#005BBB', '#FFD500'] },
  { name: 'United Arab Emirates', code: 'ae', ratio: '1:2', svgFile: 'united_arab_emirates.svg', hints: [], colors: ['#00732F', '#FFFFFF', '#000000', '#FF0000'] },
  { name: 'United Kingdom', code: 'gb', ratio: '3:5', svgFile: 'united_kingdom.svg', hints: [], colors: ['#012169', '#FFFFFF', '#C8102E'] },
  { name: 'United States', code: 'us', ratio: '10:19', svgFile: 'united_states.svg', hints: [], colors: ['#B22234', '#FFFFFF', '#3C3B6E'] },
  { name: 'Uruguay', code: 'uy', ratio: '2:3', svgFile: 'uruguay.svg', hints: [], colors: ['#FFFFFF', '#0038A8', '#FCD116'] },
  { name: 'Uzbekistan', code: 'uz', ratio: '1:2', svgFile: 'uzbekistan.svg', hints: [], colors: ['#0099B5', '#FFFFFF', '#1EB53A', '#CE1126'] },
  { name: 'Vanuatu', code: 'vu', ratio: '3:5', svgFile: 'vanuatu.svg', hints: [], colors: ['#000000', '#D21034', '#009543', '#FDCE12'] },
  { name: 'Vatican City', code: 'va', ratio: '1:1', svgFile: 'vatican_city.svg', hints: [], colors: ['#FFE000', '#FFFFFF', '#CE2B37'] },
  { name: 'Venezuela', code: 've', ratio: '2:3', svgFile: 'venezuela.svg', hints: [], colors: ['#FCE22A', '#003DA5', '#CF142B', '#FFFFFF'] },
  { name: 'Vietnam', code: 'vn', ratio: '2:3', svgFile: 'vietnam.svg', hints: [], colors: ['#DA251D', '#FFFF00'] },
  { name: 'Western Sahara', code: 'eh', ratio: '1:2', svgFile: 'western_sahara.svg', hints: [], colors: ['#000000', '#FFFFFF', '#007A3D', '#CE1126', '#FCD116'] },
  { name: 'Yemen', code: 'ye', ratio: '2:3', svgFile: 'yemen.svg', hints: [], colors: ['#CE1126', '#FFFFFF', '#000000'] },
  { name: 'Zambia', code: 'zm', ratio: '2:3', svgFile: 'zambia.svg', hints: [], colors: ['#198A00', '#EF7D00', '#000000', '#DE2010'] },
  { name: 'Zimbabwe', code: 'zw', ratio: '1:2', svgFile: 'zimbabwe.svg', hints: [], colors: ['#006400', '#FFD200', '#D40000', '#000000', '#FFFFFF', '#FFCC00'] },
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
