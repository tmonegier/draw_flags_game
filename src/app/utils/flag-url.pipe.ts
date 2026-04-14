import { Pipe, PipeTransform } from '@angular/core';
import { getFlagUrl } from './flag-url';

@Pipe({ name: 'flagUrl', standalone: true, pure: true })
export class FlagUrlPipe implements PipeTransform {
  transform(svgFile: string): string {
    return getFlagUrl(svgFile);
  }
}
