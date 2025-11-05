# Phase 3 Polish - Comprehensive Action Plan

**Created:** 2025-11-05
**Session:** 027

---

## Overview

Phase 3 (warning propagation) is functionally complete, but needs polish in four key areas:

1. Complete path propagation through all nested generators
2. Document ParseResult partial success behavior
3. Improve Zod error messages with context
4. Add type-safe error forwarding helper

---

## 1. Path Propagation Audit ⚠️ HIGH PRIORITY

**Goal:** Ensure all nested generator calls extend `parentPath` correctly.

### Status Check

✅ **Correctly Implemented:**

- `b_generators/gradient/radial.ts` → `ColorStop.generate` (has path context)

❌ **Needs Path Update:**

- `b_declarations/properties/background-image/generator.ts` → `Generators.Gradient.generate`
- `b_generators/gradient/color-stop.ts` → `Color.generate`
- `b_generators/gradient/linear.ts` → `ColorStop.generate`
- `b_generators/gradient/conic.ts` → `ColorStop.generate`

### Implementation Plan

**File 1:** `packages/b_declarations/src/properties/background-image/generator.ts`

```typescript
// BEFORE:
case "gradient": {
  return Generators.Gradient.generate(layer.gradient, {
    parentPath: parentPath,
    property: "background-image",
  });
}

// AFTER:
case "gradient": {
  return Generators.Gradient.generate(layer.gradient, {
    parentPath: [...parentPath, "gradient"],
    property: "background-image",
  });
}
```

**File 2:** `packages/b_generators/src/gradient/color-stop.ts`

```typescript
// BEFORE:
const colorResult = Color.generate(colorStop.color, context);

// AFTER:
const colorResult = Color.generate(colorStop.color, {
  parentPath: [...(context?.parentPath ?? []), "color"],
  property: context?.property,
});
```

**File 3:** `packages/b_generators/src/gradient/linear.ts`

```typescript
// BEFORE:
colorStops: colorStops.map((stop) => ColorStop.generate(stop, context)),

// AFTER:
colorStops: colorStops.map((stop, i) => ColorStop.generate(stop, {
  parentPath: [...(context?.parentPath ?? []), "colorStops", i],
  property: context?.property,
})),
```

**File 4:** `packages/b_generators/src/gradient/conic.ts`

```typescript
// BEFORE:
colorStops: colorStops.map((stop) => ColorStop.generate(stop, context)),

// AFTER:
colorStops: colorStops.map((stop, i) => ColorStop.generate(stop, {
  parentPath: [...(context?.parentPath ?? []), "colorStops", i],
  property: context?.property,
})),
```

### Verification

After changes, run the background-image test and verify path shows:

```
path: ["layers", 0, "gradient", "colorStops", 0, "color", "r"]
```

---

## 2. Document ParseResult Behavior 📝 MEDIUM PRIORITY

**Goal:** Clarify when `value` is present/absent on `ok: false`.

### Implementation

**File:** `packages/b_types/src/result/parse.ts`

Add JSDoc to `ParseResult`:

````typescript
/**
 * Result of parsing CSS text into structured data.
 *
 * Represents one of three states:
 * 1. Success: `ok: true`, `value` contains parsed data
 * 2. Total failure: `ok: false`, `value` is `undefined`, parsing failed early (fail-fast)
 * 3. Partial success: `ok: false`, `value` contains partial data, some items parsed (multi-error)
 *
 * When `ok: false`:
 * - `issues` contains at least one error
 * - `value` is `undefined` for fail-fast parsers (e.g., single value parsing)
 * - `value` contains partial result for multi-error parsers (e.g., list parsing where some items succeeded)
 *
 * @example Fail-fast parser (single angle)
 * ```typescript
 * const result = parseAngle("invalid");
 * // { ok: false, value: undefined, issues: [...] }
 * ```
 *
 * @example Multi-error parser (background-image layers)
 * ```typescript
 * const result = parseBackgroundImage("url(a.png), invalid, url(b.png)");
 * // { ok: false, value: { kind: 'layers', layers: [valid1, valid3] }, issues: [...] }
 * // Two layers parsed successfully, one failed
 * ```
 */
export type ParseResult<T = unknown> =
  | { ok: true; value: T; issues: Issue[]; property?: PropertyKey }
  | { ok: false; value?: undefined; issues: Issue[]; property?: PropertyKey }
  | { ok: false; value: T; issues: Issue[]; property?: PropertyKey };
