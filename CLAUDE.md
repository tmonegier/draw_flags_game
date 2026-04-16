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

To regenerate the world map: `python3 scripts/build_world_map.py` (reads `scripts/world.geojson`, writes `public/world-map.svg`). The map uses an equirectangular projection on a 1000×500 canvas; each `<path>` carries `data-code="<iso2>"` matching `country.service.ts` codes.

## Architecture

**flag-draws** is an Angular 19 standalone-component app where users draw country flags from memory and receive a pixel-similarity score. Only flags made purely of rectangular bands are used as game countries.

### Game flow (route order)

Difficulty levels are `'easy' | 'hard' | 'free'` (the old `medium` tier was removed).

1. `/` — `HomeComponent`: pick difficulty (easy/hard/free), call `GameStateService.startGame()`; if the tutorial for that difficulty has not been seen, `showTutorial` is set and `TutorialModalComponent` is shown before navigating; on close `markTutorialSeen()` writes `tutorial-seen-{difficulty}=1` to localStorage and navigates to `/game`. The Free page also exposes an **Explore the World** button that routes to `/explore` (see below).
1a. `/explore` — `ExploreComponent`: loads `public/world-map.svg` via `fetch`, injects it into a container (with `ViewEncapsulation.None` so CSS reaches the `<path>` children), tags paths whose `data-code` appears in `CountryService.getFreeModeCountries()` with the `drawable` class; click delegation on the container reads `data-code` off the target, sets difficulty to `'free'`, and routes to `/game/:code` so the user draws that flag as a single-country round.
2. `/game` (or `/game/:countryCode` — e.g. `/game/fr` — to jump directly to a specific country by its ISO 2-letter `code` from `country.service.ts`; handy for testing a single flag without cycling through the queue) — `GameComponent`: applies difficulty hints in `ngAfterViewInit()` (bands/cross on `splitsCanvas`, elements auto-placed on `elementsCanvas`); restricts colour picker to a **shuffled** copy of `country.colors` and pre-selects the first shuffled colour; toolbar `clearMode` is `'cancel'` on easy (restores hints) and `'clear'` on hard/free (full wipe); Elements picker is only shown on hard; pen mode and pen-size slider are shown on free mode; on submit stores the data URL in `GameStateService` and navigates to `/compare`
3. `/compare` — `CompareComponent`: on init calls `ScoringService.computeScore()` which loads the local SVG via `getFlagUrl(svgFile)`, renders both images onto off-screen canvases, and computes a pixel-match score on the 0–`SCORE_SCALE` (1000) range using `PIXEL_TOLERANCE` (60/255 per channel) from `scoring-config.ts`; pixels matching the unfilled canvas grey never count as matches; stores `RoundScore` in `GameStateService`, then routes to `/game` (next round) or `/end`. On scoring failure (image load error, etc.) the promise rejects, the component surfaces `scoringError` in a red banner, and a 0/F round is recorded so the user can move on.
4. `/end` — `EndComponent`: shows each round as a card with the user's drawing alongside the real flag. Offers **Play Again** (restarts `gameState.startGame(difficulty())` → `/game`, keeping the same mode) and **Home** (→ `/`).

All routes use lazy-loaded standalone components (`loadComponent`).

### Country & flag data

`Country` interface (`country.service.ts`):
```ts
{ name: string; code: string; ratio: string; svgFile: string; hints: DrawingHint[]; colors: string[] }
```
- `ratio` — Wikipedia height:width format, e.g. `"2:3"` means height=2, width=3
- `svgFile` — filename inside `public/flags/`, e.g. `"france.svg"`
- `hints` — pre-drawn guide structures rendered on easy difficulty
- `colors` — hex palette for that flag; shown as a restricted picker on every difficulty

