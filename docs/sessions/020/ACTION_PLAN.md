# Action Plan: Code Quality & Completeness

**Based on:** CODE_REVIEW_GAPS_TO_COMPLETION.md
**Date:** 2025-11-05
**Session:** 020

---

## Overview

This plan addresses three critical improvements to achieve production-ready quality:

1. **Unify Error Handling** - Standardize on `ParseResult`/`GenerateResult` across all packages
2. **Reduce Boilerplate** - Use Zod schemas for validation, extract common utilities
3. **Feature Completeness** - Fix hex color parser, eliminate throwing in gradient generator

---

## Phase 1: Error Handling Unification (Priority: HIGH)

**Goal:** Convert all parsers from `Result<T, string>` to `ParseResult<T>` with structured errors.

**Why Now:** Only one property is fully implemented. Perfect time before scaling to 100+ properties.

**Effort:** Low complexity, high repetition (~2 hours)

### Tasks

#### 1.1 Fix Gradient Generator Throwing (BLOCKING)

- **File:** `packages/b_generators/src/gradient/index.ts`
- **Change:** Return `GenerateResult` instead of throwing
- **Impact:** Removes try/catch wrapper in background-image generator
- **Status:** 🔴 BLOCKING - breaks contract

```typescript
// FROM: throw new Error(...)
// TO:   return generateErr(createError(...))
```

#### 1.2 Convert b_parsers to ParseResult (MECHANICAL)

- **Files:** 23 parser files (see list below)
- **Pattern:** Replace `err("string")` with `parseErr(createError(...))`
- **Strategy:** Fail-fast for atomic parsers, multi-error for list parsers

**Atomic Parsers (Fail-Fast - 15 files):**

- ✅ Template: `angle.ts` (example provided in review)
- `src/angle.ts` - parseAngleNode
- `src/length.ts` - parseLengthNode, parseLengthPercentageNode, parseNumberNode
- `src/position.ts` - parsePositionValueNode, parsePosition2D, parseAtPosition
- `src/url.ts` - parseUrl
- `src/color/hsl.ts` - parseHslFunction
- `src/color/hwb.ts` - parseHwbFunction
- `src/color/lab.ts` - parseLabFunction
- `src/color/lch.ts` - parseLchFunction
- `src/color/oklab.ts` - parseOklabFunction
- `src/color/oklch.ts` - parseOklchFunction
- `src/color/rgb.ts` - parseRgbFunction
- `src/color/color.ts` - parseNode, parse
- `src/utils/ast/functions.ts` - findFunctionNode, parseCssString

**List Parsers (Multi-Error - 4 files):**

- ✅ Template: `parseBackgroundImage` (example provided in review)
- `src/gradient/color-stop.ts` - fromNodes
- `src/gradient/conic.ts` - fromFunction, parse
- `src/gradient/linear.ts` - fromFunction, parse
- `src/gradient/radial.ts` - fromFunction, parse

#### 1.3 Convert b_utils CssValue Parser

- **File:** `packages/b_utils/src/parse/css-value-parser.ts`
- **Function:** `parseCssValueNode`
- **Change:** Return `ParseResult<CssValue>`

#### 1.4 Update b_declarations

- **Files:** 2 files
- `src/core/parser.ts` - parseDeclaration, parseDeclarationString
- `src/properties/background-image/parser.ts` - parseBackgroundImage

**Result:** Cleaner error propagation, no string wrapping

---

## Phase 2: Reduce Boilerplate (Priority: MEDIUM)

**Goal:** Eliminate repeated validation code using Zod schemas and utilities.

### Tasks

#### 2.1 Use Zod for Generator Validation

- **Files:** Color generators (7 files)
  - `packages/b_generators/src/color/rgb.ts`
  - `packages/b_generators/src/color/hsl.ts`
  - `packages/b_generators/src/color/lab.ts`
  - `packages/b_generators/src/color/lch.ts`
  - `packages/b_generators/src/color/oklab.ts`
  - `packages/b_generators/src/color/oklch.ts`
  - `packages/b_generators/src/color/hwb.ts`
