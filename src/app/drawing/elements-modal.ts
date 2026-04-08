import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FLAG_ELEMENTS, FlagElement, ElementCategory } from './flag-elements';
import { SplitConfig, SplitDirection, CrossConfig, CrossVariant } from './toolbar';

type ActiveCategory = ElementCategory | 'all' | 'bands' | 'crosses';

type GridItem =
  | { kind: 'element'; el: FlagElement }
  | { kind: 'band'; direction: SplitDirection; label: string }
  | { kind: 'cross'; variant: CrossVariant; label: string };

export interface ElementSelection {
  element: FlagElement;
  size: number;
}

const CATEGORY_LABELS: Record<ElementCategory, string> = {
  maps:         'Maps',
  coat_of_arms: 'Coat of arms',
  animals:      'Animals',
  plants:       'Plants',
  symbols:      'Symbols',
};

@Component({
  selector: 'app-elements-modal',
  templateUrl: './elements-modal.html',
  styleUrl: './elements-modal.css',
})
export class ElementsModalComponent {
  private readonly sanitizer = inject(DomSanitizer);

  isOpen = input.required<boolean>();
  activeColor = input.required<string>();

  closed = output<void>();
  elementSelected = output<ElementSelection>();
  splitsSelected = output<SplitConfig>();
  crossSelected = output<CrossConfig>();

  readonly categories: { id: ActiveCategory; label: string }[] = [
    { id: 'all',     label: 'All' },
    { id: 'bands',   label: 'Bands' },
    { id: 'crosses', label: 'Crosses' },
    ...[...new Set(FLAG_ELEMENTS.map(e => e.category))].map(cat => ({
      id: cat as ActiveCategory,
      label: CATEGORY_LABELS[cat],
    })),
  ];

  readonly bandItems: GridItem[] = [
    { kind: 'band', direction: 'horizontal', label: 'Horizontal Bands' },
    { kind: 'band', direction: 'vertical',   label: 'Vertical Bands'   },
  ];

  readonly crossItems: GridItem[] = [
    { kind: 'cross', variant: 'simple', label: 'Simple Cross' },
    { kind: 'cross', variant: 'double', label: 'Double Cross' },
  ];

  activeCategory = signal<ActiveCategory>('bands');
  selectedItem = signal<GridItem | null>(null);

  // Band configuration
  readonly splitCounts = Array.from({ length: 12 }, (_, i) => i + 2);
  splitRatios = signal<number[]>([1, 1]);
  readonly splitCount = computed(() => this.splitRatios().length);

  // Cross ratio configuration — reset to defaults when the variant changes
  // Simple default: Finland (5:3:10 width, 4:3:4 height)
  // Double default: Norway (6:1:2:1:12 width, 6:1:2:1:6 height)
  crossWidthRatios  = signal<number[]>([5, 3, 10]);
  crossHeightRatios = signal<number[]>([4, 3, 4]);

  readonly filteredItems = computed((): GridItem[] => {
    const cat = this.activeCategory();
    if (cat === 'bands')   return this.bandItems;
    if (cat === 'crosses') return this.crossItems;
    const elements = (cat === 'all'
      ? FLAG_ELEMENTS
      : FLAG_ELEMENTS.filter(e => e.category === cat)
    ).map(el => ({ kind: 'element' as const, el }));
    return cat === 'all' ? [...this.bandItems, ...this.crossItems, ...elements] : elements;
  });

  setCategory(cat: ActiveCategory): void {
    this.activeCategory.set(cat);
    this.selectedItem.set(null);
  }

  selectItem(item: GridItem): void {
    const prev = this.selectedItem();
    this.selectedItem.set(item);
    // Reset cross ratios when switching to a different variant
    if (item.kind === 'cross') {
      const prevVariant = prev?.kind === 'cross' ? prev.variant : null;
      if (prevVariant !== item.variant) {
        if (item.variant === 'simple') {
          this.crossWidthRatios.set([5, 3, 10]);
          this.crossHeightRatios.set([4, 3, 4]);
        } else {
          this.crossWidthRatios.set([6, 1, 2, 1, 12]);
          this.crossHeightRatios.set([6, 1, 2, 1, 6]);
        }
      }
    }
  }