**Hint types** (union `DrawingHint`, all in `country.service.ts`):
- `BandHint` — `{ kind: 'bands'; direction: 'horizontal'|'vertical'; ratios: number[] }` — split guide lines
- `CrossHint` — `{ kind: 'cross'; variant: 'simple'|'double'; widthRatios: number[]; heightRatios: number[] }` — Nordic cross guide lines
- `CrossOutlineHint` — `{ kind: 'crossOutline'; widthRatios: number[]; heightRatios: number[] }` — filled plus-sign on baseCanvas (e.g. Switzerland)
- `ElementHint` — `{ kind: 'element'; elementId: string; color: string; xCenter: number; yCenter: number; sizeFraction: number }` — auto-placed SVG stamp

SVG flags live in `public/flags/` (served as static assets). The download script writes them to `scripts/flags/` first; copy with `cp scripts/flags/*.svg public/flags/`.

### Canvas sizing

`CANVAS_HEIGHT = 400` is the fixed pixel height (exported from `drawing-canvas.ts`).
Both `canvasHeight` and `canvasWidth` are exposed as readonly signals so call sites
always invoke them: `canvasHeight()` returns `CANVAS_HEIGHT`, and `canvasWidth()`
is a computed signal returning `CANVAS_HEIGHT × w / h` derived from the country
ratio string. The canvas is always 400 px tall and as wide as the flag's
proportions require (e.g. 800 px for 1:2 flags, 600 px for 2:3 flags).

### State management

`GameStateService` (singleton, `providedIn: 'root'`, injects `CountryService`) holds all game state as Angular signals:
- `difficulty`, `currentCountry`, `queue`, `drawingDataUrl`, `drawingWidth`, `drawingHeight`, `roundScores`
- `isGameOver`, `averageScore`, `overallGrade` are computed signals
- `RoundScore` is `{ country: Country; score: number; grade: Grade; drawingDataUrl: string }` — the full Country is embedded (no field copies), and `grade` is the `Grade` union from `scoring-config.ts`

No persistence — state resets on page refresh.

### Scoring config (`src/app/scoring-config.ts`)

Single source of truth for grading constants:
- `SCORE_SCALE = 1000` (scoring service multiplies the pixel-match ratio by this)
- `PIXEL_TOLERANCE = 60` (per-channel)
- `GRADE_THRESHOLDS` — ordered table mapping `Grade` → minimum score (A≥900, B≥700, C≥500, D≥300, F≥0); `scoreToGrade()` walks it
- `GRADE_COLORS` — palette consumed by `GradeColorPipe`
- `SCORE_MESSAGES` — ordered table of (min → message) consumed by `compare.scoreMessage`

All threshold tests (`compare.spec.ts`, `game-state.service.spec.ts`) iterate these tables, so a future rescale only edits this file.

### Utilities (`src/app/utils/`)

- `ratio.ts` — `parseRatio()`, `ratioToCssAspect()`, `ratioToPositions()`
- `aspect-ratio.pipe.ts` — `AspectRatioPipe` (h:w → CSS w/h)
- `flag-url.ts` + `flag-url.pipe.ts` — `getFlagUrl()` and `FlagUrlPipe` for `/flags/${file}` URLs
- `grade-color.pipe.ts` — `GradeColorPipe` for `Grade` → CSS colour
- `canvas-pixels.ts` — pure pixel helpers (`floodFillPixels`, `colorMatch`, `hexToRgba`, `getPixelColor`, `setPixelColor`); unit-tested without canvas mocks

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
- `applyHints(hints[])` — called by `GameComponent.ngAfterViewInit()` on easy mode; dispatches to `applySplits` / `applyNordicCross` / `drawCrossOutline` / `placeElementDirectly`.
- Element redraws are guarded by an internal `redrawGeneration` counter so stale `Image.onload` callbacks from older recolour cycles can't paint over a fresher render.
- `applyNordicCross(config)` — draws cross guide lines on `splitsCanvas` using symmetric skip logic to preserve flood-fill regions.
- `drawCrossOutline(widthRatios, heightRatios)` — paints a filled plus-sign directly on `baseCanvas` (used for Switzerland-style crosses, not guide lines).
- `placeElementDirectly(element, color, xCenter, yCenter, sizeFraction)` — auto-stamps an SVG element on `elementsCanvas` without user interaction.
- `startElementPlacement(element, size, color)` / `cancelPlacement()` — enter/exit interactive placement mode; sets `isPlacingElement` signal and uses `overlayCanvas` for preview; on confirm, stamps onto `elementsCanvas`.
- `isPlacingElement: Signal<boolean>` — true while the user is interactively placing an element.
- `placementCancelled: output<void>()` — emitted when placement is cancelled via Escape or `cancelPlacement()`.

