import type { IconName } from '@africanies/africanies-icons';

/**
 * Option row for {@link ActionMenuComponent}.
 *
 * Set optional {@link routerLink} (and `queryParams` / `fragment`) so the row
 * renders as an `<a href>` — right-click / ⌘-click can open in a new tab.
 * Primary click still runs {@link onClick} when provided; otherwise the menu
 * navigates via the router (same pattern as tabs / segment).
 */
export interface AfricaniesMenuItem {
  /** Visible label. */
  label: string;
  /**
   * Invoked on primary activation (then the menu closes).
   * Optional when {@link routerLink} is set — the menu navigates instead.
   */
  onClick?: () => void;
  /** Optional leading icon from `@africanies/africanies-icons`. */
  icon?: IconName;
  /**
   * Optional Angular router link (`string` or commands array).
   * When set, the row is an `<a>` with a real `href` for open-in-new-tab.
   */
  routerLink?: string | readonly unknown[];
  /** Optional query params passed with {@link routerLink}. */
  queryParams?: Record<string, unknown>;
  /** Optional URL fragment with {@link routerLink}. */
  fragment?: string;
  /** When true, the item cannot be activated. */
  disabled?: boolean;
  /** Destructive styling (e.g. Delete). */
  danger?: boolean;
  /** Renders a hairline rule above this item. */
  dividerBefore?: boolean;
}
