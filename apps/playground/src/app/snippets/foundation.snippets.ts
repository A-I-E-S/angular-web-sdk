/**
 * Playground code snippets — Foundation (tokens, icons).
 * Each export is a copy-ready implementation guide for demo panels.
 */

export /**
 *
 */
const TOKENS_SETUP = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       Wire Tailwind to @aies/aies-theme so design tokens compile.
// Prerequisites: tailwindcss + postcss in the app; aies-theme package linked.
// Do:            Extend the published preset; scan app sources AND @aies/aies-ui
//                so component utilities are not purged.
// Don't:        Re-declare token colors locally — extend the preset instead.
// ───────────────────────────────────────────────────────────────────────

// tailwind.config.js — monorepo paths (adjust __dirname to your app root)
const path = require('node:path');

module.exports = {
  presets: [require('@aies/aies-theme/tailwind-preset')],
  content: [
    path.join(__dirname, 'src/**/*.{html,ts}'),
    // Required: scan the UI library so its literal Tailwind classes survive purge.
    path.join(__dirname, '../../libs/aies-ui/src/**/*.{html,ts}'),
    path.join(__dirname, '../../libs/aies-theme/src/**/*.{html,ts}'),
    // Published-app equivalent:
    // './src/**/*.{html,ts}',
    // './node_modules/@aies/aies-ui/**/*.{js,mjs}',
  ],
};
`;

export /**
 *
 */
const TOKENS_CORE = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       Apply core ink / surface tokens for primary chrome and panels.
// Prerequisites: TOKENS_SETUP applied; dark mode via ThemeService if needed.
// Do:            Use literal utility strings (bg-ink, text-white, bg-ink-brand).
// Don't:        Build class names dynamically — Tailwind cannot see them at build time.
// ───────────────────────────────────────────────────────────────────────

// Core ink / surface utilities
<div class="bg-ink text-white">Ink surface</div>
<div class="bg-ink-brand text-white">Brand ink panel</div>
<div class="bg-ink-950 text-white">Near-black panel</div>
<div class="bg-black text-white">Pure black</div>
<div class="bg-white text-ink">White surface</div>
`;

export /**
 *
 */
const TOKENS_NEUTRAL = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       Neutral palette for borders, muted copy, and page backgrounds.
// Prerequisites: TOKENS_SETUP applied.
// Do:            Pair border-border with bg-background-welcome for cards;
//                use text-neutral-600 for secondary copy.
// Don't:        Use raw hex for neutrals — stay on the token scale.
// ───────────────────────────────────────────────────────────────────────

// Borders & page chrome
<div class="rounded-lg border border-border bg-background-welcome p-4">
  <p class="text-neutral-600">Muted supporting copy</p>
  <p class="text-ink dark:text-white">Primary body on welcome background</p>
</div>

<span class="text-neutral-400">Disabled / placeholder tone</span>
<span class="text-neutral-300">Light divider accent</span>
`;

export /**
 *
 */
const TOKENS_EXPORT = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       SFN / export green accents — static marketing or mode-fixed UI.
// Prerequisites: TOKENS_SETUP applied; for dynamic primary chrome prefer
//                ModeColorService (see TOKENS_MODE_ACCENTS).
// Do:            Use export / export-subtle / export-light as literal classes.
// Don't:        Hard-code export green when the control should follow STN/SFN toggle.
// ───────────────────────────────────────────────────────────────────────

// SFN / export green
<span class="rounded-md bg-export px-2 py-1 text-white">Primary</span>
<span class="rounded-md bg-export-subtle px-2 py-1 text-export">Subtle</span>
<span class="text-export-light">Light accent text</span>
<div class="rounded-xl bg-export-tint p-5">Tinted panel</div>
`;

export /**
 *
 */
const TOKENS_IMPORT = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       STN / import orange accents — static marketing or mode-fixed UI.
// Prerequisites: TOKENS_SETUP applied; for dynamic primary chrome prefer
//                ModeColorService (see TOKENS_MODE_ACCENTS).
// Do:            Use import / import-subtle / import-light as literal classes.
// Don't:        Hard-code import orange when the control should follow STN/SFN toggle.
// ───────────────────────────────────────────────────────────────────────

