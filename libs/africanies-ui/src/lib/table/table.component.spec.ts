import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingModeService } from '@africanies/africanies-core';
import type { ShippingMode } from '@africanies/africanies-models';

import { TableComponent } from './table.component';
import type { TableColumn } from './table-column';

interface Row {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  imports: [TableComponent],
  template: `
    <africanies-table
      [columns]="columns"
      [rows]="rows()"
      [loading]="loading()"
      [error]="error()"
      loadingLabel="Loading page…"
    />
  `,
})
class TableHostComponent {
  readonly columns: TableColumn<Row>[] = [{ key: 'name', header: 'Name' }];
  readonly rows = signal<Row[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
}

describe('TableComponent keep-rows loading', () => {
  let fixture: ComponentFixture<TableHostComponent>;
  let host: TableHostComponent;

  beforeEach(async () => {
    const mode = signal<ShippingMode>('sfn');
    await TestBed.configureTestingModule({
      imports: [TableHostComponent],
      providers: [
        {
          provide: ShippingModeService,
          useValue: {
            mode: mode.asReadonly(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('shows a keep-rows overlay when loading with rows on screen', () => {
    host.rows.set([{ id: 1, name: 'Ada' }]);
    host.loading.set(true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelector('[data-testid="africanies-table-keep-rows-loading"]'),
    ).not.toBeNull();
    expect(root.textContent).toContain('Ada');
    expect(root.textContent).toContain('Loading page…');
  });

  it('uses the in-grid body loader on first load with no rows', () => {
    host.rows.set([]);
    host.loading.set(true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelector('[data-testid="africanies-table-keep-rows-loading"]'),
    ).toBeNull();
    expect(root.textContent).toContain('Loading page…');
  });

  it('shows a full-width stale error when rows remain after a failed fetch', () => {
    host.rows.set([{ id: 1, name: 'Ada' }]);
    host.error.set('Could not load page.');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const indicator = root.querySelector('africanies-error-indicator');
    expect(indicator).not.toBeNull();
    expect(indicator?.className).toContain('w-full');
    expect(root.textContent).toContain('Could not load page.');
    expect(root.textContent).toContain('Ada');
  });
});
