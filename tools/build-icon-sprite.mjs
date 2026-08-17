#!/usr/bin/env node
/**
 * Bundles repo SVG sources into a single sprite + typed IconName union.
 *
 * WHY a sprite (not one Angular component / file per icon):
 * - The kit has 600–1000+ icons. Per-icon components explode bundle size,
 *   compile time, and HTTP waterfalls.
 * - One `icons.sprite.svg` is a single cacheable request; `<use href="#id">`
 *   references symbols after IconRegistryService inlines the sprite once.
 *
 * Inputs:  <repo>/svg/*.svg
 * Outputs:
 *   - libs/aies-icons/src/assets/icons.sprite.svg
 *   - libs/aies-icons/src/lib/icon-name.ts
 *
 * Run: npm run icons:build
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const svgDir = join(repoRoot, 'svg');
const outDir = join(repoRoot, 'libs/aies-icons/src');
const spritePath = join(outDir, 'assets/icons.sprite.svg');
const typePath = join(outDir, 'lib/icon-name.ts');

/**
 * Normalizes a filename into a stable icon id / IconName.
 * Spaces become hyphens so symbol ids stay valid CSS/HTML identifiers.
 *
 * @param {string} fileName
 * @returns {string}
 */
function toIconName(fileName) {
  return basename(fileName, '.svg').trim().replace(/\s+/g, '-');
}

/**
 * Extracts viewBox (or synthesizes from width/height) and inner markup.
 *
 * @param {string} svg
 * @param {string} iconName
 * @returns {{ viewBox: string, body: string }}
 */
