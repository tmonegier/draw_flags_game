import { GradeColorPipe } from './grade-color.pipe';
import { GRADE_COLORS } from '../scoring-config';

describe('GradeColorPipe', () => {
  const pipe = new GradeColorPipe();

  for (const [grade, color] of Object.entries(GRADE_COLORS)) {
    it(`returns ${color} for grade ${grade}`, () => {
      expect(pipe.transform(grade)).toBe(color);
    });
  }

  it('returns the fallback colour for an unknown grade', () => {
    expect(pipe.transform('Z')).toBe('#888');
  });

  it('returns the fallback colour for empty/null/undefined', () => {
    expect(pipe.transform('')).toBe('#888');
    expect(pipe.transform(null)).toBe('#888');
    expect(pipe.transform(undefined)).toBe('#888');
  });
});
