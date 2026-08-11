import type { IconName } from '@aies/aies-icons';

/**
 * Option row for {@link ActionMenuComponent}.
 */
export interface AiesMenuItem {
  /** Visible label. */
  label: string;
  /** Invoked when the user activates this row (then the menu closes). */
  onClick: () => void;
  /** Optional leading icon from `@aies/aies-icons`. */
  icon?: IconName;
  /** When true, the item cannot be activated. */
  disabled?: boolean;
  /** Destructive styling (e.g. Delete). */
  danger?: boolean;
  /** Renders a hairline rule above this item. */
  dividerBefore?: boolean;
}
