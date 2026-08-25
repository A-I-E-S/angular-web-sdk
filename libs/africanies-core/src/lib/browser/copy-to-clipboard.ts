/**
 * Copy plain text to the system clipboard.
 *
 * Prefers `navigator.clipboard.writeText`. Falls back to a temporary
 * `textarea` + `document.execCommand('copy')` when the Clipboard API is
 * missing or throws (older browsers, some embedded / non-secure contexts).
 *
 * Safe to call during SSR — returns `false` when `document` is unavailable.
 *
 * @param value - Text to place on the clipboard.
 * @returns `true` when the write succeeded; `false` otherwise.
 *
 * @example
 * ```ts
 * const ok = await copyToClipboard(iconName);
 * if (ok) {
 *   toast.success(`Copied “${iconName}”`);
 * }
 * ```
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the legacy execCommand path.
  }

  try {
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
