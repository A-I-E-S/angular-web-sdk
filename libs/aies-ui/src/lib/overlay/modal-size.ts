/**
 * Named modal panel widths for {@link ModalService.open}.
 *
 * - `md` — default (forms, confirms): ~32rem
 * - `lg` — dense create/edit forms: ~42rem
 * - `xl` — media / previews: ~56rem
 */
export type ModalSize = 'md' | 'lg' | 'xl';

/**
 * Tailwind panel classes for each {@link ModalSize}.
 *
 * Literals must stay static so the host app’s Tailwind scan (UI bundle path)
 * emits the utilities. Widths use `100%` of the overlay wrapper (not `100vw`)
 * so the panel cannot extend under the viewport scrollbar.
 */
export const MODAL_SIZE_PANEL_CLASS: Record<ModalSize, readonly string[]> = {
  md: ['max-w-lg', 'w-[min(calc(100%-2rem),32rem)]'],
  lg: ['max-w-2xl', 'w-[min(calc(100%-2rem),42rem)]'],
  xl: ['max-w-4xl', 'w-[min(calc(100%-2rem),56rem)]'],
};