function parseSvg(svg, iconName) {
  const viewBoxMatch = svg.match(/\bviewBox\s*=\s*["']([^"']+)["']/i);
  const widthMatch = svg.match(/\bwidth\s*=\s*["']([\d.]+)["']/i);
  const heightMatch = svg.match(/\bheight\s*=\s*["']([\d.]+)["']/i);
  const viewBox =
    viewBoxMatch?.[1] ??
    (widthMatch && heightMatch
      ? `0 0 ${widthMatch[1]} ${heightMatch[1]}`
      : '0 0 24 24');

  const innerMatch = svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/i);
  let body = (innerMatch?.[1] ?? '').trim();

  // Prefix internal ids so defs from different icons do not collide in one sprite.
  body = body.replace(
    /\bid=(["'])([^"']+)\1/g,
    (_m, q, id) => `id=${q}${iconName}__${id}${q}`,
  );
  body = body.replace(
    /url\((["']?)#([^)"']+)\1\)/g,
    (_m, q, id) => `url(${q}#${iconName}__${id}${q})`,
  );
  body = body.replace(
    /\b(?:xlink:)?href=(["'])#([^"']+)\1/g,
    (_m, q, id) => `href=${q}#${iconName}__${id}${q}`,
  );

  // WHY currentColor: source SVGs ship hardcoded navy fills (#1C2E45) that
  // disappear on dark surfaces. Icons must follow the surrounding text color
  // (and dark:text-white / mode accents) instead of a fixed paint.
  body = themifyPaints(body);

  return { viewBox, body };
}

/**
 * Brand accent fills kept literal in the sprite (outline strokes still themify).
 * @type {Set<string>}
 */
const PRESERVED_FILLS = new Set([
  '#ef8833',
  '#1cbd5d',
  '#26a4f0',
]);

/**
 * @param {string} value
 * @returns {boolean}
 */
function isPreservedFill(value) {
  return PRESERVED_FILLS.has(value.trim().toLowerCase());
}

/**
 * Rewrites hardcoded fill/stroke paints to `currentColor`, preserving `none`
 * and partner badge accent fills.
 *
 * @param {string} body
 * @returns {string}
 */
function themifyPaints(body) {
  const rewriteAttr = (attr) => {
    body = body.replace(
      new RegExp(`\\s${attr}=(["'])([^"']*)\\1`, 'gi'),
      (match, q, value) => {
        const v = value.trim().toLowerCase();
        if (v === 'none' || v === 'currentcolor') {
          return match;
        }
        if (attr === 'fill' && isPreservedFill(value)) {
          return match;
        }
        return ` ${attr}=${q}currentColor${q}`;
      },
    );
  };

  rewriteAttr('fill');
  rewriteAttr('stroke');

  // Drop baked-in opacity so dark-mode contrast is not washed out at 60%.
  body = body.replace(/\sfill-opacity=(["'])[^"']*\1/gi, '');
  body = body.replace(/\sstroke-opacity=(["'])[^"']*\1/gi, '');

  // Inline style="fill:…" / stroke on paths (less common, still seen).
  body = body.replace(
    /\sstyle=(["'])([^"']*)\1/gi,
    (match, q, style) => {
      const next = style
        .replace(/(?:^|;)\s*fill\s*:\s*(?!none\b)[^;]+/gi, (part) => {
          const trimmed = part.replace(/^;?\s*/, '');
          if (/fill\s*:\s*none/i.test(trimmed)) {
            return part;
          }
          return part.replace(/fill\s*:\s*[^;]+/i, 'fill:currentColor');
        })
        .replace(/(?:^|;)\s*stroke\s*:\s*(?!none\b)[^;]+/gi, (part) => {
          const trimmed = part.replace(/^;?\s*/, '');
          if (/stroke\s*:\s*none/i.test(trimmed)) {
            return part;
          }
          return part.replace(/stroke\s*:\s*[^;]+/i, 'stroke:currentColor');
        })
        .replace(/(?:^|;)\s*fill-opacity\s*:\s*[^;]+/gi, '')
        .replace(/(?:^|;)\s*stroke-opacity\s*:\s*[^;]+/gi, '');
      return next.trim() ? ` style=${q}${next}${q}` : '';
    },
  );

  return body;
}

const files = readdirSync(svgDir)
  .filter((f) => f.toLowerCase().endsWith('.svg'))
  .sort((a, b) => a.localeCompare(b));

if (files.length === 0) {
  console.error(`No SVG files found in ${svgDir}`);
  process.exit(1);
}

/** @type {string[]} */
const names = [];
/** @type {string[]} */
const symbols = [];

for (const file of files) {
  const iconName = toIconName(file);
  if (names.includes(iconName)) {
    console.warn(`Duplicate icon name after normalize: ${iconName} (${file})`);
    continue;
  }
  names.push(iconName);

  const raw = readFileSync(join(svgDir, file), 'utf8');
  const { viewBox, body } = parseSvg(raw, iconName);
  symbols.push(
    `<symbol id="${iconName}" viewBox="${viewBox}">${body}</symbol>`,
  );
}

mkdirSync(dirname(spritePath), { recursive: true });

const sprite = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Generated by tools/build-icon-sprite.mjs — do not edit by hand.
  WHY sprite: 1000+ icons → one HTTP request vs thousands of components/files.
-->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none">
${symbols.join('\n')}
</svg>
`;

writeFileSync(spritePath, sprite, 'utf8');

const namesLiteral = names.map((n) => `  '${n}'`).join(',\n');
const typeSource = `/**
 * Generated by \`tools/build-icon-sprite.mjs\` — do not edit by hand.
 *
 * Closed list of every symbol id in \`icons.sprite.svg\` so typos fail at
 * compile time, editors autocomplete valid names, and the playground gallery
 * can iterate without maintaining a second list.
 *
 * To add an icon: drop an SVG into \`/svg\`, then run \`npm run icons:build\`.
 */
export const ICON_NAMES = [
${namesLiteral},
] as const;

/**
 * Union of every icon id in {@link ICON_NAMES}.
 */
export type IconName = (typeof ICON_NAMES)[number];
`;

writeFileSync(typePath, typeSource, 'utf8');

console.log(
  `Wrote ${names.length} icons → ${spritePath}\nWrote ICON_NAMES + IconName → ${typePath}`,
);
