import type { IconName } from '@africanies/africanies-icons';

/**
 * Option row for {@link ActionMenuComponent}.
 */
export interface AfricaniesMenuItem {
  /** Visible label. */
  label: string;
  /** Invoked when the user activates this row (then the menu closes). */
  onClick: () => void;
  /** Optional leading icon from `@africanies/africanies-icons`. */
  icon?: IconName;
  /** When true, the item cannot be activated. */
  disabled?: boolean;
  /** Destructive styling (e.g. Delete). */
  danger?: boolean;
  /** Renders a hairline rule above this item. */
  dividerBefore?: boolean;
}
