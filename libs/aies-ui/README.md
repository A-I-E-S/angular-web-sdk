# @aies/aies-ui

Standalone Angular UI for AIES apps — buttons, forms, filters, toasts, overlays,
tables, and the rest. Styles come from the `@aies/aies-theme` Tailwind preset.

## Install

```bash
npm install @aies/aies-ui @aies/aies-theme @aies/aies-icons @aies/aies-models @aies/aies-core
```

Peer stack: Angular 22+, `@angular/cdk`, `@angular/forms`, `@aies/*` packages
above. Configure Tailwind with the theme preset (see `@aies/aies-theme`).

Import CDK overlay styles once in the app (needed for select dismiss / modal /
drawer positioning):

```css
@import '@angular/cdk/overlay-prebuilt.css';
```

## Quick start

```ts
import { ApplicationConfig } from '@angular/core';
import { provideAiesUiOverlays, provideAiesToasts, ButtonComponent } from '@aies/aies-ui';

export const appConfig: ApplicationConfig = {
  providers: [provideAiesUiOverlays(), provideAiesToasts()],
};
```

```html
<button aies-button type="button" variant="primary">Save</button>
<aies-async-state [state]="state()" (retry)="refetch()">
  <aies-table [columns]="columns" [rows]="state().data!" />
</aies-async-state>
```

## Modules

| Area | Highlights |
| --- | --- |
| Button | `button[aies-button]` / `a[aies-button]` |
| Action menu | `ActionMenu` (+ `aiesActionMenuTrigger`) — overflow / row actions |
| Feedback | `LoadingState`, `ErrorState`, `EmptyState`, `AsyncState`, `Alert`, `Toast` (`provideAiesToasts`) |
| Filters | `FilterDrawerService` + schema from `@aies/aies-models` (`ModuleFilterConfig`) |
| Overlay | `ModalService`, `DrawerService`, `ConfirmService`, `provideAiesUiOverlays` |
| Forms | Text, select, number, file upload, checkbox, radio, toggle, textarea, date, OTP |
| Navigation | `Breadcrumb`, `Tabs` (+ `aiesTabDef`), `Segment` — optional `routerLink` per item |
| Data | `Table` (+ `aiesCellDef`), `Pagination`, `Stepper` |
| NgModules | `AiesFormsModule`, `AiesFeedbackModule`, `AiesActionsModule`, `AiesNavigationModule`, `AiesTableModule`, `AiesStepperModule`, `AiesTooltipModule` — optional one-import facades over the standalones |

Form control conventions: [docs/form-controls.md](./docs/form-controls.md).  
Alert: [src/lib/alert/docs.md](./src/lib/alert/docs.md).  
Action menu: [src/lib/action-menu/docs.md](./src/lib/action-menu/docs.md).  
Table: [src/lib/table/docs.md](./src/lib/table/docs.md).  
Pagination: [src/lib/pagination/docs.md](./src/lib/pagination/docs.md).

## Build / test

```bash
npx nx build aies-ui
npx nx test aies-ui
```
