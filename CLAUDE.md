# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200 (auto-reloads)
npm run build      # Production build → dist/
npm run watch      # Dev build with watch mode
npm test           # Unit tests via Karma/Jasmine
```

Run a single test file by passing `--include` to Karma, or focus tests with `fdescribe`/`fit` in the spec file.

Set `CHROME_BIN=/snap/bin/chromium` if Chrome is not found automatically (Linux/snap environments).

To download/refresh flag SVGs: `python3 scripts/download_flags.py` (requires `requests` + `bs4`; 20 s delay between downloads; resumes if interrupted).

## Architecture

**flag-draws** is an Angular 19 standalone-component app where users draw country flags from memory and receive a pixel-similarity score. Only flags made purely of rectangular bands are used as game countries.

### Game flow (route order)

1. `/` — `HomeComponent`: pick difficulty (easy/medium/hard), call `GameStateService.startGame()`
2. `/game` — `GameComponent`: applies difficulty hints in `ngAfterViewInit()` (bands/cross on `splitsCanvas`, elements auto-placed on `elementsCanvas`); on easy restricts colour picker to a **shuffled** copy of `country.colors` and pre-selects the first shuffled colour; toolbar shows "↩️ Cancel Changes" on easy/medium (clears canvas then re-applies hints) and "🗑️ Clear" on hard; Elements picker is only shown on hard; on submit stores the data URL in `GameStateService` and navigates to `/compare`
3. `/compare` — `CompareComponent`: on init calls `ScoringService.computeScore()` which loads the local SVG from `/flags/${svgFile}`, renders both images onto off-screen canvases, and computes a pixel-match percentage (tolerance = 60/255 per channel); stores `RoundScore` in `GameStateService`, then routes to `/game` (next round) or `/end`
4. `/end` — `EndComponent`: shows each round as a card with the user's drawing alongside the real flag

All routes use lazy-loaded standalone components (`loadComponent`).

### Country & flag data

`Country` interface (`country.service.ts`):
```ts
{ name: string; code: string; ratio: string; svgFile: string; hints: DrawingHint[]; colors: string[] }
```
- `ratio` — Wikipedia height:width format, e.g. `"2:3"` means height=2, width=3
- `svgFile` — filename inside `public/flags/`, e.g. `"france.svg"`
- `hints` — pre-drawn guide structures rendered on easy/medium difficulty
- `colors` — hex palette for that flag; shown as restricted picker on easy difficulty

**Hint types** (union `DrawingHint`, all in `country.service.ts`):
- `BandHint` — `{ kind: 'bands'; direction: 'horizontal'|'vertical'; ratios: number[] }` — split guide lines
- `CrossHint` — `{ kind: 'cross'; variant: 'simple'|'double'; widthRatios: number[]; heightRatios: number[] }` — Nordic cross guide lines
- `CrossOutlineHint` — `{ kind: 'crossOutline'; widthRatios: number[]; heightRatios: number[] }` — filled plus-sign on baseCanvas (e.g. Switzerland)
- `ElementHint` — `{ kind: 'element'; elementId: string; xCenter: number; yCenter: number; sizeFraction: number; color?: string }` — auto-placed SVG stamp

SVG flags live in `public/flags/` (served as static assets). The download script writes them to `scripts/flags/` first; copy with `cp scripts/flags/*.svg public/flags/`.

### Canvas sizing

`CANVAS_HEIGHT = 400` is the fixed pixel height (exported from `drawing-canvas.ts`).  
`canvasWidth` is a `computed()` signal: `CANVAS_HEIGHT × w / h` derived from the country ratio string.  
This means the canvas is always 400 px tall and as wide as the flag's proportions require (e.g. 800 px for 1:2 flags, 600 px for 2:3 flags).

### State management

`GameStateService` (singleton, `providedIn: 'root'`) holds all game state as Angular signals:
- `difficulty`, `currentCountry`, `queue`, `drawingDataUrl`, `drawingWidth`, `drawingHeight`, `roundScores`
- `isGameOver`, `averageScore`, `overallGrade` are computed signals
- `RoundScore` carries `country`, `code`, `score`, `grade`, `drawingDataUrl`, `svgFile`, and `ratio` so the end screen can display each drawing alongside the real flag

No persistence — state resets on page refresh.

### Drawing canvas — four stacked canvases

`DrawingCanvasComponent` (`drawing/drawing-canvas.ts`) uses four `position: absolute` canvases stacked in order:

| Canvas | Purpose | Included in submission |
|---|---|---|
| `baseCanvas` | User's flood-fill drawings | ✅ yes |
| `splitsCanvas` | Guide lines from splits/cross tools | ❌ no |
| `elementsCanvas` | SVG element stamps (above fill layer) | ✅ yes |
| `overlayCanvas` | Element placement preview + mouse events | ❌ no |

- **Flood fill** — clicking the canvas flood-fills the clicked region. If the clicked pixel has alpha > 0 on `elementsCanvas`, `recolorElement()` finds the topmost `PlacedElement` by bounding box, updates its stored color, clears `elementsCanvas`, and redraws all elements from SVG source (preserving quality). Otherwise `floodFill()` fills `baseCanvas` using `splitsCanvas` alpha as boundaries. `color: input<string>` supplies the fill colour.
- `placedElements` — private array tracking every element stamped on `elementsCanvas` (element ref, color, fractional position/size). Populated by `placeElementDirectly` and interactive placement; cleared by `clearCanvas()`.
- `getDrawingDataUrl()` composites `baseCanvas` then `elementsCanvas` onto an off-screen canvas for export.
- `clearCanvas()` resets all four canvases.
- `applyHints(hints[])` — called by `GameComponent.ngAfterViewInit()` on easy/medium; dispatches to `applySplits` / `applyNordicCross` / `drawCrossOutline` / `placeElementDirectly`.
- `applyNordicCross(config)` — draws cross guide lines on `splitsCanvas` using symmetric skip logic to preserve flood-fill regions.
- `drawCrossOutline(widthRatios, heightRatios)` — paints a filled plus-sign directly on `baseCanvas` (used for Switzerland-style crosses, not guide lines).
- `placeElementDirectly(element, color, xCenter, yCenter, sizeFraction)` — auto-stamps an SVG element on `elementsCanvas` without user interaction.
- `startElementPlacement(element, size, color)` / `cancelPlacement()` — enter/exit interactive placement mode; sets `isPlacingElement` signal and uses `overlayCanvas` for preview; on confirm, stamps onto `elementsCanvas`.
- `isPlacingElement: Signal<boolean>` — true while the user is interactively placing an element.
- `placementCancelled: output<void>()` — emitted when placement is cancelled via Escape or `cancelPlacement()`.

### Tools (toolbar.ts)

There are no freehand drawing tools. Clicking the canvas always flood-fills the clicked region with the active colour. Bands, crosses, and SVG stamps are added via the **Elements modal** (hard mode only).

The toolbar exposes: colour picker (or restricted palette when `allowedColors` is set), optionally the Elements button, and a Clear/Cancel button.

**Types exported from `toolbar.ts`:** `SplitDirection`, `SplitConfig`, `CrossVariant`, `CrossConfig`.

`ToolbarComponent` inputs:
- `activeColor: input.required<string>`
- `allowedColors: input<string[] | null>` — replaces the free colour picker with a fixed palette when non-null
- `clearLabel: input<string>` — defaults to `'🗑️ Clear'`; `GameComponent` sets `'↩️ Cancel Changes'` on easy/medium
- `showElements: input<boolean>` — defaults to `true`; `GameComponent` sets `false` on easy/medium so the Elements button is hidden

### Elements modal

`ElementsModalComponent` (`drawing/elements-modal.ts`) handles three item kinds:

- **`'element'`** — SVG stamp; interactive placement via `startElementPlacement()`, or auto-placed via `placeElementDirectly()` when an `autoPlace` config is defined
- **`'band'`** — horizontal or vertical split guide lines applied via `applySplits(direction, ratios)`
- **`'cross'`** — Nordic cross guide lines applied via `applyNordicCross(config)`

Outputs: `elementSelected: ElementSelection`, `splitsSelected: SplitConfig`, `crossSelected: CrossConfig`, `closed`.  
`FLAG_ELEMENTS` in `flag-elements.ts` currently contains:
- **Canada maple leaf** (`id: 'canada-maple-leaf'`, category `plants`, `autoPlace` for easy/medium)
- **Albania eagle** (`id: 'albania-eagle'`, category `coat_of_arms`, `autoPlace` for easy/medium)

Add further entries there to expand the elements library.

`FlagElement` in `flag-elements.ts` has an optional `autoPlace: { xCenter, yCenter, sizeFraction }` field — when present, easy/medium modes stamp the element automatically via `placeElementDirectly()` rather than waiting for user interaction.

### Scoring

`ScoringService.computeScore(userDataUrl, svgFile, width, height)` loads `/flags/${svgFile}`, draws it onto an off-screen canvas at the submitted pixel dimensions, and computes a per-channel pixel-match score (0–100).

### Grading

`scoreToGrade()` in `game-state.service.ts` maps 0–100 → A/B/C/D/F. Exported and used by both `GameStateService` and `CompareComponent`.

## Testing

Every service, component, and utility has a corresponding `*.spec.ts` file. **337 tests** covering all methods and behaviours. Run with `npm test`.

### Spec file locations

| Spec file | What it covers |
|---|---|
| `services/country.service.spec.ts` | `getCountries()`, `shuffle()` |
| `services/game-state.service.spec.ts` | `scoreToGrade()`, all signals, all methods |
| `services/scoring.service.spec.ts` | Pixel tolerance, error handling, URL construction |
| `home/home.spec.ts` | Difficulty selection, `startGame()` navigation |
| `game/game.spec.ts` | Signal defaults, color/modal handlers, `allowedColors`, `clearLabel`, `showElements`, hint application, `submit()` |
| `compare/compare.spec.ts` | Redirect guard, scoring flow, `getScoreMessage()`, navigation |
| `end/end.spec.ts` | `gradeColor()`, `aspectRatio()`, `playAgain()` |
| `drawing/toolbar.spec.ts` | `clearLabel`, `showElements` inputs, `colorChange`, `clearCanvas` outputs |
| `drawing/elements-modal.spec.ts` | Category filter, band/cross config, `updateRatio()` clamping, OK/close |
| `drawing/drawing-canvas.spec.ts` | Canvas dimensions, split/cross boundaries, element placement, mouse events |

### Testing patterns

- **Services with async image loading** (`ScoringService`): replace `window.Image` with a mock class whose `set src` calls `queueMicrotask(() => this.onload?.())`. Also spy on `CanvasRenderingContext2D.prototype.drawImage` and `.getImageData` to control pixel data without loading real images.
- **Components with `Router`**: provide with `provideRouter([])` + `provideLocationMocks()`, then `spyOn(router, 'navigate')`.
- **Signal inputs** (`input.required<T>()`): set via `fixture.componentRef.setInput('name', value)` before `detectChanges()`.
- **Signal outputs** (`output<T>()`): subscribe directly — `component.myOutput.subscribe(spy)`.
- **Private canvas methods** (`floodFill`, `recolorElement`, `redrawAllElements`, `hexToRgba`, `colorMatch`): call via `(component as any).methodName()`.
