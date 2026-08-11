# AIES SDK — Development Prompt Playbook

A sequenced set of prompts for building `@aies/aies-*` with Claude Code (or Claude in chat). Use them roughly in order — each phase assumes the previous one exists. Copy a prompt, drop it into Claude Code inside the `aies-web-sdk` repo, and adjust the bracketed details.

Every prompt below already bakes in two standing rules — keep them even if you shorten a prompt:
- **Docs**: every public export needs a JSDoc/TSDoc block (`@param`, `@returns`, `@throws`, `@example` where non-obvious).
- **Comments**: explain *why*, not *what* — no comments restating the line of code, comments on non-obvious decisions, edge cases, and workarounds.

---

## Phase 0 — Workspace scaffolding

**0.1 — Initialize the Nx workspace**
```
Set up a new Nx workspace called aies-web-sdk for a private Angular SDK published as
scoped packages to GitHub Packages (@aies scope). I need six publishable Angular
libraries: core, models, ui, icons, theme, storage. Use standalone components
(no NgModules). Generate the workspace and all six libraries with
@nx/angular:library, configure each with its own package.json for independent
publishing, and set the npm scope to @aies with package names aies-core,
aies-models, aies-ui, aies-icons, aies-theme, aies-storage. Show me the
resulting folder structure and explain each config file you touched.
```

**0.2 — Registry & publish config**
```
Configure this Nx workspace to publish all six libraries to GitHub Packages
under the @aies scope. Set up .npmrc for both the workspace root and a
template for consumer apps, configure each library's package.json with the
correct publishConfig, and set up Nx release (or changesets — recommend
which fits better here) for independent per-package versioning using
conventional commits. Explain the exact commands I'll run to cut a release.
```

**0.3 — Lint, format, commit hygiene**
```
Add ESLint + Prettier config enforcing: mandatory TSDoc on all exported
symbols (no export without a doc comment), no `any` without a justifying
comment, consistent import ordering (Angular > third-party > @aies/* >
relative). Add a commitlint config for conventional commits since release
versioning depends on it. Add a pre-commit hook via husky that runs lint
and a doc-coverage check.
```

---

## Phase 1 — Models (build this first, everything else depends on it)

**1.1 — Base models from spec**
```
I'm attaching [PRD / OpenAPI spec / existing DTOs]. Generate the
aies-models library: TypeScript interfaces and enums matching this spec,
grouped by domain into separate files (e.g. user.model.ts, listing.model.ts),
each re-exported from a barrel per domain and one root public-api.ts.
No Angular dependencies in this library at all — it must be usable outside
Angular too. Every interface needs a TSDoc block describing what it
represents and what each field means, including nullable/optional fields
and why they're optional.
```

**1.2 — Response envelope + shared utility types**
```
Add to aies-models: ApiResponseModel<T> { success: boolean; message:
string | null; data: T | null; errors: ApiErrorDetail[] | null;
pagination: PaginationMeta | null; statusCode: number | null }, plus
ApiErrorDetail { field: string | null; message: string; code: string |
null } and PaginationMeta { currentPage, perPage, totalItems, totalPages,
hasNextPage, hasPreviousPage }. statusCode exists because at least one
known backend response (public mode config) sends `status_code`
alongside success/data — assume other endpoints may too. Every field is
explicitly `| null`, never left optional/undefined, per the SDK's
null-safety convention. This is the type ApiClient normalizes every
response into (wrapped or raw) before returning it — see the note in
Phase 2.3 about defensively coalescing missing fields to null rather than
passing a partial raw object straight through, since not every backend
envelope includes every field (e.g. no errors/pagination on the mode
config response) and the normalizer must not let those come through as
undefined. Document each field's meaning and null case with TSDoc.
```

**1.3 — Mode/region config models**
```
Add to aies-models: ModeDimensionUnit ('cm' | 'inches'), ModeMassUnit
('KG' | 'LBS'), ModeCurrencyCode ('NGN' | 'USD' — extend as more
currencies are supported), ModeRegionConfig { dimensionUnit,
massUnit, currency, currencySymbol }, ModeSfnConfig { default: 
ModeRegionConfig; ng: ModeRegionConfig }, ModeStnConfig { default: 
ModeRegionConfig; us: ModeRegionConfig; cn: ModeRegionConfig; gb: 
ModeRegionConfig }, and ModeConfigData { sfn: ModeSfnConfig; stn:
ModeStnConfig }. Use camelCase field names (dimensionUnit, not
dimension_unit) consistent with the rest of the SDK's models even though
the backend sends snake_case — that mapping happens once at the
ApiClient/service boundary, not by mirroring the wire format into
TypeScript. Document that ModeStnConfig and ModeSfnConfig intentionally
have different country key sets (stn covers us/cn/gb, sfn covers ng)
since they represent different real business regions, not a shared shape.
```

