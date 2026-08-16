import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerComponent } from './date-picker.component';

@Component({
  standalone: true,
  imports: [DatePickerComponent],
  template: `
    <aies-date-picker
      label="Cutoff"
      [hint]="hint()"
      [error]="error()"
      [(value)]="value"
    />
  `,
})
class DatePickerHostComponent {
  readonly hint = signal<string | undefined>('Local day');
  readonly error = signal<string | null>(null);
  readonly value = signal<string | null>('2026-08-16');
}

describe('DatePickerComponent', () => {
  let fixture: ComponentFixture<DatePickerHostComponent>;
  let host: DatePickerHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should replace hint with error and paint an error border on the shell', () => {
    host.error.set('Required');
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="date"]');
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    const shell = input?.parentElement;

    expect(alert?.textContent?.trim()).toBe('Required');
    expect(fixture.nativeElement.textContent).not.toContain('Local day');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
    expect(shell?.className).toContain('border-danger');
  });
});
