# Refactoring Backlog

Tracking sheet for code-quality refactors. Update the **Status** column as work
progresses (`todo` → `in-progress` → `done`). Add the commit SHA when complete.

Status legend: `todo` · `in-progress` · `done` · `skipped`

## Critical

| # | Title | Status | Commit |
|---|---|---|---|
| 1 | Split `DrawingCanvasComponent` into focused services | done (option A — pure utils) | cc60fe4 |
| 2 | Deduplicate `toPositions()` inside `drawing-canvas.ts` | done | 2901d49 |
| 3 | Centralize ratio parsing + aspect-ratio helpers | done | f17674e |
| 4 | Inject `CountryService` into `GameStateService` (no `new`) | done | 699eb5b |

## High

| # | Title | Status | Commit |
|---|---|---|---|
| 5 | Centralize magic numbers (grade thresholds, scale, tolerance) | done | f726fba |
| 6 | Reshape `RoundScore` to compose `Country` instead of copying fields | done | 81e8cf4 |
| 7 | Parametrize grade-threshold tests against constants | done | f726fba (folded into #5) |

## Medium

| # | Title | Status | Commit |
|---|---|---|---|
| 8 | Centralize flag asset URL building (`/flags/${file}`) | done | 49d6e40 |
| 9 | Cache `getImageData()` to avoid per-click MB allocations | todo | — |

## Low

| # | Title | Status | Commit |
|---|---|---|---|
| 10 | Reduce `(component as any)` casts in canvas tests | done | cc60fe4 (folded into #1) |
| 11 | Unify aspect-ratio template usage between compare & end | done | f17674e (folded into #3) |

---

# Round 2 — second-pass audit (2026-04-15)

After the first wave of refactors, a fresh full-codebase audit surfaced the
items below. They're sorted by likely-bug → maintainability → polish.

## Critical (real bugs)

| # | Title | Status | Commit |
|---|---|---|---|
| 12 | `allowedColors` computed reshuffles on every recomputation (Math.random in `computed`) | done | (pending) |
| 13 | `ScoringService.computeScore()` swallows errors silently — frozen "Scoring…" UI | done | (pending) |
| 14 | Race condition in `recolorElement`: rapid clicks let stale image loads paint over fresh ones | done | (pending) |

## High (maintainability / perf)

| # | Title | Status | Commit |
|---|---|---|---|
| 15 | Template method calls (`getScoreMessage()`, `gradeColor()`) re-run every CD cycle | done | (pending) |
| 16 | No `ChangeDetectionStrategy.OnPush` anywhere — wasted CD on signal-driven app | todo | — |
| 17 | `RoundScore.grade` typed `string` instead of the existing `Grade` union | done | (pending) |
| 18 | `Promise` returned from `ScoringService` is uncancellable — leak / stale set after navigation | done | (pending) |

## Medium (consistency / polish)

| # | Title | Status | Commit |
|---|---|---|---|
| 19 | `clearLabel` input encodes intent as a string — should pass `difficulty` and let toolbar render the label | done | (pending) |
| 20 | `gradeColor()` should be a pipe (matches `AspectRatioPipe` / `FlagUrlPipe` pattern) | done | (pending, folded into #15) |
| 21 | `canvasHeight` is a constant while `canvasWidth` is a signal — naming/usage drift | done | (pending) |
| 22 | Flood-fill uses exact RGB equality; scoring uses tolerance — document or align | done | (pending) |

## Low (docs / micro)

| # | Title | Status | Commit |
|---|---|---|---|
| 23 | CLAUDE.md still mentions an `easy/medium/hard` ladder; `medium` was removed | done | (pending) |
| 24 | `Point` interface defined privately in canvas component — fine to keep, flag if reused | todo | — |
| 25 | `getDrawingDataUrl()` allocates a fresh temp canvas on every submit | todo | — |

## Detail

### 12. `allowedColors` impurity (CRITICAL bug)
**File:** `src/app/game/game.ts:27-36`
**Evidence:** `Math.random()` runs inside `computed()`. Each time a dependency
changes (e.g. the user picks a colour and `currentCountry` is unchanged but
something else in the signal graph fires), the palette is re-shuffled and the
swatches reorder visibly mid-game.
**Fix:** Compute the shuffled palette once per country. Either store it in a
plain signal updated by an `effect()` watching `currentCountry`, or shuffle
in `startGame` / `nextCountry` and stash on the country/round.
**Cost:** S.

### 13. Scoring error path swallows everything
**File:** `src/app/services/scoring.service.ts` and consumer
`compare.ts:48-64`
**Evidence:** `flagImg.onerror` and `userImg.onerror` resolve `0` silently;
`compare.ts` has no `.catch()` on the promise. If the SVG fetch fails or
`drawImage` throws (e.g. tainted canvas), the user sees the spinning
"Scoring…" badge forever.
**Fix:** Log the error in `scoring.service.ts`, and add a `.catch()` in
`compare.ts` that sets `isScoring(false)` and surfaces a "scoring failed"
state.
**Cost:** S.

### 14. Element recolour race
**File:** `src/app/drawing/drawing-canvas.ts` `renderPlacedElement` (179-189),
`redrawAllElements` (192-197), `recolorElement` (200-214)
**Evidence:** Each placed element fires a fresh `Image()` load with
`onload` writing to `elementsCtx`. Rapid recolours queue multiple loads;
they may resolve out of order.
**Fix:** Either (a) bump a per-element generation counter and ignore
older `onload` callbacks, or (b) cache the rendered SVG raster per
(element, color) pair so re-draws are synchronous.
**Cost:** M.

### 15. Template method recomputation
**Files:** `compare.html:36`, `end.html:7,19`
**Evidence:** `{{ getScoreMessage() }}` and `gradeColor(round.grade)` execute
on every CD pass. With ~10 cards on `/end` and 3 grade lookups each, that's
30 method calls per change-detection tick.
**Fix:** Convert `getScoreMessage` to a `computed`; replace `gradeColor` with
a pure pipe (folds into #20).
**Cost:** S.

### 16. No OnPush
**Files:** all components
**Evidence:** Default change detection is `Default`. The app is signal-first,
so OnPush is the natural fit — it eliminates the redundant CD cycles
triggered by every pointer event in the canvas.
**Fix:** Add `changeDetection: ChangeDetectionStrategy.OnPush` per component
and verify each one still updates correctly. Pair with #15 to avoid stale
bindings.
**Cost:** M (mostly verification).

### 17. `RoundScore.grade: string`
**File:** `src/app/services/game-state.service.ts:8`
**Evidence:** A `Grade` union exists in `scoring-config.ts` but `RoundScore`
takes a plain string. `end.gradeColor` already does `as Grade` to compensate.
**Fix:** Type as `Grade`. Update `scoreToGrade()` return type to `Grade` too
for the same reason.
**Cost:** S.

### 18. Uncancellable scoring promise
**File:** `src/app/compare/compare.ts:48-64`
**Evidence:** Navigating away mid-scoring lets the `.then` mutate component
signals on a destroyed instance.
**Fix:** Track the latest score request on the component and ignore the
result if the component was destroyed (`destroyed` signal or `DestroyRef`).
**Cost:** S.

### 19. `clearLabel` is presentational
**Files:** `src/app/drawing/toolbar.ts`, `src/app/game/game.ts:39-41`
**Evidence:** Parent ships the literal "↩️ Cancel Changes" / "🗑️ Clear"
strings. The toolbar should know its own copy.
**Fix:** Replace with `mode: input<'cancel' | 'clear'>()` (or pass
`difficulty`) and let the toolbar pick the label/icon.
**Cost:** S.

### 20. `gradeColor` should be a pipe
**File:** `src/app/end/end.ts:18-20`
**Evidence:** Pure transformation called from a template — same shape as
`AspectRatioPipe` and `FlagUrlPipe`.
**Fix:** Extract `GradeColorPipe` into `utils/grade-color.pipe.ts`.
**Cost:** S.

### 21. canvasHeight/canvasWidth API drift
**File:** `src/app/drawing/drawing-canvas.ts:46-50`
**Evidence:** `canvasHeight` is a plain readonly constant; `canvasWidth` is a
`computed()`. Templates have to remember which one to call.
**Fix:** Either expose both as signals (`canvasHeight = signal(CANVAS_HEIGHT)`)
or inline the constant where used.
**Cost:** S.

### 22. Flood-fill exact match vs scoring tolerance
**File:** `src/app/utils/canvas-pixels.ts:46-50`
**Evidence:** Flood-fill bails when the seed pixel exactly equals the fill
colour (`===`). Scoring compares with a 60/255 tolerance. They have
different jobs, but the contrast is worth a one-line comment.
**Fix:** Add a comment explaining the asymmetry, or import
`PIXEL_TOLERANCE` and use `colorMatch()` if a perceptual stop is wanted.
**Cost:** S (decision).

### 23. CLAUDE.md mentions removed `medium` difficulty
**File:** `CLAUDE.md`
**Evidence:** The doc still describes the easy/medium/hard ladder; commit
`ecf51cc` removed medium.
**Fix:** Update CLAUDE.md to match the actual `'easy' | 'hard' | 'free'`
union.
**Cost:** S.

### 24. `Point` interface scope
**File:** `src/app/drawing/drawing-canvas.ts:16`
**Evidence:** Defined privately. No second consumer today.
**Action:** Leave as-is unless reused.

### 25. `getDrawingDataUrl()` allocates a temp canvas every call
**File:** `src/app/drawing/drawing-canvas.ts:125-135`
**Evidence:** Called once per submission, so cost is negligible.
**Action:** Leave as-is unless profiling shows it matters.

## If you only do three things now

1. **#12 — fix `allowedColors` impurity.** Active UX bug; smallest fix.
2. **#13 — wire up scoring error handling.** A blank flag or 5xx pins the
   user on a frozen "Scoring…" badge with no escape today.
3. **#15 + #20 — kill template method calls.** Cheap, removes per-CD waste,
   and #20 falls out of #15 naturally. (Then #16 OnPush becomes safe.)


---

## Detail

### 1. Split `DrawingCanvasComponent`
**Files:** `src/app/drawing/drawing-canvas.ts` (498 → 447 lines)
**Why:** SRP violation — flood-fill, element placement, hint rendering, pen,
mouse handling all tangled. Blocks future features (undo/redo, accessibility)
and forces tests to mock canvas APIs.
**Done:** Option A — pure-utility extraction. `floodFillPixels`, `colorMatch`,
`hexToRgba`, `getPixelColor`, `setPixelColor`, `ratioToPositions` moved to
`utils/canvas-pixels.ts` and `utils/ratio.ts`. Component keeps a thin
`floodFill(x, y)` wrapper that handles the canvas IO. Pixel-algorithm tests
moved to `utils/canvas-pixels.spec.ts` (16 tests, no canvas mocks needed).
A future pass could extract element placement (SVG building / recolour) the
same way, but the SVG layer is already cohesive enough to leave alone.

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
