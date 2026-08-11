#!/usr/bin/env node
/**
 * Fails if a public export under libs is missing a leading TSDoc block.
 * Heuristic only — catches obvious misses before review, not a full TSDoc parser.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LIBS = join(ROOT, 'libs');

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      out.push(...walk(full));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts') && entry !== 'test-setup.ts') {
      out.push(full);
    }
  }
  return out;
}

const exportRe =
  /^export\s+(?:declare\s+)?(?:async\s+)?(?:abstract\s+)?(?:const|let|var|function|class|enum|type|interface|abstract\s+class)\s+/m;

/** @type {string[]} */
const missing = [];

for (const lib of readdirSync(LIBS)) {
  const src = join(LIBS, lib, 'src');
  try {
    if (!statSync(src).isDirectory()) continue;
  } catch {
    continue;
  }
  for (const file of walk(src)) {
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!exportRe.test(line) && !/^export\s+\{/.test(line)) {
        // Match `export class` / `export function` / `export const` / `export type` / `export interface`
        if (
          !/^\s*export\s+(abstract\s+)?(class|function|const|let|type|interface|enum)\s+\w+/.test(
            line,
          )
        ) {
          continue;
        }
      } else if (!/^\s*export\s+(abstract\s+)?(class|function|const|let|type|interface|enum)\s+\w+/.test(line)) {
        continue;
      }

      // Skip re-exports from barrels: `export type { X } from`
      if (/^\s*export\s+(type\s+)?\{/.test(line) || /^\s*export\s+\*\s+from/.test(line)) {
        continue;
      }

      // Look backward for a TSDoc block, ignoring blank lines and eslint comments
      let j = i - 1;
      while (j >= 0 && (/^\s*$/.test(lines[j]) || /^\s*\/\//.test(lines[j]))) {
        j--;
      }
      const hasDoc = j >= 0 && /\*\/\s*$/.test(lines[j]);
      if (!hasDoc) {
        missing.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
      }
    }
  }
}

if (missing.length) {
  console.error('Missing TSDoc on public exports:\n' + missing.map((m) => `  - ${m}`).join('\n'));
  process.exit(1);
}

console.log('Doc coverage check passed.');
