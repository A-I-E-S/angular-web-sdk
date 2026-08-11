# Button

Theme-token button for primary actions, secondary chrome, ghost dismissals, and destructive confirms.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual emphasis |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding and type scale |
| `disabled` | `boolean` | `false` | Blocks activation; sets `aria-disabled` |

Content is projected — put labels and optional `<aies-icon>` inside the host.

## Usage

```html
<button aies-button type="button" variant="primary" (click)="save()">
  Save
</button>

<button aies-button type="button" variant="secondary" size="sm">
  Cancel
</button>

<button aies-button type="button" variant="ghost">
  Learn more
</button>

<button aies-button type="button" variant="danger" [disabled]="busy()">
  <aies-icon name="trash" [size]="16" />
  Delete
</button>
```

## Accessibility

- Prefer native `<button type="button">` (or `<a aies-button>` for navigation).
- Focus uses a visible `outline` from theme ink tokens.
- When `disabled`, the host sets `disabled`, `aria-disabled="true"`, and `tabindex="-1"`.
- Do not nest interactive elements inside the button.
