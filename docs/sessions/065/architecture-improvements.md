# Architecture Improvement Recommendations

**Session:** 065  
**Date:** 2025-11-11  
**Status:** 🟡 PLANNED  
**Context:** Post-validation architecture review after fixing `var()` support and keyword handling

---

## Executive Summary

The current architecture is **production-ready (8/10)**. These improvements are refinements that will:

- Reduce boilerplate in property definitions
- Improve type safety across package boundaries
- Consolidate validation logic
- Make the system easier to extend

All recommendations are backward-compatible and can be implemented incrementally.

---

## Improvement #1: Type Consistency Between Parser Layers

**Priority:** 🔴 High  
**Effort:** Medium (2-3 hours)  
**Impact:** High (affects all future property additions)

### Problem

Currently there's a type mismatch between `@b/parsers` and `@b/declarations`:

```typescript
// @b/parsers: Returns bare strings
parseBackgroundClipValue(ast)
  → ParseResult<"border-box" | "padding-box" | "content-box" | "text">

// @b/declarations: Requires keyword objects
itemParser(ast)
  → ParseResult<{ kind: "keyword", value: "border-box" } | CssValue>
```

This requires manual wrapping in every property parser:

```typescript
// Current: Manual wrapping required (repeated 6+ times)
export const parseBackgroundClip = createMultiValueParser({
  itemParser(valueNode) {
    const result = Parsers.Background.parseBackgroundClipValue(valueNode);
    if (!result.ok) return result as ParseResult<BackgroundClipValue>;
    return parseOk({ kind: "keyword", value: result.value }); // Manual wrap
  },
  aggregator: (layers) => ({ kind: "list", values: layers }),
});
```

### Solutions

#### Option A: Make @b/parsers IR-Aware (Breaking Change)

**Pros:**

- Single source of truth
- No wrapping needed
- Consistent IR everywhere

**Cons:**

- Breaking change for @b/parsers API
- Makes @b/parsers depend on IR types
- Loses simplicity of "parser returns primitives"

```typescript
// @b/parsers/src/background/clip.ts
export function parseBackgroundClipValue(valueNode: csstree.Value): ParseResult<KeywordValue<BackgroundClip>> {
  // ...
  return parseOk({ kind: "keyword", value: val as BackgroundClip });
}
```

#### Option B: Create Declarative Wrapper Helper (Recommended)

**Pros:**

- Backward compatible
- @b/parsers stays simple
- Reduces boilerplate by ~90%
- Type-safe

**Cons:**

- Slight abstraction overhead

````typescript
// @b/declarations/src/utils/wrap-keyword-parser.ts
import type { ParseResult, CssValue } from "@b/types";
import { parseOk } from "@b/types";

/**
 * Type for a keyword wrapped as IR object.
 */
export type KeywordValue<T extends string> = {
  kind: "keyword";
  value: T;
};

/**
 * Wraps a bare-string keyword parser to return keyword IR objects.
 *
 * This bridges the gap between @b/parsers (returns primitives) and
 * @b/declarations (expects IR objects).
 *
 * @example
 * ```typescript
 * export const parseBackgroundClip = createMultiValueParser({
 *   itemParser: wrapKeywordParser(Parsers.Background.parseBackgroundClipValue),
 *   aggregator: (layers) => ({ kind: "list", values: layers }),
 * });
 * ```
 */
export function wrapKeywordParser<T extends string>(
  parser: (node: csstree.Value) => ParseResult<T>
): (node: csstree.Value) => ParseResult<KeywordValue<T> | CssValue> {
  return (node) => {
    const result = parser(node);
    if (!result.ok) {
      // Error case: preserve issues and property
      return result as ParseResult<KeywordValue<T> | CssValue>;
    }
    // Success: wrap as keyword IR
    return parseOk({ kind: "keyword", value: result.value });
  };
}
````

**Usage:**

