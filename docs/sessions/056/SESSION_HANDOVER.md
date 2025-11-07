# Session 057: cssValueSchema Pattern - Background Size

**Date:** 2025-11-07
**Focus:** Refactored background-size using cssValueSchema pattern

---

## ✅ Accomplished

### The cssValueSchema Pattern Breakthrough

**Refactored `background-size` to leverage `cssValueSchema`:**

- ✅ **Keywords**: `bgSizeKeywordSchema` in `@b/keywords` (Zod union: auto, cover, contain)
- ✅ **Types**: `bgSizeSchema` uses `cssValueSchema` for width/height (magic!)
- ✅ **Parser**: Uses `parseNodeToCssValue` - no custom parsing needed
- ✅ **Generator**: Uses `cssValueToCss` - no custom generation needed
- ✅ **Documentation**: Completely rewrote `HOW-TO-ADD-PROPERTY.md` (653→350 lines)

### Key Insight: cssValueSchema Pattern

**Use `cssValueSchema` for component values → get var(), calc(), literals for free!**

```typescript
// Old Way (Session 056): Custom SizeValue type
{ kind: "percentage", value: { value: 50, unit: "%" } }

// New Way (Session 057): Use CssValue directly!
{ kind: "literal", value: 50, unit: "%" }  // Works with var(), calc(), etc.!
```

**Benefits:**

- ✅ Automatic support for `var()`, `calc()`, `min()`, `max()`, `clamp()`
- ✅ No custom parsing for common values (percentage, length, auto)
- ✅ Future-proof: new CSS features work automatically
- ✅ Simpler code: delegate to `parseNodeToCssValue` and `cssValueToCss`

---

## 🎉 What Changed in This Session

### File Changes:

**Keywords (`@b/keywords`):**

- Renamed `background-size.ts` → `bg-size.ts`
- Changed from array to Zod schema: `bgSizeKeywordSchema = z.union([auto, cover, contain])`
- Updated tests to use Zod validation

**Types (`@b/types`):**

- Renamed `background-size.ts` → `bg-size.ts`
- **Key Change**: `bgSizeSchema.explicit` now uses `cssValueSchema` for width/height
- Before: `{ kind: "auto" }` or `{ kind: "percentage", value: ... }`
- After: `{ kind: "keyword", value: "auto" }` or `{ kind: "literal", value: 50, unit: "%" }`
- Property-level: `bgSizeListSchema` with CSS-wide keywords at correct level

**Parser (`@b/parsers`):**

- Simplified `parseBackgroundSizeValue` - delegates to `parseNodeToCssValue`
- Removed custom `parseSizeValue` function (no longer needed!)
- Validates keywords with `bgSizeKeywordSchema.safeParse()`

**Generator (`@b/generators`):**

- Ultra-simple `generateBackgroundSizeValue` - uses `cssValueToCss`
- Removed custom `generateSizeValue` function (no longer needed!)

**Declarations (`@b/declarations`):**

- Updated `types.ts` to re-export from `@b/types`
- Changed property IR: `layers` → `values` (renamed for clarity)
- Parser/generator remain thin orchestrators

**Tests:**

- Updated all tests to expect `CssValue` format
- `{ kind: "auto" }` → `{ kind: "keyword", value: "auto" }`
- `{ kind: "percentage", ... }` → `{ kind: "literal", value: 50, unit: "%" }`

**Documentation:**

- Backed up old `HOW-TO-ADD-PROPERTY.md` → `.backup-2025-11-07`
- Rewrote from scratch: 653 lines → 350 lines
- Focus on `cssValueSchema` pattern
- Clear examples using actual working code

---

## 📊 Current State

**Working:**

- ✅ `background-size` fully refactored with `cssValueSchema` pattern

Revisit docs/architecture/patterns/HOW-TO-ADD-PROPERTY.md

