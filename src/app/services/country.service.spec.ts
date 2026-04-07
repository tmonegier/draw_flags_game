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
    it('returns 44 countries', () => {
      expect(service.getCountries().length).toBe(44);
    });

    it('returns a new array each call (not the same reference)', () => {
      expect(service.getCountries()).not.toBe(service.getCountries());
    });

    it('does not mutate internal data when the returned array is modified', () => {
      const a = service.getCountries();
      a.push({ name: 'Test', code: 'xx', ratio: '1:1', svgFile: 'test.svg', hints: [], colors: [] });
      expect(service.getCountries().length).toBe(44);
    });

    it('every country has a non-empty name', () => {
      service.getCountries().forEach(c => expect(c.name).toBeTruthy());
    });

    it('every country has a non-empty code', () => {
      service.getCountries().forEach(c => expect(c.code).toBeTruthy());
    });

    it('every country ratio matches the h:w pattern', () => {
      service.getCountries().forEach(c => expect(c.ratio).toMatch(/^\d+:\d+$/));
    });

    it('every country svgFile ends with .svg', () => {
      service.getCountries().forEach(c => expect(c.svgFile).toMatch(/\.svg$/));
    });

    it('every country has a non-empty hints array', () => {
      service.getCountries().forEach(c => expect(c.hints.length).toBeGreaterThan(0));
    });

    it('every country has at least one color', () => {
      service.getCountries().forEach(c => expect(c.colors.length).toBeGreaterThan(0));
    });

    it('every color is a valid hex string', () => {
      service.getCountries().forEach(c =>
        c.colors.forEach(col => expect(col).toMatch(/^#[0-9a-fA-F]{6}$/))
      );
    });

    it('includes France', () => {
      expect(service.getCountries().map(c => c.name)).toContain('France');
    });

    it('includes Armenia', () => {
      expect(service.getCountries().map(c => c.name)).toContain('Armenia');
    });

    it('includes Madagascar', () => {
      expect(service.getCountries().map(c => c.name)).toContain('Madagascar');
    });

    it('includes Norway', () => {
      expect(service.getCountries().map(c => c.name)).toContain('Norway');
    });

    it('band hints have a direction and non-empty ratios', () => {
      service.getCountries().forEach(c =>
        c.hints.forEach(h => {
          if (h.kind === 'bands') {
            expect(['horizontal', 'vertical']).toContain(h.direction);
            expect(h.ratios.length).toBeGreaterThan(0);
          }
        })
      );
    });

    it('cross hints have a valid variant and non-empty ratio arrays', () => {
      service.getCountries().forEach(c =>
        c.hints.forEach(h => {
          if (h.kind === 'cross') {
            expect(['simple', 'double']).toContain(h.variant);
            expect(h.widthRatios.length).toBeGreaterThan(0);
            expect(h.heightRatios.length).toBeGreaterThan(0);
          }
        })
      );
    });

    it('crossOutline hints have non-empty ratio arrays with at least 5 parts each', () => {
      service.getCountries().forEach(c =>
        c.hints.forEach(h => {
          if (h.kind === 'crossOutline') {
            expect(h.widthRatios.length).toBeGreaterThanOrEqual(5);
            expect(h.heightRatios.length).toBeGreaterThanOrEqual(5);
          }
        })
      );
    });

    it('element hints have a non-empty elementId, a hex color, and valid center/size fractions', () => {
      service.getCountries().forEach(c =>
        c.hints.forEach(h => {
          if (h.kind === 'element') {
            expect(h.elementId.length).toBeGreaterThan(0);
            expect(h.color).toMatch(/^#[0-9a-fA-F]{6}$/);
            expect(h.xCenter).toBeGreaterThanOrEqual(0);
            expect(h.xCenter).toBeLessThanOrEqual(1);
            expect(h.yCenter).toBeGreaterThanOrEqual(0);
            expect(h.yCenter).toBeLessThanOrEqual(1);
            expect(h.sizeFraction).toBeGreaterThan(0);
            expect(h.sizeFraction).toBeLessThanOrEqual(1);
          }
        })
      );
    });

    it('includes Albania', () => {
      expect(service.getCountries().map(c => c.name)).toContain('Albania');
    });

    it('Albania has an element hint for the double-headed eagle', () => {
      const albania = service.getCountries().find(c => c.name === 'Albania')!;
      expect(albania).toBeTruthy();
      const elementHint = albania.hints.find(h => h.kind === 'element');
      expect(elementHint).toBeTruthy();
      if (elementHint?.kind === 'element') {
        expect(elementHint.elementId).toBe('albania-eagle');
      }
    });

    it('includes Canada', () => {
      expect(service.getCountries().map(c => c.name)).toContain('Canada');
    });

    it('Canada has ratio 1:2', () => {
      const canada = service.getCountries().find(c => c.name === 'Canada')!;
      expect(canada.ratio).toBe('1:2');
    });

    it('Canada has a vertical bands hint and a maple leaf element hint', () => {
      const canada = service.getCountries().find(c => c.name === 'Canada')!;
      const bandsHint = canada.hints.find(h => h.kind === 'bands');
      expect(bandsHint).toBeTruthy();
      if (bandsHint?.kind === 'bands') {
        expect(bandsHint.direction).toBe('vertical');
        expect(bandsHint.ratios).toEqual([1, 2, 1]);
      }
      const elementHint = canada.hints.find(h => h.kind === 'element');
      expect(elementHint).toBeTruthy();
      if (elementHint?.kind === 'element') {
        expect(elementHint.elementId).toBe('canada-maple-leaf');
      }
    });

    it('Canada colors include the flag red', () => {
      const canada = service.getCountries().find(c => c.name === 'Canada')!;
      expect(canada.colors).toContain('#d52b1e');
    });

    it('includes Slovenia', () => {
      expect(service.getCountries().map(c => c.name)).toContain('Slovenia');
    });

    it('Slovenia has ratio 1:2', () => {
      const slovenia = service.getCountries().find(c => c.name === 'Slovenia')!;
      expect(slovenia.ratio).toBe('1:2');
    });

    it('Slovenia has a horizontal bands hint and a coat of arms element hint', () => {
      const slovenia = service.getCountries().find(c => c.name === 'Slovenia')!;
      const bandsHint = slovenia.hints.find(h => h.kind === 'bands');
      expect(bandsHint).toBeTruthy();
      if (bandsHint?.kind === 'bands') {
        expect(bandsHint.direction).toBe('horizontal');
        expect(bandsHint.ratios).toEqual([1, 1, 1]);
      }
      const elementHint = slovenia.hints.find(h => h.kind === 'element');
      expect(elementHint).toBeTruthy();
      if (elementHint?.kind === 'element') {
        expect(elementHint.elementId).toBe('slovenia-coat-of-arms');
      }
    });

    it('includes Slovakia', () => {
      expect(service.getCountries().map(c => c.name)).toContain('Slovakia');
    });

    it('Slovakia has ratio 2:3', () => {
      const slovakia = service.getCountries().find(c => c.name === 'Slovakia')!;
      expect(slovakia.ratio).toBe('2:3');
    });

    it('Slovakia has a horizontal bands hint and a coat of arms element hint', () => {
      const slovakia = service.getCountries().find(c => c.name === 'Slovakia')!;
      const bandsHint = slovakia.hints.find(h => h.kind === 'bands');
      expect(bandsHint).toBeTruthy();
      if (bandsHint?.kind === 'bands') {
        expect(bandsHint.direction).toBe('horizontal');
        expect(bandsHint.ratios).toEqual([1, 1, 1]);
      }
      const elementHint = slovakia.hints.find(h => h.kind === 'element');
      expect(elementHint).toBeTruthy();
      if (elementHint?.kind === 'element') {
        expect(elementHint.elementId).toBe('slovakia-coat-of-arms');
      }
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
      const countries = service.getCountries();
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
