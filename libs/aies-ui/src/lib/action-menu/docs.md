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

### `AiesMenuItem`

| Field | Type | Description |
| --- | --- | --- |
| `label` | `string` | Visible label |
| `onClick` | `() => void` | Called when the row is activated (menu closes after) |
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

rowActions(row: Shipment): AiesMenuItem[] {
  return [
    { label: 'Open', icon: 'eye', onClick: () => this.open(row) },
    { label: 'Edit', icon: 'edit', onClick: () => this.edit(row) },
    {
      label: 'Delete',
      icon: 'trash',
      danger: true,
      dividerBefore: true,
      onClick: () => this.delete(row),
    },
  ];
}
```

```html
<!-- Default ellipsis trigger -->
<aies-action-menu [items]="rowActions(row)" />

<!-- Custom trigger -->
<aies-action-menu [items]="toolbarActions">
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

Keep `TableComponent` presentational — build row-scoped items in the actions
cell:

```html
<aies-table [columns]="columns" [rows]="rows">
  <ng-template aiesCellDef="actions" let-row>
    <aies-action-menu [items]="rowActions(row)" />
  </ng-template>
</aies-table>
```

## Accessibility

- Default trigger sets `aria-haspopup="menu"` and `aria-expanded`.
- Panel uses `role="menu"` / `role="menuitem"`.
- Keyboard: ArrowUp/Down, Home/End, Enter/Space activate, Escape closes.
- Outside click and transparent backdrop dismiss.
