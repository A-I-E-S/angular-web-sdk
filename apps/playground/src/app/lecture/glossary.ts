/**
 * Angular & RxJS concepts referenced across playground implementation snippets.
 * IDs double as URL fragments: `/lecture#firstValueFrom`.
 */
export type GlossaryCategory =
  | 'RxJS'
  | 'Angular signals'
  | 'Angular forms'
  | 'Angular DI'
  | 'Angular routing'
  | 'AIES SDK';

/**
 *
 */
export interface GlossaryCategoryMeta {
  /** Short label shown on chips and section headers. */
  label: GlossaryCategory;
  /** Spelled-out meaning when the label is an abbreviation. */
  expansion?: string;
  /** One sentence on what belongs in this group. */
  description: string;
}

export /**
 *
 */
const GLOSSARY_CATEGORY_META: Record<
  GlossaryCategory,
  GlossaryCategoryMeta
> = {
  RxJS: {
    label: 'RxJS',
    expansion: 'Reactive Extensions for JavaScript',
    description:
      'Streams, operators, and utilities for async data (HTTP, overlays, router events).',
  },
  'Angular signals': {
    label: 'Angular signals',
    description:
      'Fine-grained reactive state: signal, computed, input, output, model, and view queries.',
  },
  'Angular forms': {
    label: 'Angular forms',
    description:
      'Reactive forms and the bridge between form controls and custom inputs.',
  },
  'Angular DI': {
    label: 'Angular DI',
    expansion: 'Dependency Injection',
    description:
      'How Angular creates and delivers services, tokens, and configuration to your code.',
  },
  'Angular routing': {
    label: 'Angular routing',
    description: 'In-app navigation, route params, and URL-driven UI state.',
  },
  'AIES SDK': {
    label: 'AIES SDK',
    expansion: 'Software Development Kit',
    description:
      'Bootstrap helpers, overlay APIs, and injection tokens shipped with @aies/aies-ui.',
  },
};

/**
 *
 */
export interface GlossaryEntry {
  /** URL fragment and primary match token. */
  id: string;
  title: string;
  category: GlossaryCategory;
  /** One-line takeaway. */
  summary: string;
  /** Plain-language explanation (paragraphs separated by blank lines). */
  detail: string;
  /** Optional short code sample. */
  example?: string;
  /** Other glossary ids. */
  seeAlso?: string[];
  /**
   * Token to link in highlighted snippets (word boundary match).
   * Defaults to `id` when omitted.
   */
  match?: string;
}

export /**
 *
 */
