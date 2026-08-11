# Pagination

Prev / next pager driven by `PaginationMeta` from `@aies/aies-models` —
the same shape on `ApiResponseModel.pagination`, so list screens bind
the API envelope directly with no mapping layer.

The component does **not** fetch. `pageChange` emits the target 1-based
page; the consumer calls the list endpoint again.

## API

### `aies-pagination`

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `meta` | `PaginationMeta` | yes | Slice from the latest list response |
| `pageChange` | `output<number>` | — | Target page after Previous / Next |

### `PaginationMeta` (from `@aies/aies-models`)

| Field | Type | Description |
| --- | --- | --- |
| `currentPage` | `number` | Active 1-based page |
| `perPage` | `number` | Page size |
| `totalItems` | `number` | Total row count |
| `totalPages` | `number` | Total pages |
| `hasNextPage` | `boolean` | Enables Next |
| `hasPreviousPage` | `boolean` | Enables Previous |

Prev/next disable from `hasPreviousPage` / `hasNextPage` — not recomputed
from `currentPage` / `totalPages` inside the component.

## Usage

```ts
import { PaginationComponent, TableComponent } from '@aies/aies-ui';
import type { ApiResponseModel } from '@aies/aies-models';

readonly page = signal(1);
readonly response = signal<ApiResponseModel<Shipment[]> | null>(null);

load(page: number): void {
  this.api
    .getResource<Shipment>('shipments', null, { page, size: 20 })
    .subscribe((res) => {
      this.page.set(page);
      this.response.set(res);
    });
}

onPageChange(next: number): void {
  this.load(next);
}
```

```html
@if (response(); as res) {
  <aies-table [columns]="columns" [rows]="res.data ?? []" />
  @if (res.pagination; as meta) {
    <aies-pagination [meta]="meta" (pageChange)="onPageChange($event)" />
  }
}
```

## Patterns

| Need | Do this |
| --- | --- |
| Wire to list API | Bind `[meta]="response().pagination!"` when non-null |
| Change page size | Pass a new `size` on the next `getResource` call; meta updates from the response |
| Hide when one page | `@if (meta.totalPages > 1)` around the pager |
| Pair with table | See [Table](../table/docs.md) + `AsyncStateComponent` |

## Accessibility

- Root is `<nav aria-label="Pagination">`.
- Previous / Next are `aies-button` controls with native `disabled` when
  `hasPreviousPage` / `hasNextPage` is false.