---

## Phase 2 — Core (API layer)

**2.1 — SDK configuration/injection pattern**
```
Build the configuration system for aies-core: an InjectionToken for
SDK config (baseUrl, timeout, default headers), and a provideAiesSdk()
standalone-style provider function consuming apps call in their
app.config.ts. Document exactly how a consuming app wires this up, with
a full code example in the TSDoc header of the file.
```

**2.2 — ShippingModeService + shipment-mode interceptor**
```
Build ShippingModeService in aies-core: a signal-based service holding
the current ShippingMode ('stn' | 'sfn'), persisted via StorageService,
defaulting to 'sfn' when nothing is stored yet. Expose `mode` as a
read-only signal and a `setMode(mode)` method. Then build
shipmentModeInterceptor — a functional HTTP interceptor that reads the
current mode from ShippingModeService and attaches it as an
`x-shipment-mode` header on every outgoing request. Document both with a
TSDoc @example showing registration: ShippingModeService needs no
explicit provider (providedIn: 'root'), but the interceptor must be
registered via provideHttpClient(withInterceptors([shipmentModeInterceptor]))
in the consuming app's app.config.ts alongside provideAiesSdk().
```

**2.3 — Generic ApiClient (endpoint-agnostic)**
```
Build ApiClient in aies-core wrapping HttpClient — get/post/patch/delete
methods, each with two overload signatures based on a `responseMode`
option ('wrapped' | 'raw', defaulting to 'wrapped'): 'wrapped' returns
Observable<ApiResponseModel<T>>, 'raw' returns Observable<T> directly
(for endpoints like user profile that return the bare payload with no
envelope). ApiClient must NOT know about specific endpoint paths —
domain services in each consuming app define those (see Phase 8) so new
endpoints never require an SDK release.

Internally, every response — regardless of requested responseMode — goes
through a normalize<T>() step that detects whether the raw payload is
wrapped (has `success` and `data` keys) and, if so, explicitly coalesces
EVERY ApiResponseModel field to null rather than passing the raw object
through as-is: `{ success: raw.success, message: raw.message ?? null,
data: raw.data ?? null, errors: raw.errors ?? null, pagination:
raw.pagination ?? null, statusCode: raw.statusCode ?? null }`. This
matters because not every backend envelope includes every field (e.g.
the public mode config response has no errors/pagination) — without this
coalescing, those fields would come through as undefined at runtime even
though the type says `| null`, silently breaking the SDK's null-safety
guarantee. If the payload isn't wrapped at all, build the full envelope
with data: raw, everything else null.

Add an HTTP interceptor for attaching auth headers (build now with a
no-op/placeholder token source — full auth flow is pinned for later) and
confirm the shipmentModeInterceptor from 2.2 composes cleanly alongside
it.
```

**2.4 — Retry/caching strategy (only if needed)**
```
Add a retry strategy (exponential backoff, max 3 attempts) to the core
HTTP layer for idempotent GET requests only, and a simple in-memory
response cache with a configurable TTL per endpoint. Document the
tradeoffs of enabling caching in the module-level TSDoc so consumers
understand when NOT to use it (e.g. frequently-changing data).
```

**2.5 — Resource ID + pagination convention helper**
```
Many AIES endpoints follow a shared convention on the path shape
`/{basePath}/{id?}` combined with query params (page, size, order),
where `id` has three meanings: null → return a paginated list (page/size/
order apply, size omitted falls back to the backend's own configured
default e.g. api.paginate.<resource>.pageSize); the literal string 'all'
→ return the full unpaginated list, ignoring page/size/order entirely;
a number → fetch a single record by that id, also ignoring pagination
params. Add a ResourceId = number | 'all' | null type to aies-models and
a PaginationQueryParams { page?, size?, order? } type alongside it. Then
add a getResource<T>(basePath, id, query?) method to ApiClient with three
overload signatures so the return type is correctly inferred per id
shape: null -> ApiResponseModel<T[]> (paginated), 'all' ->
ApiResponseModel<T[]> (full list), number -> ApiResponseModel<T> (single
record). The implementation should build the path (append `/${id}` unless
id is null) and attach the current shipment mode (from
ShippingModeService, 2.2) as a `mode` query param automatically — note
this is IN ADDITION to the x-shipment-mode header the interceptor already
attaches, since some endpoints expect it in both places; confirm this
against real endpoint behavior and flag if any endpoint turns out to only
need one or the other. Document all three id-shape behaviors clearly in
the method's TSDoc with one @example per shape.
```

