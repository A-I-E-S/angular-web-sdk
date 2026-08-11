import type { OverlayRef } from '@angular/cdk/overlay';

/** Surface kind — drives enter/leave transform (center scale vs edge slide). */
export type OverlaySurface = 'modal' | 'drawer';

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Backdrop + panel enter animations after the portal attaches.
 *
 * Uses the Web Animations API so consumers get motion without shipping a
 * separate CSS bundle. Skipped when the user prefers reduced motion.
 * @param overlayRef
 * @param surface
 */
export function playOverlayEnter(
  overlayRef: OverlayRef,
  surface: OverlaySurface,
): void {
  if (prefersReducedMotion()) {
    return;
  }

  overlayRef.backdropElement?.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 220,
    easing: 'ease-out',
    fill: 'both',
  });

  const pane = overlayRef.overlayElement;
  if (surface === 'modal') {
    pane.animate(
      [
        { opacity: 0, transform: 'scale(0.96) translateY(10px)' },
        { opacity: 1, transform: 'scale(1) translateY(0)' },
      ],
      { duration: 260, easing: EASE_OUT, fill: 'both' },
    );
    return;
  }

  pane.animate(
    [
      { opacity: 0, transform: 'translateX(100%)' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    { duration: 300, easing: EASE_OUT, fill: 'both' },
  );
}

/**
 * Reverse of {@link playOverlayEnter}. Resolves when leave animations finish
 * (or immediately when reduced-motion is on) so dispose can wait.
 * @param overlayRef - Live CDK overlay whose panel/backdrop animate out.
 * @param surface - Modal vs drawer leave keyframes.
 * @returns Promise that resolves when leave animations complete.
 */
export function playOverlayLeave(
  overlayRef: OverlayRef,
  surface: OverlaySurface,
): Promise<void> {
  if (prefersReducedMotion()) {
    return Promise.resolve();
  }

  const animations: Animation[] = [];

  const backdropAnim = overlayRef.backdropElement?.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 160, easing: 'ease-in', fill: 'both' },
  );
  if (backdropAnim) {
    animations.push(backdropAnim);
  }

  const pane = overlayRef.overlayElement;
  const paneAnim =
    surface === 'modal'
      ? pane.animate(
          [
            { opacity: 1, transform: 'scale(1) translateY(0)' },
            { opacity: 0, transform: 'scale(0.98) translateY(6px)' },
          ],
          { duration: 160, easing: 'ease-in', fill: 'both' },
        )
      : pane.animate(
          [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: 'translateX(100%)' },
          ],
          { duration: 220, easing: 'ease-in', fill: 'both' },
        );
  animations.push(paneAnim);

  return Promise.all(animations.map((a) => a.finished)).then(() => undefined);
}
