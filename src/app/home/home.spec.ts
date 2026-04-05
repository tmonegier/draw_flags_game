import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { HomeComponent } from './home';
import { GameStateService } from '../services/game-state.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;
  let gameState: GameStateService;

  beforeEach(async () => {
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

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Difficulties array ────────────────────────────────────────────────────────

  it('difficulties has exactly 3 entries', () => {
    expect(component.difficulties.length).toBe(3);
  });

  it('difficulties contains easy, medium and hard keys', () => {
    const keys = component.difficulties.map(d => d.key);
    expect(keys).toContain('easy');
    expect(keys).toContain('medium');
    expect(keys).toContain('hard');
  });

  it('each difficulty has a non-empty label', () => {
    component.difficulties.forEach(d => expect(d.label.length).toBeGreaterThan(0));
  });

  it('each difficulty has a non-empty description', () => {
    component.difficulties.forEach(d => expect(d.description.length).toBeGreaterThan(0));
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

    it('navigates to /game', () => {
      component.startGame();
      expect(router.navigate).toHaveBeenCalledWith(['/game']);
    });

    it('navigates to /game regardless of the selected difficulty', () => {
      component.select('hard');
      component.startGame();
      expect(router.navigate).toHaveBeenCalledWith(['/game']);
    });

    it('initialises game state so currentCountry is set', () => {
      component.startGame();
      expect(gameState.currentCountry()).not.toBeNull();
    });
  });
});