```typescript
// Before: Manual wrapping (18 lines)
export const parseBackgroundClip = createMultiValueParser<BackgroundClipValue, BackgroundClipIR>({
  itemParser(valueNode: csstree.Value): ParseResult<BackgroundClipValue> {
    const result = Parsers.Background.parseBackgroundClipValue(valueNode);
    if (!result.ok) {
      return result as ParseResult<BackgroundClipValue>;
    }
    return parseOk({ kind: "keyword", value: result.value });
  },
  aggregator(layers: BackgroundClipValue[]): BackgroundClipIR {
    return { kind: "list", values: layers };
  },
});

// After: Declarative (4 lines)
export const parseBackgroundClip = createMultiValueParser({
  itemParser: wrapKeywordParser(Parsers.Background.parseBackgroundClipValue),
  aggregator: (layers) => ({ kind: "list", values: layers }),
});
```

### Implementation Plan

1. Create `@b/declarations/src/utils/wrap-keyword-parser.ts`
2. Add tests for error propagation and success wrapping
3. Refactor existing properties:
   - `background-clip/parser.ts`
   - `background-origin/parser.ts`
   - `background-attachment/parser.ts` (if needed)
4. Update documentation with usage examples
5. Use in all future property definitions

**Files to modify:**

- `packages/b_declarations/src/utils/wrap-keyword-parser.ts` (new)
- `packages/b_declarations/src/utils/index.ts` (export)
- `packages/b_declarations/src/properties/background-clip/parser.ts`
- `packages/b_declarations/src/properties/background-origin/parser.ts`
- Add test: `packages/b_declarations/src/utils/wrap-keyword-parser.test.ts`

---

## Improvement #2: Eliminate Redundant `allowedKeywords` Pre-validation

**Priority:** 🟡 Medium  
**Effort:** Small (1-2 hours)  
**Impact:** Medium (cleaner code, better error messages)

### Problem

Currently validation happens in two places:

```typescript
// 1. Pre-validation in parser.ts (lines 258-270)
if (definition.allowedKeywords && !isCustomProperty(property)) {
  const trimmedValue = value.trim().toLowerCase();
  if (/^[a-z-]+$/i.test(trimmedValue) &&
      !definition.allowedKeywords.includes(trimmedValue)) {
    preValidationIssues.push(...); // "Invalid keyword"
  }
}

// 2. Authoritative validation in property parser
export function parseBackgroundClipValue(valueNode) {
  const val = node.name.toLowerCase();
  if (BACKGROUND_CLIP.includes(val as BackgroundClip)) {
    return parseOk(val);
  }
  return parseErr(...); // "Invalid background-clip value: ..."
}
```

**Issues:**

- Duplicate logic
- Pre-validation error is generic: "Invalid keyword"
- Property parser error is specific: "Invalid background-clip value: 'foo'. Expected: border-box, padding-box, content-box, or text"
- Pre-validation interferes with universal function detection

### Solution

Remove pre-validation, trust property parsers as authoritative:

```typescript
// parser.ts: Remove allowedKeywords block entirely
// Lines 258-270 can be deleted

// Keep ONLY for detecting universal functions (if needed)
if (definition.multiValue && /^[a-z-]+$/i.test(trimmedValue)) {
  // This is a bare identifier - createMultiValueParser will handle it
  // Universal functions (var, calc) are caught by isUniversalFunction
}
```

**Benefits:**

- Single source of truth (property parsers)
- Better error messages reach users
- Less code
- Faster (one validation pass instead of two)

### Implementation Plan

1. Remove `allowedKeywords` pre-validation block from `parser.ts`
2. Update `PropertyDefinition` type to make `allowedKeywords` optional/deprecated
3. Run full test suite to verify property parsers catch all invalid values
4. Update tests that expect pre-validation errors (if any)
5. Document that validation is property-parser responsibility

**Files to modify:**

- `packages/b_declarations/src/parser.ts` (remove lines 258-270)
- `packages/b_declarations/src/core/types.ts` (mark `allowedKeywords` deprecated)
- Update any tests expecting pre-validation errors

---

## Improvement #3: Type-Safe `defineProperty` Generic

**Priority:** 🟢 Low-Medium  
**Effort:** Small (30 minutes)  
**Impact:** Medium (prevents registration bugs)

### Problem

