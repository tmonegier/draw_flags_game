import { Component, computed, effect, input, output, signal } from '@angular/core';
import { Difficulty } from '../services/country.service';

interface TutorialStep {
  emoji: string;
  title: string;
  body: string;
}

const STEPS: Record<Difficulty, TutorialStep[]> = {
  easy: [
    {
      emoji: '📐',
      title: 'Guide Lines Are Pre-Drawn',
      body: "The flag's bands, crosses, and elements are already sketched as guides — focus on filling them in with color.",
    },
    {
      emoji: '🎨',
      title: 'Restricted Color Palette',
      body: "Only the flag's real colors appear in the toolbar. No guessing — just pick a color and click to fill.",
    },
    {
      emoji: '🪣',
      title: 'Click to Flood-Fill',
      body: 'Click anywhere on the canvas to flood-fill that region with your active color. Guide lines act as boundaries.',
    },
    {
      emoji: '↩️',
      title: 'Cancel Changes',
      body: 'Made a mistake? Hit "↩️ Cancel Changes" to instantly restore the canvas to its original pre-drawn state.',
    },
  ],
  hard: [
    {
      emoji: '🏁',
      title: 'Blank Canvas',
      body: 'No hints, no guides. Draw the entire flag from scratch — both the layout and the colors.',
    },
    {
      emoji: '🧩',
      title: 'Elements Panel',
      body: 'Use the Elements button to add horizontal/vertical bands, Nordic crosses, or special SVG stamps like coats of arms.',
    },
    {
      emoji: '🎨',
      title: 'Full Color Picker',
      body: "Use the full color picker to match the flag's exact colors as closely as you can.",
    },
    {
      emoji: '🪣',
      title: 'Click to Flood-Fill',
      body: 'Click anywhere on the canvas to flood-fill a region. Add bands or crosses first to create fill boundaries.',
    },
    {
      emoji: '🗑️',
      title: 'Clear Canvas',
      body: 'Made a mess? Hit "🗑️ Clear" to wipe everything and start again from a blank canvas.',
    },
  ],
  free: [
    {
      emoji: '✏️',
      title: 'Freehand Pen',
      body: 'Hold the mouse button and drag to draw freely on the canvas. No flood-fill — every stroke is yours.',
    },
    {
      emoji: '🎨',
      title: 'Flag Color Palette',
      body: "Only the flag's real colors are available. Pick a color from the palette and draw away.",
    },
    {
      emoji: '🗑️',
      title: 'Clear Canvas',
      body: 'Made a mistake? Hit "🗑️ Clear" to wipe the canvas and start over.',
    },
  ],
};

@Component({
  selector: 'app-tutorial-modal',
  templateUrl: './tutorial-modal.html',
  styleUrl: './tutorial-modal.css',
})
export class TutorialModalComponent {
  difficulty = input.required<Difficulty>();
  isOpen = input<boolean>(false);

  closed = output<void>();

  showSteps = signal(false);
  currentStep = signal(0);

  readonly difficultyLabel = computed(() => {
    const map: Record<Difficulty, string> = { easy: 'Pre-fill Flags', hard: 'Free Canvas', free: 'Free' };
    return map[this.difficulty()];
  });

  readonly difficultyEmoji = computed(() => {
    const map: Record<Difficulty, string> = { easy: '🟢', hard: '🔴', free: '✏️' };
    return map[this.difficulty()];
  });

  readonly steps = computed(() => STEPS[this.difficulty()]);

  readonly currentStepData = computed(() => this.steps()[this.currentStep()]);

  readonly isLastStep = computed(() => this.currentStep() === this.steps().length - 1);

  constructor() {
    // Reset to confirmation screen each time the modal opens.
    effect(() => {
      if (this.isOpen()) {
        this.showSteps.set(false);
        this.currentStep.set(0);
      }
    });
  }

  skip(): void {
    this.showSteps.set(false);
    this.closed.emit();
  }

  startTutorial(): void {
    this.currentStep.set(0);
    this.showSteps.set(true);
  }

  prev(): void {
    this.currentStep.update(s => s - 1);
  }

  next(): void {
    if (this.isLastStep()) {
      this.showSteps.set(false);
      this.closed.emit();
    } else {
      this.currentStep.update(s => s + 1);
    }
  }
}
