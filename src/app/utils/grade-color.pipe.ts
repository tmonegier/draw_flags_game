import { Pipe, PipeTransform } from '@angular/core';
import { GRADE_COLORS, Grade } from '../scoring-config';

const FALLBACK = '#888';

@Pipe({ name: 'gradeColor', standalone: true, pure: true })
export class GradeColorPipe implements PipeTransform {
  transform(grade: string | null | undefined): string {
    if (!grade) return FALLBACK;
    return GRADE_COLORS[grade as Grade] ?? FALLBACK;
  }
}
