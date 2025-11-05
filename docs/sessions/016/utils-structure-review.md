# Utils Structure Review

## Current Situation

**Two utils locations exist:**

1. `packages/b_utils/` - Shared utilities package
   - Cross-package utilities
   - Parse helpers (css-value-parser)
   - Generate helpers
   - Exported as `@b/utils`

2. `packages/b_parsers/src/utils/` - Parser-internal utilities
   - AST manipulation (split-by-comma, find-function)
   - Parser-specific helpers
   - NOT exported from package

## Question

Should AST utilities be in:

- **Option A**: `packages/b_parsers/src/utils/` (current)
  - Pro: Co-located with parsers
  - Pro: Clear that they're parser-specific
  - Con: Not accessible to other packages
- **Option B**: `packages/b_utils/src/parse/ast/`
  - Pro: Shared across packages
  - Pro: Consistent with existing `b_utils` structure
  - Pro: Could be used by generators for validation
  - Con: Adds dependency

## Recommendation

**Keep current structure** for now:

- AST utilities are tightly coupled to css-tree
- Only used internally by parsers
- No other package needs them currently
- If generators need AST utilities later, we can refactor

**If refactoring needed:**

1. Move `packages/b_parsers/src/utils/ast/` → `packages/b_utils/src/ast/`
2. Add css-tree dependency to `@b/utils`
3. Export from `@b/utils` index
4. Update imports in `@b/parsers`

## Current Dependencies

```
@b/parsers
├── depends on: @b/types, @b/utils, css-tree
└── src/utils/ (internal only)

@b/utils
├── depends on: @b/types, css-tree
└── src/parse/ (parse helpers)
```

## Decision

**Status:** Documented, not urgent
**Action:** Continue with current structure
**Review:** When implementing parsers, if other packages need AST utils, refactor then

---

**Created:** 2025-11-05  
**Session:** 016
