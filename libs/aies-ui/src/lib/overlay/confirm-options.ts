import type { Observable } from 'rxjs';

/**
 * Work to run after the user confirms.
 *
 * The dialog stays open and the confirm button shows a loading state until
 * this settles. Resolve / complete to close with `true`; throw or error to
 * keep the dialog open so the user can retry or cancel.
 */
export type ConfirmWork = () =>
  | Observable<unknown>
  | Promise<unknown>
  | void;

/**
 * Options for {@link ConfirmService.confirm}.
 *
 * Passed into {@link ConfirmDialogComponent} as {@link OVERLAY_DATA}.
 */
export interface ConfirmOptions {
  /** Dialog heading. Defaults to a neutral "Confirm". */
  title?: string;
  /** Body copy describing the action the user is confirming. */
  message: string;
  /** Primary action label. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Dismiss action label. Defaults to "Cancel". */
  cancelLabel?: string;
  /**
   * When true, the cancel button uses the primary variant and appears after
   * the confirm button so the safe/dismiss action is the obvious choice.
   */
  emphasizeCancel?: boolean;
  /**
   * When true, the confirm button uses the danger variant so destructive
   * actions read as high-risk before the click.
   */
  danger?: boolean;
  /**
   * When true, backdrop click and Escape dismiss as Cancel (`false`).
   * Defaults to `false` — confirms require Confirm or Cancel.
   */
  dismissible?: boolean;
  /**
   * Optional async work tied to Confirm. When omitted, Confirm closes
   * immediately with `true`.
   */
  onConfirm?: ConfirmWork;
}
