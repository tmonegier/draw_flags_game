import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarComponent],
    }).compileComponents();

    fixture   = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeColor', '#000000');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── clearLabel input ──────────────────────────────────────────────────────────

  it('clearLabel defaults to "🗑️ Clear"', () => {
    expect(component.clearLabel()).toBe('🗑️ Clear');
  });

  it('clearLabel reflects a custom value', () => {
    fixture.componentRef.setInput('clearLabel', '↩️ Cancel Changes');
    fixture.detectChanges();
    expect(component.clearLabel()).toBe('↩️ Cancel Changes');
  });

  // ── showElements input ────────────────────────────────────────────────────────

  it('showElements defaults to true', () => {
    expect(component.showElements()).toBeTrue();
  });

  it('showElements can be set to false', () => {
    fixture.componentRef.setInput('showElements', false);
    fixture.detectChanges();
    expect(component.showElements()).toBeFalse();
  });

  // ── onColorInput ──────────────────────────────────────────────────────────────

  it('onColorInput emits the input element value via colorChange', () => {
    const emitted: string[] = [];
    component.colorChange.subscribe(v => emitted.push(v));
    component.onColorInput({ target: { value: '#ff0000' } } as unknown as Event);
    expect(emitted).toEqual(['#ff0000']);
  });

  it('onColorInput passes the exact value without modification', () => {
    const emitted: string[] = [];
    component.colorChange.subscribe(v => emitted.push(v));
    component.onColorInput({ target: { value: '#abc123' } } as unknown as Event);
    expect(emitted).toEqual(['#abc123']);
  });

  // ── onClear ───────────────────────────────────────────────────────────────────

  it('onClear emits clearCanvas', () => {
    let called = false;
    component.clearCanvas.subscribe(() => { called = true; });
    component.onClear();
    expect(called).toBeTrue();
  });

  it('onClear emits exactly once per call', () => {
    let callCount = 0;
    component.clearCanvas.subscribe(() => callCount++);
    component.onClear();
    component.onClear();
    expect(callCount).toBe(2);
  });

  // ── input signals ─────────────────────────────────────────────────────────────

  it('activeColor input is readable as a signal', () => {
    expect(component.activeColor()).toBe('#000000');
  });

  it('activeColor reflects a new value set from outside', () => {
    fixture.componentRef.setInput('activeColor', '#ff0000');
    fixture.detectChanges();
    expect(component.activeColor()).toBe('#ff0000');
  });

  // ── showPenSize input ─────────────────────────────────────────────────────────

  it('showPenSize defaults to false', () => {
    expect(component.showPenSize()).toBeFalse();
  });

  it('pen size slider is hidden when showPenSize is false', () => {
    fixture.componentRef.setInput('showPenSize', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pen-size-slider')).toBeNull();
  });

  it('pen size slider is visible when showPenSize is true', () => {
    fixture.componentRef.setInput('showPenSize', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pen-size-slider')).not.toBeNull();
  });

  // ── penSize input ─────────────────────────────────────────────────────────────

  it('penSize defaults to 4', () => {
    expect(component.penSize()).toBe(4);
  });

  it('penSize reflects a new value set from outside', () => {
    fixture.componentRef.setInput('penSize', 12);
    fixture.detectChanges();
    expect(component.penSize()).toBe(12);
  });

  // ── onPenSizeInput ────────────────────────────────────────────────────────────

  it('onPenSizeInput emits the numeric value via penSizeChange', () => {
    const emitted: number[] = [];
    component.penSizeChange.subscribe(v => emitted.push(v));
    component.onPenSizeInput({ target: { value: '15' } } as unknown as Event);
    expect(emitted).toEqual([15]);
  });

  it('onPenSizeInput converts the string value to a number', () => {
    const emitted: number[] = [];
    component.penSizeChange.subscribe(v => emitted.push(v));
    component.onPenSizeInput({ target: { value: '7' } } as unknown as Event);
    expect(typeof emitted[0]).toBe('number');
  });
});
