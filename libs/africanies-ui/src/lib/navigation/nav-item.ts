import type { IconName } from '@africanies/africanies-icons';

/**
 * Shared item contract for breadcrumb, tabs, and segment.
 *
 * When {@link routerLink} is set, the host component renders an `<a>` with
 * Angular `RouterLink` / `RouterLinkActive` so active state comes from the
 * **consumer’s** router. When omitted, items are buttons driven by a local
 * `activeId` model.
 */
export interface AfricaniesNavItem {
  /** Stable id for selection, templates, and tracking. */
  id: string;
  /** Visible label. */
  label: string;
  /**
   * Optional Angular router link (`string` or commands array).
   * When set, navigation and active state are owned by the router.
   */
  routerLink?: string | readonly unknown[];
  /** Optional query params passed to `RouterLink`. */
  queryParams?: Record<string, unknown>;
  /** Optional URL fragment. */
  fragment?: string;
  /** When true, the item cannot be activated. */
  disabled?: boolean;
  /**
   * Non-link breadcrumb tone. When `false`, uses primary text (`text-ink`) instead
   * of muted grey. Defaults to muted for group/segment labels without a link.
   */
  breadcrumbMuted?: boolean;
  /** Optional leading icon from `@africanies/africanies-icons`. */
  icon?: IconName;
}
