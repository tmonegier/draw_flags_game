import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { CompareComponent } from './compare';
import { GameStateService } from '../services/game-state.service';
import { ScoringService } from '../services/scoring.service';
import { SCORE_MESSAGES } from '../scoring-config';

describe('CompareComponent', () => {
  let fixture: ComponentFixture<CompareComponent>;
  let component: CompareComponent;
  let router: Router;
  let gameState: GameStateService;
  let mockScoring: jasmine.SpyObj<ScoringService>;

  beforeEach(async () => {
    mockScoring = jasmine.createSpyObj('ScoringService', ['computeScore']);
    mockScoring.computeScore.and.returnValue(Promise.resolve(750));

    await TestBed.configureTestingModule({
      imports: [CompareComponent],
      providers: [
        { provide: ScoringService, useValue: mockScoring },
        provideRouter([]),
        provideLocationMocks(),
      ],
    }).compileComponents();

    gameState = TestBed.inject(GameStateService);
    router   = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  /** Start game + submit drawing, then create + initialise the component. */
  async function createReady(score = 750): Promise<void> {
    mockScoring.computeScore.and.returnValue(Promise.resolve(score));
    gameState.startGame('easy');
    gameState.submitDrawing('data:image/png;base64,abc', 600, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  // ── Redirect guard in ngOnInit ────────────────────────────────────────────────

  it('redirects to / when there is no current country', () => {
    // No startGame → currentCountry is null
    gameState.submitDrawing('data:x', 600, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('redirects to / when the drawing data URL is empty', () => {
    gameState.startGame('easy');
    // No submitDrawing → drawingDataUrl stays ''
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('does not redirect when country and drawing are both set', async () => {
    await createReady();
    expect(router.navigate).not.toHaveBeenCalledWith(['/']);
  });

  // ── Getters ───────────────────────────────────────────────────────────────────

  it('flagUrl starts with /flags/ and ends with .svg', async () => {
    await createReady();
    expect(component.flagUrl).toMatch(/^\/flags\/.+\.svg$/);
  });

  it('flagUrl is empty string when there is no current country', () => {
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    // Do NOT call detectChanges — avoid triggering ngOnInit navigation side effect
    expect(component.flagUrl).toBe('');
  });

  it('flagAspectRatio converts h:w to CSS w/h (e.g. 2:3 → 3/2)', async () => {
    await createReady();
    const ratio = component.currentCountry!.ratio;
    const [h, w] = ratio.split(':').map(Number);
    expect(component.flagAspectRatio).toBe(`${w}/${h}`);
  });

  it('flagAspectRatio falls back to 3/2 when there is no current country', () => {
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    expect(component.flagAspectRatio).toBe('3/2'); // default ratio '2:3'
  });

  it('hasMore is true when the queue is non-empty', async () => {
    // hard: 6 countries → after startGame: 1 current + 5 queue
    gameState.startGame('hard');
    gameState.submitDrawing('data:x', 600, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.hasMore).toBeTrue();
  });

  it('hasMore is false when the queue is empty', async () => {
    gameState.startGame('hard'); // 1 current + 9 queue
    for (let i = 0; i < 9; i++) gameState.nextCountry(); // drain queue
    gameState.submitDrawing('data:x', 600, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.hasMore).toBeFalse();
  });

  // ── ngOnInit scoring flow ─────────────────────────────────────────────────────

  it('calls computeScore on init', async () => {
    await createReady();
    expect(mockScoring.computeScore).toHaveBeenCalledTimes(1);
  });

  it('passes the drawing data URL, svg file, width and height to computeScore', async () => {
    gameState.startGame('easy');
    gameState.submitDrawing('data:image/png;base64,xyz', 800, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    const country = gameState.currentCountry()!;
    expect(mockScoring.computeScore).toHaveBeenCalledWith(
      'data:image/png;base64,xyz',
      country.svgFile,
      800,
      400,
    );
  });

  it('sets score signal after computing', async () => {
    await createReady(880);
    expect(component.score()).toBe(880);
  });

  it('sets grade signal from scoreToGrade after computing', async () => {
    await createReady(880); // 880 → B
    expect(component.grade()).toBe('B');
  });

  it('sets isScoring to false after computing', async () => {
    await createReady();
    expect(component.isScoring()).toBeFalse();
  });

  it('isScoring is true before computing completes', () => {
    // Do NOT await whenStable — check the pre-resolve state
    mockScoring.computeScore.and.returnValue(new Promise(() => {})); // never resolves
    gameState.startGame('easy');
    gameState.submitDrawing('data:x', 600, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isScoring()).toBeTrue();
  });

  it('adds a round score to game state after computing', async () => {
    await createReady(750);
    expect(gameState.roundScores().length).toBe(1);
    expect(gameState.roundScores()[0].score).toBe(750);
  });

  it('round score embeds the full country object', async () => {
    await createReady();
    const country = gameState.currentCountry()!;
    const rs = gameState.roundScores()[0];
    expect(rs.country).toBe(country);
  });

  // ── Scoring failure handling ──────────────────────────────────────────────────

  async function createReadyWithRejection(err: Error): Promise<void> {
    mockScoring.computeScore.and.returnValue(Promise.reject(err));
    gameState.startGame('easy');
    gameState.submitDrawing('data:image/png;base64,abc', 600, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('exposes a scoringError signal when computeScore rejects', async () => {
    await createReadyWithRejection(new Error('boom'));
    expect(component.scoringError()).toBe('boom');
    expect(component.isScoring()).toBeFalse();
  });

  it('records a 0/F round even when scoring fails so the game can continue', async () => {
    await createReadyWithRejection(new Error('boom'));
    expect(gameState.roundScores().length).toBe(1);
    expect(gameState.roundScores()[0].score).toBe(0);
    expect(gameState.roundScores()[0].grade).toBe('F');
  });

  // ── scoreMessage ──────────────────────────────────────────────────────────────

  it('scoreMessage returns empty string when score is null', () => {
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    expect(component.scoreMessage()).toBe('');
  });

  // Drive boundary tests off the same SCORE_MESSAGES table the component reads.
  for (const msg of SCORE_MESSAGES) {
    it(`scoreMessage returns "${msg.message.slice(0, 28)}…" at the lower bound (score = ${msg.min})`, async () => {
      await createReady();
      component.score.set(msg.min);
      expect(component.scoreMessage()).toBe(msg.message);
    });
  }
  // Just-below-boundary: each message should yield to the next tier down.
  for (let i = 0; i < SCORE_MESSAGES.length - 1; i++) {
    const here = SCORE_MESSAGES[i];
    const below = SCORE_MESSAGES[i + 1];
    it(`scoreMessage drops to "${below.message.slice(0, 20)}…" just below ${here.min}`, async () => {
      await createReady();
      component.score.set(here.min - 1);
      expect(component.scoreMessage()).toBe(below.message);
    });
  }

  // ── next() ────────────────────────────────────────────────────────────────────

  it('next() navigates to /game when there is another country in the queue', async () => {
    gameState.startGame('hard'); // 5 remaining in queue
    gameState.submitDrawing('data:x', 600, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    component.next();
    expect(router.navigate).toHaveBeenCalledWith(['/game']);
  });

  it('next() navigates to /end when the queue is exhausted', async () => {
    gameState.startGame('hard');
    for (let i = 0; i < 9; i++) gameState.nextCountry(); // drain queue
    gameState.submitDrawing('data:x', 600, 400);
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    component.next();
    expect(router.navigate).toHaveBeenCalledWith(['/end']);
  });

  // ── goHome() ──────────────────────────────────────────────────────────────────

  it('goHome() navigates to /', async () => {
    await createReady();
    component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