Current implementation allows type mismatches:

```typescript
// Current: No enforcement of name ↔ IR type match
export function defineProperty<T>(definition: PropertyDefinition<T>) {
  propertyRegistry.register(definition as PropertyDefinition<unknown>);
  return definition;
}

// This compiles but is wrong:
defineProperty<BackgroundClipIR>({
  name: "background-color", // ❌ Wrong IR type!
  parse: parseBackgroundClip,
  generate: generateBackgroundClip,
  // ...
});
```

### Solution

Constrain generic to match `PropertyIRMap`:

```typescript
export function defineProperty<K extends keyof PropertyIRMap>(
  definition: PropertyDefinition<PropertyIRMap[K]> & { name: K }
): PropertyDefinition<PropertyIRMap[K]> {
  propertyRegistry.register(definition);
  return definition;
}

// Now this is a compile error:
defineProperty({
  name: "background-color", // ✅ K = "background-color"
  parse: parseBackgroundClip, // ❌ Type error: parse returns BackgroundClipIR, not BackgroundColorIR
  // ...
});
```

**Trade-off:** Requires `PropertyIRMap` to be complete before defining properties. This is already the case (generated script).

### Implementation Plan

1. Update `defineProperty` signature in `core/registry.ts`
2. Remove type arguments from all `defineProperty` call sites (inferred now)
3. Run typecheck to catch any mismatches
4. Fix any caught bugs

**Files to modify:**

- `packages/b_declarations/src/core/registry.ts`
- All `packages/b_declarations/src/properties/*/definition.ts` (remove `<T>`)

---

## Improvement #4: Standardize on Schema-First IR Definitions

**Priority:** 🟢 Low  
**Effort:** Medium (2-3 hours)  
**Impact:** Low (consistency, documentation)

### Current State

Mix of approaches:

```typescript
// Approach A: Schema-first (recommended)
export const backgroundClipIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("list"), values: z.array(...) }),
]);
export type BackgroundClipIR = z.infer<typeof backgroundClipIRSchema>;

// Approach B: Type-first (less common)
export type BackgroundClipIR =
  | { kind: "keyword"; value: CssWide }
  | { kind: "list"; values: BackgroundClipValue[] };
export const backgroundClipIRSchema = z.union([...]); // Defined separately
```

### Recommendation

**Always use schema-first** for these benefits:

1. **Runtime validation**: Can validate generated IR in tests
2. **Self-documenting**: Zod schemas are readable and include `.describe()`
3. **Type safety**: Type derived from schema is always correct
4. **Refactoring**: Change schema, type automatically updates

### Example Enhancement

```typescript
export const backgroundClipIRSchema = z
  .discriminatedUnion("kind", [
    z
      .object({
        kind: z.literal("keyword"),
        value: Keywords.cssWide,
      })
      .describe("CSS-wide keyword (inherit, initial, etc.)"),

    z
      .object({
        kind: z.literal("list"),
        values: z.array(backgroundClipValueSchema).min(1),
      })
      .describe("Comma-separated list of background-clip values"),
  ])
  .describe("IR for the background-clip CSS property");

export type BackgroundClipIR = z.infer<typeof backgroundClipIRSchema>;

// Enable runtime validation in tests
export function validateBackgroundClipIR(ir: unknown): BackgroundClipIR {
  return backgroundClipIRSchema.parse(ir);
}
```

### Implementation Plan

1. Audit all `types.ts` files for consistency
2. Ensure all schemas are defined before types
3. Add `.describe()` calls for documentation
4. Export validation functions for testing
5. Add tests that validate round-trip (parse → validate → generate)

**Files to audit:**

- All `packages/b_declarations/src/properties/*/types.ts`

---

## Improvement #5: Consolidate Universal Function Detection

**Priority:** 🟢 Low  
**Effort:** Small (1 hour)  
**Impact:** Low (DRY, maintainability)

### Problem

Universal function detection scattered across multiple files:

