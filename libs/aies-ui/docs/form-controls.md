# Form controls — shared pattern

Every `@aies/aies-ui` form control follows this contract so fields feel identical across surfaces. **TextInputComponent** is the reference implementation; copy its structure (not a shared base class) when adding a new control.

## Required API

| Concern | Contract |
| --- | --- |
| Label | `label` input (string). Always rendered above the control. |
| Hint | Optional `hint` input. Shown below the control when there is **no** error. |
| Error | `error` input (`string \| null`). **Field-level** validation copy — distinct from `ErrorStateComponent` (page/section async failure). When set: replace the hint visually, apply error border/chrome, set `aria-invalid="true"`, and point `aria-describedby` at the error element. Never swallow a set error. |
| Prefix / suffix | Named projection slots `<ng-content select="[prefix]" />` and `[suffix]` so consumers can project icons, clear buttons, currency symbols, spinners, etc. **Omit deliberately** (and say so in TSDoc) when the control type cannot sensibly host them (checkbox, radio, toggle, file upload). |
| Forms | Implement **`ControlValueAccessor`** on every control so Reactive Forms (`formControlName` / `[formControl]`) work consistently. Also expose a `value` / `valueChange` (or control-specific `selected` / `selectedChange`) surface for template bindings. |

## Accessibility checklist

1. Associate the label with the control (`for` / `id`, or wrapping).
2. When `error` is non-null: `aria-invalid="true"` and `aria-describedby` → error message id.
3. When only `hint` is shown: optionally `aria-describedby` → hint id.
4. Honor `setDisabledState` from CVA (disabled chrome + no interaction).

## Visual chrome

Use Tailwind **theme tokens** from `@aies/aies-theme` only (no hardcoded hex):

- Default field: `border-border`, `bg-white` / `dark:bg-ink-950`, `text-ink`
- Focus: `focus-visible:outline` with `outline-ink` (or focus ring on the wrapper)
- Error: `border-danger`, error text `text-danger`
- Hint: `text-neutral-600` / `text-caption`

Shared class fragments live in `src/lib/forms/form-field.classes.ts` — keep string literals intact so the Tailwind scanner retains utilities in the published bundle.

## Control-specific notes

| Control | Prefix/suffix | Value shape |
| --- | --- | --- |
| Text input | Yes | `string` |
| Textarea | Yes | `string` |
| Number input | Yes | `number \| null` (display uses `Intl.NumberFormat('en-US')`; commas never leave the component) |
| Select | Yes (control `[prefix]`/`[suffix]` + per-option `prefix`/`suffix` IconName) | Single: `SelectOption \| null`; multiple: `SelectOption[]` — see Select TSDoc |
| Date picker | Yes | `string \| null` (`YYYY-MM-DD` from native `input[type=date]`) |
| Checkbox / toggle | **N/A** | `boolean` |
| Radio (group) | **N/A** | selected option `value` (`T \| null`) |
| File upload | **N/A** | Emits `filesSelected: FileUploadResult[]` (not a classic text value) |

## Do not confuse with feedback states

- **Form `error`** — one field failed validation; stays inline under that field.
- **`ErrorStateComponent` / `EmptyStateComponent` / `LoadingStateComponent`** — section or page async lifecycle; never use them inside a form control for validation.
