# @africanies/africanies-ui

Standalone Angular UI for AFRICANIES apps — buttons, forms, filters, toasts, overlays,
tables, and the rest. Styles come from the `@africanies/africanies-theme` Tailwind preset.

## Install

```bash
npm install @africanies/africanies-ui @africanies/africanies-theme @africanies/africanies-icons @africanies/africanies-models @africanies/africanies-core
```

Peer stack: Angular 22+, `@angular/cdk`, `@angular/forms`, `/*` packages
above. Configure Tailwind with the theme preset (see `@africanies/africanies-theme`).

Import CDK overlay styles once in the app (needed for select dismiss / modal /
drawer positioning):

```css
@import '@angular/cdk/overlay-prebuilt.css';
```

## Quick start

```ts
import { ApplicationConfig } from '@angular/core';
import { provideAfricaniesUiOverlays, provideAfricaniesToasts, ButtonComponent } from '@africanies/africanies-ui';

export const appConfig: ApplicationConfig = {
  providers: [provideAfricaniesUiOverlays(), provideAfricaniesToasts()],
};
```

```html
<button africanies-button type="button" variant="primary">Save</button>
<africanies-table
  [columns]="columns"
  [rows]="state().data ?? []"
  [loading]="state().isLoading"
  [error]="state().error"
  emptyMessage="No results match these filters."
/>
```

## Modules

| Area | Highlights |
| --- | --- |
| Button | `button[africanies-button]` / `a[africanies-button]` |
| Copy | `africanies-copy` — clipboard icon button (`copyToClipboard`) |
| Action menu | `ActionMenu` (+ `africaniesActionMenuTrigger`) — overflow / row actions |
| Avatar | `Avatar`, `AvatarMenu` — initials/image + account dropdown |
| Feedback | `LoadingState`, `ErrorState`, `EmptyState`, `AsyncState`, `ErrorIndicator`, `Alert`, `Chip`, `Toast` (`provideAfricaniesToasts`) |
| Filters | `FilterDrawerService`, `FilterQueryService` — hydrate/write list queries on the URL |
| Overlay | `ModalService`, `DrawerService`, `ConfirmService`, `provideAfricaniesUiOverlays` |
| Forms | Text, select, address (Places API New REST), number, file upload, checkbox, radio, toggle, textarea, date, OTP — address needs `provideGooglePlaces({ apiKey })` |
| Navigation | `AppShell` (clock, notifications, avatar menu, page title + subtitle), `SideNav` (SDK logo), `ShippingModeSwitch`, `Breadcrumb`, `PageHeader`, `Tabs`, `Segment` |
| Notifications | `NotificationDrawerService` — inbox drawer (via `DrawerService`) |
| Data | `Table` (+ `africaniesCellDef`), `Pagination`, `Stepper` |
| NgModules | `AfricaniesFormsModule`, `AfricaniesFeedbackModule`, `AfricaniesActionsModule`, `AfricaniesNavigationModule`, `AfricaniesTableModule`, `AfricaniesStepperModule`, `AfricaniesTooltipModule` — optional one-import facades over the standalones |

Live examples: run the workspace playground (`npx nx serve playground`).

## Build / test

```bash
npx nx build africanies-ui
npx nx test africanies-ui
```
