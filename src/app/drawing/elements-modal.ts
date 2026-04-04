import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FLAG_ELEMENTS, FlagElement, ElementCategory } from './flag-elements';
import { SplitConfig, SplitDirection } from './toolbar';

type ActiveCategory = ElementCategory | 'all' | 'bands';

type GridItem =
  | { kind: 'element'; el: FlagElement }
  | { kind: 'band'; direction: SplitDirection; label: string };

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

  readonly categories: { id: ActiveCategory; label: string }[] = [
    { id: 'all',   label: 'All' },
    { id: 'bands', label: 'Bands' },
    ...[...new Set(FLAG_ELEMENTS.map(e => e.category))].map(cat => ({
      id: cat as ActiveCategory,
      label: CATEGORY_LABELS[cat],
    })),
  ];

  readonly bandItems: GridItem[] = [
    { kind: 'band', direction: 'horizontal', label: 'Horizontal Bands' },
    { kind: 'band', direction: 'vertical',   label: 'Vertical Bands'   },
  ];

  activeCategory = signal<ActiveCategory>('all');
  selectedItem = signal<GridItem | null>(null);

  // Band configuration
  readonly splitCounts = Array.from({ length: 12 }, (_, i) => i + 2);
  splitRatios = signal<number[]>([1, 1]);
  readonly splitCount = computed(() => this.splitRatios().length);

  readonly filteredItems = computed((): GridItem[] => {
    const cat = this.activeCategory();
    if (cat === 'bands') return this.bandItems;
    const elements = (cat === 'all'
      ? FLAG_ELEMENTS
      : FLAG_ELEMENTS.filter(e => e.category === cat)
    ).map(el => ({ kind: 'element' as const, el }));
    return cat === 'all' ? [...this.bandItems, ...elements] : elements;
  });

  setCategory(cat: ActiveCategory): void {
    this.activeCategory.set(cat);
    this.selectedItem.set(null);
  }

  selectItem(item: GridItem): void {
    this.selectedItem.set(item);
  }

  isItemSelected(item: GridItem): boolean {
    const sel = this.selectedItem();
    if (!sel) return false;
    if (sel.kind === 'band' && item.kind === 'band') return sel.direction === item.direction;
    if (sel.kind === 'element' && item.kind === 'element') return sel.el.id === item.el.id;
    return false;
  }

  isBandSelected(): boolean {
    return this.selectedItem()?.kind === 'band';
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
    } else {
      this.splitsSelected.emit({ direction: item.direction, ratios: this.splitRatios() });
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
}