```
import { propertyDefinitions } from './properties';
import { parseErr, createError, ParseResult } from '@b/types';
import { cssWideKeywordSchema } from '@b/keywords'; // The authoritative schema

// This should be the main exported parsing function
export function parseDeclaration<TProperty extends RegisteredProperty>(
  property: TProperty,
  value: string,
): DeclarationParseResult<PropertyIRMap[TProperty]> {

  const trimmedValue = value.trim();

  // ✨ UNIVERSAL KEYWORD CHECK - THE SINGLE SOURCE OF TRUTH ✨
  const wideKeywordCheck = cssWideKeywordSchema.safeParse(trimmedValue.toLowerCase());
  if (wideKeywordCheck.success) {
    // It's a universal keyword. We're done. Return a successful result.
    const ir: PropertyIRMap[TProperty] = {
      kind: 'keyword',
      value: wideKeywordCheck.data,
    } as any; // We use `as any` because TS can't prove this matches all possible IRs

    return {
      ok: true,
      value: {
        property,
        original: value,
        ir,
      },
      issues: [],
    };
  }
  // ✨ END OF UNIVERSAL CHECK ✨


  // If it wasn't a universal keyword, proceed to property-specific parsing.
  const definition = propertyDefinitions[property as RegisteredProperty];
  if (!definition) {
    return parseErr(createError(...));
  }

  // Delegate to the specific parser, which now doesn't need to worry about 'inherit'.
  const specificParseResult = definition.parser(trimmedValue);

  // ... rest of the logic to wrap the result
}
```

- ✅ All 2363 tests passing
- ✅ All quality checks passing (typecheck, lint, format)
- ✅ Production build successful
- ✅ Documentation updated

**Architecture Pattern Established:**

```
@b/keywords → Zod schemas
@b/types → Use cssValueSchema for component values
@b/parsers → Use parseNodeToCssValue (generic!)
@b/generators → Use cssValueToCss (generic!)
@b/declarations → Thin orchestrators
```

**Not Yet Refactored to cssValueSchema Pattern:**

- ⚠️ `background-repeat` - still uses old custom value types
- ⚠️ `background-origin` - still uses old custom value types
- ⚠️ `background-clip` - still uses old custom value types
- ⚠️ `background-attachment` - still uses old custom value types

---

## 🎯 Next Steps

### Priority 1: Audit Background Properties

**Need to evaluate if they should use `cssValueSchema` pattern:**

1. `background-repeat` - Can repeat values use `cssValueSchema`?
2. `background-origin` - Box keywords only, probably fine as-is
3. `background-clip` - Box keywords only, probably fine as-is
4. `background-attachment` - Simple keywords, probably fine as-is

**Questions to answer per property:**

- Do component values benefit from `var()` / `calc()` support?
- Are current custom types simpler or more complex than `cssValueSchema`?
- Is the property used by other CSS properties (mask-\*, etc.)?

### Priority 2: CSS-Wide Keywords Architecture

**Implement top-level `parseDeclaration` check (see note below):**

Currently each property parser checks for CSS-wide keywords. Should be:

- **Universal check** in `parseDeclaration` orchestrator (ONE place)
- Short-circuits before calling property parser
- Returns `{ kind: "keyword", value: "inherit" }` immediately
- Property parsers become simpler (no need to check for inherit/initial/etc.)

**Benefits:**

- DRY - written once
- Simplifies every property parser
- Architecturally correct (matches browser behavior)

### Priority 3: Documentation

- Create ADR for `cssValueSchema` pattern
- Document when to use custom types vs. `cssValueSchema`
- Add decision tree to HOW-TO guide

---

## 💡 Key Architectural Decisions

### The cssValueSchema Pattern

**USE `cssValueSchema` for component values when:**

- ✅ Value can logically accept `var()` (most cases!)
- ✅ Value might benefit from `calc()` (sizes, positions, numbers)
- ✅ You want future-proof support for new CSS functions
- ✅ You want to avoid writing custom parse/generate logic

**DON'T use `cssValueSchema` when:**

