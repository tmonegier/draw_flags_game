import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ToolbarComponent, DrawingTool } from './toolbar';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarComponent],
    }).compileComponents();

    fixture   = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeTool', 'fill');
    fixture.componentRef.setInput('activeColor', '#000000');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── tools array ───────────────────────────────────────────────────────────────

  it('has exactly 2 tools', () => {
    expect(component.tools.length).toBe(2);
  });

  it('tools contains a fill entry', () => {
    expect(component.tools.map(t => t.key)).toContain('fill');
  });

  it('tools contains an eraser entry', () => {
    expect(component.tools.map(t => t.key)).toContain('eraser');
  });

  it('each tool has a non-empty icon', () => {
    component.tools.forEach(t => expect(t.icon.length).toBeGreaterThan(0));
  });

  it('each tool has a non-empty title', () => {
    component.tools.forEach(t => expect(t.title.length).toBeGreaterThan(0));
  });

  // ── selectTool ────────────────────────────────────────────────────────────────

  it('selectTool emits fill via toolChange', () => {
    const emitted: DrawingTool[] = [];
    component.toolChange.subscribe(v => emitted.push(v));
    component.selectTool('fill');
    expect(emitted).toEqual(['fill']);
  });

  it('selectTool emits eraser via toolChange', () => {
    const emitted: DrawingTool[] = [];
    component.toolChange.subscribe(v => emitted.push(v));
    component.selectTool('eraser');
    expect(emitted).toEqual(['eraser']);
  });

  it('selectTool emits once per call', () => {
    const emitted: DrawingTool[] = [];
    component.toolChange.subscribe(v => emitted.push(v));
    component.selectTool('eraser');
    component.selectTool('fill');
    expect(emitted.length).toBe(2);
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

  it('activeTool input is readable as a signal', () => {
    expect(component.activeTool()).toBe('fill');
  });

  it('activeColor input is readable as a signal', () => {
    expect(component.activeColor()).toBe('#000000');
  });

  it('activeTool reflects a new value set from outside', () => {
    fixture.componentRef.setInput('activeTool', 'eraser');
    fixture.detectChanges();
    expect(component.activeTool()).toBe('eraser');
  });
});
