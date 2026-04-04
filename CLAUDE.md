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

To download/refresh flag SVGs: `python3 scripts/download_flags.py` (requires `requests` + `bs4`; 20 s delay between downloads; resumes if interrupted).

## Architecture

**flag-draws** is an Angular 19 standalone-component app where users draw country flags from memory and receive a pixel-similarity score. Only flags made purely of rectangular bands are used as game countries.

### Game flow (route order)

1. `/` — `HomeComponent`: pick difficulty (easy/medium/hard), call `GameStateService.startGame()`
2. `/game` — `GameComponent`: draw on a canvas whose ratio matches the current country's flag; on submit, stores the data URL in `GameStateService` and navigates to `/compare`
3. `/compare` — `CompareComponent`: on init calls `ScoringService.computeScore()` which loads the local SVG from `/flags/${svgFile}`, renders both images onto off-screen canvases, and computes a pixel-match percentage (tolerance = 60/255 per channel); stores `RoundScore` in `GameStateService`, then routes to `/game` (next round) or `/end`
4. `/end` — `EndComponent`: shows each round as a card with the user's drawing alongside the real flag

All routes use lazy-loaded standalone components (`loadComponent`).

### Country & flag data

`Country` interface (`country.service.ts`):
```ts
{ name: string; code: string; ratio: string; svgFile: string }
```
- `ratio` — Wikipedia height:width format, e.g. `"2:3"` means height=2, width=3
- `svgFile` — filename inside `public/flags/`, e.g. `"france.svg"`

SVG flags live in `public/flags/` (served as static assets). The download script writes them to `scripts/flags/` first; copy with `cp scripts/flags/*.svg public/flags/`.

### Canvas sizing

`CANVAS_HEIGHT = 400` is the fixed pixel height (exported from `drawing-canvas.ts`).  
`canvasWidth` is a `computed()` signal: `CANVAS_HEIGHT × w / h` derived from the country ratio string.  
This means the canvas is always 400 px tall and as wide as the flag's proportions require (e.g. 800 px for 1:2 flags, 600 px for 2:3 flags).

### State management

`GameStateService` (singleton, `providedIn: 'root'`) holds all game state as Angular signals:
- `difficulty`, `currentCountry`, `queue`, `drawingDataUrl`, `drawingWidth`, `drawingHeight`, `roundScores`
- `isGameOver`, `averageScore`, `overallGrade` are computed signals
- `RoundScore` carries `drawingDataUrl`, `svgFile`, and `ratio` so the end screen can display each drawing alongside the real flag

No persistence — state resets on page refresh.

### Drawing canvas — three stacked canvases

`DrawingCanvasComponent` (`drawing/drawing-canvas.ts`) uses three `position: absolute` canvases:

| Canvas | Purpose | Included in submission |
|---|---|---|
| `baseCanvas` | User's permanent drawings | ✅ yes |
| `splitsCanvas` | Guide lines from splits tool | ❌ no |
| `overlayCanvas` | Element placement preview + mouse events | ❌ no |

- **Flood fill** reads `baseCanvas` pixel data for colour matching but also reads `splitsCanvas` alpha to treat guide lines as boundaries. When the fill reaches a split-line pixel it paints it on `baseCanvas` (so no white gap appears after submission) but does not propagate through.
- `getDrawingDataUrl()` exports only `baseCanvas`.
- `clearCanvas()` resets all three canvases.

### Tools (toolbar.ts)

`DrawingTool = 'fill' | 'eraser'`

The toolbar exposes: tool buttons, colour picker, Elements button, Clear button.  
Splits / bands are configured inside the **Elements modal** (not the toolbar).

### Elements modal

`ElementsModalComponent` (`drawing/elements-modal.ts`) handles two item kinds:

- **`'element'`** — SVG stamp placed on the canvas at a fixed 80 px size via `startElementPlacement()`
- **`'band'`** — horizontal or vertical split lines applied via `applySplits(direction, ratios)`

Emits `elementSelected: ElementSelection` or `splitsSelected: SplitConfig` depending on which kind is confirmed with "OK!".  
`FLAG_ELEMENTS` in `flag-elements.ts` is currently empty; add entries there to populate the elements library.

### Scoring

`ScoringService.computeScore(userDataUrl, svgFile, width, height)` loads `/flags/${svgFile}`, draws it onto an off-screen canvas at the submitted pixel dimensions, and computes a per-channel pixel-match score (0–100).

### Grading

`scoreToGrade()` in `game-state.service.ts` maps 0–100 → A/B/C/D/F. Exported and used by both `GameStateService` and `CompareComponent`.
