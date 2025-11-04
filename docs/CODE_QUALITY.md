# Code Quality Standards

**Philosophy:** Keep it green. Always.

This document defines the non-negotiable quality standards for this monorepo template.

---

## Rules

### Path Aliases

**Use `@/` for all cross-directory imports in apps:**

```typescript
// ✅ Good - clear and concise
import { useStore } from "@/lib";
import { Logo } from "@/features/ui";
import { api } from "@/lib/api";

// ❌ Bad - fragile relative paths
import { useStore } from "../../lib";
import { Logo } from "../../../features/ui";
```

**Use package imports for shared code:**

```typescript
// ✅ Good - consuming from shared packages
import { Button, Card } from "@b/ui";
import { useTheme } from "@b/b_components";
import { cn } from "@b/ui/lib/utils";

// ❌ Bad - don't use relative paths to packages
import { Button } from "../../../packages/ui/src/ui/button";
```

**Same directory - use relative:**

```typescript
// ✅ Good - files in same directory
import { Component } from "./Component";
import { helper } from "./utils";
```

---

## Barrel Exports

**Every directory should have `index.ts` (or `index.tsx`):**

```typescript
// Simple re-export pattern
export * from "./file1";
export * from "./file2";
```

**No default exports. Use named exports:**

```typescript
// ✅ Good
export function Component() { ... }
export const CONSTANT = 42;

// ❌ Bad
export default function Component() { ... }
```

**Namespace exports when needed:**

```typescript
// Use for better API or avoiding collisions
export * as ModuleName from "./module";

// Then import as
import { ModuleName } from "@/features";
```

**No convenience exports. No selective re-exports.**

### Code Organization

**Feature-based structure in apps:**

```
src/
├── features/         ← Domain features
│   ├── auth/
│   ├── dashboard/
│   └── ...
├── components/       ← Shared UI components
├── lib/             ← Utilities and helpers
└── app/             ← App-level (routes, layout)
```

**Package structure:**

```
packages/ui/
├── src/
│   ├── ui/          ← Component implementations
│   ├── lib/         ← Utilities
│   └── index.tsx    ← Public API
└── package.json
```

---

## Quality Gates

**Must pass before commit:**

```bash
just check   # TypeScript + Lint + Format
just build   # Production build
```

**Fix, don't skip:**

- Errors: Fix immediately
- Warnings: Fix or justify (comments required)
- Info: Address when reasonable

### TypeScript

**Strict mode enabled. No escape hatches:**

```typescript
// ❌ Bad - forbidden patterns
const data: any = fetchData(); // No 'any'
// @ts-ignore                            // No @ts-ignore
const result = data as SomeType; // No 'as' without comment

// ✅ Good - type-safe patterns
const data: unknown = fetchData();
if (isValidData(data)) {
  // Type guard narrows type
  useData(data);
}

// ✅ Good - justified cast with comment
// Cast needed: external library returns incorrect type
const result = data as SomeType;
```

**Handle unknowns properly:**

```typescript
// ✅ Good - validate before use
function processData(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
  throw new Error("Invalid data");
}
```

**Unused code:**

```typescript
// ❌ Bad
import { unused } from "lib"; // Remove unused imports

function handler(event, _ctx) {
  // ✅ Prefix unused params with _
  return event.data;
}
```

**Remove dead code immediately:**

- Unused imports
- Unused variables
- Commented-out code (use git history instead)
- Unreachable code

### Linting & Formatting

**Biome controls dialed high:**

- a11y rules enforced (no `onClick` without keyboard handler)
- React hooks rules enforced (dependencies array must be correct)
- Performance rules enforced (avoid unnecessary re-renders)
- Security rules enforced (no dangerouslySetInnerHTML without justification)

**When you must disable a rule:**

```typescript
// ❌ Bad - vague reason
// biome-ignore lint/rule: needed

// ✅ Good - specific, justified
// biome-ignore lint/suspicious/noExplicitAny: External library returns untyped data
const result: any = legacyLibrary.getData();

// ✅ Better - fix the issue instead
const result: unknown = legacyLibrary.getData();
if (isValidResult(result)) {
  // Use properly typed data
}
```

**Auto-fix what you can:**

```bash
just format    # Formats and fixes safe issues
just lint      # Shows remaining issues
```

---

## Testing Standards

**Test what matters:**

- Critical user flows
- Complex business logic
- Edge cases and error handling
- Public APIs of shared packages

**Don't test:**

- Implementation details
- Third-party libraries
- Trivial getters/setters

