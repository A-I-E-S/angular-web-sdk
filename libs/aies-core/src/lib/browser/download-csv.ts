/** Value that can be serialized into a CSV cell. */
export type CsvCellValue = string | number | boolean | null | undefined;

/**
 * Options for {@link downloadCsv}.
 */
export interface DownloadCsvOptions {
  /** Download filename, including `.csv`. */
  filename: string;
  /** Optional header row. */
  headers?: readonly CsvCellValue[];
  /** Data rows. Each inner array is one CSV record. */
  rows: readonly (readonly CsvCellValue[])[];
  /**
   * Prefix a UTF-8 BOM so Excel opens the file as UTF-8. Defaults to `true`.
   */
  bom?: boolean;
}

/**
 * Escape a single CSV field (RFC 4180).
 *
 * Quotes fields that contain commas, quotes, or line breaks. `null` /
 * `undefined` become an empty cell.
 *
 * @param value - Cell value.
 */
export function csvCell(value: CsvCellValue): string {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Build a CSV document string (optional BOM + header + rows).
 *
 * @param options - Headers, rows, and BOM flag (filename is ignored).
 */
export function toCsvString(
  options: Pick<DownloadCsvOptions, 'headers' | 'rows' | 'bom'>,
): string {
  const lines: string[] = [];
  if (options.headers?.length) {
    lines.push(options.headers.map(csvCell).join(','));
  }
  for (const row of options.rows) {
    lines.push(row.map(csvCell).join(','));
  }
  const body = lines.length ? `${lines.join('\n')}\n` : '';
  const bom = options.bom === false ? '' : '\uFEFF';
  return `${bom}${body}`;
}

/**
 * Download a CSV file in the browser.
 *
 * Hosts supply filename, headers, and already-mapped row values. Safe during
 * SSR — returns `false` when `document` is unavailable.
 *
 * @param options - Filename, headers, and row cells.
 * @returns `true` when the download was triggered.
 *
 * @example
 * ```ts
 * downloadCsv({
 *   filename: 'warehouses.csv',
 *   headers: ['Name', 'Status'],
 *   rows: warehouses.map((row) => [
 *     row.name,
 *     row.active ? 'Active' : 'In-Active',
 *   ]),
 * });
 * ```
 */
export function downloadCsv(options: DownloadCsvOptions): boolean {
  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    return false;
  }

  const blob = new Blob([toCsvString(options)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = options.filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