**2.6 — Shared query-client defaults (for consuming apps using TanStack Query)**
```
Consuming apps use @tanstack/angular-query-experimental (injectQuery /
injectMutation) for caching, background refetch, and stale-while-
revalidate — this library is NOT a dependency of the SDK itself, since
query caching is app-level state, not shared infrastructure. What the SDK
CAN usefully provide: extend provideAiesSdk() (or add a sibling
provideAiesQueryDefaults() function) that returns a configured
QueryClient with sane shared defaults — e.g. staleTime, retry count/
backoff matching the retry strategy already used in ApiClient (2.4), and
gcTime — so every consuming app doesn't redefine these independently and
they stay consistent across STN/SFN and both apps. This should be
optional/composable, not forced — an app that wants different defaults
for a specific query can still override them per-injectQuery call.
Document in the TSDoc that @tanstack/angular-query-experimental is
currently an experimental package (per TanStack's own versioning
warning) and that consuming apps should pin an exact version rather than
a caret range for it specifically. Also document the expected shape
consuming apps pass into AsyncStateComponent (6.4.2) — i.e. mapping an
injectQuery() result's data/isLoading/isFetching/isError/error signals
into AsyncQueryState<T> — with a full worked example.
```

**2.7 — ModeConfigService (region/currency/unit metadata)**
```
Build ModeConfigService in aies-core, using the ModeConfigData models
from 1.3. It fetches /public/mode/config via ApiClient.get() (wrapped
mode — this endpoint sends success/data/status_code but no
errors/pagination, exercising the normalizer's null-coalescing from 2.3),
stores the result in a signal (`config`, read-only, mirroring
ShippingModeService/ThemeService's pattern elsewhere in the SDK — do NOT
use BehaviorSubject here), and exposes a `loading` signal alongside it.
Add a `loadConfig()` method (safe to call multiple times — subsequent
calls just refresh the signal) and a `getRegionConfig(countryCode:
string | null, appType?: ModeAppType): ModeRegionConfig | null` method
that defaults `appType` to ShippingModeService's CURRENT mode (inject
ShippingModeService from 2.2) rather than requiring callers to pass it
on every call, and falls back to the mode's `default` region config when
the given country code isn't a recognized key. Do not build any
app-specific error-handling wrapper around the request — let errors
propagate to the caller (or the TanStack Query layer, 2.6) rather than
assuming how a consuming app wants failures surfaced. Document with a
TSDoc @example showing loadConfig() called once at app startup and
getRegionConfig() used downstream, e.g. to format a currency amount for
the shipment's origin country.
```

---

## Phase 3 — Theme (build before UI, since UI consumes tokens)

**3.1 — Design tokens**
```
Set up aies-theme: CSS custom properties for a light/dark design system —
color palette, spacing scale, typography scale, radii, shadows — defined
under [data-theme="light"] and [data-theme="dark"] selectors on :root.
Compile this from Tailwind config so the library ships plain compiled CSS
(no dependency on the consuming app having Tailwind installed). Document
every token's intended use in a THEME.md inside the library, and add a
short TSDoc comment above each token group in the source explaining what
it controls.
```

**3.2 — Theme service**
```
Add a ThemeService to aies-theme: a signal-based (or BehaviorSubject-based
— pick one and justify it in a comment) service to toggle/read the current
theme, persist the choice via aies-storage's StorageService, and respect
prefers-color-scheme on first load. Document the public API with TSDoc
and add a usage @example.
```

---

## Phase 4 — Storage

**4.1 — Storage abstraction**
```
Build aies-storage: an injectable StorageService interface with
localStorage and sessionStorage implementations behind an InjectionToken
so it's swappable and mockable in tests. Include get/set/remove/clear
with generic typing (get<T>(key): T | null) and JSON
serialization handled internally. Document failure modes (e.g. quota
exceeded, storage disabled in private browsing) in TSDoc @throws and
show how to catch them in the @example.
```

---

## Phase 5 — Icons

**5.1 — Icon system**
```
Build aies-icons using an SVG sprite + registry approach for [N] icons
in [source folder]. Generate: a build script that bundles all SVGs into
a single sprite file, a typed IconName union type generated from the
sprite (so consumers get autocomplete and compile errors on typos), and
an <aies-icon name="..."> standalone component that renders from the
sprite. Document the build script's steps inline (why sprite over
per-icon components, given 1,000+ icons) and add a README section on
adding a new icon.
```

---

## Phase 6 — UI components

