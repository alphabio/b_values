# b_values

World-class CSS Values ↔ IR library with strongly-typed Zod schemas.

## Project Status

**Current Session:** 002

**Goal:** Pure data transformation library for CSS values (parse CSS → IR, generate IR → CSS)

## For New Agents

1. **Read** `docs/SESSION_HANDOVER.md` for current session state
2. **Review** previous session in `docs/sessions/001/` for context
3. **Create artifacts** during session in current session folder (`docs/sessions/002/`)
4. **At session end:**
   - Update `docs/SESSION_HANDOVER.md` with accomplishments
   - Move `docs/SESSION_HANDOVER.md` to `docs/sessions/002/`
   - Save git ref: `git rev-parse HEAD > docs/sessions/002/git-ref.txt`
   - Create new `docs/SESSION_HANDOVER.md` for session 003
   - Commit everything

## Architecture

- **7-package monorepo:** keywords, types, units, parsers, generators, properties, values
- **Pure functions:** No state, no side effects
- **Bidirectional:** CSS ↔ IR transformation
- **Type-safe:** Zod schemas + TypeScript
- **Tree-shakeable:** Import only what you need

See `docs/sessions/001/` for detailed architecture analysis.

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Format and lint
pnpm format
pnpm lint
```

## Monorepo Structure

```
packages/
├── b_keywords/      - CSS keyword enums
├── b_types/         - Zod schemas for value types
├── b_units/         - Unit definitions
├── b_parsers/       - CSS → IR parsers
├── b_generators/    - IR → CSS generators
├── b_properties/    - Property-level schemas
└── b_values/        - Main umbrella package

apps/
└── basic/           - Playground/test app
```