- **Pattern:** Replace manual null/undefined/type checks with `schema.safeParse()`
- **Template:** Provided in review (see rgb.ts example)

#### 2.2 Extract Color Interpolation Parser

- **Current:** Duplicated across conic.ts, linear.ts, radial.ts
- **Target:** `packages/b_parsers/src/utils/color-interpolation.ts`
- **Function:** `parseColorInterpolationMethod(nodes, startIndex)`
- **Returns:** `{ method: ColorInterpolationMethod, nextIndex: number }`

#### 2.3 Refactor Generator Common Logic

- **File:** `packages/b_declarations/src/core/generator.ts`
- **Function:** Extract `getGenerator()` helper
- **Benefits:** Reduces duplication between `generateDeclaration` and `generateDeclarationObject`

---

## Phase 3: Feature Completeness (Priority: HIGH)

**Goal:** Fix incomplete implementations that affect correctness.

### Tasks

#### 3.1 Fix Hex Color Parser (CORRECTNESS BUG)

- **File:** `packages/b_types/src/color/hex.ts`
- **Issue:** Missing 3-digit (#f00) and 4-digit (#f00a) shorthands
- **Issue:** Regex is case-sensitive (should be case-insensitive)
- **Fix:** Update regex pattern

```typescript
// FROM: /^#[0-9A-F]{6}([0-9A-F]{2})?$/
// TO:   /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
```

#### 3.2 Update Hex Color Parser

- **File:** `packages/b_parsers/src/color/hex.ts`
- **Change:** Handle shorthand formats, normalize if desired

---

## Phase 4: Future Expansion (Priority: LOW - Documented)

**Goal:** Document gaps for future work (not in scope for this session).

### Known Gaps

#### 4.1 CssValue Parser Expansion

- **File:** `packages/b_utils/src/parse/css-value-parser.ts`
- **Gap:** Only handles `var()` and primitives
- **Missing:** `calc()`, `min()`, `max()`, `clamp()`
- **Note:** IR already supports these, parser needs to catch up
- **Effort:** Significant (recursive parsing of function contents)

---

## Execution Strategy

### Recommended Order

1. **Phase 1.1** - Fix gradient generator (5 mins) - UNBLOCKS everything
2. **Phase 3.1** - Fix hex parser (10 mins) - CORRECTNESS
3. **Phase 1.2** - Convert parsers to ParseResult (1-2 hours) - MECHANICAL
4. **Phase 1.3** - Convert b_utils parser (15 mins)
5. **Phase 1.4** - Update b_declarations (30 mins)
6. **Phase 2.1** - Zod validation in generators (1 hour)
7. **Phase 2.2** - Extract color interpolation utility (30 mins)
8. **Phase 2.3** - Refactor generator helpers (15 mins)

### Quality Gates

After each phase:

```bash
just check   # Typecheck + lint + format
just test    # All tests pass
just build   # Production build
```

### Estimated Total Time

- **Phase 1:** 2.5 hours (error handling unification)
- **Phase 2:** 1.75 hours (boilerplate reduction)
- **Phase 3:** 20 mins (hex color fix)
- **Total:** ~5 hours of focused work

---

## Success Criteria

✅ All parsers return `ParseResult<T>` (no `Result<T, string>`)
✅ All generators return `GenerateResult` (no throwing)
✅ Hex color parser handles all valid formats
✅ No manual null/undefined checks in generators (use Zod)
✅ No duplicated color interpolation parsing logic
✅ All quality gates passing
✅ Documentation updated

---

## Next Steps

**Ready to begin?** Suggest starting with:

1. **Quick Wins** (Phase 1.1 + 3.1) - 15 mins to fix critical issues
2. **Phase 1** - Systematic conversion to ParseResult
3. **Phase 2** - Cleanup and DRY

**Questions:**

- Should we tackle all at once or break into sub-sessions?
- Any specific phase you want to prioritize?
- Ready to start with Phase 1.1 (gradient generator fix)?