**6.1 — Component scaffolding, one at a time**
```
Build an [component name, e.g. Button] standalone component for aies-ui.
Requirements: consumes design tokens from aies-theme (no hardcoded colors
or spacing), fully typed Inputs/Outputs, uses aies-icons where relevant,
accessible (correct ARIA roles/labels, keyboard nav). Add:
- TSDoc on the component class explaining its purpose and variants
- TSDoc on every @Input/@Output explaining accepted values and defaults
- An @example showing basic usage in a template
- A basic unit test covering inputs, outputs, and a11y attributes
```

**6.2 — Component docs page (repeat per component or batch)**
```
Generate a markdown docs page for the [component name] component: props
table (name, type, default, description), usage examples for each major
variant, and accessibility notes. Save it alongside the component source
so it can later feed a Storybook or Compodoc setup.
```

**6.3 — Storybook or Compodoc (optional but recommended)**
```
Set up [Storybook | Compodoc] for aies-ui to auto-generate a browsable
component catalog from the TSDoc comments and stories. Configure it to
pull in the aies-theme CSS so components render with real tokens, and
add a script to publish the built docs to GitHub Pages on release.
```

---

## Phase 6.4 — Feedback state components

**6.4.1 — Loading, Error, Empty states**
```
Build LoadingStateComponent, ErrorStateComponent, and EmptyStateComponent
for aies-ui. These are distinct from form-control validation errors (see
Phase 6.5) — these are page/section-level states for async data fetches.
Requirements:
- LoadingStateComponent: spinner + optional message, inline or block mode.
- ErrorStateComponent: required message input, and a `retry` output that
  is ALWAYS wired to a visible retry button — there is no variant of this
  component without a retry action, so don't add a toggle to hide it.
- EmptyStateComponent: same retry-always-present rule as ErrorStateComponent,
  since "no results" can change after a filter reset or fresh fetch.
Both should default to sensible copy but accept custom message text.
Document in each component's TSDoc that omitting a (retry) handler is a
misuse of the component, not a supported configuration.
```

**6.4.2 — AsyncStateComponent (wrapper, background-fetch aware)**
```
Build AsyncStateComponent<T> for aies-ui — a wrapper component designed
to sit on top of a consuming app's data-fetching layer (e.g. TanStack
Query's injectQuery), not just a plain loading/error/empty boolean set.
It takes a single `state` input of type AsyncQueryState<T>:

  interface AsyncQueryState<T> {
    data: T | undefined;
    isLoading: boolean;   // true ONLY on the very first fetch, before any data exists
    isFetching: boolean;  // true whenever ANY fetch is in flight, including background refetches
    isError: boolean;     // true if the most recent fetch attempt failed
    error: string | null;
  }

Render logic, in order:
1. state.isLoading -> LoadingStateComponent (blocking; no data exists yet).
2. state.isError && state.data === undefined -> ErrorStateComponent
   (blocking; errored AND nothing to show).
3. data present but empty (empty array, or null/undefined after loading
   finished) -> EmptyStateComponent (blocking).
4. Otherwise: render <ng-content /> (the projected success content) and
   NEVER block on background activity. On top of that content, in a
   small non-blocking badge positioned so it never covers the content
   (e.g. top-right corner):
   - if state.isError is true here (meaning we HAVE data, but the most
     recent background refetch failed) -> show a subtle "Showing saved
     data — last refresh failed" badge with an inline retry button. This
     is a stale-data notice, not a blocking error.
   - else if state.isFetching is true (a background refetch is running,
     not the initial load) -> show a subtle "Updating…" badge, no action
     needed, just an aria-live="polite" status indicator.

Expose a single `retry` output that the blocking error/empty states AND
the stale-data badge's retry button all wire into — one handler
regardless of which case triggered it. This is the standard way any
data-driven view (Table, future List/Grid, anything else) should present
these states — wrap projected content in AsyncStateComponent rather than
each component reimplementing its own state branching, per Table's own
docs in 6.7.1. Document with a TSDoc @example showing it wired to a
TanStack Query injectQuery() result's data/isLoading/isFetching/isError
signals.
```

---

## Phase 6.5 — Shared form control pattern (read before building any form control)

