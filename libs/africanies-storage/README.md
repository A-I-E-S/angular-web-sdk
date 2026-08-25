# @africanies/africanies-storage

Injectable browser storage for the AFRICANIES Web SDK. Provides a swappable
`StorageService` behind `STORAGE_TOKEN`, with `localStorage` (default) and
`sessionStorage` implementations plus `provideLocalStorage()` /
`provideSessionStorage()` helpers.

Shipping mode (`ShippingModeService` in `@africanies/africanies-core`) always persists
via `SessionStorageService` directly so each browser tab can use a different
STN/SFN mode. Theme and auth token use `STORAGE_TOKEN` (localStorage by default).

## Usage

```ts
import {
  STORAGE_TOKEN,
  provideLocalStorage,
  AFRICANIES_THEME_KEY,
} from '@africanies/africanies-storage';

// app.config.ts
providers: [provideLocalStorage()];

// elsewhere
const storage = inject(STORAGE_TOKEN);
storage.set(AFRICANIES_THEME_KEY, 'dark');
```

## Tests

Run `nx test africanies-storage`.
