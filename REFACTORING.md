# Refactoring Backlog

Tracking sheet for code-quality refactors. Update the **Status** column as work
progresses (`todo` → `in-progress` → `done`). Add the commit SHA when complete.

Status legend: `todo` · `in-progress` · `done` · `skipped`

## Critical

| # | Title | Status | Commit |
|---|---|---|---|
| 1 | Split `DrawingCanvasComponent` into focused services | todo | — |
| 2 | Deduplicate `toPositions()` inside `drawing-canvas.ts` | done | (pending) |
| 3 | Centralize ratio parsing + aspect-ratio helpers | done | (pending) |
| 4 | Inject `CountryService` into `GameStateService` (no `new`) | done | (pending) |

## High

| # | Title | Status | Commit |
|---|---|---|---|
| 5 | Centralize magic numbers (grade thresholds, scale, tolerance) | todo | — |
| 6 | Reshape `RoundScore` to compose `Country` instead of copying fields | todo | — |
| 7 | Parametrize grade-threshold tests against constants | todo | — |

## Medium

| # | Title | Status | Commit |
|---|---|---|---|
| 8 | Centralize flag asset URL building (`/flags/${file}`) | todo | — |
| 9 | Cache `getImageData()` to avoid per-click MB allocations | todo | — |

## Low

| # | Title | Status | Commit |
|---|---|---|---|
| 10 | Reduce `(component as any)` casts in canvas tests | todo | — |
| 11 | Unify aspect-ratio template usage between compare & end | done | (folded into #3) |

---

## Detail

### 1. Split `DrawingCanvasComponent`
**Files:** `src/app/drawing/drawing-canvas.ts` (~500 lines)
**Why:** SRP violation — flood-fill, element placement, hint rendering, pen,
mouse handling all tangled. Blocks future features (undo/redo, accessibility)
and forces tests to mock canvas APIs.
**Approach:** Extract `CanvasPixelService` (flood-fill, colour matching,
hex→rgba), then `CanvasElementService` (SVG stamping, recolour). Component
stays as thin orchestrator.
**Cost:** M (2–3 h).

### 2. Deduplicate `toPositions()`
**Files:** `src/app/drawing/drawing-canvas.ts:229` and `:280` (identical bodies).
**Why:** Same ratio→pixel-position helper duplicated inside the same file.
**Approach:** Promote to a single private method on the component.
**Cost:** S (15 min).

### 3. Centralize ratio parsing
**Files:** `drawing-canvas.ts:47`, `compare.ts:31`, `end.ts:21` plus tests.
**Why:** `split(':').map(Number)` is repeated; the h:w → CSS w/h transform is
in compare.ts and end.ts with subtly different APIs (getter vs method).
**Approach:** Add `src/app/utils/ratio.ts` with `parseRatio()` and
`ratioToCssAspect()`. Optionally an `AspectRatioPipe` for templates.
**Cost:** S (30 min).

### 4. Inject `CountryService`
**Files:** `src/app/services/game-state.service.ts:24`.
**Why:** `new CountryService()` bypasses Angular DI, blocks easy stubbing in
tests and prevents alternate implementations.
**Approach:** Switch to constructor / `inject()`; relies on existing
`providedIn: 'root'`.
**Cost:** S (20 min).

### 5. Centralize magic numbers
**Files:** `game-state.service.ts:14-19`, `compare.ts:81-84`,
`scoring.service.ts` (tolerance=60, scale=1000).
**Why:** Grade thresholds and the 0–1000 scale are duplicated; tests had to be
updated 10× during the recent rescale.
**Approach:** New `src/app/constants.ts` exporting `GRADE_THRESHOLDS`,
`SCORE_SCALE`, `PIXEL_TOLERANCE`, `GRADE_COLORS`.
**Cost:** S (45 min).

### 6. Reshape `RoundScore`
**Files:** `game-state.service.ts:4-12`, `compare.ts`, `end.html`.
**Why:** RoundScore copies `country`, `code`, `svgFile`, `ratio` from Country.
Schema desync risk.
**Approach:** `RoundScore { country: Country; score; grade; drawingDataUrl }`.
**Cost:** M (1 h).

### 7. Parametrize grade tests
**Files:** `compare.spec.ts:192-244`, `game-state.service.spec.ts:7-17`.
**Why:** ~10 hardcoded boundary cases per file; brittle to threshold changes.
**Approach:** Drive boundary tests from `GRADE_THRESHOLDS` (depends on #5).
**Cost:** S (30 min).

### 8. Centralize flag URL
**Files:** `compare.ts:25`, `scoring.service.ts:16`, `end.html:32`.
**Why:** Three call sites for `/flags/${file}` — fragile under asset-path
changes.
**Approach:** `getFlagUrl(svgFile)` utility; pipe variant for templates.
**Cost:** S (20 min).

### 9. Cache `getImageData()`
**Files:** `drawing-canvas.ts:392`, `:435`, `:440`.
**Why:** ~1.28 MB allocation on every pointer-down for an 800×400 canvas.
**Approach:** Cache `imageData` / `splitsData` snapshots; invalidate on draw,
clear, hint, element placement. Profile first.
**Cost:** M (1.5 h).

### 10. Reduce `(component as any)` in canvas tests
**Files:** `drawing-canvas.spec.ts:78,106,115,132,143`.
**Why:** Bypasses TS to reach private methods — refactors silently break tests.
**Approach:** Resolves naturally if #1 lands; otherwise expose protected
helpers or move logic to a service.
**Cost:** S (15 min) or folds into #1.

### 11. Unify aspect-ratio in templates
**Files:** `compare.html:18`, `end.html:25`.
**Why:** Compare uses a getter, end uses a per-row method (re-runs every render).
**Approach:** Use the pipe from #3 in both templates.
**Cost:** S (30 min) — folds into #3.
