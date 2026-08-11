# Action menu

Compact overflow menu for row and toolbar actions. Opens a CDK connected
overlay (same pattern as select) so the panel is not clipped by table
`overflow`.

## API

### `aies-action-menu`

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `AiesMenuItem[]` | yes | Menu options |
| `ariaLabel` | `string` | no | Trigger / menu name (default `"Actions"`) |
| `disabled` | `boolean` | no | Disables the default trigger |
| `actionSelect` | `output<string>` | — | Emits the selected item `id`, then closes |

### `AiesMenuItem`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Emitted on `actionSelect` |
| `label` | `string` | Visible label |
| `icon` | `IconName?` | Optional leading icon |
| `disabled` | `boolean?` | Non-interactive row |
| `danger` | `boolean?` | Destructive styling |
| `dividerBefore` | `boolean?` | Hairline rule above the row |

### Custom trigger

Project a control marked with `aiesActionMenuTrigger` (see
`ActionMenuTriggerDirective`). When present, the default ellipsis button is
hidden.

## Usage

```ts
import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
  type AiesMenuItem,
} from '@aies/aies-ui';

rowActions: AiesMenuItem[] = [
  { id: 'open', label: 'Open', icon: 'eye' },
  { id: 'edit', label: 'Edit', icon: 'edit' },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    danger: true,
    dividerBefore: true,
  },
];

onRowAction(id: string, row: Shipment): void {
  // branch on id
}
```

```html
<!-- Default ellipsis trigger -->
<aies-action-menu
  [items]="rowActions"
  (actionSelect)="onRowAction($event, row)"
/>

<!-- Custom trigger -->
<aies-action-menu [items]="toolbarActions" (actionSelect)="onAction($event)">
  <button
    type="button"
    aies-button
    aiesActionMenuTrigger
    variant="secondary"
    size="sm"
  >
    Actions
  </button>
</aies-action-menu>
```

## With table

Keep `TableComponent` presentational — place the menu inside an actions cell:

```html
<aies-table [columns]="columns" [rows]="rows">
  <ng-template aiesCellDef="actions" let-row>
    <aies-action-menu
      [items]="rowActions"
      (actionSelect)="onRowAction($event, row)"
    />
  </ng-template>
</aies-table>
```

## Accessibility

- Default trigger sets `aria-haspopup="menu"` and `aria-expanded`.
- Panel uses `role="menu"` / `role="menuitem"`.
- Keyboard: ArrowUp/Down, Home/End, Enter/Space activate, Escape closes.
- Outside click and transparent backdrop dismiss.
