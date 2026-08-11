import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingModeService } from '@aies/aies-core';

import {
  ButtonComponent,
  type ButtonSize,
  type ButtonVariant,
} from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <button
      aies-button
      type="button"
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
    >
      Label
    </button>
  `,
})
class ButtonHostComponent {
  readonly variant = signal<ButtonVariant>('primary');
  readonly size = signal<ButtonSize>('md');
  readonly disabled = signal(false);
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonHostComponent>;
  let host: ButtonHostComponent;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button[aies-button]');
  });

  it('should render projected content', () => {
    expect(button.textContent?.trim()).toBe('Label');
  });

  it('should apply primary variant classes by default (SFN / export)', () => {
    expect(button.className).toContain('bg-export');
    expect(button.className).toContain('text-white');
  });

  it('should switch primary to import orange when mode is STN', () => {
    const shipping = TestBed.inject(ShippingModeService);
    shipping.setMode('stn');
    fixture.detectChanges();

    expect(button.className).toContain('bg-import');
    expect(button.className).not.toContain('bg-export');
  });

  it('should switch variant and size classes', () => {
    host.variant.set('danger');
    host.size.set('sm');
    fixture.detectChanges();

    expect(button.className).toContain('bg-danger');
    expect(button.className).toContain('min-h-8');
  });

  it('should expose disabled and aria-disabled for a11y', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('tabindex')).toBe('-1');
  });

  it('should keep a native button type for keyboard activation', () => {
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
  });
});
