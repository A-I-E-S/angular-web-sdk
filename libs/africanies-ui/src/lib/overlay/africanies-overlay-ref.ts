import type { OverlayRef } from '@angular/cdk/overlay';

import { Observable, Subject } from 'rxjs';

import type { OverlayHandle } from '@africanies/africanies-core';

/**
 * Concrete {@link OverlayHandle} bound to a CDK {@link OverlayRef}.
 *
 * Provided into the overlay content injector so opened components can call
 * `close(result)` without importing CDK types. Completing `afterClosed`
 * once keeps route sync and confirm flows from double-firing.
 *
 * @typeParam TResult - Value forwarded to `afterClosed` subscribers.
 */
export class AfricaniesOverlayRef<TResult = unknown>
  implements OverlayHandle<TResult>
{
  private readonly closed$ = new Subject<TResult | undefined>();
  private settled = false;

  /**
   * @param overlayRef - CDK overlay hosting the content portal.
   * @param playLeave - Optional leave animation that must finish before dispose.
   */
  constructor(
    private readonly overlayRef: OverlayRef,
    private readonly playLeave?: () => Promise<void>,
  ) {}

  /**
   * Disposes the overlay and emits `result` on {@link afterClosed}.
   *
   * Idempotent: later calls are ignored so backdrop + ESC + explicit close
   * cannot emit twice. When a leave animation is configured, dispose waits
   * until it finishes so the panel can blur/slide out.
   *
   * @param result - Optional value for callers awaiting the dialog outcome.
   */
  close(result?: TResult): void {
    if (this.settled) {
      return;
    }
    this.settled = true;

    const finish = (): void => {
      this.closed$.next(result);
      this.closed$.complete();
      this.overlayRef.dispose();
    };

    if (!this.playLeave) {
      finish();
      return;
    }

    void this.playLeave().then(finish, finish);
  }

  /**
   * Emits once when the overlay finishes closing, then completes.
   *
   * @returns Observable of the close result (or `undefined` if dismissed).
   */
  afterClosed(): Observable<TResult | undefined> {
    return this.closed$.asObservable();
  }
}
