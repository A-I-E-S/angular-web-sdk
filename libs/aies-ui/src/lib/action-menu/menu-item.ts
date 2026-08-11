import type { IconName } from '@aies/aies-icons';

/**
 * Option row for {@link ActionMenuComponent}.
 */
export interface AiesMenuItem {
  /** Stable id emitted on {@link ActionMenuComponent.actionSelect}. */
  id: string;
  /** Visible label. */
  label: string;
  /** Optional leading icon from `@aies/aies-icons`. */
  icon?: IconName;
  /** When true, the item cannot be activated. */
  disabled?: boolean;
  /** Destructive styling (e.g. Delete). */
  danger?: boolean;
  /** Renders a hairline rule above this item. */
  dividerBefore?: boolean;
}
