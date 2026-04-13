import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { HomeComponent, SWIPE_THRESHOLD_PX } from './home';
import { GameStateService } from '../services/game-state.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;
  let gameState: GameStateService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideLocationMocks()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    gameState = TestBed.inject(GameStateService);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── guidedDifficulties array ──────────────────────────────────────────────────

  it('guidedDifficulties has exactly 3 entries', () => {
    expect(component.guidedDifficulties.length).toBe(3);
  });

  it('guidedDifficulties contains easy, medium and hard keys', () => {
    const keys = component.guidedDifficulties.map(d => d.key);
    expect(keys).toContain('easy');
    expect(keys).toContain('medium');
    expect(keys).toContain('hard');
  });

  it('guidedDifficulties does not contain free', () => {
    const keys = component.guidedDifficulties.map(d => d.key);
    expect(keys).not.toContain('free');
  });

  it('each guided difficulty has a non-empty label', () => {
    component.guidedDifficulties.forEach(d => expect(d.label.length).toBeGreaterThan(0));
  });

  it('each guided difficulty has a non-empty description', () => {
    component.guidedDifficulties.forEach(d => expect(d.description.length).toBeGreaterThan(0));
  });

  // ── freeDifficulty ────────────────────────────────────────────────────────────

  it('freeDifficulty key is "free"', () => {
    expect(component.freeDifficulty.key).toBe('free');
  });

  it('freeDifficulty has a non-empty label', () => {
    expect(component.freeDifficulty.label.length).toBeGreaterThan(0);
  });

  it('freeDifficulty has a non-empty description', () => {
    expect(component.freeDifficulty.description.length).toBeGreaterThan(0);
  });

  // ── selected signal ───────────────────────────────────────────────────────────

  it('selected defaults to easy', () => {
    expect(component.selected()).toBe('easy');
  });

  // ── select() ─────────────────────────────────────────────────────────────────

  describe('select()', () => {
    it('sets selected to medium', () => {
      component.select('medium');
      expect(component.selected()).toBe('medium');
    });

    it('sets selected to hard', () => {
      component.select('hard');
      expect(component.selected()).toBe('hard');
    });

    it('can switch back from hard to easy', () => {
      component.select('hard');
      component.select('easy');
      expect(component.selected()).toBe('easy');
    });
  });

  // ── startGame() ───────────────────────────────────────────────────────────────

  describe('startGame()', () => {
    it('calls gameState.startGame with the currently selected difficulty', () => {
      spyOn(gameState, 'startGame').and.callThrough();
      component.select('medium');
      component.startGame();
      expect(gameState.startGame).toHaveBeenCalledWith('medium');
    });

    it('passes easy by default (no prior select())', () => {
      spyOn(gameState, 'startGame').and.callThrough();
      component.startGame();
      expect(gameState.startGame).toHaveBeenCalledWith('easy');
    });

    it('shows tutorial when not yet seen for this difficulty', () => {
      component.startGame();
      expect(component.showTutorial()).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('shows tutorial regardless of selected difficulty when not yet seen', () => {
      component.select('hard');
      component.startGame();
      expect(component.showTutorial()).toBeTrue();
    });

    it('navigates directly to /game when tutorial already seen for this difficulty', () => {
      localStorage.setItem('tutorial-seen-easy', '1');
      component.startGame();
      expect(component.showTutorial()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/game']);
    });

    it('navigates directly to /game when tutorial already seen for hard', () => {
      localStorage.setItem('tutorial-seen-hard', '1');
      component.select('hard');
      component.startGame();
      expect(component.showTutorial()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/game']);
    });

    it('shows tutorial for medium when only easy was seen before', () => {
      localStorage.setItem('tutorial-seen-easy', '1');
      component.select('medium');
      component.startGame();
      expect(component.showTutorial()).toBeTrue();
    });

    it('initialises game state so currentCountry is set', () => {
      component.startGame();
      expect(gameState.currentCountry()).not.toBeNull();
    });
  });

  // ── carousel paging ───────────────────────────────────────────────────────────

  describe('carousel paging', () => {
    it('defaults page to guided so it matches the default easy selection', () => {
      expect(component.page()).toBe('guided');
    });

    it('showPage(free) selects the free difficulty', () => {
      component.showPage('free');
      expect(component.page()).toBe('free');
      expect(component.selected()).toBe('free');
    });

    it('showPage(guided) from free defaults selection back to easy', () => {
      component.showPage('free');
      component.showPage('guided');
      expect(component.page()).toBe('guided');
      expect(component.selected()).toBe('easy');
    });

    it('showPage(guided) preserves a guided selection that was already made', () => {
      component.select('hard');
      component.showPage('guided');
      expect(component.selected()).toBe('hard');
    });

    it('nextPage toggles from guided to free', () => {
      component.nextPage();
      expect(component.page()).toBe('free');
    });

    it('prevPage toggles from free back to guided', () => {
      component.showPage('free');
      component.prevPage();
      expect(component.page()).toBe('guided');
    });

    it('nextPage wraps when already on free (still works, stays on guided)', () => {
      component.showPage('free');
      component.nextPage();
      expect(component.page()).toBe('guided');
    });
  });

  // ── swipe gestures ────────────────────────────────────────────────────────────

  describe('touch swipe', () => {
    const touch = (x: number) => ({ changedTouches: [{ clientX: x }] } as unknown as TouchEvent);

    it('swipe left (negative dx beyond threshold) moves to next page', () => {
      component.onTouchStart(touch(200));
      component.onTouchEnd(touch(200 - SWIPE_THRESHOLD_PX - 1));
      expect(component.page()).toBe('free');
    });

    it('swipe right (positive dx beyond threshold) moves to previous page', () => {
      component.showPage('free');
      component.onTouchStart(touch(50));
      component.onTouchEnd(touch(50 + SWIPE_THRESHOLD_PX + 1));
      expect(component.page()).toBe('guided');
    });

    it('small movement below threshold does not change page', () => {
      component.onTouchStart(touch(100));
      component.onTouchEnd(touch(110));
      expect(component.page()).toBe('guided');
    });

    it('touchend without prior touchstart is a no-op', () => {
      component.onTouchEnd(touch(500));
      expect(component.page()).toBe('guided');
    });
  });

  // ── onTutorialClosed() ────────────────────────────────────────────────────────

  describe('onTutorialClosed()', () => {
    it('navigates to /game', () => {
      component.onTutorialClosed();
      expect(router.navigate).toHaveBeenCalledWith(['/game']);
    });

    it('sets showTutorial to false', () => {
      component.showTutorial.set(true);
      component.onTutorialClosed();
      expect(component.showTutorial()).toBeFalse();
    });

    it('marks the current difficulty as seen in localStorage', () => {
      component.select('medium');
      component.onTutorialClosed();
      expect(localStorage.getItem('tutorial-seen-medium')).toBe('1');
    });

    it('subsequent startGame() for the same difficulty skips the tutorial', () => {
      component.onTutorialClosed();       // marks easy as seen
      component.startGame();              // starts a new game on easy
      expect(component.showTutorial()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/game']);
    });
  });
});
