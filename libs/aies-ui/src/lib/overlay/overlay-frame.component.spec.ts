import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  OverlayFooterDirective,
  OverlayFrameComponent,
  OverlayHeaderDirective,
} from './overlay-frame.component';

@Component({
  standalone: true,
  imports: [
    OverlayFrameComponent,
    OverlayHeaderDirective,
    OverlayFooterDirective,
  ],
  template: `
    <aies-overlay-frame>
      <div aiesOverlayHeader>Header chrome</div>
      <p>Body copy</p>
      <div aiesOverlayFooter>Footer actions</div>
    </aies-overlay-frame>
  `,
})
class OverlayFrameHostComponent {}

describe('OverlayFrameComponent', () => {
  let fixture: ComponentFixture<OverlayFrameHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayFrameHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverlayFrameHostComponent);
    fixture.detectChanges();
  });

  it('keeps header and footer outside the scroll region', () => {
    const root = fixture.nativeElement as HTMLElement;
    const frame = root.querySelector('aies-overlay-frame') as HTMLElement;
    const slots = Array.from(frame.children) as HTMLElement[];
    expect(slots).toHaveLength(3);

    const [headerSlot, bodySlot, footerSlot] = slots;
    expect(headerSlot.className).toContain('shrink-0');
    expect(footerSlot.className).toContain('shrink-0');
    expect(bodySlot.className).toContain('aies-overlay-scroll');
    expect(bodySlot.className).toContain('overflow-y-auto');

    expect(headerSlot.textContent).toContain('Header chrome');
    expect(bodySlot.textContent).toContain('Body copy');
    expect(footerSlot.textContent).toContain('Footer actions');
    expect(bodySlot.textContent).not.toContain('Header chrome');
    expect(bodySlot.textContent).not.toContain('Footer actions');
  });
});
