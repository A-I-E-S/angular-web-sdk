# @aies/aies-storage

Injectable browser storage for the AIES Web SDK. Provides a swappable
`StorageService` behind `STORAGE_TOKEN`, with `localStorage` (default) and
`sessionStorage` implementations plus `provideLocalStorage()` /
`provideSessionStorage()` helpers.

## Usage

```ts
import {
  STORAGE_TOKEN,
  provideLocalStorage,
  AIES_THEME_KEY,
} from '@aies/aies-storage';

// app.config.ts
providers: [provideLocalStorage()];

// elsewhere
const storage = inject(STORAGE_TOKEN);
storage.set(AIES_THEME_KEY, 'dark');
```

## Tests

Run `nx test aies-storage`.