**6.5.1 — Establish the base pattern**
```
Before building any individual form control (text input, select, textarea,
etc.) for aies-ui, establish and document the shared pattern every one of
them must follow, since they should feel identical in structure. Every
form control needs:

1. A `label` input and optional `hint` input.
2. An `error` input (string | null) that is DISTINCT from
   ErrorStateComponent — this is field-level validation error text, not a
   failed-request state. When set: show the error message in place of the
   hint, apply an error visual style to the control's border/wrapper, and
   wire `aria-invalid` + `aria-describedby` pointing at the error message
   for accessibility. Never silently swallow the error — if `error` is
   set, it must be visibly rendered.
2. Named content-projection slots for `prefix` and `suffix` using
   `<ng-content select="[prefix]" />` / `[suffix]`, NOT a fixed icon-name
   input — this lets consumers project any content (an aies-icon, a clear
   button, a currency symbol, a loading spinner) rather than being locked
   to icons only.
3. A `valueChange` output (or ControlValueAccessor implementation if we're
   supporting Reactive Forms — confirm which approach and use it
   consistently across every control).

Write this pattern up as a short CONTRIBUTING section (form-controls.md)
inside aies-ui, then implement TextInputComponent as the reference
implementation others should be modeled after. Every subsequent form
control prompt should reference this doc rather than re-specifying the
pattern.
```

**6.5.2 — Remaining form controls, one at a time**
```
Build [Textarea | Select | Checkbox | Radio | Toggle | DatePicker |
FileUpload] for aies-ui following the shared pattern documented in
form-controls.md (label, hint, error with aria wiring, prefix/suffix
slots where applicable, ControlValueAccessor). Flag in your response if
this control type doesn't sensibly support one of prefix/suffix/error so
we can decide whether to omit it deliberately rather than force-fit it.
```

**6.5.3 — Select: searchable mode**
```
Add a `searchable` boolean input to SelectComponent. When true, render a
text input at the top of the open dropdown that filters `options` by
label (case-insensitive substring match) as the user types, with the
list re-filtering live and no results showing a simple "No matches"
row (not the full EmptyStateComponent — this is a tiny inline list, not
a page section). When false, the dropdown is a plain click-to-select list
with no filter input. Note this is a prerequisite for 6.5.4 (add-new-entity)
and 6.5.5 (free-text creatable option) — both operate on this same
search input, so build this first and have those two reference it rather
than re-implementing filtering.
Keep keyboard navigation (arrow keys + enter) working correctly whether
searchable is on or off.
```

**6.5.4 — Select: "add new entity" via modal**
```
Extend SelectComponent (built per the shared form-control pattern) with a
`create` input of type SelectCreateConfig<TResult, T> — { label, component,
data?, mapResult }. When set, render a trigger row at the bottom of the
dropdown list showing `create.label`. Clicking it calls ModalService.open()
(from Phase 6.6) with `create.component`, passing `create.data` via
OVERLAY_DATA. On afterClosed(), if a result came back, call
`create.mapResult(result)` to produce a new SelectOption, append it to the
current options, emit an `optionsChange` output with the full updated list
(so the parent, which usually owns the canonical entity list, can persist
the addition upstream), and auto-select the new option via
`selectedChange`. The modal component itself is entirely consumer-owned —
Select must not know or assume anything about what happens inside it
beyond the mapResult contract. Document with a TSDoc @example showing a
full config object and the optionsChange/selectedChange wiring in a
template.
```

**6.5.5 — Select: free-text creatable option**
```
Add an `allowFreeText` boolean input to SelectComponent (requires
`searchable` from 6.5.3 to be enabled, since it operates on that same
search text). When true and the current search text doesn't exactly
match any existing option's label, show a synthetic "Add \"<query>\""
row inline at the top or bottom of the filtered list (no modal).
Selecting it creates a SelectOption where both label and value are the
typed text, appends it to options, emits optionsChange and
selectedChange the same way the modal-create path does in 6.5.4, and
clears the search text. This is independent of the `create` config from
6.5.4 — a Select can support free-text only, modal-create only, both, or
neither. Document the distinction clearly in the component's TSDoc:
free-text is for simple string-only options with no backing entity;
modal-create is for entities needing a real creation flow.
```

**6.5.6 — Select: multi-select mode**
```
Add a `multiple` boolean input to SelectComponent. When true:
- `selected` becomes SelectOption<T>[] instead of a single SelectOption,
  and `selectedChange` emits the full array on every change rather than
  a single value — this is a breaking type change for consumers switching
  modes, so document it clearly rather than trying to silently support
  both shapes behind one output.
- Render selected options as removable chips/tags inside the control
  (each with a small "x" to deselect), with the dropdown list showing a
  checkbox per option and staying open after a selection so the user can
  pick several without reopening it.
- Add an optional `maxSelected` input; once reached, disable remaining
  unselected options rather than silently rejecting clicks, and show a
  brief inline note (e.g. "Up to 5 selected") so the limit is visible.
- Both allowFreeText (6.5.5) and create (6.5.4) must keep working in
  multiple mode — a newly created or free-text option gets appended to
  the current selection array, not swapped in as the sole selection.
Document the single vs multiple mode distinction prominently at the top
of the component's TSDoc since it changes the shape of selectedChange.
```

