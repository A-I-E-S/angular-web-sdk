# Contributing

## Branch naming

Prefer short, scoped names:

- `feat/<topic>` — new capability
- `fix/<topic>` — bug fix
- `chore/<topic>` — tooling, deps, CI
- `docs/<topic>` — documentation only
- `refactor/<topic>` — no behavior change

Examples: `feat/table-pagination`, `fix/auth-interceptor-timeout`.

## Commits

We use [Conventional Commits](https://www.conventionalcommits.org/). Nx release
(`projectsRelationship: independent` in `nx.json`) versions each `@aies/*`
package from its own commit history.

| Prefix | Effect on release |
| --- | --- |
| `feat:` | minor bump for touched packages |
| `fix:` | patch bump |
| `feat!:` / `BREAKING CHANGE:` | major bump |
| `docs:`, `chore:`, `test:`, `refactor:` | usually no version bump unless configured otherwise |

Examples:

```
feat(aies-ui): add pagination previous/next controls
fix(aies-core): persist shipping mode on storage failure
docs: clarify ThemeService bootstrap
```

Commitlint runs via husky — keep the first line under ~100 characters.

## Documentation requirements

- Every **public export** needs a TSDoc/JSDoc block (`@param`, `@returns`,
  `@throws`, `@example` where non-obvious).
- Prefer comments that explain **why**, not what the next line does.
- Run `npm run docs:coverage` before opening a PR when you add exports.

## Adding a component (`aies-ui`)

1. Create the standalone component under `libs/aies-ui/src/lib/…`.
2. Export it from the barrel (`src/index.ts` and any subfolder `index.ts`).
3. Add TSDoc + a short docs note if behavior is non-obvious
   (see `libs/aies-ui/docs/` or co-located `docs.md`).
4. Add/adjust unit tests.
5. Demo it on a playground page under `apps/playground/src/app/pages/`.

## Adding an icon (`aies-icons`)

1. Drop a `.svg` into `/svg` (kebab-case filename; spaces → hyphens).
2. Run `npm run icons:build`.
3. Commit regenerated `icons.sprite.svg` and `icon-name.ts`
   (`ICON_NAMES` + `IconName`).
4. The playground `/icons` gallery picks up new names automatically.

## Adding a model (`aies-models`)

1. Add the type under `libs/aies-models/src/lib/<domain>/`.
2. Re-export from the domain `index.ts` and root `src/index.ts`.
3. Document the type with TSDoc; keep the package free of Angular imports.
4. Optionally list it on the playground `/models` page.

## Release

Packages are released independently to GitHub Packages. From a clean `main`
(after review):

```bash
# 1. Version packages from conventional commits (runs preVersion build)
nx release version

# 2. Generate per-project changelogs
nx release changelog

# 3. Ensure all six libs build
nx run-many -t build --projects=aies-models,aies-storage,aies-core,aies-theme,aies-icons,aies-ui

# 4. Publish to GitHub Packages (requires auth)
nx release publish
```

Notes:

- `nx.json` → `release.projectsRelationship: "independent"`,
  `changelog.projectChangelogs: true`.
- `version.preVersionCommand` already builds the six libs before bumping.
- Authenticate to `npm.pkg.github.com` with a PAT that has `write:packages`.

## Local checks

```bash
npm run lint
npm run test
npm run build
npx nx build playground
```