const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'firstValueFrom',
    title: 'firstValueFrom',
    category: 'RxJS',
    summary:
      'Turns an Observable into a Promise that resolves with the first emitted value.',
    detail:
      'Observables are lazy streams — they do nothing until something subscribes. Many Angular APIs (HttpClient, overlay `afterClosed`, etc.) return Observables.\n\n`firstValueFrom(obs$)` subscribes once, resolves when the Observable emits its first value, then unsubscribes. Use it inside `async`/`await` when you want promise-style flow in a component method or service.\n\nIf the Observable completes without emitting, it rejects. If you need the last value instead, use `lastValueFrom`.',
    example: `import { firstValueFrom } from 'rxjs';

async load(): Promise<void> {
  const res = await firstValueFrom(this.http.get<Shipment[]>('/shipments'));
  this.rows.set(res.data);
}`,
    seeAlso: ['Observable', 'signal', 'inject'],
  },
  {
    id: 'Observable',
    title: 'Observable',
    category: 'RxJS',
    summary: 'A lazy, push-based stream of values over time.',
    detail:
      'RxJS Observables power HTTP calls, router events, overlay results, and many Angular internals. You subscribe (or use operators like `pipe`, `map`, `filter`) to react to emissions.\n\nIn modern Angular you often bridge Observables to signals with `toSignal`, or convert a single emission to a Promise with `firstValueFrom` when `async/await` reads clearer.',
    seeAlso: ['firstValueFrom', 'toSignal', 'takeUntilDestroyed'],
  },
  {
    id: 'lastValueFrom',
    title: 'lastValueFrom',
    category: 'RxJS',
    summary:
      'Like firstValueFrom, but waits for the Observable to complete and returns the last emitted value.',
    detail:
      'Use when a stream emits multiple values and you only care about the final one (e.g. a scan/reduction). Most Angular service calls only emit once, so `firstValueFrom` is more common.\n\nRejects if the Observable completes without emitting.',
    seeAlso: ['firstValueFrom', 'Observable'],
  },
  {
    id: 'toSignal',
    title: 'toSignal',
    category: 'Angular signals',
    summary: 'Subscribes to an Observable and exposes its latest value as a signal.',
    detail:
      'Import from `@angular/core/rxjs-interop`. `toSignal(source$)` returns a `Signal` that updates when the Observable emits.\n\nCommon in routed components: convert `router.events` or `route.queryParamMap` into a signal, then derive UI state with `computed`. Always provide `{ initialValue: … }` when the stream may not emit synchronously on first render.',
    example: `import { toSignal } from '@angular/core/rxjs-interop';

private readonly url = toSignal(
  this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map(() => this.router.url),
    startWith(this.router.url),
  ),
  { initialValue: this.router.url },
);`,
    seeAlso: ['signal', 'computed', 'Observable'],
  },
  {
    id: 'signal',
    title: 'signal',
    category: 'Angular signals',
    summary: 'Reactive primitive — call it like a function to read the current value.',
    detail:
      'Signals hold mutable state: `const count = signal(0)`, read with `count()`, update with `count.set(3)` or `count.update(n => n + 1)`.\n\nAngular change detection tracks signal reads in templates and `computed`/`effect`, so you often skip manual `ChangeDetectorRef` for local UI state (loading flags, panel open, selected row, etc.).',
    example: `protected readonly page = signal(1);
protected readonly loading = signal(false);

protected load(): void {
  this.loading.set(true);
  // …
  this.loading.set(false);
}`,
    seeAlso: ['computed', 'effect', 'model'],
  },
  {
    id: 'computed',
    title: 'computed',
    category: 'Angular signals',
    summary: 'Derived signal — recalculates when its dependencies change.',
    detail:
      '`computed(() => …)` reads other signals inside the factory and caches the result until a dependency changes.\n\nUse for view-model shaping: map query signals into `AsyncQueryStateModel`, build breadcrumb arrays from a URL signal, or derive stepper progress — without storing duplicate state.',
    example: `protected readonly listState = computed((): AsyncQueryStateModel<Shipment[]> => ({
  status: this.isLoading() ? 'loading' : 'success',
  data: this.rows(),
  isFetching: this.isFetching(),
}));`,
    seeAlso: ['signal', 'toSignal'],
  },
  {
    id: 'effect',
    title: 'effect',
    category: 'Angular signals',
    summary: 'Runs side effects when signals it reads change.',
    detail:
      'Use sparingly for syncing signal state to non-Angular APIs (localStorage, third-party widgets). Prefer `computed` for derived data.\n\nEffects run after render; avoid writing signals that the same effect reads unless you guard against loops.',
    seeAlso: ['signal', 'computed'],
  },
  {
    id: 'inject',
    title: 'inject()',
    category: 'Angular DI',
    summary: 'Resolves a service from Angular’s dependency injector.',
    detail:
      'Call `inject(MyService)` in a component, directive, pipe, or `runInInjectionContext`. Replaces constructor injection for standalone components and keeps fields grouped near usage.\n\nPlayground snippets use it for SDK services (`FilterDrawerService`, `ToastService`, `ApiClient`, theme helpers, etc.).',
    example: `private readonly toast = inject(ToastService);
private readonly api = inject(ApiClient);`,
    seeAlso: ['standalone', 'provideAiesUiOverlays', 'DestroyRef'],
  },
  {
    id: 'HttpClient',
    title: 'HttpClient',
    category: 'Angular DI',
    summary: 'Angular service for HTTP GET/POST/etc. — returns Observables.',
    detail:
      'Register with `provideHttpClient()` in `app.config.ts`. Methods like `get<T>(url)` return `Observable<T>` — pipe operators, subscribe, bridge with `toSignal`, or `await firstValueFrom(...)`.\n\nPlayground list demos use `ApiClient` (a typed wrapper); toast snippets show raw `HttpClient` with `withToast()` for automatic success/error toasts.',
    example: `import { provideHttpClient } from '@angular/common/http';

export const appConfig = {
  providers: [provideHttpClient()],
};`,
    seeAlso: ['Observable', 'firstValueFrom', 'inject'],
  },
  {
    id: 'standalone',
    title: 'standalone components',
    category: 'Angular DI',
    summary: 'Components that declare their own `imports` instead of an NgModule.',
    detail:
      'Set `standalone: true` on `@Component` and list dependencies in `imports: [ButtonComponent, RouterLink, …]`.\n\nThe AIES SDK ships standalone components. NgModule facades (`AiesFormsModule`, etc.) still exist for one-import ergonomics, but tree-shaking favors direct standalone imports.',
    seeAlso: ['inject', 'input'],
  },
  {
    id: 'input',
    title: 'input()',
    category: 'Angular signals',
    summary: 'Signal-based @Input — `readonly foo = input(default)`.',
    detail:
      'Angular 17+ signal inputs replace `@Input() foo`. Parent binds `[foo]="value"`; child reads `foo()` in templates and class logic.\n\nOptional inputs use `input<string | null>(null)`. Required: `input.required<string>()`. Transform with `{ transform: booleanAttribute }` for attribute coercion.',
    seeAlso: ['model', 'output', 'standalone'],
  },
  {
    id: 'output',
    title: 'output()',
    category: 'Angular signals',
    summary: 'Signal-based @Output — `readonly saved = output<Shipment>()`.',
    detail:
      'Replaces `@Output() saved = new EventEmitter()`. Parent listens with `(saved)="onSave($event)"`.\n\nEmit with `this.saved.emit(value)`. Outputs are explicit one-way events upward; prefer `model()` when you need two-way binding.',
    seeAlso: ['input', 'model'],
  },
  {
    id: 'model',
    title: 'model()',
    category: 'Angular signals',
    summary: 'Two-way binding — `[(collapsed)]` on a signal model.',
    detail:
      '`readonly collapsed = model(false)` exposes read via `collapsed()` and write via `collapsed.set(…)` / two-way binding from the parent.\n\nUsed in SDK components like `aies-side-nav` (`[(collapsed)]`, `[(activeId)]`) so hosts can sync rail state without separate input + output pairs.',
    seeAlso: ['input', 'signal'],
  },
  {
    id: 'viewChild',
    title: 'viewChild()',
    category: 'Angular signals',
    summary: 'Query a child component or element from the template as a signal.',
    detail:
      'Import from `@angular/core`. `viewChild(MyComponent)` or `viewChild<ElementRef>("input")` returns a signal that updates when the queried target is available.\n\nPrefer over the legacy `@ViewChild` decorator in new code. Use `viewChildren` for multiple matches.',
    example: `protected readonly table = viewChild(TableComponent);

protected focusFirstRow(): void {
  this.table()?.scrollToTop();
}`,
    seeAlso: ['signal', 'input'],
  },
  {
    id: 'booleanAttribute',
    title: 'booleanAttribute',
    category: 'Angular signals',
    summary: 'Input transform — coerces HTML attribute strings to true/false.',
    detail:
      'Pass as `{ transform: booleanAttribute }` on `input()`. Empty attribute presence becomes `true`; missing attribute becomes `false`.\n\nSDK components use this for flags like `disabled`, `required`, and `muted` so `[disabled]` works without binding a literal `true`.',
    example: `readonly disabled = input(false, { transform: booleanAttribute });`,
    seeAlso: ['input', 'standalone'],
  },
  {
    id: 'FormControl',
    title: 'FormControl',
    category: 'Angular forms',
    summary: 'Single reactive-form field — value, validators, and disabled state.',
    detail:
      'From `@angular/forms`. `new FormControl("", { validators: [Validators.required] })` tracks one control. Bind in templates with `[formControl]` or group several controls in a `FormGroup`.\n\nAIES form components also work with signal `value` / `(valueChange)` for simpler cases without reactive forms.',
    example: `readonly email = new FormControl('', {
  nonNullable: true,
  validators: [Validators.email],
});`,
    seeAlso: ['ControlValueAccessor', 'signal'],
  },
  {
    id: 'ControlValueAccessor',
    title: 'ControlValueAccessor',
    category: 'Angular forms',
    summary: 'Interface that lets a custom input participate in reactive forms.',
    detail:
      'Abbreviated CVA in Angular docs. Your component implements `writeValue`, `registerOnChange`, `registerOnTouched`, and optionally `setDisabledState` so Angular forms can read/write the value.\n\nEvery AIES form control (`aies-text-input`, `aies-select`, etc.) implements CVA — you can use `[formControl]` or two-way `[(value)]` interchangeably.',
    seeAlso: ['FormControl', 'input', 'model'],
  },
  {
    id: 'takeUntilDestroyed',
    title: 'takeUntilDestroyed',
    category: 'RxJS',
    summary: 'Unsubscribes automatically when the component is destroyed.',
    detail:
      'Import from `@angular/core/rxjs-interop`. Pipe overlay or HTTP Observables with `takeUntilDestroyed()` (optionally pass `DestroyRef`) so you do not leak subscriptions when the user navigates away.\n\nPrefer this over manual `Subscription` fields in components.',
    example: `this.modal
  .open(EditPanel, { data })
  .afterClosed()
  .pipe(takeUntilDestroyed())
  .subscribe((result) => { /* … */ });`,
    seeAlso: ['Observable', 'afterClosed', 'DestroyRef'],
  },
  {
    id: 'DestroyRef',
    title: 'DestroyRef',
    category: 'Angular DI',
    summary: 'Token tied to the current injector’s destroy lifecycle.',
    detail:
      'Inject `DestroyRef` to register cleanup when a component, directive, or environment injector is torn down.\n\n`takeUntilDestroyed()` uses it under the hood. You can also call `destroyRef.onDestroy(() => …)` for non-Observable cleanup (timers, listeners).',
    example: `private readonly destroyRef = inject(DestroyRef);

constructor() {
  const id = setInterval(() => this.tick(), 1000);
  this.destroyRef.onDestroy(() => clearInterval(id));
}`,
    seeAlso: ['takeUntilDestroyed', 'inject'],
  },
  {
    id: 'afterClosed',
    title: 'afterClosed()',
    category: 'AIES SDK',
    summary: 'Observable that emits once when a modal/drawer/filter overlay closes.',
    detail:
      'AIES overlay services (`ModalService`, `DrawerService`, `FilterDrawerService`) return a handle with `.afterClosed()` — an Observable of the result passed to `ref.close(result)`.\n\nSubscribe (with `takeUntilDestroyed`) or `await firstValueFrom(handle.afterClosed())` to continue flow after the user applies filters or saves a form.',
    seeAlso: ['firstValueFrom', 'takeUntilDestroyed', 'OVERLAY_DATA'],
  },
  {
    id: 'OVERLAY_DATA',
    title: 'OVERLAY_DATA',
    category: 'AIES SDK',
    summary: 'Injection token for data passed into a modal/drawer panel component.',
    detail:
      'When opening a panel, pass `{ data: { … } }` in the config. Inside the panel component, `inject(OVERLAY_DATA)` retrieves that payload with full typing.\n\nPair with `inject(AiesOverlayRef)` to close the overlay and return a result.',
    seeAlso: ['afterClosed', 'inject', 'provideAiesUiOverlays'],
  },
  {
    id: 'AiesOverlayRef',
    title: 'AiesOverlayRef',
    category: 'AIES SDK',
    summary: 'Handle to close a modal/drawer and pass a result back to the caller.',
    detail:
      'Inject inside a panel component opened by `ModalService` or `DrawerService`. Call `this.ref.close(result)` when the user saves or cancels — the opener receives `result` through `afterClosed()`.\n\nGeneric type parameter types the result: `AiesOverlayRef<EditShipmentResult>`.',
    example: `protected readonly ref = inject(AiesOverlayRef<Shipment>);

protected save(): void {
  this.ref.close(this.draft());
}`,
    seeAlso: ['OVERLAY_DATA', 'afterClosed', 'inject'],
  },
  {
    id: 'provideAiesUiOverlays',
    title: 'provideAiesUiOverlays()',
    category: 'AIES SDK',
    summary: 'Registers modal, drawer, and confirm services at app bootstrap.',
    detail:
      'Add to `ApplicationConfig.providers` once. Required before using `ModalService`, `DrawerService`, `ConfirmService`, or `FilterDrawerService`.\n\nAlso pulls in Angular CDK overlay infrastructure used for positioning and backdrop.',
    example: `export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAiesUiOverlays(),
    provideAiesToasts(),
  ],
};`,
    seeAlso: ['inject', 'afterClosed'],
  },
  {
    id: 'provideAiesToasts',
    title: 'provideAiesToasts()',
    category: 'AIES SDK',
    summary: 'Registers the toast stack host and ToastService.',
    detail:
      'Call once in `app.config.ts`. Then inject `ToastService` anywhere to show timed or persistent corner notifications.',
    seeAlso: ['provideAiesUiOverlays', 'inject'],
  },
  {
    id: 'RouterLink',
    title: 'RouterLink',
    category: 'Angular routing',
    summary: 'Directive that navigates without full page reloads.',
    detail:
      "Use on `<a routerLink=\"/path\">` or `[routerLink]=\"['/shipments', id]\"` with optional `queryParams`. SDK nav components (`aies-breadcrumb`, `aies-tabs`, `aies-side-nav`) accept `routerLink` on items so active state follows the URL.",
    seeAlso: ['toSignal', 'ActivatedRoute', 'standalone'],
  },
  {
    id: 'Router',
    title: 'Router',
    category: 'Angular routing',
    summary: 'Service for imperative navigation and reading the current URL.',
    detail:
      'Inject `Router` to call `navigate()`, `navigateByUrl()`, or listen to `router.events`. Pair with `ActivatedRoute` for the active route segment’s params and data.\n\nSDK nav demos use `Router` + `toSignal` to keep breadcrumb/tabs in sync with the URL.',
    seeAlso: ['RouterLink', 'ActivatedRoute', 'toSignal'],
  },
  {
    id: 'ActivatedRoute',
    title: 'ActivatedRoute',
    category: 'Angular routing',
    summary: 'Snapshot of the route segment this component was loaded under.',
    detail:
      'Inject to read `paramMap`, `queryParamMap`, `data`, and child routes. Streams like `route.queryParamMap` pair well with `toSignal` for filter state synced to the URL.\n\nFilter playground snippets deserialize list filters from query params via `ActivatedRoute`.',
    example: `private readonly route = inject(ActivatedRoute);

protected readonly filters = toSignal(
  this.route.queryParamMap.pipe(map((p) => deserializeFilters(p))),
  { initialValue: defaultFilters() },
);`,
    seeAlso: ['Router', 'toSignal', 'RouterLink'],
  },
];

