import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TutorialModalComponent } from './tutorial-modal';

describe('TutorialModalComponent', () => {
  let component: TutorialModalComponent;
  let fixture: ComponentFixture<TutorialModalComponent>;

  function setup(difficulty: 'easy' | 'medium' | 'hard' = 'easy', isOpen = true): void {
    fixture = TestBed.createComponent(TutorialModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('difficulty', difficulty);
    fixture.componentRef.setInput('isOpen', isOpen);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialModalComponent],
    }).compileComponents();
  });

  // ── Visibility ────────────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    setup('easy', false);
    const backdrop = fixture.nativeElement.querySelector('.backdrop');
    expect(backdrop).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    setup('easy', true);
    expect(fixture.nativeElement.querySelector('.modal')).not.toBeNull();
  });

  // ── Confirmation screen ───────────────────────────────────────────────────────

  it('shows the confirmation screen by default', () => {
    setup('easy');
    expect(fixture.nativeElement.querySelector('.confirm-screen')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.steps-screen')).toBeNull();
  });

  it('displays the correct difficulty label in the badge (easy)', () => {
    setup('easy');
    const badge = fixture.nativeElement.querySelector('.mode-badge');
    expect(badge.textContent).toContain('Easy Mode');
  });

  it('displays the correct difficulty label in the badge (medium)', () => {
    setup('medium');
    const badge = fixture.nativeElement.querySelector('.mode-badge');
    expect(badge.textContent).toContain('Medium Mode');
  });

  it('displays the correct difficulty label in the badge (hard)', () => {
    setup('hard');
    const badge = fixture.nativeElement.querySelector('.mode-badge');
    expect(badge.textContent).toContain('Hard Mode');
  });

  it('skip button emits closed', () => {
    setup('easy');
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);
    fixture.nativeElement.querySelector('.skip-btn').click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('close (✕) button emits closed', () => {
    setup('easy');
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);
    fixture.nativeElement.querySelector('.close-btn').click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('"Show me how" button switches to steps screen', () => {
    setup('easy');
    fixture.nativeElement.querySelector('.show-btn').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.steps-screen')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.confirm-screen')).toBeNull();
  });

  // ── Steps screen ──────────────────────────────────────────────────────────────

  it('startTutorial() sets showSteps to true', () => {
    setup('easy');
    component.startTutorial();
    expect(component.showSteps()).toBeTrue();
  });

  it('starts at step 0 after startTutorial()', () => {
    setup('easy');
    component.startTutorial();
    expect(component.currentStep()).toBe(0);
  });

  it('easy mode has 4 steps', () => {
    setup('easy');
    expect(component.steps().length).toBe(4);
  });

  it('medium mode has 4 steps', () => {
    setup('medium');
    expect(component.steps().length).toBe(4);
  });

  it('hard mode has 5 steps', () => {
    setup('hard');
    expect(component.steps().length).toBe(5);
  });

  it('step 1 of easy mentions guide lines', () => {
    setup('easy');
    expect(component.steps()[0].title.toLowerCase()).toContain('guide');
  });

  it('step 1 of hard mentions blank canvas', () => {
    setup('hard');
    expect(component.steps()[0].title.toLowerCase()).toContain('blank canvas');
  });

  it('step count display shows "1 / N" on first step', () => {
    setup('easy');
    component.startTutorial();
    fixture.detectChanges();
    const count = fixture.nativeElement.querySelector('.step-count');
    expect(count.textContent.trim()).toBe(`1 / ${component.steps().length}`);
  });

  it('progress dots count matches steps length', () => {
    setup('hard');
    component.startTutorial();
    fixture.detectChanges();
    const dots = fixture.nativeElement.querySelectorAll('.dot');
    expect(dots.length).toBe(component.steps().length);
  });

  it('first dot is active on step 0', () => {
    setup('easy');
    component.startTutorial();
    fixture.detectChanges();
    const dots = fixture.nativeElement.querySelectorAll('.dot');
    expect(dots[0].classList).toContain('active');
    expect(dots[1].classList).not.toContain('active');
  });

  // ── Navigation between steps ──────────────────────────────────────────────────

  it('next() advances to step 1', () => {
    setup('easy');
    component.startTutorial();
    component.next();
    expect(component.currentStep()).toBe(1);
  });

  it('prev() goes back to step 0 from step 1', () => {
    setup('easy');
    component.startTutorial();
    component.next();
    component.prev();
    expect(component.currentStep()).toBe(0);
  });

  it('prev button is hidden on step 0', () => {
    setup('easy');
    component.startTutorial();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.prev-btn')).toBeNull();
  });

  it('prev button is visible on step 1', () => {
    setup('easy');
    component.startTutorial();
    component.next();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.prev-btn')).not.toBeNull();
  });

  it('next button shows "Next →" on non-last steps', () => {
    setup('easy');
    component.startTutorial();
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.next-btn');
    expect(btn.textContent.trim()).toBe('Next →');
  });

  it('next button shows "🚩 Let\'s Play!" on last step', () => {
    setup('easy');
    component.startTutorial();
    // advance to last step
    for (let i = 0; i < component.steps().length - 1; i++) component.next();
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.next-btn');
    expect(btn.textContent.trim()).toContain("Let's Play!");
  });

  it('isLastStep is false on step 0', () => {
    setup('easy');
    component.startTutorial();
    expect(component.isLastStep()).toBeFalse();
  });

  it('isLastStep is true on final step', () => {
    setup('easy');
    component.startTutorial();
    for (let i = 0; i < component.steps().length - 1; i++) component.next();
    expect(component.isLastStep()).toBeTrue();
  });

  it('next() on last step emits closed', () => {
    setup('easy');
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);
    component.startTutorial();
    for (let i = 0; i < component.steps().length; i++) component.next();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('next() on last step resets showSteps to false', () => {
    setup('easy');
    component.startTutorial();
    for (let i = 0; i < component.steps().length; i++) component.next();
    expect(component.showSteps()).toBeFalse();
  });

  // ── Re-open resets state ──────────────────────────────────────────────────────

  it('re-opening the modal resets to confirmation screen', () => {
    setup('easy', false);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    component.startTutorial();
    component.next();
    expect(component.currentStep()).toBe(1);

    // Close and re-open
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(component.showSteps()).toBeFalse();
    expect(component.currentStep()).toBe(0);
  });
});