**6.5.7 — NumberInput: comma-separated display**
```
Build NumberInputComponent for aies-ui following the shared form-control
pattern (label, error, hint from 6.5.1). The public contract is a plain
`value: number | null` input and `valueChange: number | null` output —
comma formatting is DISPLAY-ONLY. Internally, render the input's visible
text via Intl.NumberFormat('en-US').format(value) (a computed signal),
and on user input, strip commas and parse back to a number before
emitting valueChange — never let a comma-formatted string leak into the
public value contract. Handle invalid/partial input (e.g. mid-typing
"1,2") gracefully without emitting NaN. Document with a TSDoc @example
showing that consumers always bind to/from a plain number, never a
formatted string.
```

**6.5.8 — FileUpload: file select, camera, and type-aware preview**
```
Build FileUploadComponent for aies-ui following the shared form-control
pattern (label, error from 6.5.1) where applicable — prefix/suffix slots
don't apply here, note that explicitly in the component's TSDoc rather
than force-fitting them. Inputs: `accept` (string, passed straight to
the native file input's accept attribute, e.g. 'image/*,.pdf' — this is
how the SDK determines allowed file types, not a separate enum),
`allowFileSelect` (boolean, default true), `allowCamera` (boolean,
default true — renders a second trigger using a hidden
<input type="file" capture="environment"> so mobile browsers open the
native camera directly), `multiple` (boolean, default false). Emit a
`filesSelected` output of FileUploadResult[] where each result is
{ file: File; previewUrl: string | null; isImage: boolean } — previewUrl
is an object URL (URL.createObjectURL) for image files only; non-image
files get isImage: false and previewUrl: null, and the component should
render a generic file icon (from aies-icons) plus filename/size for
those instead of attempting an image preview. Revoke previewUrl object
URLs in ngOnDestroy to avoid memory leaks on components handling many
files. Document with a TSDoc @example showing accept restricted to a
specific type (e.g. KYC document upload: 'image/*,.pdf') and the preview
rendering logic for both image and non-image cases.
```

---

## Phase 6.6 — Programmatic overlay system (Modal, Drawer, Confirm)

**6.6.1 — Overlay foundation**
```
Add @angular/cdk as a dependency of aies-ui and build a shared overlay
foundation on top of @angular/cdk/overlay: ModalService and DrawerService,
each exposing an `open<TComponent, TData, TResult>(component, config)`
method that dynamically attaches the given component via ComponentPortal,
injects `config.data` into it through an OVERLAY_DATA injection token, and
returns an OverlayHandle with `close(result?)` and `afterClosed():
Observable<TResult | undefined>`. Wire backdrop click and ESC to close()
unless `dismissible: true` is set (default is locked). Document the full open/close/result flow
with a worked TSDoc @example on ModalService.open(), including how the
opened component reads OVERLAY_DATA and calls close() with a result. Note
that SelectComponent's create-via-modal feature (6.5.4) depends on
ModalService existing, so build this before or alongside Select.
```

**6.6.2 — ConfirmService**
```
Build ConfirmService on top of ModalService from 6.6.1, plus a built-in
ConfirmDialogComponent (title, message, confirmLabel, cancelLabel inputs).
Expose `confirm(options): Observable<boolean>` so consuming apps get a
one-line confirm flow without building their own confirm modal. Document
with a TSDoc @example showing the subscribe-and-branch usage pattern.
```

**6.6.3 — Route-driven overlays (query param opens a Modal/Drawer)**
```
Build a route-syncing layer on top of ModalService/DrawerService from
6.6.1 so a query param can trigger a modal or drawer to open, and closing
it (backdrop click, ESC, or the component's own close(result) call)
removes that param from the URL — keeping overlay state and URL state in
sync in both directions, including correct behavior on browser
back/forward and on a hard page refresh with the param already present.

Add:
- OverlayRouteEntry { component: Type<unknown>; overlay: 'modal' | 'drawer' }
  and OverlayRouteConfig { paramKey: string; routes: Record<string,
  OverlayRouteEntry> } types in aies-core.
- provideOverlayRoutes(configs: OverlayRouteConfig[]): Provider[] — a
  config function consuming apps call in app.config.ts alongside
  provideAiesSdk(), registering one or more param-key -> component maps
  (e.g. `modal` for modals, `drawer` for drawers, so both can coexist).
- RouteOverlayService, forced to instantiate eagerly via
  provideAppInitializer (so it starts watching the route immediately, not
  lazily on first injection) — it subscribes to ActivatedRoute's
  queryParamMap and: opens the matching overlay when the configured param
  key's value matches a registered route and nothing is currently open
  for that key; closes the currently-open overlay (without re-navigating)
  when the param disappears from the URL, e.g. via back button; and on
  the overlay's own afterClosed(), strips the param back out of the URL
  via router.navigate with queryParamsHandling: 'merge' so a manual close
  doesn't leave a stale param behind. Any OTHER query params present
  alongside the trigger param (e.g. ?modal=edit-shipment&id=123) should
  be passed into the opened component as its OVERLAY_DATA.

Document with a full TSDoc @example on provideOverlayRoutes showing: the
config registration, a routerLink that opens the overlay via query
params, and confirming that refreshing the page with the param already
in the URL reopens the overlay correctly on load.
```

