import { parseRatio, ratioToCssAspect } from './ratio';
import { AspectRatioPipe } from './aspect-ratio.pipe';

describe('parseRatio', () => {
  it('splits "h:w" into numeric h and w', () => {
    expect(parseRatio('2:3')).toEqual({ h: 2, w: 3 });
  });
  it('handles 1:1', () => {
    expect(parseRatio('1:1')).toEqual({ h: 1, w: 1 });
  });
});

describe('ratioToCssAspect', () => {
  const cases: Array<[string, string]> = [
    ['2:3', '3/2'],
    ['1:2', '2/1'],
    ['3:5', '5/3'],
    ['1:1', '1/1'],
    ['2:5', '5/2'],
  ];
  for (const [input, expected] of cases) {
    it(`converts ${input} to ${expected}`, () => {
      expect(ratioToCssAspect(input)).toBe(expected);
    });
  }
});

describe('AspectRatioPipe', () => {
  const pipe = new AspectRatioPipe();
  it('delegates to ratioToCssAspect', () => {
    expect(pipe.transform('2:3')).toBe('3/2');
  });
});