```typescript
// @b/declarations/src/utils/type-guards.ts
const UNIVERSAL_FUNCTION_NAMES = ["var", "calc", "min", ...];

// @b/declarations/src/parser.ts (pre-validation)
if (/^[a-z-]+$/i.test(val) && /* custom check */) { ... }

// @b/declarations/src/utils/create-multi-value-parser.ts
if (firstNode && isUniversalFunction(firstNode)) { ... }
```

### Solution

Centralize in `@b/types` as source of truth:

```typescript
// @b/types/src/universal-functions.ts
/**
 * CSS functions that work across all properties.
 * These are handled by the declaration layer, not property-specific parsers.
 *
 * @see https://drafts.csswg.org/css-values-4/#functional-notations
 */
export const UNIVERSAL_FUNCTION_NAMES = [
  "var",
  "calc",
  "min",
  "max",
  "clamp",
  "env",
  "attr", // Technically property-specific but treated as universal
] as const;

export type UniversalFunctionName = (typeof UNIVERSAL_FUNCTION_NAMES)[number];

export function isUniversalFunctionName(name: string): name is UniversalFunctionName {
  return UNIVERSAL_FUNCTION_NAMES.includes(name as UniversalFunctionName);
}

/**
 * Check if a CSS AST node is a universal function.
 */
export function isUniversalFunctionNode(node: csstree.CssNode): boolean {
  return node.type === "Function" && isUniversalFunctionName(node.name);
}
```

### Implementation Plan

1. Create `@b/types/src/universal-functions.ts`
2. Export from `@b/types/src/index.ts`
3. Replace all scattered checks with imports
4. Add JSDoc references to spec

**Files to modify:**

- `packages/b_types/src/universal-functions.ts` (new)
- `packages/b_types/src/index.ts` (export)
- `packages/b_declarations/src/utils/type-guards.ts` (use import)
- `packages/b_declarations/src/utils/create-multi-value-parser.ts` (use import)

---

## Implementation Strategy

### Phase 1: Foundation (High-Priority Items)

**Target: Session 066**

1. ✅ Implement `wrapKeywordParser` helper (#1)
2. ✅ Refactor `background-clip`, `background-origin` to use it
3. ✅ Add tests for wrapper helper

**Success Criteria:**

- Reduced parser boilerplate by ~80%
- All tests pass
- Pattern documented for future properties

### Phase 2: Validation Cleanup (Medium-Priority)

**Target: Session 067**

1. ✅ Remove `allowedKeywords` pre-validation (#2)
2. ✅ Verify property parsers provide good error messages
3. ✅ Update any affected tests

**Success Criteria:**

- Single validation path (property parsers)
- Error messages improved
- Tests pass

### Phase 3: Type Safety (Low-Priority)

**Target: Session 068**

1. ✅ Implement type-safe `defineProperty` (#3)
2. ✅ Fix any caught type mismatches
3. ✅ Consolidate universal function detection (#5)
4. ✅ Audit schema-first consistency (#4)

**Success Criteria:**

- Compile-time safety for property registration
- Centralized universal function logic
- Consistent schema-first pattern

---

## Validation & Testing

After each phase:

1. **Run full test suite**: `just test`
2. **Type check**: `just typecheck`
3. **Lint**: `just lint`
4. **Integration test**: Manually test `var()`, `calc()`, keywords in playground
5. **Documentation**: Update relevant docs with new patterns

---

## Success Metrics

- **Lines of code**: Reduce parser boilerplate by 60-80%
- **Type safety**: Catch property registration bugs at compile time
- **Maintainability**: Single source of truth for validation and universal functions
- **Developer experience**: New properties take 50% less time to add
- **Error messages**: Property-specific errors reach users consistently

---

## Notes

- All changes are backward-compatible
- No breaking changes to public API
- Can be implemented incrementally over multiple sessions
- Each phase delivers immediate value
- Total effort: ~6-8 hours across 3 sessions

---

## References

- Session 065: Initial var() support and keyword normalization
- `@b/declarations/src/utils/create-multi-value-parser.ts`: Multi-value parser factory
- `@b/types/src/values/css-value.ts`: CssValue IR definitions
- CSS Values Spec: https://drafts.csswg.org/css-values-4/
