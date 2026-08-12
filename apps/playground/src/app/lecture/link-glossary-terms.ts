import { highlightSnippet } from '../shared/highlight-snippet';
import { GLOSSARY_MATCH_TERMS } from './glossary';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wrap glossary tokens in snippet HTML with links to `/lecture#id`.
 * Skips text inside existing HTML tags (highlight.js markup).
 * @param html - Syntax-highlighted snippet HTML.
 * @returns HTML with glossary term links inserted.
 */
export function linkGlossaryTermsInHtml(html: string): string {
  return html
    .split(/(<[^>]+>)/g)
    .map((segment) => {
      if (segment.startsWith('<')) {
        return segment;
      }

      let text = segment;
      for (const { id, match } of GLOSSARY_MATCH_TERMS) {
        const regex = new RegExp(`\\b${escapeRegex(match)}\\b`, 'g');
        text = text.replace(
          regex,
          `<a href="/lecture#${id}" class="pg-glossary-link">${match}</a>`,
        );
      }
      return text;
    })
    .join('');
}

/**
 * Syntax-highlight a snippet and link glossary terms for the Show code panel.
 * @param code - Raw TypeScript snippet text.
 * @param language - highlight.js language id.
 * @returns Highlighted HTML with glossary links.
 */
export function highlightSnippetWithGlossary(
  code: string,
  language = 'typescript',
): string {
  return linkGlossaryTermsInHtml(highlightSnippet(code, language));
}
