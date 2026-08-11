/**
 * Helpers for the native `accept` attribute (MIME types + extensions).
 */

/**
 * Whether `file` matches a comma-separated `accept` string.
 * Empty `accept` allows every file.
 *
 * @param file - Candidate from picker / drop / camera.
 * @param accept - Native accept value (e.g. `image/*,.pdf`).
 * @returns True when the file is allowed.
 */
export function fileMatchesAccept(file: File, accept: string): boolean {
  const tokens = parseAcceptTokens(accept);
  if (!tokens.length) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return name.endsWith(token);
    }
    if (token.endsWith('/*')) {
      return type.startsWith(token.slice(0, -1));
    }
    return type === token;
  });
}

/**
 * Human-readable chips for the dropzone (e.g. `Images`, `PDF`).
 *
 * @param accept - Native accept value.
 * @returns Deduped short labels; empty when accept is unrestricted.
 */
export function acceptLabels(accept: string): string[] {
  const tokens = parseAcceptTokens(accept);
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const label = labelForAcceptToken(token);
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

/**
 * @param accept - Native accept value.
 * @returns Lowercased trimmed tokens.
 */
function parseAcceptTokens(accept: string): string[] {
  return accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * @param token - One accept token.
 * @returns Short UI label.
 */
function labelForAcceptToken(token: string): string {
  if (token === 'image/*') {
    return 'Images';
  }
  if (token === 'video/*') {
    return 'Video';
  }
  if (token === 'audio/*') {
    return 'Audio';
  }
  if (token === 'application/pdf' || token === '.pdf') {
    return 'PDF';
  }
  if (
    token ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    token === '.xlsx' ||
    token === '.xls' ||
    token === 'application/vnd.ms-excel'
  ) {
    return 'Excel';
  }
  if (
    token ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    token === '.docx' ||
    token === '.doc' ||
    token === 'application/msword'
  ) {
    return 'Word';
  }
  if (token === 'application/zip' || token === '.zip') {
    return 'ZIP';
  }
  if (token.startsWith('.')) {
    return token.slice(1).toUpperCase();
  }
  if (token.endsWith('/*')) {
    return `${token.slice(0, -2)} files`;
  }
  const subtype = token.includes('/') ? token.split('/')[1] : token;
  return subtype.toUpperCase();
}

/**
 * File-name extension without the leading dot (uppercased), or empty.
 *
 * @param fileName - Original file name.
 * @returns Extension label for non-image tiles.
 */
export function fileExtensionLabel(fileName: string): string {
  const i = fileName.lastIndexOf('.');
  if (i < 0 || i === fileName.length - 1) {
    return '';
  }
  return fileName.slice(i + 1).toUpperCase().slice(0, 5);
}
