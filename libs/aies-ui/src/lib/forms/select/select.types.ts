import type { Type } from '@angular/core';

import type { IconName } from '@aies/aies-icons';

/**
 * Selectable row for {@link SelectComponent}.
 *
 * Optional {@link prefix} / {@link suffix} are **option-level** icon slots
 * (parallel to the control’s `[prefix]` / `[suffix]` projection on the
 * trigger). They render in the dropdown row, selected chips, and — in single
 * mode — beside the trigger label.
 *
 * @typeParam T - Underlying option value (string, id, entity key, etc.).
 */
export interface SelectOption<T = string> {
  /** Visible label in the trigger and list. */
  label: string;
  /** Canonical value for equality / form models. */
  value: T;
  /** When true, the option cannot be chosen. */
  disabled?: boolean;
  /**
   * Leading icon slot for this option (`aies-icon` name).
   * Omit when the row is label-only.
   */
  prefix?: IconName;
  /**
   * Trailing icon slot for this option (`aies-icon` name).
   * Omit when the row is label-only.
   */
  suffix?: IconName;
}

/**
 * Config for creating a new entity via {@link ModalService} from the select.
 *
 * Free-text creatable (`allowFreeText`) is independent: use free-text for
 * simple string-only options with no backing entity; use `create` when the
 * consumer needs a real creation flow (form modal) before the option exists.
 *
 * @typeParam TResult - Value the modal closes with (`afterClosed`).
 * @typeParam T - Option value type produced by `mapResult`.
 */
export interface SelectCreateConfig<TResult = unknown, T = string> {
  /** Label for the create trigger row at the bottom of the dropdown. */
  label: string;
  /** Standalone component opened with {@link ModalService.open}. */
  component: Type<unknown>;
  /** Optional bag injected as {@link OVERLAY_DATA} into the modal. */
  data?: unknown;
  /**
   * Maps the modal close result into a {@link SelectOption} to append and
   * select. Not called when the modal dismisses without a result.
   */
  mapResult: (result: TResult) => SelectOption<T>;
}
