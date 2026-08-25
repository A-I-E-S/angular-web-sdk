import type { IconName } from '@africanies/africanies-icons';

/**
 * Toast tone — mirrors alert semantics, different surface (transient stack).
 */
export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

/**
 * Input for {@link ToastService.show}.
 */
export interface ToastShowOptions {
  /** Body copy (required). */
  message: string;
  /** Optional short heading. */
  title?: string;
  /** Semantic tone. Defaults to `info`. */
  variant?: ToastVariant;
  /**
   * Auto-dismiss delay in ms. `null` = persistent until dismiss.
   * Omit to use the variant default (error → persistent, warning → longer).
   */
  durationMs?: number | null;
  /** Override the default variant icon. */
  icon?: IconName;
}

/**
 * One entry in the live toast stack.
 */
export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  /** `null` means persistent. */
  durationMs: number | null;
  icon?: IconName;
  /** Collapse count when identical toasts merge. */
  count: number;
  /** When true and {@link count} &gt; 1, show every stacked copy. */
  expanded: boolean;
  createdAt: number;
}

/** Default auto-dismiss timings (ms). `danger` is always persistent. */
export const TOAST_DURATION_MS: Record<ToastVariant, number | null> = {
  info: 4500,
  success: 4500,
  warning: 8000,
  danger: null,
};

/** Default icons per variant. */
export const TOAST_ICONS: Record<ToastVariant, IconName> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'warning',
  danger: 'warning',
};

/**
 * Fingerprint used to collapse identical toasts (iOS-style count bump).
 *
 * @param variant - Tone.
 * @param title - Optional heading.
 * @param message - Body.
 * @returns Stable key.
 */
export function toastFingerprint(
  variant: ToastVariant,
  title: string | undefined,
  message: string,
): string {
  return `${variant}|${title ?? ''}|${message}`;
}
