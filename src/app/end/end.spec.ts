import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { EndComponent } from './end';
import { GameStateService, RoundScore, scoreToGrade } from '../services/game-state.service';

function makeScore(score: number): RoundScore {
  return {
    country: 'France', code: 'fr', score,
    grade: scoreToGrade(score),
    drawingDataUrl: 'data:image/png;base64,abc',
    svgFile: 'france.svg', ratio: '2:3',
  };
}

describe('EndComponent', () => {
  let component: EndComponent;
  let fixture: ComponentFixture<EndComponent>;
  let router: Router;
  let gameState: GameStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndComponent],
      providers: [provideRouter([]), provideLocationMocks()],
    }).compileComponents();

    fixture   = TestBed.createComponent(EndComponent);
    component = fixture.componentInstance;
    router    = TestBed.inject(Router);
    gameState = TestBed.inject(GameStateService);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── gradeColor ────────────────────────────────────────────────────────────────

  describe('gradeColor()', () => {
    it('returns #68d391 for A', () => expect(component.gradeColor('A')).toBe('#68d391'));
    it('returns #63b3ed for B', () => expect(component.gradeColor('B')).toBe('#63b3ed'));
    it('returns #f6e05e for C', () => expect(component.gradeColor('C')).toBe('#f6e05e'));
    it('returns #f6ad55 for D', () => expect(component.gradeColor('D')).toBe('#f6ad55'));
    it('returns #fc8181 for F', () => expect(component.gradeColor('F')).toBe('#fc8181'));
    it('returns #888 for unknown grade string', () => expect(component.gradeColor('Z')).toBe('#888'));
    it('returns #888 for empty string',         () => expect(component.gradeColor('')).toBe('#888'));
    it('is case-sensitive (lowercase a → #888)', () => expect(component.gradeColor('a')).toBe('#888'));
  });

  // ── playAgain ─────────────────────────────────────────────────────────────────

  it('playAgain() navigates to /', () => {
    component.playAgain();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  // ── gameState exposure ────────────────────────────────────────────────────────

  it('exposes gameState.roundScores() from the service', () => {
    gameState.addRoundScore(makeScore(80));
    expect(component.gameState.roundScores().length).toBe(1);
  });

  it('roundScores contains the exact object added', () => {
    const rs = makeScore(75);
    gameState.addRoundScore(rs);
    expect(component.gameState.roundScores()).toContain(rs);
  });

  it('exposes gameState.overallGrade() correctly', () => {
    gameState.addRoundScore(makeScore(950)); // 950 → A
    expect(component.gameState.overallGrade()).toBe('A');
  });

  it('overallGrade updates reactively when scores are added', () => {
    gameState.addRoundScore(makeScore(400)); // D
    expect(component.gameState.overallGrade()).toBe('D');
    gameState.addRoundScore(makeScore(900)); // avg 650 → C
    expect(component.gameState.overallGrade()).toBe('C');
  });
});
