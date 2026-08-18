import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ShippingModeService } from '@aies/aies-core';
import type { ShippingMode } from '@aies/aies-models';

import { ToggleComponent } from './toggle.component';

@Component({
  standalone: true,
  imports: [ToggleComponent, ReactiveFormsModule],
  template: `
    <aies-toggle
      label="Active"
      [value]="value()"
      [loading]="loading()"
      [disabled]="disabled()"
      (valueChange)="onValueChange($event)"
    />
    <aies-toggle label="Form" [formControl]="control" />
  `,
})
class ToggleHostComponent {
  readonly value = signal(false);
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly control = new FormControl(false, { nonNullable: true });
  readonly emitted: boolean[] = [];

  onValueChange(next: boolean): void {
    this.emitted.push(next);
  }
}

describe('ToggleComponent', () => {
  let fixture: ComponentFixture<ToggleHostComponent>;
  let host: ToggleHostComponent;
  let mode: ReturnType<typeof signal<ShippingMode>>;

  beforeEach(async () => {
    mode = signal<ShippingMode>('sfn');
    await TestBed.configureTestingModule({
      imports: [ToggleHostComponent],
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

    fixture = TestBed.createComponent(ToggleHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function switches(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('button[role="switch"]'),
    );
  }

  it('emits the next value without flipping until the parent commits', () => {
    const [toggle] = switches();
    expect(toggle.getAttribute('aria-checked')).toBe('false');

    toggle.click();
    fixture.detectChanges();

    expect(host.emitted).toEqual([true]);
    expect(toggle.getAttribute('aria-checked')).toBe('false');

    host.value.set(true);
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  it('shows a spinner and blocks clicks while loading', () => {
    const [toggle] = switches();
    host.loading.set(true);
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-busy')).toBe('true');
    expect(toggle.disabled).toBe(true);
    expect(toggle.querySelector('.animate-spin')).not.toBeNull();

    toggle.click();
    fixture.detectChanges();
    expect(host.emitted).toEqual([]);
  });

  it('propagates clicks through ControlValueAccessor', () => {
    const [, formToggle] = switches();
    formToggle.click();
    fixture.detectChanges();

    expect(host.control.value).toBe(true);
    expect(formToggle.getAttribute('aria-checked')).toBe('true');
  });
});