---

## Phase 6.7 — Table + Pagination

**6.7.1 — Table with flexible, template-based cells**
```
Build TableComponent<T> for aies-ui. Columns are defined via a
`columns: TableColumn<T>[]` input (key, header, sortable?, width?), but
cell CONTENT is provided via content-projected <ng-template aiesCellDef="key">
per column — the same pattern Angular CDK Table uses — so a cell can
render literally anything a consumer puts in the template: a badge, a
button that opens a modal, a nested component, not just text. Columns
without a matching template fall back to rendering row[key] as plain
text. Build a small structural directive (aiesCellDef) to register each
projected template against its column key, and a defaultCell fallback
template inside TableComponent itself.

Also handle: sortable column headers emitting a `sortChange` output
rather than sorting internally — sorting is a server-driven concern via
the existing order query param (see 2.4), not something the component
should do client-side. TableComponent is intentionally presentational and
must NOT implement its own loading/error/empty branching — consumers wrap
it in AsyncStateComponent (6.4.2) for that instead, so Table just renders
whatever rows() it's given. Document the aiesCellDef pattern with a full
worked @example in the component's TSDoc, including a text column, a
component-in-cell column, an actions column, and the AsyncStateComponent
wrapping pattern.
```

**6.7.2 — Pagination component**
```
Build PaginationComponent for aies-ui. It takes a single `meta` input of
type PaginationMeta (from aies-models — the exact shape ApiResponseModel
already returns, no separate pagination type to maintain) and emits a
`pageChange` output with the target page number. Prev/next buttons
disable based on meta.hasPreviousPage/hasNextPage rather than computing
that from currentPage/totalPages manually. Document with a TSDoc
@example showing it wired directly to a getResource() call's response
(from Phase 2.5), i.e. the full loop of: render aies-table with
response().data, render aies-pagination with response().pagination,
pageChange calls getResource() again with the new page number.
```

---

## Phase 6.8 — Stepper

**6.8.1 — Multi-step wizard component**
```
Build StepperComponent for aies-ui, for multi-step flows (e.g. a
shipment-creation wizard), distinct from any status-timeline component —
this one is for form/wizard navigation, not displaying a shipment's
delivery progress. Inputs: `steps: StepDefinition[]` where
StepDefinition is { key: string; label: string; isValid?: boolean },
`activeIndex: number`, `linear: boolean` (default true — in linear mode,
navigating forward past a step whose isValid is explicitly false is
blocked; non-linear allows jumping to any step by clicking its header).
Emit `activeIndexChange`. Render the step header (numbered/checked
circles + labels showing current/completed/upcoming visual states) built
into the component, but per-step BODY content is content-projected using
the same aiesCellDef-style pattern as Table (6.7.1) — a structural
directive (e.g. aiesStepDef="key") marking which projected template
belongs to which step — so each step's actual form/content is fully
consumer-defined and StepperComponent itself has no knowledge of what's
inside a step. Document with a TSDoc @example showing a 2-3 step wizard
with distinct form content per step and the linear-mode validation
blocking behavior.
```

---

## Phase 7 — Cross-cutting docs

**7.1 — Root README and per-library README**
```
Write a root README.md for aies-web-sdk covering: what this SDK is, the six
packages and what each contains, install instructions (including the
.npmrc registry setup consuming apps need), a quickstart wiring up
provideAiesSdk + ThemeService, and a link to per-library docs. Then write
a shorter README.md inside each of the six libraries covering just that
package's exports and a minimal usage example.
```

**7.2 — Contribution guide**
```
Write a CONTRIBUTING.md: branch naming, conventional commit format (tie
it to how release versioning reads commits), the doc-comment requirement
for all exports, how to add a new component/icon/model, and the exact
steps to cut a release (build, version, publish) so anyone on the AIES
team can ship a new version without asking me.
```

