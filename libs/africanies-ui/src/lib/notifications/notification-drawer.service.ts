import { inject, Injectable } from '@angular/core';

import type { OverlayHandle } from '@africanies/africanies-core';

import { DrawerService } from '../overlay/drawer.service';
import type {
  NotificationDrawerData,
  NotificationDrawerResult,
} from './notification.types';
import { NotificationDrawerPanel } from './notification-drawer.panel';

/**
 * Opens {@link NotificationDrawerPanel} via {@link DrawerService}.
 *
 * Requires {@link provideAfricaniesUiOverlays} at bootstrap.
 */
@Injectable({ providedIn: 'root' })
export class NotificationDrawerService {
  private readonly drawer = inject(DrawerService);

  /**
   * @param data - Notification list and optional drawer title.
   * @returns Overlay handle; `afterClosed` emits when an item is chosen or dismissed.
   */
  open(
    data: NotificationDrawerData,
  ): OverlayHandle<NotificationDrawerResult> {
    return this.drawer.open<NotificationDrawerData, NotificationDrawerResult>(
      NotificationDrawerPanel,
      {
        data,
        dismissible: true,
        panelClass: [
          '!w-[min(100%,28rem)]',
          '!p-4',
          '!overflow-hidden',
          'sm:!p-5',
        ],
      },
    );
  }
}
