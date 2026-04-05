import { Component, input, output } from '@angular/core';

export type DrawingTool = 'fill' | 'eraser';

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

export interface ToolState {
  tool: DrawingTool;
  color: string;
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class ToolbarComponent {
  activeTool = input.required<DrawingTool>();
  activeColor = input.required<string>();

  toolChange = output<DrawingTool>();
  colorChange = output<string>();
  clearCanvas = output<void>();
  openElements = output<void>();

  readonly tools: { key: DrawingTool; icon: string; title: string }[] = [
    { key: 'fill', icon: '🪣', title: 'Fill (Bucket)' },
    { key: 'eraser', icon: '⬜', title: 'Eraser' },
  ];

  selectTool(tool: DrawingTool): void {
    this.toolChange.emit(tool);
  }

  onColorInput(event: Event): void {
    this.colorChange.emit((event.target as HTMLInputElement).value);
  }

  onClear(): void {
    this.clearCanvas.emit();
  }
}
