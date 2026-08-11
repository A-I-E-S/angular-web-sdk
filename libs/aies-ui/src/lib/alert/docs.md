# Alert

Inline page/section banner for guidance, success, warning, and danger
messages. Distinct from `ErrorStateComponent` (full-section async failure +
Retry) and from toast stacks (not in this package yet).

## API

### `aies-alert`

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Semantic tone |
| `title` | `string?` | — | Optional heading |
| `message` | `string` | required | Body copy |
| `dismissible` | `boolean` | `true` | Shows dismiss control |
| `icon` | `IconName?` | per variant | Override leading icon |
| `dismissed` | `output<void>` | — | User closed the alert |

Project optional actions under the message via default `ng-content`.

### Defaults icons

| Variant | Icon |
| --- | --- |
| `info` | `info-circle` |
| `success` | `check-circle` |
| `warning` | `warning` |
| `danger` | `warning` |

## Usage

```ts
import { AlertComponent } from '@aies/aies-ui';
import { signal } from '@angular/core';

showRatesBanner = signal(true);
```

```html
@if (showRatesBanner()) {
  <aies-alert
    variant="warning"
    title="Rates outdated"
    message="Refresh to pull the latest carrier rates before quoting."
    (dismissed)="showRatesBanner.set(false)"
  >
    <button aies-button type="button" size="sm" class="mt-2" (click)="refreshRates()">
      Refresh rates
    </button>
  </aies-alert>
}

<aies-alert
  variant="success"
  message="Shipment SFN-1042 was submitted."
  [dismissible]="false"
/>
```

## Patterns

| Need | Do this |
| --- | --- |
| Hide after dismiss | `@if (visible())` + `(dismissed)="visible.set(false)"` |
| Permanent notice | `[dismissible]="false"` |
| Async page failure | Prefer `aies-error-state` / `aies-async-state`, not alert |
| Custom icon | `[icon]="'airplane'"` (typed `IconName`) |

## Accessibility

- `info` / `success` → `role="status"` + `aria-live="polite"`
- `warning` / `danger` → `role="alert"` + `aria-live="assertive"`
- Dismiss control uses `aria-label="Dismiss"`
