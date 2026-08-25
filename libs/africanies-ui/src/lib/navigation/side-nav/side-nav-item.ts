import type { IconName } from '@africanies/africanies-icons';

/**
 * Side-nav entry - top-level or nested under {@link children}.
 *
 * Optional {@link routerLink} follows the same router-owned active pattern as
 * tabs / segment. Nested children may also be routed.
 */
export interface AfricaniesSideNavItem {
  /** Stable id for selection, expansion, and tracking. */
  id: string;
  /** Visible label (also used in the collapsed hover blade). */
  label: string;
  /** Leading icon - recommended so the collapsed rail stays identifiable. */
  icon?: IconName;
  /**
   * Optional Angular router link. When set, navigation and active state are
   * owned by the consumer's router.
   */
  routerLink?: string | readonly unknown[];
  /** Optional query params for `RouterLink`. */
  queryParams?: Record<string, unknown>;
  /** Optional URL fragment. */
  fragment?: string;
  /** When true, the item cannot be activated. */
  disabled?: boolean;
  /**
   * When true, shows a pulsing dot on the top-right of the row (live updates,
   * unread counts, websocket events, etc.). The host app toggles this flag.
   */
  badge?: boolean;
  /**
   * Nested entries (one level deep is typical; deeper trees are supported).
   * Parent click toggles the branch when expanded; when the rail is collapsed,
   * it expands and activates the first enabled child.
   */
  children?: AfricaniesSideNavItem[];
}
