# @aies/aies-ui

Standalone Angular UI primitives for AIES apps: button, feedback states,
overlays (modal / drawer / confirm), form controls, navigation chrome
(breadcrumb / tabs / segment), table, pagination, and stepper. Styles use
Tailwind utilities from `@aies/aies-theme`.

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
import { provideAiesUiOverlays, ButtonComponent } from '@aies/aies-ui';

export const appConfig: ApplicationConfig = {
  providers: [provideAiesUiOverlays()],
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
| Feedback | `LoadingState`, `ErrorState`, `EmptyState`, `AsyncState` |
| Overlay | `ModalService`, `DrawerService`, `ConfirmService`, `provideAiesUiOverlays` |
| Forms | Text, select, number, file upload, checkbox, radio, toggle, textarea, date |
| Navigation | `Breadcrumb`, `Tabs` (+ `aiesTabDef`), `Segment` — optional `routerLink` per item |
| Data | `TableComponent`, `PaginationComponent`, `StepperComponent` |

Form control conventions: [docs/form-controls.md](./docs/form-controls.md).

## Build / test

```bash
npx nx build aies-ui
npx nx test aies-ui
```
