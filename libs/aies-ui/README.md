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
| Copy | `aies-copy` — clipboard icon button (`copyToClipboard`) |
| Action menu | `ActionMenu` (+ `aiesActionMenuTrigger`) — overflow / row actions |
| Avatar | `Avatar`, `AvatarMenu` — initials/image + account dropdown |
| Feedback | `LoadingState`, `ErrorState`, `EmptyState`, `AsyncState`, `ErrorIndicator`, `Alert`, `Chip`, `Toast` (`provideAiesToasts`) |
| Filters | `FilterDrawerService` + schema from `@aies/aies-models` (`ModuleFilterConfigModel`) |
| Overlay | `ModalService`, `DrawerService`, `ConfirmService`, `provideAiesUiOverlays` |
| Forms | Text, select, address (Google Places), number, file upload, checkbox, radio, toggle, textarea, date, OTP — address needs `provideGooglePlaces({ apiKey })` |
| Navigation | `AppShell` (clock, notifications, avatar menu), `SideNav` (SDK logo, logout), `Breadcrumb`, `Tabs`, `Segment` |
| Notifications | `NotificationDrawerService` — inbox drawer (via `DrawerService`) |
| Data | `Table` (+ `aiesCellDef`), `Pagination`, `Stepper` |
| NgModules | `AiesFormsModule`, `AiesFeedbackModule`, `AiesActionsModule`, `AiesNavigationModule`, `AiesTableModule`, `AiesStepperModule`, `AiesTooltipModule` — optional one-import facades over the standalones |

Live examples: run the workspace playground (`npx nx serve playground`).

## Build / test

```bash
npx nx build aies-ui
npx nx test aies-ui
```