  isItemSelected(item: GridItem): boolean {
    const sel = this.selectedItem();
    if (!sel) return false;
    if (sel.kind === 'band'    && item.kind === 'band')    return sel.direction === item.direction;
    if (sel.kind === 'element' && item.kind === 'element') return sel.el.id === item.el.id;
    if (sel.kind === 'cross'   && item.kind === 'cross')   return sel.variant === item.variant;
    return false;
  }

  isBandSelected(): boolean {
    return this.selectedItem()?.kind === 'band';
  }

  isCrossSelected(): boolean {
    return this.selectedItem()?.kind === 'cross';
  }

  updateCrossWidthRatio(index: number, event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const value = Math.max(1, Math.min(99, isNaN(raw) ? 1 : raw));
    const ratios = [...this.crossWidthRatios()];
    ratios[index] = value;
    this.crossWidthRatios.set(ratios);
  }

  updateCrossHeightRatio(index: number, event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const value = Math.max(1, Math.min(99, isNaN(raw) ? 1 : raw));
    const ratios = [...this.crossHeightRatios()];
    ratios[index] = value;
    this.crossHeightRatios.set(ratios);
  }

  setSplitCount(n: number): void {
    const current = this.splitRatios();
    if (n > current.length) {
      this.splitRatios.set([...current, ...Array(n - current.length).fill(1)]);
    } else {
      this.splitRatios.set(current.slice(0, n));
    }
  }

  updateRatio(index: number, event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const value = Math.max(1, Math.min(9, isNaN(raw) ? 1 : raw));
    const ratios = [...this.splitRatios()];
    ratios[index] = value;
    this.splitRatios.set(ratios);
  }

  onOk(): void {
    const item = this.selectedItem();
    if (!item) return;
    if (item.kind === 'element') {
      this.elementSelected.emit({ element: item.el, size: 80 });
    } else if (item.kind === 'band') {
      this.splitsSelected.emit({ direction: item.direction, ratios: this.splitRatios() });
    } else {
      this.crossSelected.emit({
        variant: item.variant,
        widthRatios:  this.crossWidthRatios(),
        heightRatios: this.crossHeightRatios(),
      });
    }
    this.onClose();
  }

  onClose(): void {
    this.selectedItem.set(null);
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }

  getElementPreviewSvg(el: FlagElement): SafeHtml {
    const color = this.activeColor();
    const content = el.svgContent.replace(/currentColor/g, color);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${content}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getBandPreviewSvg(direction: SplitDirection): SafeHtml {
    const colors = ['#4a7cbe', '#e8e8e8', '#be4a4a'];
    const rects = direction === 'horizontal'
      ? colors.map((c, i) => `<rect x="0" y="${i * 33.3}" width="100" height="33.4" fill="${c}"/>`).join('')
      : colors.map((c, i) => `<rect x="${i * 33.3}" y="0" width="33.4" height="100" fill="${c}"/>`).join('');
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${rects}</svg>`
    );
  }

  getCrossPreviewSvg(variant: CrossVariant): SafeHtml {
    // Simple cross: Denmark proportions (viewBox 37×28, cross at x=14 y=14, width=4)
    // Double cross: Norway proportions (viewBox 22×16, outer=4, inner=2)
    const svg = variant === 'simple'
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 28">
           <rect width="37" height="28" fill="#c8102e"/>
           <path stroke="#fff" stroke-width="4" d="M0,14h37M14,0v28"/>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 16">
           <rect width="22" height="16" fill="#ba0c2f"/>
           <path stroke="#fff" stroke-width="4" d="M0,8h22M8,0v16"/>
           <path stroke="#00205b" stroke-width="2" d="M0,8h22M8,0v16"/>
         </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
