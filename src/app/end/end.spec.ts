import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { EndComponent } from './end';
import { GameStateService, RoundScore, scoreToGrade } from '../services/game-state.service';

function makeScore(score: number): RoundScore {
  return {
    country: {
      name: 'France', code: 'fr', ratio: '2:3', svgFile: 'france.svg',
      hints: [], colors: [],
    },
    score,
    grade: scoreToGrade(score),
    drawingDataUrl: 'data:image/png;base64,abc',
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
