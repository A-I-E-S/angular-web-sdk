import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('javascript', typescript);
hljs.registerLanguage('js', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);

/**
 * Highlight a playground implementation snippet for IDE-like display.
 * Defaults to TypeScript (snippets are mostly TS + template literals).
 * @param code - Raw source to highlight.
 * @param language - highlight.js language id (default `typescript`).
 * @returns HTML string with highlight.js span markup.
 */
export function highlightSnippet(
  code: string,
  language = 'typescript',
): string {
  try {
    return hljs.highlight(code, {
      language,
      ignoreIllegals: true,
    }).value;
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
