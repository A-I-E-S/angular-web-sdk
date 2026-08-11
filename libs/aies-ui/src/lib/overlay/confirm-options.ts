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
   * When true, the confirm button uses the danger variant so destructive
   * actions read as high-risk before the click.
   */
  danger?: boolean;
}