### Tutorial modal

`TutorialModalComponent` (`home/tutorial-modal.ts`) is a multi-step onboarding modal shown once per difficulty.

- **Inputs:** `difficulty: input.required<Difficulty>()`, `isOpen: input<boolean>(false)`
- **Output:** `closed: output<void>()`
- **Flow:** Opens on a confirmation screen; user can skip (closes immediately) or start the walkthrough. Steps are defined per-difficulty in the `STEPS` constant. Navigating past the last step emits `closed`.
- **Integration:** `HomeComponent.startGame()` checks `localStorage.getItem('tutorial-seen-{difficulty}')`. If `null`, sets `showTutorial` signal to show the modal; otherwise navigates straight to `/game`. On `(closed)`, `onTutorialClosed()` calls `markTutorialSeen()` (writes `'1'`) then navigates to `/game`.

### Tools (toolbar.ts)

There are no freehand drawing tools. Clicking the canvas always flood-fills the clicked region with the active colour. Bands, crosses, and SVG stamps are added via the **Elements modal** (hard mode only).

The toolbar exposes: colour picker (or restricted palette when `allowedColors` is set), optionally the Elements button, and a Clear/Cancel button.

**Types exported from `toolbar.ts`:** `SplitDirection`, `SplitConfig`, `CrossVariant`, `CrossConfig`.

`ToolbarComponent` inputs:
- `activeColor: input.required<string>`
- `allowedColors: input<string[] | null>` — replaces the free colour picker with a fixed palette when non-null
- `clearMode: input<'clear' | 'cancel'>` — defaults to `'clear'`; `GameComponent` passes `'cancel'` on easy. The toolbar maps the mode to the displayed label ("🗑️ Clear" / "↩️ Cancel Changes") via its internal `CLEAR_LABELS` table — callers don't ship presentation strings.
- `showElements: input<boolean>` — defaults to `true`; `GameComponent` sets `false` outside hard mode so the Elements button is hidden

### Elements modal

`ElementsModalComponent` (`drawing/elements-modal.ts`) handles three item kinds:

- **`'element'`** — SVG stamp; interactive placement via `startElementPlacement()`, or auto-placed via `placeElementDirectly()` when an `autoPlace` config is defined
- **`'band'`** — horizontal or vertical split guide lines applied via `applySplits(direction, ratios)`
- **`'cross'`** — Nordic cross guide lines applied via `applyNordicCross(config)`

Outputs: `elementSelected: ElementSelection`, `splitsSelected: SplitConfig`, `crossSelected: CrossConfig`, `closed`.  
`FLAG_ELEMENTS` in `flag-elements.ts` currently contains (all have `autoPlace` for easy mode):

| ID | Category |
|---|---|
| `morocco-star` | `symbols` |
| `algeria-crescent-star` | `symbols` |
| `tunisia-crescent-star` | `symbols` |
| `turkey-crescent-star` | `symbols` |
| `slovenia-coat-of-arms` | `coat_of_arms` |
| `slovakia-coat-of-arms` | `coat_of_arms` |
| `canada-maple-leaf` | `plants` |
| `albania-eagle` | `coat_of_arms` |
| `vietnam-star` | `symbols` |
| `china-star` | `symbols` |
| `mongolia-soyombo` | `symbols` |
| `nepal-moon` | `symbols` |
| `nepal-sun` | `symbols` |
| `liechtenstein-crown` | `symbols` |
| `bhutan-dragon` | `symbols` |
| `vatican-coat-of-arms` | `coat_of_arms` |

Add further entries there to expand the elements library.

