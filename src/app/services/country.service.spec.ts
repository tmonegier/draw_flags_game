import { TestBed } from '@angular/core/testing';
import { CountryService } from './country.service';

describe('CountryService', () => {
  let service: CountryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountryService);
  });

  // ── getCountries ─────────────────────────────────────────────────────────────

  describe('getCountries', () => {
    it('returns 9 countries for easy', () => {
      expect(service.getCountries('easy').length).toBe(9);
    });

    it('returns 10 countries for medium', () => {
      expect(service.getCountries('medium').length).toBe(10);
    });

    it('returns 6 countries for hard', () => {
      expect(service.getCountries('hard').length).toBe(6);
    });

    it('returns a new array each call (not the same reference)', () => {
      const a = service.getCountries('easy');
      const b = service.getCountries('easy');
      expect(a).not.toBe(b);
    });

    it('does not mutate internal data when the returned array is modified', () => {
      const a = service.getCountries('easy');
      a.push({ name: 'Test', code: 'xx', ratio: '1:1', svgFile: 'test.svg' });
      expect(service.getCountries('easy').length).toBe(9);
    });

    it('every country has a non-empty name', () => {
      for (const diff of ['easy', 'medium', 'hard'] as const) {
        service.getCountries(diff).forEach(c => expect(c.name).toBeTruthy());
      }
    });

    it('every country has a non-empty code', () => {
      for (const diff of ['easy', 'medium', 'hard'] as const) {
        service.getCountries(diff).forEach(c => expect(c.code).toBeTruthy());
      }
    });

    it('every country ratio matches the h:w pattern', () => {
      for (const diff of ['easy', 'medium', 'hard'] as const) {
        service.getCountries(diff).forEach(c =>
          expect(c.ratio).toMatch(/^\d+:\d+$/)
        );
      }
    });

    it('every country svgFile ends with .svg', () => {
      for (const diff of ['easy', 'medium', 'hard'] as const) {
        service.getCountries(diff).forEach(c =>
          expect(c.svgFile).toMatch(/\.svg$/)
        );
      }
    });

    it('easy countries include France', () => {
      expect(service.getCountries('easy').map(c => c.name)).toContain('France');
    });

    it('medium countries include Armenia', () => {
      expect(service.getCountries('medium').map(c => c.name)).toContain('Armenia');
    });

    it('hard countries include Madagascar', () => {
      expect(service.getCountries('hard').map(c => c.name)).toContain('Madagascar');
    });
  });

  // ── shuffle ───────────────────────────────────────────────────────────────────

  describe('shuffle', () => {
    it('returns an array of the same length', () => {
      expect(service.shuffle([1, 2, 3, 4, 5]).length).toBe(5);
    });

    it('contains all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = service.shuffle(original);
      expect([...shuffled].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not mutate the input array', () => {
      const arr = [1, 2, 3, 4, 5];
      const copy = [...arr];
      service.shuffle(arr);
      expect(arr).toEqual(copy);
    });

    it('returns a new array reference', () => {
      const arr = [1, 2, 3];
      expect(service.shuffle(arr)).not.toBe(arr);
    });

    it('handles an empty array', () => {
      expect(service.shuffle([])).toEqual([]);
    });

    it('handles a single-element array', () => {
      expect(service.shuffle([42])).toEqual([42]);
    });

    it('returns the same elements when shuffling country objects', () => {
      const countries = service.getCountries('easy');
      const shuffled = service.shuffle(countries);
      expect(shuffled.length).toBe(countries.length);
      countries.forEach(c => expect(shuffled).toContain(c));
    });

    it('produces a different order at least sometimes (statistical test over 20 runs)', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8];
      const original = arr.join(',');
      const sameCount = Array.from({ length: 20 })
        .filter(() => service.shuffle(arr).join(',') === original).length;
      // Chance of all 20 runs keeping the same order: (1/8!)^20 ≈ 0
      expect(sameCount).toBeLessThan(20);
    });
  });
});
