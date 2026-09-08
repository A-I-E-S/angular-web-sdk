import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ShippingModeService } from '@africanies/africanies-core';
import type { ShippingMode } from '@africanies/africanies-models';

import { ModeColorService } from './mode-color.service';

describe('ModeColorService', () => {
  let mode: ReturnType<typeof signal<ShippingMode>>;
  let service: ModeColorService;

  beforeEach(() => {
    mode = signal<ShippingMode>('sfn');
    TestBed.configureTestingModule({
      providers: [
        ModeColorService,
        {
          provide: ShippingModeService,
          useValue: {
            mode: mode.asReadonly(),
          },
        },
      ],
    });
    service = TestBed.inject(ModeColorService);
  });

  it('uses export brand fills and text for SFN in light and dark', () => {
    const classes = service.classes();
    const primaryTokens = classes.primary.split(/\s+/);
    expect(classes.text.split(/\s+/)).toContain('text-export');
    expect(primaryTokens).toContain('bg-export');
    expect(primaryTokens).not.toContain('bg-export-strong');
    expect(classes.ghostPrimary.split(/\s+/)).toContain('text-export');
    expect(classes.activeFill.split(/\s+/)).toContain('bg-export');
    expect(classes.stroked.split(/\s+/)).toContain('text-export');
    expect(classes.stroked.split(/\s+/)).toContain('border-export');
  });

  it('keeps bright export accents for dark-mode companions in SFN', () => {
    const classes = service.classes();
    expect(classes.primary).toContain('dark:bg-export');
    expect(classes.ghostPrimary).toContain('dark:text-export');
  });

  it('uses accessible import-strong fills and text in STN light mode', () => {
    mode.set('stn');
    const classes = service.classes();
    expect(classes.text).toContain('text-import-strong');
    expect(classes.primary).toContain('bg-import-strong');
    expect(classes.ghostPrimary).toContain('text-import-strong');
    expect(classes.activeFill).toContain('bg-import-strong');
    expect(classes.stroked).toContain('text-import-strong');
    expect(classes.primary).not.toContain('bg-export-strong');
  });
});
