import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { CompareComponent } from './compare';
import { GameStateService } from '../services/game-state.service';
import { ScoringService } from '../services/scoring.service';

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

  it('round score includes country name, code, svgFile and ratio', async () => {
    await createReady();
    const country = gameState.currentCountry()!;
    const rs = gameState.roundScores()[0];
    expect(rs.country).toBe(country.name);
    expect(rs.code).toBe(country.code);
    expect(rs.svgFile).toBe(country.svgFile);
    expect(rs.ratio).toBe(country.ratio);
  });

  // ── getScoreMessage ───────────────────────────────────────────────────────────

  it('getScoreMessage returns empty string when score is null', () => {
    fixture   = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    expect(component.getScoreMessage()).toBe('');
  });

  it('getScoreMessage returns outstanding message for score >= 900', async () => {
    await createReady();
    component.score.set(950);
    expect(component.getScoreMessage()).toContain('Outstanding');
  });

  it('getScoreMessage returns great message for score 700–899', async () => {
    await createReady();
    component.score.set(750);
    expect(component.getScoreMessage()).toContain('Great');
  });

  it('getScoreMessage returns not-bad message for score 500–699', async () => {
    await createReady();
    component.score.set(600);
    expect(component.getScoreMessage()).toContain('Not bad');
  });

  it('getScoreMessage returns keep-practicing message for score 300–499', async () => {
    await createReady();
    component.score.set(400);
    expect(component.getScoreMessage()).toContain('practicing');
  });

  it('getScoreMessage returns better-luck message for score < 300', async () => {
    await createReady();
    component.score.set(150);
    expect(component.getScoreMessage()).toContain('luck');
  });

  it('getScoreMessage boundary: score 900 is outstanding', async () => {
    await createReady();
    component.score.set(900);
    expect(component.getScoreMessage()).toContain('Outstanding');
  });

  it('getScoreMessage boundary: score 700 is great', async () => {
    await createReady();
    component.score.set(700);
    expect(component.getScoreMessage()).toContain('Great');
  });

  it('getScoreMessage boundary: score 500 is not-bad', async () => {
    await createReady();
    component.score.set(500);
    expect(component.getScoreMessage()).toContain('Not bad');
  });

  it('getScoreMessage boundary: score 300 is keep-practicing', async () => {
    await createReady();
    component.score.set(300);
    expect(component.getScoreMessage()).toContain('practicing');
  });

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