````

---

## 3. Zod Error Context 🔧 MEDIUM PRIORITY

**Goal:** Remove deprecated `error` map, leverage `zodErrorToIssues` context.

### Implementation

**File 1:** `packages/b_keywords/src/named-colors.ts`

```typescript
// BEFORE:
export const namedColorSchema = z.union(namedColors, {
  error: () => ({ message: "..." }),
});

// AFTER:
export const namedColorSchema = z.union(namedColors);
// Remove custom error map - let zodErrorToIssues handle it
```

**File 2:** `packages/b_generators/src/color/named.ts`

```typescript
// BEFORE:
const validation = Keywords.namedColorSchema.safeParse(colorName);
if (!validation.success) {
  const issues = zodErrorToIssues(validation.error);
  result.issues.push(...issues);
}

// AFTER:
const validation = Keywords.namedColorSchema.safeParse(colorName);
if (!validation.success) {
  const issues = zodErrorToIssues(validation.error, {
    receivedValue: colorName,
    validKeys: Keywords.namedColorsMap,
  });
  result.issues.push(...issues);
}
```

### Benefits

- Leverages existing "Did you mean '...'" suggestion logic
- More consistent error messages across the codebase
- Future-proof (no deprecated API)

---

## 4. Type-Safe Error Forwarding 🛡️ LOW PRIORITY

**Goal:** Replace `as` casts with type-safe helper.

### Implementation

**File 1:** `packages/b_types/src/result/parse.ts`

Add helper function:

````typescript
/**
 * Creates a new ParseResult failure from an existing one, preserving issues
 * but ensuring the new result has the correct (undefined) value type.
 *
 * Use this when an early parse step fails and you need to forward the error
 * to the parent parser's return type.
 *
 * @example
 * ```typescript
 * function parseHSL(node: CssValue): ParseResult<HSLColor> {
 *   const hResult = parseComponentH(node);
 *   if (!hResult.ok) return forwardParseErr<HSLColor>(hResult);
 *   // ...
 * }
 * ```
 */
export function forwardParseErr<T>(failedResult: ParseResult<unknown>): ParseResult<T> {
  return {
    ok: false,
    issues: failedResult.issues,
    property: failedResult.property,
  };
}
````

**File 2:** Update parsers using `as` casts

Search for pattern: `as ParseResult<`

Files likely affected:

- `packages/b_parsers/src/color/hsl.ts`
- `packages/b_parsers/src/color/rgb.ts`
- `packages/b_parsers/src/color/hwb.ts`
- Any other parsers using this pattern

```typescript
// BEFORE:
if (!hResult.ok) return hResult as ParseResult<HSLColor>;

// AFTER:
import { forwardParseErr } from "@b/types";
if (!hResult.ok) return forwardParseErr<HSLColor>(hResult);
```

---

## Execution Order

### Phase 1: Critical Path (30 min)

1. ✅ **Path propagation audit** - Fix all 4 generator files
2. ✅ **Test verification** - Ensure full path appears in warnings

### Phase 2: Documentation (10 min)

3. ✅ **Document ParseResult** - Add comprehensive JSDoc

### Phase 3: Quality Improvements (20 min)

4. ✅ **Zod error context** - Update named color validation
5. ✅ **Type-safe forwarding** - Add helper and update parsers

### Phase 4: Validation (10 min)

6. ✅ **Run all tests** - `just test`
7. ✅ **Run quality checks** - `just check`
8. ✅ **Production build** - `just build`

**Total estimated time:** 70 minutes

---

## Success Criteria

- [ ] Full path shows in nested warnings: `["layers", 0, "gradient", "colorStops", 0, "color", "r"]`
- [ ] All 994 tests passing
- [ ] All quality checks passing
- [ ] Zero TypeScript errors
- [ ] Zero lint warnings
- [ ] Production build succeeds
- [ ] Named color suggestions work: "Did you mean 'red'?"
- [ ] No `as ParseResult<>` casts remaining

---

## Notes

- **Path propagation is the highest priority** - it directly addresses the Phase 3 goal
- **Other items are polish** - they improve code quality but don't block Phase 3 completion
- All changes are surgical - no architectural changes required
