import { TestBed } from '@angular/core/testing';
import { GameStateService, RoundScore, scoreToGrade } from './game-state.service';

// ── scoreToGrade (pure function) ──────────────────────────────────────────────

describe('scoreToGrade', () => {
  it('returns A for score = 1000', () => expect(scoreToGrade(1000)).toBe('A'));
  it('returns A for score = 900',  () => expect(scoreToGrade(900)).toBe('A'));
  it('returns B for score = 899',  () => expect(scoreToGrade(899)).toBe('B'));
  it('returns B for score = 700',  () => expect(scoreToGrade(700)).toBe('B'));
  it('returns C for score = 699',  () => expect(scoreToGrade(699)).toBe('C'));
  it('returns C for score = 500',  () => expect(scoreToGrade(500)).toBe('C'));
  it('returns D for score = 499',  () => expect(scoreToGrade(499)).toBe('D'));
  it('returns D for score = 300',  () => expect(scoreToGrade(300)).toBe('D'));
  it('returns F for score = 299',  () => expect(scoreToGrade(299)).toBe('F'));
  it('returns F for score = 0',    () => expect(scoreToGrade(0)).toBe('F'));
});

// ── GameStateService ──────────────────────────────────────────────────────────

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('difficulty defaults to easy', () => {
      expect(service.difficulty()).toBe('easy');
    });

    it('queue is empty', () => {
      expect(service.queue()).toEqual([]);
    });

    it('currentCountry is null', () => {
      expect(service.currentCountry()).toBeNull();
    });

    it('drawingDataUrl is empty string', () => {
      expect(service.drawingDataUrl()).toBe('');
    });

    it('drawingWidth defaults to 600', () => {
      expect(service.drawingWidth()).toBe(600);
    });

    it('drawingHeight defaults to 400', () => {
      expect(service.drawingHeight()).toBe(400);
    });

    it('roundScores is empty', () => {
      expect(service.roundScores()).toEqual([]);
    });

    it('isGameOver is false', () => {
      expect(service.isGameOver()).toBeFalse();
    });

    it('averageScore is 0', () => {
      expect(service.averageScore()).toBe(0);
    });

    it('overallGrade is F (average 0)', () => {
      expect(service.overallGrade()).toBe('F');
    });
  });

  // ── startGame ─────────────────────────────────────────────────────────────

  describe('startGame', () => {
    it('sets the difficulty signal', () => {
      service.startGame('hard');
      expect(service.difficulty()).toBe('hard');
    });

    it('clears any previous round scores', () => {
      service.addRoundScore(makeScore(80));
      service.startGame('easy');
      expect(service.roundScores()).toEqual([]);
    });

    it('sets currentCountry to a non-null country', () => {
      service.startGame('easy');
      expect(service.currentCountry()).not.toBeNull();
    });

    it('queue length + 1 equals 10 for easy', () => {
      service.startGame('easy');
      expect(service.queue().length + 1).toBe(10);
    });

    it('queue length + 1 equals 10 for hard', () => {
      service.startGame('hard');
      expect(service.queue().length + 1).toBe(10);
    });

    it('clears drawingDataUrl', () => {
      service.submitDrawing('data:image/png;base64,abc', 600, 400);
      service.startGame('easy');
      expect(service.drawingDataUrl()).toBe('');
    });

    it('isGameOver is false after startGame', () => {
      service.startGame('easy');
      expect(service.isGameOver()).toBeFalse();
    });

    it('currentCountry is one of the countries returned by CountryService', () => {
      service.startGame('easy');
      const current = service.currentCountry();
      expect(current).not.toBeNull();
      // Its svgFile must end with .svg
      expect(current!.svgFile).toMatch(/\.svg$/);
    });
  });

  // ── startGameWithCountry ──────────────────────────────────────────────────

  describe('startGameWithCountry', () => {
    it('returns true for a known country code', () => {
      expect(service.startGameWithCountry('fr', 'easy')).toBeTrue();
    });

    it('returns false for an unknown country code', () => {
      expect(service.startGameWithCountry('xx', 'easy')).toBeFalse();
    });

    it('sets currentCountry to the matching country', () => {
      service.startGameWithCountry('fr', 'easy');
      expect(service.currentCountry()?.code).toBe('fr');
      expect(service.currentCountry()?.name).toBe('France');
    });

    it('sets the difficulty', () => {
      service.startGameWithCountry('fr', 'hard');
      expect(service.difficulty()).toBe('hard');
    });

    it('sets the queue to empty (single-country game)', () => {
      service.startGameWithCountry('fr', 'easy');
      expect(service.queue()).toEqual([]);
    });

    it('clears any previous round scores', () => {
      service.addRoundScore(makeScore(80));
      service.startGameWithCountry('fr', 'easy');
      expect(service.roundScores()).toEqual([]);
    });

    it('clears drawingDataUrl', () => {
      service.submitDrawing('data:image/png;base64,abc', 600, 400);
      service.startGameWithCountry('fr', 'easy');
      expect(service.drawingDataUrl()).toBe('');
    });

    it('does not change state when country code is unknown', () => {
      service.startGame('easy');
      const before = service.currentCountry();
      service.startGameWithCountry('xx', 'hard');
      expect(service.currentCountry()).toEqual(before);
    });

    it('isGameOver is true immediately (empty queue, country set)', () => {
      service.startGameWithCountry('fr', 'easy');
      expect(service.isGameOver()).toBeTrue();
    });
  });

  // ── submitDrawing ─────────────────────────────────────────────────────────

  describe('submitDrawing', () => {
    it('sets drawingDataUrl', () => {
      service.submitDrawing('data:image/png;base64,xyz', 600, 400);
      expect(service.drawingDataUrl()).toBe('data:image/png;base64,xyz');
    });

    it('sets drawingWidth', () => {
      service.submitDrawing('url', 800, 400);
      expect(service.drawingWidth()).toBe(800);
    });

    it('sets drawingHeight', () => {
      service.submitDrawing('url', 600, 300);
      expect(service.drawingHeight()).toBe(300);
    });
  });

  // ── addRoundScore ─────────────────────────────────────────────────────────

  describe('addRoundScore', () => {
    it('appends a round score', () => {
      const rs = makeScore(75);
      service.addRoundScore(rs);
      expect(service.roundScores().length).toBe(1);
      expect(service.roundScores()[0]).toEqual(rs);
    });

    it('accumulates multiple round scores', () => {
      service.addRoundScore(makeScore(60));
      service.addRoundScore(makeScore(80));
      expect(service.roundScores().length).toBe(2);
    });

    it('returns a new array reference each time (immutable update)', () => {
      service.addRoundScore(makeScore(50));
      const first = service.roundScores();
      service.addRoundScore(makeScore(70));
      expect(service.roundScores()).not.toBe(first);
    });
  });

  // ── nextCountry ───────────────────────────────────────────────────────────

  describe('nextCountry', () => {
    beforeEach(() => service.startGame('easy')); // 1 current + 9 queue

    it('returns true when the queue is not empty', () => {
      expect(service.nextCountry()).toBeTrue();
    });

    it('sets currentCountry to the first item in the queue', () => {
      const nextExpected = service.queue()[0];
      service.nextCountry();
      expect(service.currentCountry()).toEqual(nextExpected);
    });

    it('removes one country from the queue', () => {
      const before = service.queue().length;
      service.nextCountry();
      expect(service.queue().length).toBe(before - 1);
    });

    it('clears drawingDataUrl when advancing', () => {
      service.submitDrawing('data:image/png;base64,x', 600, 400);
      service.nextCountry();
      expect(service.drawingDataUrl()).toBe('');
    });

    it('returns false when queue is empty', () => {
      service.startGame('hard'); // 1 current + 9 queue
      for (let i = 0; i < 9; i++) service.nextCountry();
      expect(service.nextCountry()).toBeFalse();
    });

    it('does not change currentCountry when queue is empty', () => {
      service.startGame('hard');
      for (let i = 0; i < 9; i++) service.nextCountry();
      const last = service.currentCountry();
      service.nextCountry(); // returns false, should not change
      expect(service.currentCountry()).toEqual(last);
    });
  });

  // ── isGameOver ────────────────────────────────────────────────────────────

  describe('isGameOver', () => {
    it('is false before startGame (currentCountry is null)', () => {
      expect(service.isGameOver()).toBeFalse();
    });

    it('is false right after startGame (queue not empty)', () => {
      service.startGame('easy');
      expect(service.isGameOver()).toBeFalse();
    });

    it('is true when the queue is drained and currentCountry is set', () => {
      service.startGame('hard'); // 10 countries total
      for (let i = 0; i < 9; i++) service.nextCountry();
      expect(service.isGameOver()).toBeTrue();
    });
  });

  // ── averageScore ──────────────────────────────────────────────────────────

  describe('averageScore', () => {
    it('returns 0 with no scores', () => {
      expect(service.averageScore()).toBe(0);
    });

    it('returns the score itself with a single entry', () => {
      service.addRoundScore(makeScore(75));
      expect(service.averageScore()).toBe(75);
    });

    it('computes the mean of multiple scores', () => {
      service.addRoundScore(makeScore(60));
      service.addRoundScore(makeScore(80));
      expect(service.averageScore()).toBe(70);
    });

    it('rounds the result to the nearest integer', () => {
      service.addRoundScore(makeScore(66));
      service.addRoundScore(makeScore(67));
      // (66 + 67) / 2 = 66.5 → rounds to 67
      expect(service.averageScore()).toBe(67);
    });
  });

  // ── overallGrade ──────────────────────────────────────────────────────────

  describe('overallGrade', () => {
    it('is F with no scores (average 0)', () => {
      expect(service.overallGrade()).toBe('F');
    });

    it('is A when average score is 900+', () => {
      service.addRoundScore(makeScore(1000));
      service.addRoundScore(makeScore(900));
      expect(service.overallGrade()).toBe('A');
    });

    it('is B when average score is 700–899', () => {
      service.addRoundScore(makeScore(700));
      expect(service.overallGrade()).toBe('B');
    });

    it('is C when average score is 500–699', () => {
      service.addRoundScore(makeScore(550));
      expect(service.overallGrade()).toBe('C');
    });

    it('is D when average score is 300–499', () => {
      service.addRoundScore(makeScore(400));
      expect(service.overallGrade()).toBe('D');
    });

    it('mirrors scoreToGrade(averageScore())', () => {
      service.addRoundScore(makeScore(60));
      service.addRoundScore(makeScore(80));
      expect(service.overallGrade()).toBe(scoreToGrade(service.averageScore()));
    });
  });
});

// ── Helper ────────────────────────────────────────────────────────────────────

function makeScore(score: number): RoundScore {
  return {
    country: 'France',
    code: 'fr',
    score,
    grade: scoreToGrade(score),
    drawingDataUrl: 'data:image/png;base64,abc',
    svgFile: 'france.svg',
    ratio: '2:3',
  };
}
