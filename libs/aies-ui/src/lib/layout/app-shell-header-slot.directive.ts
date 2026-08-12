import { Directive } from '@angular/core';

/**
 * Marks projected content as the custom header for {@link AppShellComponent}.
 *
 * When present, the built-in {@link AppShellHeaderComponent} is skipped.
 */
@Directive({
  selector: '[aiesAppShellHeader]',
  standalone: true,
})
export class AppShellHeaderSlotDirective {}
