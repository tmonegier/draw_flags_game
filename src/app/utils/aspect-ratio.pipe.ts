import { Pipe, PipeTransform } from '@angular/core';
import { ratioToCssAspect } from './ratio';

@Pipe({ name: 'aspectRatio', standalone: true, pure: true })
export class AspectRatioPipe implements PipeTransform {
  transform(ratio: string): string {
    return ratioToCssAspect(ratio);
  }
}