**7.3 — Changelog audit**
```
Review the generated CHANGELOGs across all six packages since the last
audit and flag any breaking changes that aren't clearly marked, any
public export missing a TSDoc block, and any component missing a docs
page. Give me a checklist I can work through.
```

**7.4 — Playground app (living documentation)**
```
Set up a new Nx app called `playground` inside the aies-web-sdk workspace — a
plain Angular app (not published, dev-only) that imports all six @aies/*
libraries locally via workspace paths and renders a live catalog of the
whole SDK. It should include:
- A theme toggle (light/dark) wired to ThemeService, visible on every page
- A shipment-mode toggle (stn/sfn) wired to ShippingModeService
- A page per aies-ui component showing every variant/state (including
  LoadingStateComponent and ErrorStateComponent), pulling the prop table
  and usage examples from each component's TSDoc/docs page rather than
  duplicating that content by hand
- An icon gallery page listing every icon in aies-icons with its name
  (click-to-copy the IconName) so devs don't have to grep the sprite
- A design tokens page rendering the current theme's color/spacing/
  typography scale as swatches, generated from the CSS custom properties
  in aies-theme, not hardcoded
- A models reference page listing every exported interface from
  aies-models with its fields and TSDoc descriptions

Wire this up to run via `nx serve playground` locally, and add a CI job
that builds it and deploys it to GitHub Pages on every merge to main, so
the whole team always has an up-to-date, browsable reference without
needing to read source files. Structure it so adding a new component or
icon later requires zero manual playground updates — it should discover
and render from what's exported, not from a maintained list.
```

---

## Phase 8 — Consumption

**8.1 — Wire up a consuming app**
```
I have an Angular app at [path/repo]. Install @aies/aies-core, aies-models,
aies-ui, aies-theme, aies-storage from GitHub Packages, wire up
provideAiesSdk() in app.config.ts with our baseUrl, add the theme CSS
import and data-theme toggle, and replace [existing component/service]
with the SDK equivalent. Show me a diff, don't touch anything else.
```

**8.2 — Wire up query caching + AsyncStateComponent for a data view**
```
For [feature, e.g. "the shipments list page"] in this app: install
@tanstack/angular-query-experimental (pinned to an exact version, since
it's currently marked experimental upstream) if not already present,
register provideTanStackQuery with the QueryClient from
provideAiesQueryDefaults() (2.6) in app.config.ts, then convert
[ShipmentService.getShipments() usage] to use injectQuery wrapping the
existing ApiClient-based service call — don't change the service method
itself, just consume it via injectQuery instead of a raw subscribe. Map
the resulting data/isLoading/isFetching/isError/error signals into
AsyncQueryState<T> and wrap the existing template content in
<aies-async-state [state]="..." (retry)="...refetch()">. Confirm the page
now: shows cached data instantly on revisit within staleTime, shows the
blocking loading state only on a true first fetch, and shows the
non-blocking "Updating…"/stale-data badge rather than a full reload when
a background refetch runs or fails.
```

---

## Pinned — not yet scheduled into a phase

**Auth flows (login, logout, register, forgot password, fetch profile)** —
agreed this belongs in `aies-core` since the server contract is identical
across all consuming apps, rather than duplicated per app. Not built yet;
capture these decisions when it's picked up:
- Token storage AND refresh-token handling live in the SDK — `AuthService`
  reads/writes tokens via `StorageService` (Phase 4), not raw
  localStorage. A refresh-token interceptor sits alongside
  `shipmentModeInterceptor` (2.2): catches 401s, attempts a silent
  refresh, retries the original request once, and only propagates
  failure (triggering logout) if the refresh itself fails.
- `AuthService.currentUser` / `isAuthenticated` should be signal-based,
  same pattern as `ShippingModeService`/`ThemeService`.
- **`getProfile()` returns the RAW payload, no ApiResponseModel envelope**
  — use ApiClient's `responseMode: 'raw'` overload (2.3) for this one
  call specifically; don't assume every auth endpoint is raw, check each.

---

## How to use this well

- Run phases roughly in order — `models` → `core`/`theme`/`storage` (parallel-safe) → `icons`/`ui` → `docs`.
- For 6.1, run it once per component rather than batching many at once — output quality (and doc quality) drops when Claude has to hold ten components' worth of context at once.
- After each phase, ask Claude Code to run `nx affected -t lint test build` before moving on, so problems surface immediately rather than compounding.
- Keep this file in the repo (e.g. `docs/prompt-playbook.md`) and update prompts as your actual conventions diverge from what's drafted here — it doubles as onboarding material for anyone else who joins the SDK work.
