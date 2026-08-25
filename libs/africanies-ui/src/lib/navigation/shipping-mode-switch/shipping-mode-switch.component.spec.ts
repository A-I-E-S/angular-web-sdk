import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { ShippingModeService } from '@africanies/africanies-core';
import type { ShippingMode } from '@africanies/africanies-models';

import { ShippingModeSwitchComponent } from './shipping-mode-switch.component';

class FakeShippingModeService {
  private readonly _mode = signal<ShippingMode>('sfn');
  readonly mode = this._mode.asReadonly();

  setMode(mode: ShippingMode): void {
    this._mode.set(mode);
  }

  requestModeChange(mode: ShippingMode) {
    if (mode !== this._mode()) {
      this._mode.set(mode);
      return of(true);
    }
    return of(false);
  }
}

describe('ShippingModeSwitchComponent', () => {
  let fixture: ComponentFixture<ShippingModeSwitchComponent>;
  let shipping: FakeShippingModeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingModeSwitchComponent],
      providers: [
        { provide: ShippingModeService, useClass: FakeShippingModeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingModeSwitchComponent);
    shipping = TestBed.inject(
      ShippingModeService,
    ) as unknown as FakeShippingModeService;
    fixture.detectChanges();
  });

  it('should mark Ship from Nigeria as selected by default', () => {
    const radios = fixture.nativeElement.querySelectorAll('[role="radio"]');
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });

  it('should persist Ship to Nigeria when that card is clicked', () => {
    const toNigeria: HTMLButtonElement =
      fixture.nativeElement.querySelector('[aria-label="Shipping to Nigeria"]');
    toNigeria.click();
    fixture.detectChanges();

    expect(shipping.mode()).toBe('stn');
    expect(toNigeria.getAttribute('aria-checked')).toBe('true');
  });
});
