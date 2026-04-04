import { Component, input, output } from '@angular/core';

export type DrawingTool = 'fill' | 'eraser';

export type SplitDirection = 'horizontal' | 'vertical';

export interface SplitConfig {
  direction: SplitDirection;
  ratios: number[];
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
