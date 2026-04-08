import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ElementsModalComponent, ElementSelection } from './elements-modal';
import { SplitConfig } from './toolbar';
import { FlagElement } from './flag-elements';

// A concrete element used to drive element-path tests
const TEST_ELEMENT: FlagElement = {
  id: 'test-circle',
  name: 'Circle',
  flagOf: 'Test Country',
  category: 'symbols',
  defaultColor: '#ffffff',
  svgContent: '<circle cx="50" cy="50" r="40" fill="currentColor"/>',
};

describe('ElementsModalComponent', () => {
  let component: ElementsModalComponent;
  let fixture: ComponentFixture<ElementsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementsModalComponent],
    }).compileComponents();

    fixture   = TestBed.createComponent(ElementsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('activeColor', '#000000');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial state ─────────────────────────────────────────────────────────────

  it('activeCategory defaults to bands',  () => expect(component.activeCategory()).toBe('bands'));
  it('selectedItem defaults to null',     () => expect(component.selectedItem()).toBeNull());
  it('splitRatios defaults to [1, 1]',   () => expect(component.splitRatios()).toEqual([1, 1]));
  it('splitCount defaults to 2',          () => expect(component.splitCount()).toBe(2));

  // ── categories array ──────────────────────────────────────────────────────────

  it('categories always contains "all"',   () => {
    expect(component.categories.map(c => c.id)).toContain('all');
  });

  it('categories always contains "bands"', () => {
    expect(component.categories.map(c => c.id)).toContain('bands');
  });

  // ── splitCounts ───────────────────────────────────────────────────────────────

  it('splitCounts starts at 2', () => {
    expect(component.splitCounts[0]).toBe(2);
  });

  it('splitCounts ends at 13', () => {
    expect(component.splitCounts[component.splitCounts.length - 1]).toBe(13);
  });

  it('splitCounts has 12 entries', () => {
    expect(component.splitCounts.length).toBe(12);
  });

  // ── filteredItems ─────────────────────────────────────────────────────────────

  it('"bands" category shows only band items', () => {
    component.setCategory('bands');
    expect(component.filteredItems().every(i => i.kind === 'band')).toBeTrue();
  });

  it('"bands" category shows horizontal and vertical band items', () => {
    component.setCategory('bands');
    const dirs = component.filteredItems()
      .filter(i => i.kind === 'band')
      .map(i => (i as any).direction as string);
    expect(dirs).toContain('horizontal');
    expect(dirs).toContain('vertical');
  });

  it('"all" category includes band items', () => {
    component.setCategory('all');
    expect(component.filteredItems().some(i => i.kind === 'band')).toBeTrue();
  });

  // ── setCategory ───────────────────────────────────────────────────────────────

  it('setCategory updates activeCategory', () => {
    component.setCategory('bands');
    expect(component.activeCategory()).toBe('bands');
  });

  it('setCategory clears the current selection', () => {
    component.selectItem({ kind: 'band', direction: 'horizontal', label: 'H' });
    component.setCategory('bands');
    expect(component.selectedItem()).toBeNull();
  });

  // ── selectItem / isItemSelected ───────────────────────────────────────────────

  it('selectItem stores the item in selectedItem', () => {
    const item = { kind: 'band' as const, direction: 'horizontal' as const, label: 'H' };
    component.selectItem(item);
    expect(component.selectedItem()).toEqual(item);
  });

  it('isItemSelected returns true for the exact selected band', () => {
    const item = { kind: 'band' as const, direction: 'horizontal' as const, label: 'H' };
    component.selectItem(item);
    expect(component.isItemSelected(item)).toBeTrue();
  });

  it('isItemSelected returns false for a band with different direction', () => {
    component.selectItem({ kind: 'band', direction: 'horizontal', label: 'H' });
    expect(component.isItemSelected({ kind: 'band', direction: 'vertical', label: 'V' })).toBeFalse();
  });

  it('isItemSelected returns false when nothing is selected', () => {
    expect(component.isItemSelected({ kind: 'band', direction: 'horizontal', label: 'H' })).toBeFalse();
  });

  it('isItemSelected returns true for a selected element matched by id', () => {
    const item = { kind: 'element' as const, el: TEST_ELEMENT };
    component.selectItem(item);
    expect(component.isItemSelected(item)).toBeTrue();
  });

  it('isItemSelected returns false for an element with a different id', () => {
    component.selectItem({ kind: 'element', el: TEST_ELEMENT });
    const other = { ...TEST_ELEMENT, id: 'other-id' };
    expect(component.isItemSelected({ kind: 'element', el: other })).toBeFalse();
  });

  it('isItemSelected returns false when comparing band against element kind', () => {
    component.selectItem({ kind: 'band', direction: 'horizontal', label: 'H' });
    expect(component.isItemSelected({ kind: 'element', el: TEST_ELEMENT })).toBeFalse();
  });

  // ── isBandSelected ────────────────────────────────────────────────────────────

  it('isBandSelected is true when a band item is selected', () => {
    component.selectItem({ kind: 'band', direction: 'horizontal', label: 'H' });
    expect(component.isBandSelected()).toBeTrue();
  });

  it('isBandSelected is false when nothing is selected', () => {
    expect(component.isBandSelected()).toBeFalse();
  });

  it('isBandSelected is false when an element item is selected', () => {
    component.selectItem({ kind: 'element', el: TEST_ELEMENT });
    expect(component.isBandSelected()).toBeFalse();
  });

  // ── setSplitCount ─────────────────────────────────────────────────────────────

  it('setSplitCount(4) expands ratios to length 4 padding with 1s', () => {
    component.setSplitCount(4);
    expect(component.splitRatios()).toEqual([1, 1, 1, 1]);
  });

  it('setSplitCount preserves existing values when growing', () => {
    component.splitRatios.set([2, 3]);
    component.setSplitCount(4);
    expect(component.splitRatios()).toEqual([2, 3, 1, 1]);
  });

  it('setSplitCount truncates to the requested length when shrinking', () => {
    component.splitRatios.set([2, 3, 4, 5]);
    component.setSplitCount(2);
    expect(component.splitRatios()).toEqual([2, 3]);
  });

  it('setSplitCount updates splitCount accordingly', () => {
    component.setSplitCount(5);
    expect(component.splitCount()).toBe(5);
  });

  it('setSplitCount(2) on default [1,1] leaves array unchanged', () => {
    component.setSplitCount(2);
    expect(component.splitRatios()).toEqual([1, 1]);
  });

  // ── updateRatio ───────────────────────────────────────────────────────────────

  it('updateRatio sets the value at the given index', () => {
    component.updateRatio(0, { target: { value: '3' } } as unknown as Event);
    expect(component.splitRatios()[0]).toBe(3);
  });

  it('updateRatio clamps values below 1 to 1', () => {
    component.updateRatio(0, { target: { value: '0' } } as unknown as Event);
    expect(component.splitRatios()[0]).toBe(1);
  });

  it('updateRatio clamps values above 9 to 9', () => {
    component.updateRatio(0, { target: { value: '10' } } as unknown as Event);
    expect(component.splitRatios()[0]).toBe(9);
  });

  it('updateRatio treats NaN input as 1', () => {
    component.updateRatio(0, { target: { value: 'abc' } } as unknown as Event);
    expect(component.splitRatios()[0]).toBe(1);
  });

  it('updateRatio accepts the minimum valid value of 1', () => {
    component.updateRatio(0, { target: { value: '1' } } as unknown as Event);
    expect(component.splitRatios()[0]).toBe(1);
  });

  it('updateRatio accepts the maximum valid value of 9', () => {
    component.updateRatio(0, { target: { value: '9' } } as unknown as Event);
    expect(component.splitRatios()[0]).toBe(9);
  });

  it('updateRatio produces a new array reference (immutable update)', () => {
    const before = component.splitRatios();
    component.updateRatio(0, { target: { value: '5' } } as unknown as Event);
    expect(component.splitRatios()).not.toBe(before);
  });

  it('updateRatio only changes the specified index', () => {
    component.splitRatios.set([1, 1]);
    component.updateRatio(1, { target: { value: '4' } } as unknown as Event);
    expect(component.splitRatios()[0]).toBe(1);
    expect(component.splitRatios()[1]).toBe(4);
  });

  // ── onOk ──────────────────────────────────────────────────────────────────────

  it('onOk does nothing when no item is selected', () => {
    const elSpy = jasmine.createSpy();
    const spSpy = jasmine.createSpy();
    component.elementSelected.subscribe(elSpy);
    component.splitsSelected.subscribe(spSpy);
    component.onOk();
    expect(elSpy).not.toHaveBeenCalled();
    expect(spSpy).not.toHaveBeenCalled();
  });

  it('onOk emits elementSelected with element and size=80 for element items', () => {
    const emitted: ElementSelection[] = [];
    component.elementSelected.subscribe(v => emitted.push(v));
    component.selectItem({ kind: 'element', el: TEST_ELEMENT });
    component.onOk();
    expect(emitted.length).toBe(1);
    expect(emitted[0].element).toBe(TEST_ELEMENT);
    expect(emitted[0].size).toBe(80);
  });

  it('onOk emits splitsSelected with correct direction and ratios for band items', () => {
    const emitted: SplitConfig[] = [];
    component.splitsSelected.subscribe(v => emitted.push(v));
    component.selectItem({ kind: 'band', direction: 'vertical', label: 'V' });
    component.splitRatios.set([1, 2, 1]);
    component.onOk();
    expect(emitted.length).toBe(1);
    expect(emitted[0].direction).toBe('vertical');
    expect(emitted[0].ratios).toEqual([1, 2, 1]);
  });

  it('onOk clears selectedItem after emitting', () => {
    component.selectItem({ kind: 'band', direction: 'horizontal', label: 'H' });
    component.onOk();
    expect(component.selectedItem()).toBeNull();
  });

  it('onOk emits closed after emitting selection', () => {
    let closedEmitted = false;
    component.closed.subscribe(() => { closedEmitted = true; });
    component.selectItem({ kind: 'band', direction: 'horizontal', label: 'H' });
    component.onOk();
    expect(closedEmitted).toBeTrue();
  });

  // ── onClose ───────────────────────────────────────────────────────────────────

  it('onClose clears selectedItem', () => {
    component.selectItem({ kind: 'band', direction: 'horizontal', label: 'H' });
    component.onClose();
    expect(component.selectedItem()).toBeNull();
  });

  it('onClose emits closed', () => {
    let closedEmitted = false;
    component.closed.subscribe(() => { closedEmitted = true; });
    component.onClose();
    expect(closedEmitted).toBeTrue();
  });

  // ── onBackdropClick ───────────────────────────────────────────────────────────

  it('onBackdropClick closes the modal when target equals currentTarget', () => {
    let closedEmitted = false;
    component.closed.subscribe(() => { closedEmitted = true; });
    const el = document.createElement('div');
    component.onBackdropClick({ target: el, currentTarget: el } as unknown as MouseEvent);
    expect(closedEmitted).toBeTrue();
  });

  it('onBackdropClick does NOT close when target is a child element', () => {
    let closedEmitted = false;
    component.closed.subscribe(() => { closedEmitted = true; });
    const parent = document.createElement('div');
    const child  = document.createElement('div');
    component.onBackdropClick({ target: child, currentTarget: parent } as unknown as MouseEvent);
    expect(closedEmitted).toBeFalse();
  });

  // ── getElementPreviewSvg ──────────────────────────────────────────────────────

  it('getElementPreviewSvg substitutes activeColor for currentColor', () => {
    fixture.componentRef.setInput('activeColor', '#ff0000');
    fixture.detectChanges();
    const result = component.getElementPreviewSvg(TEST_ELEMENT) as any;
    const html: string = result['changingThisBreaksApplicationSecurity'];
    expect(html).toContain('#ff0000');
    expect(html).not.toContain('currentColor');
  });

  it('getElementPreviewSvg wraps content in an SVG with viewBox', () => {
    const result = component.getElementPreviewSvg(TEST_ELEMENT) as any;
    const html: string = result['changingThisBreaksApplicationSecurity'];
    expect(html).toContain('<svg');
    expect(html).toContain('viewBox="0 0 100 100"');
  });

  // ── getBandPreviewSvg ─────────────────────────────────────────────────────────

  it('getBandPreviewSvg returns SVG markup for horizontal bands', () => {
    const result = component.getBandPreviewSvg('horizontal') as any;
    const html: string = result['changingThisBreaksApplicationSecurity'];
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
  });

  it('getBandPreviewSvg returns SVG markup for vertical bands', () => {
    const result = component.getBandPreviewSvg('vertical') as any;
    const html: string = result['changingThisBreaksApplicationSecurity'];
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
  });

  it('getBandPreviewSvg horizontal rect has fixed y positions', () => {
    const result = component.getBandPreviewSvg('horizontal') as any;
    const html: string = result['changingThisBreaksApplicationSecurity'];
    // Horizontal bands stack vertically — first band starts at y=0
    expect(html).toContain('y="0"');
  });

  it('getBandPreviewSvg vertical rect has fixed x positions', () => {
    const result = component.getBandPreviewSvg('vertical') as any;
    const html: string = result['changingThisBreaksApplicationSecurity'];
    // Vertical bands stack horizontally — first band starts at x=0
    expect(html).toContain('x="0"');
  });
});
