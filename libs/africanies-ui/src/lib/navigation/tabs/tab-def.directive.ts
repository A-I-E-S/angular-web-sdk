import { Directive, inject, input, TemplateRef } from '@angular/core';

/**
 * Implicit context for templates registered with {@link TabDefDirective}.
 */
export interface TabDefContext {
  /** Tab id matching {@link AfricaniesNavItem.id}. */
  $implicit: string;
}

/**
 * Registers projected tab panel content against a tab id for
 * {@link TabsComponent} (local / non-router mode).
 *
 * @example
 * ```html
 * <ng-template africaniesTabDef="details">
 *   <app-shipment-details />
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[africaniesTabDef]',
  standalone: true,
})
export class TabDefDirective {
  /** Template projected as the active tab panel. */
  readonly template = inject(TemplateRef<TabDefContext>);

  /**
   * Tab id this template binds to — must match an {@link AfricaniesNavItem.id}.
   */
  readonly africaniesTabDef = input.required<string>();
}
