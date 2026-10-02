import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { ShippingModeService } from '@africanies/africanies-core';
import type { ShippingMode } from '@africanies/africanies-models';

import { RefreshComponent } from './refresh.component';

describe('RefreshComponent', () => {
  let fixture: ComponentFixture<RefreshComponent>;

  beforeEach(async () => {
    const mode = signal<ShippingMode>('sfn');
    await TestBed.configureTestingModule({
      imports: [RefreshComponent],
      providers: [
        {
          provide: ShippingModeService,
          useValue: {
            mode: mode.asReadonly(),
            requestModeChange: () => of(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RefreshComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('emits refresh when requested', () => {
    const emit = jest.spyOn(fixture.componentInstance.refresh, 'emit');
    fixture.componentInstance.requestRefresh();
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it('marks STN mode on the host for the orange accent', () => {
    fixture.componentRef.setInput('appType', 'stn');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('is-import')).toBe(true);
  });

  it('renders africanies-icon refresh', () => {
    const icon = fixture.nativeElement.querySelector(
      'africanies-icon[data-icon="refresh"]',
    );
    expect(icon).not.toBeNull();
  });

  it('disables while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