// STN / import orange
<span class="rounded-md bg-import px-2 py-1 text-white">Primary</span>
<span class="rounded-md bg-import-subtle px-2 py-1 text-import">Subtle</span>
<span class="text-import-light">Light accent text</span>
<div class="rounded-xl bg-import-tint p-5">Tinted panel</div>
`;

export /**
 *
 */
const TOKENS_FEEDBACK = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       Semantic status colors — independent of SFN/STN shipping mode.
// Prerequisites: TOKENS_SETUP applied.
// Do:            Pair bg-*-subtle with text-* for inline alerts and badges;
//                reserve danger-strong for high-emphasis errors.
// Don't:        Map danger/warning to export/import — they are mode-agnostic.
// ───────────────────────────────────────────────────────────────────────

// Status colors
<span class="rounded-md bg-danger-subtle px-2 py-1 text-danger">Danger</span>
<span class="rounded-md bg-danger px-2 py-1 text-white">Danger solid</span>
<span class="rounded-md bg-warning-subtle px-2 py-1 text-warning-dark">Warning</span>
<span class="text-danger-dark">Inline error copy</span>
`;

export /**
 *
 */
const TOKENS_TYPE = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       Typography scale from the theme preset — headings through captions.
// Prerequisites: TOKENS_SETUP applied; font stack inherited from preset.
// Do:            Match semantic level to content hierarchy (heading-1 for page titles).
// Don't:        Mix arbitrary text-[Npx] sizes when a token exists.
// ───────────────────────────────────────────────────────────────────────

<h1 class="text-heading-1 text-ink dark:text-white">Ship across continents</h1>
<h2 class="text-heading-2 text-ink dark:text-white">Shipment details</h2>
<h3 class="text-heading-3 text-ink dark:text-white">Cargo summary</h3>
<p class="text-body-lg text-ink dark:text-white">
  Supporting sentence for denser marketing or empty states.
</p>
<p class="text-body text-ink dark:text-white">
  Default reading size for forms, tables, and dialogs.
</p>
<p class="text-body-sm text-neutral-600">Secondary copy and dense metadata.</p>
<span class="text-caption text-neutral-600">Hints, timestamps, and chip labels.</span>
`;

export /**
 *
 */
const TOKENS_MODE_ACCENTS = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       Dynamic primary chrome that follows the active shipping mode.
// Prerequisites: ShippingModeService (via provideAiesSdk); ModeColorService from
//                @aies/aies-theme; TOKENS_SETUP so export/import utilities compile.
// Do:            Bind [class] to modeColor.classes() literals (primary, text, soft);
//                toggle SFN/STN in product shell to verify both palettes.
// Don't:        Interpolate Tailwind token names — use the service's literal strings.
// ───────────────────────────────────────────────────────────────────────

import { Component, inject } from '@angular/core';
import { ModeColorService } from '@aies/aies-theme';
import { ButtonComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-mode-accent-demo',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    @let colors = modeColor.classes();

    <button aies-button type="button" [class]="colors.primary">
      Mode-aware primary CTA
    </button>

    <span [class]="colors.text">Accent label</span>

    <div class="rounded-xl p-5" [class]="colors.bgSubtle">
      <p class="m-0 text-caption font-medium uppercase tracking-wide" [class]="colors.text">
        SFN export / STN import
      </p>
      <p class="mt-2 m-0 text-heading-3 text-ink dark:text-white">Shipment headline</p>
    </div>

    <div
      class="rounded-lg px-3 py-2 transition"
      [class]="colors.soft + ' ' + colors.softHover"
    >
      Selected row highlight
    </div>
  \`,
})
export class ModeAccentDemoComponent {
  protected readonly modeColor = inject(ModeColorService);
}
`;

export /**
 *
 */
const ICONS_USAGE = `
// ── GUIDE ─────────────────────────────────────────────────────
// Intent:       Render icons from the shared SVG sprite with type-safe names.
// Prerequisites: @aies/aies-icons package; sprite registered once at bootstrap
//                (see package README / index.html symbol defs).
// Do:            Import AiesIconComponent; type dynamic names as IconName;
//                use [size] for consistent scaling; prefer literal name="…" in templates.
// Don't:        Pass free-form strings for icon ids — autocomplete and compile-time
//                safety come from IconName.
// ───────────────────────────────────────────────────────────────────────

import { Component } from '@angular/core';
import { AiesIconComponent, type IconName } from '@aies/aies-icons';

@Component({
  selector: 'app-icon-demo',
  standalone: true,
  imports: [AiesIconComponent],
  template: \`
    <aies-icon name="airplane" [size]="24" />
    <aies-icon name="warehouse" [size]="24" />
    <aies-icon name="warning" [size]="24" />
    <aies-icon [name]="dynamicIcon" [size]="16" />
  \`,
})
export class IconDemoComponent {
  // Typed binding — only valid sprite ids compile cleanly.
  protected readonly dynamicIcon: IconName = 'anchor';
}
`;