/** Longest match first so `toSignal` is not partially matched as `signal`. */
export const GLOSSARY_MATCH_TERMS = [...GLOSSARY_ENTRIES]
  .map((entry) => ({
    id: entry.id,
    match: entry.match ?? entry.id,
  }))
  .sort((a, b) => b.match.length - a.match.length);

export /**
 *
 */
const GLOSSARY_BY_ID = new Map(
  GLOSSARY_ENTRIES.map((entry) => [entry.id, entry]),
);

export /**
 *
 */
const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  'RxJS',
  'Angular signals',
  'Angular forms',
  'Angular DI',
  'Angular routing',
  'AIES SDK',
];

/**
 * Category metadata for lecture section headers.
 * @param category - Glossary category id.
 * @returns Label, expansion, and description for the category.
 */
export function categoryMeta(category: GlossaryCategory): GlossaryCategoryMeta {
  return GLOSSARY_CATEGORY_META[category];
}

/**
 * Display heading for a category, including spelled-out abbreviations.
 * @param category - Glossary category id.
 * @returns Heading text for the lecture page.
 */
export function categoryHeading(category: GlossaryCategory): string {
  const meta = GLOSSARY_CATEGORY_META[category];
  return meta.expansion ? `${meta.label} (${meta.expansion})` : meta.label;
}

/**
 * Stable URL fragment for a category section, e.g. `category-angular-di`.
 * @param category - Glossary category id.
 * @returns URL-safe fragment for in-page navigation.
 */
export function categoryFragmentId(category: GlossaryCategory): string {
  return `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Glossary entries grouped under one category.
 * @param category - Glossary category id.
 * @returns Entries whose `category` matches.
 */
export function glossaryEntriesForCategory(
  category: GlossaryCategory,
): GlossaryEntry[] {
  return GLOSSARY_ENTRIES.filter((entry) => entry.category === category);
}
