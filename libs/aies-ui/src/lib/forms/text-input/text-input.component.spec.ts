import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { TextInputComponent, type TextInputType } from './text-input.component';

@Component({
  standalone: true,
  imports: [TextInputComponent, ReactiveFormsModule],
  template: `
    <aies-text-input
      label="Name"
      [hint]="hint()"
      [error]="error()"
      [formControl]="control"
    >
      <span prefix>P</span>
      <span suffix>S</span>
    </aies-text-input>
  `,
})
class TextInputHostComponent {
  readonly hint = signal<string | undefined>('Helpful hint');
  readonly error = signal<string | null>(null);
  readonly control = new FormControl('initial', { nonNullable: true });
}

describe('TextInputComponent', () => {
  let fixture: ComponentFixture<TextInputHostComponent>;
  let host: TextInputHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextInputHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render label, hint, and CVA value', () => {
    const label = fixture.nativeElement.querySelector('label');
    const input = fixture.nativeElement.querySelector('input');
    const hint = fixture.nativeElement.querySelector('p');

    expect(label?.textContent?.trim()).toBe('Name');
    expect(input?.value).toBe('initial');
    expect(hint?.textContent?.trim()).toBe('Helpful hint');
  });

  it('should replace hint with error and set aria wiring', () => {
    host.error.set('Required');
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    const alert = fixture.nativeElement.querySelector('[role="alert"]');

    expect(alert?.textContent?.trim()).toBe('Required');
    expect(fixture.nativeElement.textContent).not.toContain('Helpful hint');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('should propagate user input through ControlValueAccessor', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = 'Ada';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.control.value).toBe('Ada');
  });

  it('should project prefix and suffix slots', () => {
    const prefix = fixture.nativeElement.querySelector('[data-slot="prefix"]');
    const suffix = fixture.nativeElement.querySelector('[data-slot="suffix"]');

    expect(prefix?.textContent?.trim()).toBe('P');
    expect(suffix?.textContent?.trim()).toBe('S');
  });

  it('should default to type=text and omit empty autocomplete', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('type')).toBe('text');
    expect(input.hasAttribute('autocomplete')).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [TextInputComponent],
  template: `
    <aies-text-input
      label="Password"
      [type]="type()"
      autocomplete="current-password"
    />
  `,
})
class PasswordInputHostComponent {
  readonly type = signal<TextInputType>('password');
}

describe('TextInputComponent type/autocomplete', () => {
  it('should bind password type and autocomplete', async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PasswordInputHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    expect(input.getAttribute('type')).toBe('password');
    expect(input.getAttribute('autocomplete')).toBe('current-password');

    fixture.componentInstance.type.set('text');
    fixture.detectChanges();
    expect(input.getAttribute('type')).toBe('text');
  });
});
