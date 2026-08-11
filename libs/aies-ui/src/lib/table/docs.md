# Table

Presentational data table for list screens. Columns come from a `columns`
input; cell bodies come from projected `<ng-template aiesCellDef="key">`
templates (CDK-style). Columns without a matching template fall back to
`row[key]` as plain text.

**Not included on purpose**

- Loading / error / empty UI — wrap with `AsyncStateComponent`
- Client-side sorting — sortable headers emit `sortChange`; you refetch
- Fetching / paging — pair with `PaginationComponent` + your API call

## API

### `aies-table`

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `columns` | `TableColumn<T>[]` | yes | Header chrome + column keys |
| `rows` | `T[]` | yes | Row records to render (empty → empty `<tbody>`) |
| `sort` | `TableSortChange \| null` | no | Active sort for header indicators |
| `sortChange` | `output<TableSortChange>` | — | Emitted when a sortable header is clicked |

Import `TableComponent` and `CellDefDirective` (needed wherever you use
`aiesCellDef`).

### `TableColumn<T>`

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Matches `aiesCellDef` / indexes `row[key]` for the default renderer. May be a virtual key (e.g. `"actions"`). |
| `header` | `string` | Header label |
| `sortable` | `boolean?` | When true, header is a button that emits `sortChange` |
| `width` | `string?` | CSS width (`'8rem'`, `'20%'`, …) applied inline |

### `TableSortChange`

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Column that was activated |
| `direction` | `'asc' \| 'desc'` | Requested direction (toggles on repeated clicks of the same column) |

### `aiesCellDef`

| Binding | Type | Description |
| --- | --- | --- |
| `aiesCellDef` | `string` | Column key this template fills |
| `let-row` | `T` | Implicit context — the current row (`CellDefContext.$implicit`) |

## Usage

```ts
import {
  AsyncStateComponent,
  CellDefDirective,
  TableComponent,
  type TableColumn,
  type TableSortChange,
} from '@aies/aies-ui';

interface Shipment {
  reference: string;
  status: string;
}

readonly columns: TableColumn<Shipment>[] = [
  { key: 'reference', header: 'Reference', sortable: true },
  { key: 'status', header: 'Status' },
  { key: 'actions', header: '', width: '6rem' },
];

readonly sort = signal<TableSortChange | null>(null);

onSort(change: TableSortChange): void {
  this.sort.set(change);
  // Refetch with order derived from change.key / change.direction
  this.loadPage(this.page());
}
```

```html
<aies-async-state [state]="state()" (retry)="refetch()">
  <aies-table
    [columns]="columns"
    [rows]="state().data!"
    [sort]="sort()"
    (sortChange)="onSort($event)"
  >
    <!-- Text column: default row[key] renderer (no template needed). -->

    <ng-template aiesCellDef="status" let-row>
      <app-shipment-status [status]="row.status" />
    </ng-template>

    <ng-template aiesCellDef="actions" let-row>
      <aies-action-menu
        [items]="rowActions"
        [ariaLabel]="'Actions for ' + row.reference"
        (actionSelect)="onRowAction($event, row)"
      />
    </ng-template>
  </aies-table>
</aies-async-state>
```

## Patterns

| Need | Do this |
| --- | --- |
| Plain text cell | Omit `aiesCellDef` — `row[key]` is stringified |
| Badge / nested component | `<ng-template aiesCellDef="status" let-row>…</ng-template>` |
| Row overflow actions | Virtual `actions` column + [`aies-action-menu`](../action-menu/docs.md) |
| Sort | Set `sortable: true`, bind `[sort]` + `(sortChange)`, refetch |
| Empty / loading / error | Wrap the table in `aies-async-state` |
| Paging | Render `aies-pagination` beside the table (see [Pagination](../pagination/docs.md)) |

## Accessibility

- Headers use `<th scope="col">`.
- Sortable headers are real `<button type="button">` elements with visible focus.
- Prefer meaningful `header` labels even for action columns (`''` is allowed when space is tight).