**Test co-location:**

Tests must be co-located with source files:

```
packages/b_types/src/
├── result.ts          ← Implementation
├── result.test.ts     ← Tests (same directory)
├── color/
│   ├── hex.ts         ← Implementation
│   └── hex.test.ts    ← Tests (same directory)
```

**Benefits:**

- Easy to find tests for any file
- Encourages testing as you code
- Clear relationship between code and tests
- Simplifies imports (relative paths)

**Test commands:**

```bash
just test              # Run all tests
just test:watch        # Watch mode
just cover             # Coverage report
```

---

## Git & Commits

**Commit message format (Conventional Commits):**

```bash
# Format
<type>(<scope>): <description>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting, missing semicolons, etc
refactor: Code change that neither fixes a bug nor adds a feature
perf:     Performance improvement
test:     Adding or updating tests
build:    Build system or tooling changes
ci:       CI/CD pipeline changes
chore:    Maintenance (deps, config, etc)

# Scopes (monorepo - apps and packages)
Apps:
  basic              - The basic app

Packages:
  b_components       - Shared React components
  b_server           - Server-side utilities
  b_store            - State management (Zustand)
  ui                 - UI component library (Radix UI)
  tailwind-config    - Shared Tailwind CSS config
  typescript-config  - Shared TypeScript configs

Common:
  docs               - Documentation changes
  deps               - Dependency updates
  build              - Build system changes
  ci                 - CI/CD changes
  test               - Test changes
  repo               - Repository-wide changes
  dx                 - Developer experience

# Examples
feat(basic): add login with email
fix(ui): button hover state on dark mode
docs: update architecture README
chore(deps): upgrade react to 19.2
refactor(b_store): simplify state structure
test(b_components): add theme provider tests
ci: update github actions workflow
build(tailwind-config): add new color tokens

# Scope can be omitted for certain types
docs: update README
chore(deps): update all dependencies
ci: fix deployment pipeline
```

**Use the commit helper:**

```bash
pnpm commit    # Interactive commit helper (Commitizen)
```

**Pre-commit hooks (Lefthook):**

- Auto-format staged files
- Run lint checks
- Type check changed files
- Block commit if checks fail

**To skip hooks (emergency only):**

```bash
git commit --no-verify -m "emergency fix"
```

---

## Commands

```bash
# Quality check (fast)
just check

# Full build test
just build

# Auto-fix safe issues
just format

# Development
just dev
```

---

## Standards Summary

**Code must:**

- ✅ Compile without errors
- ✅ Pass all lint rules
- ✅ Format consistently
- ✅ Build successfully
- ✅ Be readable and maintainable

**Before committing:**

1. Run `just check` (typecheck + lint + format)
2. Run `just build` (verify production build)
3. Run `just test` (if tests exist)
4. All must be green ✅

**Before PR:**

- All quality gates pass
- No console warnings in build
- No TypeScript errors
- Tests pass with coverage
- Commits follow conventional format

---

## Rationale

**High standards early = less technical debt later**

We're building production-grade software. Quality is non-negotiable.

**Small issues compound exponentially:**

- One `any` leads to more `any`
- One skipped test leads to untested code
- One lint ignore leads to more ignores

**Fix issues immediately, don't accumulate them.**

**Green checks = confidence to ship.**

---

## Non-Negotiables

These rules have **zero exceptions:**

1. ❌ No `any` types
2. ❌ No `@ts-ignore` or `@ts-expect-error`
3. ❌ No disabled lint rules without justification
4. ❌ No committing broken builds
5. ❌ No committing failing tests
6. ❌ No unused imports or variables
7. ❌ No unformatted code

**If you can't follow these rules, discuss with the team first.**

---

## 📁 File Naming Conventions

### Temporary Files

**All temp files in `/tmp/` must be prefixed with `b_`:**

```bash
# ✅ Good - easy to identify agent-generated files
/tmp/b_analysis.md
/tmp/b_debug_script.sh
/tmp/b_test_output.txt
/tmp/b_working_notes.md

# ❌ Bad - unclear origin
/tmp/analysis.md
/tmp/script.sh
/tmp/output.txt
```

**Why this matters:**

- User can quickly identify agent-generated files
- Easy to review and capture valuable context
- Distinguishes from system/other temp files
- Simplifies cleanup

**Applies to:**

- Analysis documents
- Ad-hoc scripts
- Debug outputs
- Working notes
- Any file created in `/tmp/`

---

**User may review `/tmp/b_*` files later** - they often contain valuable information worth preserving.
