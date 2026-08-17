import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { AddressInputComponent } from './address-input.component';
import type { AddressPlace, AddressPrediction } from './address-input.types';
import { GooglePlacesService } from './google-places.service';

const LAGOS_PREDICTION: AddressPrediction = {
  placeId: 'place-lagos-1',
  description: '12 Broad Street, Lagos, Nigeria',
  mainText: '12 Broad Street',
  secondaryText: 'Lagos, Nigeria',
};

const LAGOS_PLACE: AddressPlace = {
  placeId: 'place-lagos-1',
  formattedAddress: '12 Broad Street, Lagos, Nigeria',
  name: '12 Broad Street',
  lat: 6.4541,
  lng: 3.3947,
  locality: 'Lagos',
  country: 'Nigeria',
  countryCode: 'NG',
};

class MockGooglePlacesService {
  getPredictions = jest.fn(
    async (): Promise<AddressPrediction[]> => [LAGOS_PREDICTION],
  );

  getPlaceDetails = jest.fn(
    async (): Promise<AddressPlace | null> => LAGOS_PLACE,
  );
}

@Component({
  standalone: true,
  imports: [AddressInputComponent, ReactiveFormsModule],
  template: `
    <aies-address-input
      label="Pickup"
      [hint]="hint()"
      [error]="error()"
      [debounceMs]="0"
      [formControl]="control"
      (placeSelected)="lastSelected.set($event)"
    >
      <span prefix>P</span>
      <span suffix>S</span>
    </aies-address-input>
  `,
})
class AddressInputHostComponent {
  readonly hint = signal<string | undefined>('Start typing');
  readonly error = signal<string | null>(null);
  readonly control = new FormControl<AddressPlace | null>(null);
  readonly lastSelected = signal<AddressPlace | null>(null);
}

/**
 * @param ms - Delay in milliseconds.
 * @returns Promise that resolves after `ms`.
 */
function delay(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('AddressInputComponent', () => {
  let fixture: ComponentFixture<AddressInputHostComponent>;
  let host: AddressInputHostComponent;
  let places: MockGooglePlacesService;

  beforeEach(async () => {
    places = new MockGooglePlacesService();

    await TestBed.configureTestingModule({
      imports: [AddressInputHostComponent],
      providers: [{ provide: GooglePlacesService, useValue: places }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressInputHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render label, hint, and projection slots', () => {
    const label = fixture.nativeElement.querySelector('label');
    const hint = fixture.nativeElement.querySelector('p');
    const prefix = fixture.nativeElement.querySelector('[data-slot="prefix"]');
    const suffix = fixture.nativeElement.querySelector('[data-slot="suffix"]');

    expect(label?.textContent?.trim()).toBe('Pickup');
    expect(hint?.textContent?.trim()).toBe('Start typing');
    expect(prefix?.textContent?.trim()).toBe('P');
    expect(suffix?.textContent?.trim()).toBe('S');
  });

  it('should replace hint with error and set aria wiring', () => {
    host.error.set('Required');
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    const alert = fixture.nativeElement.querySelector('[role="alert"]');

    expect(alert?.textContent?.trim()).toBe('Required');
    expect(fixture.nativeElement.textContent).not.toContain('Start typing');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('should write formatted address from ControlValueAccessor', () => {
    host.control.setValue(LAGOS_PLACE);
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.value).toBe(LAGOS_PLACE.formattedAddress);
  });

  it('should fetch predictions, select a place, and emit details', async () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = 'Broad';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await delay(0);
    await delay(0);
    fixture.detectChanges();

    expect(places.getPredictions).toHaveBeenCalled();

    const option: HTMLButtonElement | null = document.querySelector(
      '[role="option"]',
    );
    expect(option).toBeTruthy();
    option?.click();

    await delay(0);
    fixture.detectChanges();

    expect(places.getPlaceDetails).toHaveBeenCalledWith('place-lagos-1');
    expect(host.control.value).toEqual(LAGOS_PLACE);
    expect(host.lastSelected()).toEqual(LAGOS_PLACE);
    expect(input.value).toBe(LAGOS_PLACE.formattedAddress);
  });

  it('should show formatted address from the value model (edit prepopulate)', () => {
    host.control.setValue(null);
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('');

    host.control.setValue(LAGOS_PLACE);
    fixture.detectChanges();
    expect(input.value).toBe(LAGOS_PLACE.formattedAddress);
  });
});