`FlagElement` in `flag-elements.ts` has an optional `autoPlace: { xCenter, yCenter, sizeFraction }` field — when present, easy mode stamps the element automatically via `placeElementDirectly()` rather than waiting for user interaction.

### Scoring

`ScoringService.computeScore(userDataUrl, svgFile, width, height)` loads the flag via `getFlagUrl(svgFile)`, renders both images onto off-screen canvases at the submitted pixel dimensions, and computes a per-channel pixel-match score on the 0–`SCORE_SCALE` range (currently 0–1000) using `PIXEL_TOLERANCE`. The promise **rejects** (with a logged `Error`) on image load or canvas failures; consumers must `.catch()`.

### Grading

`scoreToGrade()` in `game-state.service.ts` maps a score to a `Grade` ('A'|'B'|'C'|'D'|'F') by walking `GRADE_THRESHOLDS` from `scoring-config.ts`. Exported and used by both `GameStateService` and `CompareComponent`.

## Testing

Every service, component, pipe, and utility has a corresponding `*.spec.ts` file. Run with `npm test`.

### Spec file locations

| Spec file | What it covers |
|---|---|
| `services/country.service.spec.ts` | `getCountries()`, `shuffle()` |
| `services/game-state.service.spec.ts` | `scoreToGrade()` boundary table, all signals/methods |
| `services/scoring.service.spec.ts` | Pixel tolerance, rejection on load/render failure, URL construction |
| `scoring-config.ts` | (constants — exercised indirectly via game-state and compare specs) |
| `home/home.spec.ts` | Difficulty selection, `startGame()` navigation, tutorial localStorage flow |
| `home/tutorial-modal.spec.ts` | Step navigation, skip/close, difficulty-specific steps |
| `game/game.spec.ts` | Signal defaults, color/modal handlers, `allowedColors`, `clearMode`, `showElements`, hint application, `submit()` |
| `compare/compare.spec.ts` | Redirect guard, scoring flow, `scoreMessage` boundary table, scoring-error path, destruction guard, navigation |
| `end/end.spec.ts` | `playAgain()`, `gameState` exposure |
| `explore/explore.spec.ts` | SVG injection, drawable class tagging, click → `/game/:code`, hover tooltip, fetch failure |
| `drawing/toolbar.spec.ts` | `clearMode`/`clearLabel`, `showElements` inputs, `colorChange`, `clearCanvas` outputs |
| `drawing/elements-modal.spec.ts` | Category filter, band/cross config, `updateRatio()` clamping, OK/close |
| `drawing/drawing-canvas.spec.ts` | Canvas dimensions, split/cross boundaries, element placement, mouse events |
| `utils/canvas-pixels.spec.ts` | `floodFillPixels`, `colorMatch`, `hexToRgba`, `getPixelColor`, `setPixelColor` |
| `utils/ratio.spec.ts` | `parseRatio`, `ratioToCssAspect`, `AspectRatioPipe` |
| `utils/flag-url.spec.ts` | `getFlagUrl`, `FlagUrlPipe` |
| `utils/grade-color.pipe.spec.ts` | `GradeColorPipe` |

### Testing patterns

- **Services with async image loading** (`ScoringService`): replace `window.Image` with a mock class whose `set src` calls `queueMicrotask(() => this.onload?.())`. Also spy on `CanvasRenderingContext2D.prototype.drawImage` and `.getImageData` to control pixel data without loading real images. Use `expectAsync(...).toBeRejectedWithError(...)` for the failure paths.
- **Components with `Router`**: provide with `provideRouter([])` + `provideLocationMocks()`, then `spyOn(router, 'navigate')`.
- **Signal inputs** (`input.required<T>()`): set via `fixture.componentRef.setInput('name', value)` before `detectChanges()`.
- **Signal outputs** (`output<T>()`): subscribe directly — `component.myOutput.subscribe(spy)`.
- **Threshold tests**: `compare.spec.ts` and `game-state.service.spec.ts` iterate `SCORE_MESSAGES` / `GRADE_THRESHOLDS` from `scoring-config.ts` so a future rescale doesn't churn dozens of `it()` calls.
