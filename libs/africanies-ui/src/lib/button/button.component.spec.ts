import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingModeService } from '@africanies/africanies-core';
import type { ShippingMode } from '@africanies/africanies-models';

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
      africanies-button
      type="button"
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
    >
      Label
    </button>
  `,
})
class ButtonHostComponent {
  readonly variant = signal<ButtonVariant>('primary');
  readonly size = signal<ButtonSize>('md');
  readonly disabled = signal(false);
  readonly loading = signal(false);
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonHostComponent>;
  let host: ButtonHostComponent;
  let button: HTMLButtonElement;
  let mode: ReturnType<typeof signal<ShippingMode>>;

  beforeEach(async () => {
    mode = signal<ShippingMode>('sfn');
    await TestBed.configureTestingModule({
      imports: [ButtonHostComponent],
      providers: [
        {
          provide: ShippingModeService,
          useValue: {
            mode: mode.asReadonly(),
            setMode: (next: ShippingMode) => mode.set(next),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button[africanies-button]');
  });

  it('should render projected content', () => {
    expect(button.textContent?.trim()).toBe('Label');
  });

  it('should apply primary variant classes by default (SFN / export)', () => {
    expect(button.className).toContain('bg-export-strong');
    expect(button.className).toContain('text-white');
  });

  it('should switch primary to import orange when mode is STN', () => {
    mode.set('stn');
    fixture.detectChanges();

    expect(button.className).toContain('bg-import-strong');
    expect(button.className).not.toContain('bg-export-strong');
  });

  it('should switch ghost-primary text accent with shipping mode', () => {
    host.variant.set('ghost-primary');
    fixture.detectChanges();
    expect(button.className).toContain('text-export-strong');
    expect(button.className).toContain('bg-transparent');

    mode.set('stn');
    fixture.detectChanges();

    expect(button.className).toContain('text-import-strong');
    expect(button.className).not.toContain('text-export-strong');
  });

  it('should switch variant and size classes', () => {
    host.variant.set('danger');
    host.size.set('sm');
    fixture.detectChanges();

    expect(button.className).toContain('bg-danger-dark');
    expect(button.className).toContain('h-8');
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

  it('should show a circular spinner and treat the host as busy while loading', () => {
    host.loading.set(true);
    fixture.detectChanges();

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(true);
    expect(button.querySelector('.animate-spin')).not.toBeNull();
    expect(button.textContent?.trim()).toBe('Label');
  });
});
