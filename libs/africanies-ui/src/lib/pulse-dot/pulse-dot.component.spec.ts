import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulseDotComponent } from './pulse-dot.component';

describe('PulseDotComponent', () => {
  let fixture: ComponentFixture<PulseDotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PulseDotComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PulseDotComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('renders the status dot by default', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.africanies-pulse-dot')).not.toBeNull();
  });

  it('hides when active is false', () => {
    fixture.componentRef.setInput('active', false);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.africanies-pulse-dot')).toBeNull();
  });

  it('sets the aria-label', () => {
    fixture.componentRef.setInput('label', 'Items need attention');
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector(
      '.africanies-pulse-dot',
    ) as HTMLElement;
    expect(dot.getAttribute('aria-label')).toBe('Items need attention');
  });
});
