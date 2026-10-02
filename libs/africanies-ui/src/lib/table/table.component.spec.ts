import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

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
      [showRefresh]="showRefresh()"
      [showFilter]="showFilter()"
      [filterCount]="filterCount()"
      (filterClearClick)="cleared.set(cleared() + 1)"
    />
  `,
})
class TableHostComponent {
  readonly columns: TableColumn<Row>[] = [{ key: 'name', header: 'Name' }];
  readonly rows = signal<Row[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showRefresh = signal(false);
  readonly showFilter = signal(false);
  readonly filterCount = signal(0);
  readonly cleared = signal(0);
}

describe('TableComponent keep-rows loading', () => {
  let fixture: ComponentFixture<TableHostComponent>;
  let host: TableHostComponent;

  beforeEach(async () => {
    // jsdom does not provide ResizeObserver; the table measures expand width.
    globalThis.ResizeObserver = class {
      observe(): void {
        /* no-op */
      }
      unobserve(): void {
        /* no-op */
      }
      disconnect(): void {
        /* no-op */
      }
    } as typeof ResizeObserver;

    const mode = signal<ShippingMode>('sfn');
    await TestBed.configureTestingModule({
      imports: [TableHostComponent],
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

  it('shows Clear when filters are active and emits filterClearClick', () => {
    host.rows.set([{ id: 1, name: 'Ada' }]);
    host.showFilter.set(true);
    host.filterCount.set(2);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const clear = Array.from(root.querySelectorAll('button')).find((button) =>
      /Clear/.test(button.textContent ?? ''),
    ) as HTMLButtonElement | undefined;
    expect(clear).toBeTruthy();
    clear?.click();
    expect(host.cleared()).toBe(1);
  });

  it('renders africanies-refresh when showRefresh and rows are present', () => {
    host.rows.set([{ id: 1, name: 'Ada' }]);
    host.showRefresh.set(true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('africanies-refresh')).not.toBeNull();
  });
});