- ❌ Simple keyword-only properties (e.g., `border-collapse: collapse`)
- ❌ Complex structured syntax (e.g., gradient direction with `to top left`)
- ❌ Custom validation beyond basic CSS value types

### CSS-Wide Keywords Belong at Property Level

**CORRECT:**

```typescript
// Property IR schema
const propertySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: cssWideKeywordSchema }), // ✅
  z.object({ kind: z.literal("value"), ... }),
]);
```

**INCORRECT:**

```typescript
// Don't add inherit/initial to cssValueSchema!
const cssValueSchema = z.union([
  ...,
  z.literal("inherit"), // ❌ Wrong level!
]);
```

**Rationale:** `inherit` replaces the _entire property value_, not a component.

### Package Roles

**`@b/keywords`** - Zod schemas for keyword sets
**`@b/types`** - IR schemas (leverage `cssValueSchema`!)
**`@b/parsers`** - Value-level (use `parseNodeToCssValue`)
**`@b/generators`** - Value-level (use `cssValueToCss`)
**`@b/declarations`** - Property-level thin orchestrators

---

## 📁 Files Modified This Session

**Keywords:**

- Renamed: `packages/b_keywords/src/background-size.ts` → `bg-size.ts`
- Updated: `bg-size.test.ts` (tests Zod schema validation)
- Updated: `packages/b_keywords/src/index.ts` (export path)

**Types:**

- Renamed: `packages/b_types/src/background-size.ts` → `bg-size.ts`
- Updated: `bg-size.test.ts` (tests with `CssValue` format)
- Updated: `packages/b_types/src/index.ts` (export path)

**Parsers:**

- Simplified: `packages/b_parsers/src/background/size.ts` (uses `parseNodeToCssValue`)

**Generators:**

- Simplified: `packages/b_generators/src/background/size.ts` (uses `cssValueToCss`)

**Declarations:**

- Updated: `packages/b_declarations/src/properties/background-size/types.ts`
- Updated: `packages/b_declarations/src/properties/background-size/parser.ts` (uses new types)
- Updated: `packages/b_declarations/src/properties/background-size/generator.ts` (uses new types)
- Updated: `packages/b_declarations/src/properties/background-size/parser.test.ts` (all tests)
- Updated: `packages/b_declarations/src/properties/background-size/generator.test.ts` (all tests)

**Documentation:**

- Backed up: `docs/architecture/patterns/HOW-TO-ADD-PROPERTY.md.backup-2025-11-07`
- Rewrote: `docs/architecture/patterns/HOW-TO-ADD-PROPERTY.md` (new pattern)

---

## 📝 Important Notes for Next Session

### CSS-Wide Keywords Refactor Needed

User provided architectural insight: **CSS-wide keyword checking should be in `parseDeclaration` orchestrator**

**Current State:** Every property parser checks for `inherit`, `initial`, etc. (DRY violation!)

**Proposed Change:**

```typescript
// packages/b_declarations/src/parser.ts
export function parseDeclaration(property, value) {
  // ✨ Universal check FIRST (before property parser)
  const wideKeywordCheck = cssWideKeywordSchema.safeParse(value.trim().toLowerCase());
  if (wideKeywordCheck.success) {
    return parseOk({ kind: "keyword", value: wideKeywordCheck.data });
  }

  // Only if not CSS-wide keyword, delegate to property parser
  return definition.parser(value);
}
```

**Benefits:**

- DRY - logic in ONE place
- Simplifies every property parser
- Architecturally correct (matches browser behavior)
- `preParse` in `createMultiValueParser` becomes clearer (property-specific only)

---

**Status:** ✅ **Session 057 Complete - background-size refactored**

**Next Session Plan:**

1. Audit: background-repeat, background-origin, background-clip, background-attachment
2. Decide: Which should use `cssValueSchema` pattern?
3. Implement: CSS-wide keywords in top-level orchestrator
4. Document: Create ADR for pattern decisions
