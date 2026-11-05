import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangeComponent } from './date-range.component';
import { buildDateRangePresets } from './date-range.presets';

@Component({
  standalone: true,
  imports: [DateRangeComponent],
  template: `
    <africanies-date-range
      label="Period"
      [hint]="hint()"
      [error]="error()"
      [(start)]="start"
      [(end)]="end"
    />
  `,
})
class DateRangeHostComponent {
  readonly hint = signal<string | undefined>('Inclusive');
  readonly error = signal<string | null>(null);
  readonly start = signal<string | null>('2026-11-01');
  readonly end = signal<string | null>('2026-11-30');
}

describe('DateRangeComponent', () => {
  let fixture: ComponentFixture<DateRangeHostComponent>;
  let host: DateRangeHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangeHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows a full calendar month as that month', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    const text = button.textContent ?? '';

    expect(text).toContain('2026');
    expect(text).not.toContain('–');
    expect(
      fixture.nativeElement.querySelectorAll('input[type="date"]').length,
    ).toBe(0);
  });

  it('shows a partial range as start and end', () => {
    host.end.set('2026-11-15');
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('–');
  });

  it('replaces the hint with the error', () => {
    host.error.set('End date must be on or after the start date.');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');

    expect(alert?.textContent?.trim()).toContain('End date');
    expect(fixture.nativeElement.textContent).not.toContain('Inclusive');
    expect(button.getAttribute('aria-invalid')).toBe('true');
    expect(button.getAttribute('aria-describedby')).toBe(alert.id);
  });
});

describe('buildDateRangePresets', () => {
  const today = new Date(2026, 10, 5);

  it('builds last 7 days, this month, and this year from a fixed day', () => {
    const presets = buildDateRangePresets(today, {
      last7Days: 'Last 7 days',
      thisMonth: 'This month',
      thisYear: 'This year',
    });

    expect(presets.map((preset) => [preset.id, preset.start, preset.end])).toEqual([
      ['last7Days', '2026-10-30', '2026-11-05'],
      ['thisMonth', '2026-11-01', '2026-11-30'],
      ['thisYear', '2026-01-01', '2026-12-31'],
    ]);
  });

  it('disables a shortcut that falls outside min or max', () => {
    const presets = buildDateRangePresets(
      today,
      {
        last7Days: 'Last 7 days',
        thisMonth: 'This month',
        thisYear: 'This year',
      },
      { min: '2026-11-01', max: '2026-11-30' },
    );

    expect(presets.find((preset) => preset.id === 'thisMonth')?.disabled).toBe(
      false,
    );
    expect(presets.find((preset) => preset.id === 'last7Days')?.disabled).toBe(
      true,
    );
    expect(presets.find((preset) => preset.id === 'thisYear')?.disabled).toBe(
      true,
    );
  });
});
