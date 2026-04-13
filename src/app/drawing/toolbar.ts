import { Component, input, output } from '@angular/core';

export type SplitDirection = 'horizontal' | 'vertical';

export interface SplitConfig {
  direction: SplitDirection;
  ratios: number[];
}

export type CrossVariant = 'simple' | 'double';

export interface CrossConfig {
  variant: CrossVariant;
  /**
   * Width division ratios: [left, bar, right] for simple cross,
   * or [left, outer, inner, outer, right] for double cross.
   * e.g. Finland simple: [5, 3, 10]
   */
  widthRatios: number[];
  /**
   * Height division ratios: [top, bar, bottom] for simple cross,
   * or [top, outer, inner, outer, bottom] for double cross.
   * e.g. Finland simple: [4, 3, 4]
   */
  heightRatios: number[];
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class ToolbarComponent {
  activeColor = input.required<string>();
  /** When non-null, replaces the free color picker with a fixed palette of flag colors. */
  allowedColors = input<string[] | null>(null);
  /** Label for the clear/cancel button. */
  clearLabel = input<string>('🗑️ Clear');
  /** Whether to show the Elements library button. */
  showElements = input<boolean>(true);
  /** Whether to show the pen size slider. */
  showPenSize = input<boolean>(false);
  /** Current pen radius in pixels (used when showPenSize is true). */
  penSize = input<number>(4);

  colorChange = output<string>();
  clearCanvas = output<void>();
  openElements = output<void>();
  penSizeChange = output<number>();

  onColorInput(event: Event): void {
    this.colorChange.emit((event.target as HTMLInputElement).value);
  }

  onClear(): void {
    this.clearCanvas.emit();
  }

  onPenSizeInput(event: Event): void {
    this.penSizeChange.emit(Number((event.target as HTMLInputElement).value));
  }
}
