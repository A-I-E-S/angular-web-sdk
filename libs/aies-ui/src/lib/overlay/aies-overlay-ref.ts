import type { OverlayHandle } from '@aies/aies-core';
import type { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

/**
 * Concrete {@link OverlayHandle} bound to a CDK {@link OverlayRef}.
 *
 * Provided into the overlay content injector so opened components can call
 * `close(result)` without importing CDK types. Completing `afterClosed`
 * once keeps route sync and confirm flows from double-firing.
 *
 * @typeParam TResult - Value forwarded to `afterClosed` subscribers.
 */
export class AiesOverlayRef<TResult = unknown>
  implements OverlayHandle<TResult>
{
  private readonly closed$ = new Subject<TResult | undefined>();
  private settled = false;

  /**
   * @param overlayRef - CDK overlay hosting the content portal.
   */
  constructor(private readonly overlayRef: OverlayRef) {}

  /**
   * Disposes the overlay and emits `result` on {@link afterClosed}.
   *
   * Idempotent: later calls are ignored so backdrop + ESC + explicit close
   * cannot emit twice.
   *
   * @param result - Optional value for callers awaiting the dialog outcome.
   */
  close(result?: TResult): void {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this.closed$.next(result);
    this.closed$.complete();
    this.overlayRef.dispose();
  }

  /**
   * Emits once when the overlay finishes closing, then completes.
   */
  afterClosed(): Observable<TResult | undefined> {
    return this.closed$.asObservable();
  }
}
