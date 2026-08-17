import { NgModule } from '@angular/core';

import {
  InfoPopoverComponent,
  InfoPopoverContentDirective,
  InfoPopoverTriggerDirective,
} from '../info-popover';

/**
 * NgModule facade for {@link InfoPopoverComponent} and its trigger/content markers.
 *
 * Prefer importing the standalone pieces directly in modern apps:
 * ```ts
 * imports: [InfoPopoverComponent, InfoPopoverContentDirective, InfoPopoverTriggerDirective],
 * ```
 */
@NgModule({
  imports: [
    InfoPopoverComponent,
    InfoPopoverContentDirective,
    InfoPopoverTriggerDirective,
  ],
  exports: [
    InfoPopoverComponent,
    InfoPopoverContentDirective,
    InfoPopoverTriggerDirective,
  ],
})
export class AiesInfoPopoverModule {}
