import { OverlayModule } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { PaginationMetaModel } from '@aies/aies-models';

import { FilterQueryService } from '../filters/filter-query.service';
import { PaginationComponent } from './pagination.component';

@Component({
  standalone: true,
  imports: [PaginationComponent],
  template: `
    <aies-pagination
      [meta]="meta()"
      (pageChange)="page.set($event)"
      (sizeChange)="size.set($event)"
    />
  `,
})
class PaginationHostComponent {
  readonly page = signal<number | null>(null);
  readonly size = signal<number | null>(null);
  readonly meta = signal<PaginationMetaModel>({
    current_page: 2,
    per_page: 15,
    total_items: 28,
    total_pages: 2,
    has_next_page: false,
    has_previous_page: true,
  });
}

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationHostComponent>;
  let host: PaginationHostComponent;
  let filterQuery: { setPage: jest.Mock; setSize: jest.Mock };

  beforeEach(async () => {
    filterQuery = {
      setPage: jest.fn().mockResolvedValue(true),
      setSize: jest.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [PaginationHostComponent, OverlayModule],
      providers: [{ provide: FilterQueryService, useValue: filterQuery }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('renders page status, size select, and numbered pages without a Rows label', () => {
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';
    expect(text).toContain('Page 2 of 2');
    expect(text).not.toContain('Rows');
    expect(text).toContain('15');
    expect(text).toContain('Previous');
    expect(text).toContain('Next');

    const pageButtons = Array.from(
      root.querySelectorAll('button[aria-label^="Page "]'),
    ) as HTMLButtonElement[];
    expect(pageButtons.map((button) => button.textContent?.trim())).toEqual([
      '1',
      '2',
    ]);
    expect(
      pageButtons.find((button) => button.getAttribute('aria-current') === 'page')
        ?.textContent?.trim(),
    ).toBe('2');
  });

  it('emits sizeChange when a size option is chosen', () => {
    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-haspopup="listbox"]',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const options = Array.from(
      document.querySelectorAll('[role="option"]'),
    ) as HTMLButtonElement[];
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      '5',
      '15',
      '30',
    ]);

    options.find((option) => option.textContent?.trim() === '30')?.click();
    fixture.detectChanges();

    expect(host.size()).toBe(30);
    expect(filterQuery.setSize).toHaveBeenCalledWith(30);
  });

  it('emits pageChange from Previous when a previous page exists', () => {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'button[aies-button]',
      ),
    ) as HTMLButtonElement[];
    const previous = buttons.find((button) =>
      button.textContent?.includes('Previous'),
    );
    expect(previous?.disabled).toBe(false);
    previous?.click();
    fixture.detectChanges();

    expect(host.page()).toBe(1);
    expect(filterQuery.setPage).toHaveBeenCalledWith(1);
  });

  it('emits pageChange from a numbered page button', () => {
    const pageOne = (
      fixture.nativeElement as HTMLElement
    ).querySelector('button[aria-label="Page 1"]') as HTMLButtonElement;
    pageOne.click();
    fixture.detectChanges();

    expect(host.page()).toBe(1);
    expect(filterQuery.setPage).toHaveBeenCalledWith(1);
  });

  it('windows long page lists with ellipsis', () => {
    host.meta.set({
      current_page: 5,
      per_page: 15,
      total_items: 150,
      total_pages: 10,
      has_next_page: true,
      has_previous_page: true,
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const pageButtons = Array.from(
      root.querySelectorAll('button[aria-label^="Page "]'),
    ) as HTMLButtonElement[];
    expect(pageButtons.map((button) => button.textContent?.trim())).toEqual([
      '1',
      '4',
      '5',
      '6',
      '10',
    ]);
    expect(root.textContent).toContain('…');
  });
});
