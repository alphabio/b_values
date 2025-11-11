# Architecture Fixes for 50+ Properties

**Date:** 2025-11-11  
**Scope:** Critical fixes before scaling  
**Status:** 🔴 PLANNING

---

## Executive Summary

Comprehensive architectural review identified **10 issues**. Of these:

- **4 are CRITICAL** (will cause silent failures at scale)
- **3 are HIGH** (will cause maintenance pain)
- **3 are MEDIUM** (clarity/documentation)

This document defines fixes for the 7 most impactful issues.

---

## CRITICAL FIXES (Must Do Before Scaling)

### 1. Type-Level Contract is Fake 🚨

**Current (Broken):**
```typescript
// types.ts lines 145-157
type MultiValuePropertyNames = {
  [K in keyof PropertyIRMap]: PropertyDefinition<PropertyIRMap[K]> extends { multiValue: true } ? K : never;
}[keyof PropertyIRMap];
```

**Problem:** 
- Checks generic `PropertyDefinition<T>` type alias, not actual registered definitions
- Will never catch violations (it's type theater)
- False confidence: "contract enforced" ✅ but it's not

**Impact at 50+ properties:**
- Add property with `multiValue: true` but IR with no `kind: "list"`
- Contract check passes (because it's fake)
- Runtime explosion when multi-value parser tries to access `.values`

**Fix Options:**

#### Option A: Single Source of Truth (RECOMMENDED)

1. Create `properties/index.ts` that exports all definitions:
   ```typescript
   // packages/b_declarations/src/properties/index.ts
   import { backgroundAttachment } from "./background-attachment";
   import { backgroundClip } from "./background-clip";
   // ... 50+ more
   
   export const PROPERTY_DEFINITIONS = {
     "background-attachment": backgroundAttachment,
     "background-clip": backgroundClip,
     // ...
   } as const;
   
   export type PropertyDefinitions = typeof PROPERTY_DEFINITIONS;
   ```

2. Derive `PropertyIRMap` from definitions:
   ```typescript
   // types.map.ts (or types.ts)
   import type { PropertyDefinitions } from "./properties";
   
   type ExtractIR<T> = T extends PropertyDefinition<infer IR> ? IR : never;
   
   export type PropertyIRMap = {
     [K in keyof PropertyDefinitions]: ExtractIR<PropertyDefinitions[K]>
   };
   ```

3. Make contract check real:
   ```typescript
   type MultiValuePropertyNames = {
     [K in keyof PropertyDefinitions]: 
       PropertyDefinitions[K]["multiValue"] extends true ? K : never
   }[keyof PropertyDefinitions];
   
   type MultiValueIRsHaveListVariant = {
     [K in MultiValuePropertyNames]: 
       PropertyIRMap[K] extends { kind: "list" } ? true : never
   }[MultiValuePropertyNames];
   
   // @ts-expect-error - Now actually checks!
   type _AssertMultiValueContract = MultiValueIRsHaveListVariant extends true ? true : never;
   ```

**Pros:**
- Type safety is real
- PropertyIRMap auto-derived (no manual sync)
- Registry population can iterate PROPERTY_DEFINITIONS

**Cons:**
- Manual barrel export maintenance
- Circular import risk (mitigated by keeping definitions in leaf modules)

#### Option B: Codegen Metadata Map

Keep current codegen, but also generate:
```typescript
// types.meta.ts (auto-generated)
export interface PropertyMetaMap {
  "background-attachment": { multiValue: true };
  "background-clip": { multiValue: true };
  "background-color": { multiValue: false };
  // ...
}
```

Then contract check uses `PropertyMetaMap[K]["multiValue"]`.

**Pros:**
- No manual barrel exports
- Keeps current codegen workflow

**Cons:**
- Two generated files to keep in sync
- More moving parts

**Decision:** Going with Option A. Manual barrel is worth the type safety.

---

### 2. CSS-Wide Keywords Assumption is Implicit 🎯

**Current (Unsafe):**
```typescript
// parser.ts line 75
if (wideKeywordCheck.ok) {
  return parseOk({
    property,
    ir: { kind: "keyword", value: wideKeywordCheck.data } as never,
    important,
  });
}
```

**Problem:**
- `as never` assumes every property IR has `{ kind: "keyword", value: CssWide }`
- No enforcement
- Will break when someone adds a property without this variant

**Impact at 50+ properties:**
- Add property with IR that doesn't support CSS-wide keywords
- User writes `background-foo: initial`
- Parser returns fake IR with `as never`
- Type system lies, runtime confusion

**Fix:**

#### Option 1: Enforce All Properties Support CSS-Wide (RECOMMENDED)

Make it a hard requirement:

1. Add type-level check:
   ```typescript
   type CssWideKeywordVariant = { kind: "keyword"; value: Keywords.CssWide };
   
   type SupportsCssWide<T> = T extends CssWideKeywordVariant ? true : false;
   
   type AllSupportCssWide = {
     [K in keyof PropertyIRMap]: SupportsCssWide<PropertyIRMap[K]> extends true ? true : K
   }[keyof PropertyIRMap];
   
   // @ts-expect-error - If any property doesn't support CSS-wide, this shows which
   type _AssertAllSupportCssWide = AllSupportCssWide extends true ? true : never;
   ```

2. Document in ARCHITECTURE.md:
   > **CSS-Wide Keywords Contract**
   > 
   > All property IR types MUST include a variant:
   > ```typescript
   > { kind: "keyword", value: Keywords.CssWide }
   > ```
   > 
   > This is enforced at compile-time via `_AssertAllSupportCssWide`.

#### Option 2: Opt-In Flag

Add `supportsCssWide?: boolean` to `PropertyDefinition` and check at runtime:

```typescript
if (wideKeywordCheck.ok) {
  if (!definition.supportsCssWide) {
    return parseErr(...); // Property doesn't support CSS-wide keywords
  }
  // Safe to return
}
```

**Decision:** Option 1. CSS-wide keywords are spec-mandated for all properties (except custom properties, which we already exclude).

---

### 5. Hash → Keyword is Semantically Wrong 🐛

**Current (Bug):**
```typescript
// @b/utils/parse/css-value-parser.ts lines 154-157
case "Hash": {
  const value = node.value.toLowerCase();
  return parseOk({ kind: "keyword", value: `#${value}` });
}
```

**Problem:**
- `#fff` is not a keyword
- It's a hex color
- `CssValue` already has `kind: "hex-color"` for this

**Impact:**
- Type confusion (hex colors masquerading as keywords)
- Generator code that pattern-matches on `kind: "keyword"` will mishandle
- Semantic incorrectness propagates through the system

**Fix:**

```typescript
case "Hash": {
  const value = node.value.toLowerCase();
  return parseOk({ 
    kind: "hex-color", 
    value: `#${value}` 
  });
}
```

Also ensure `CssValue` schema includes:
```typescript
z.object({ kind: z.literal("hex-color"), value: z.string() })
```

**Validation:**
- Update tests that rely on Hash → keyword
- Verify `cssValueToCss` handles `hex-color` kind

---

### 8. Import Layering Footgun 💣

**Current (Dangerous):**
```
@b/utils/parse/css-value-parser.ts       -> parseCssValueNode()
@b/parsers/utils/css-value-parser.ts     -> parseNodeToCssValue()
```

**Problem:**
- Names are dangerously similar
- Property parsers should use `@b/parsers` (complex functions)
- Easy to import from `@b/utils` by mistake
- Bypasses gradient/color/calc handling

**Impact at 50+ properties:**
- Property parser imports from wrong package
- User writes `background: linear-gradient(...)`
- Parser sees generic CssValue, not specialized Gradient IR
- Silent incorrect behavior

**Fixes:**

1. **Rename for clarity:**
   ```typescript
   // @b/utils
   export function parseCssValueNodeGeneric() // Generic, no complex functions
   
   // @b/parsers
   export function parseCssValueWithComplexFunctions() // Full power
   ```

2. **Add JSDoc warnings:**
   ```typescript
   /**
    * Generic CSS value parser (NO complex function support).
    * 
    * ⚠️ Property parsers should use @b/parsers/parseNodeToCssValue instead.
    * This low-level parser does NOT handle:
    * - linear-gradient(), radial-gradient(), conic-gradient()
    * - rgb(), hsl(), oklch(), etc.
    * - calc(), min(), max(), clamp()
    * 
    * @internal
    */
   export function parseCssValueNode(node: csstree.CssNode): ParseResult<CssValue>
   ```

3. **ESLint rule (future):**
   ```json
   {
     "no-restricted-imports": {
       "patterns": [{
         "group": ["@b/utils/*"],
         "message": "Property parsers should import from @b/parsers, not @b/utils"
       }]
     }
   }
   ```

---

## HIGH PRIORITY FIXES

### 3. Partial Failure Semantics Not Documented

**Current:** `ParseResult`/`GenerateResult` allow `ok: false` with partial `value`.

**Problem:** Implicit behavior, easy to misuse.

**Fix:**

1. Document in `result/parse.ts` and `result/generate.ts`:
   ```typescript
   /**
    * ParseResult for CSS parsing operations.
    * 
    * Supports partial success:
    * - ok: true, value: T          → Full success
    * - ok: false, value: undefined → Total failure
    * - ok: false, value: T         → Partial failure (some data recovered)
    * 
    * Callers MUST check both `ok` and `value` when handling errors.
    * 
    * @example
    * ```typescript
    * const result = parseDeclaration("color: red, blue");
    * if (!result.ok) {
    *   if (result.value !== undefined) {
    *     // Partial success: some values parsed
    *   }
    * }
    * ```
    */
   ```

2. Add helper predicates:
   ```typescript
   export function isTotalFailure(result: ParseResult): boolean {
     return !result.ok && result.value === undefined;
   }
   
   export function isPartialSuccess(result: ParseResult): boolean {
     return !result.ok && result.value !== undefined;
   }
   ```

---

### 4. generateDeclaration Double Stamping

**Current:** Issues get `property` field stamped multiple times.

**Problem:** API encourages misuse (seen in `generateDeclarationList`).

**Fix:**

1. Document responsibility:
   ```typescript
   /**
    * Property-level generators return VALUE ONLY.
    * 
    * Contract:
    * - Input: Property-specific IR
    * - Output: CSS value string (no "property:" prefix, no !important)
    * - Issues: May include property field, but NOT required
    * 
    * generateDeclaration adds:
    * - "property: value" format
    * - !important flag
    * - Stamps all issues with property field
    */
   export type PropertyGenerator<T> = (ir: T) => GenerateResult;
   ```

2. Make `ensureProperty` explicit about its role:
   ```typescript
   /**
    * Stamp property field on all issues in result.
    * 
    * Called by generateDeclaration to ensure all issues
    * include the property name for debugging.
    */
   function ensureProperty(result: GenerateResult, property: string): GenerateResult
   ```

---

### 7. parseDeclarationList Partial Success

**Current:** Returns `ok: true` for zero declarations with zero issues.

**Problem:** Subtle edge case.

**Fix:** Document explicitly:
```typescript
/**
 * Parse multiple CSS declarations from a DeclarationList.
 * 
 * Partial success semantics:
 * - ok: true  → All declarations parsed OR zero declarations with no errors
 * - ok: false → At least one declaration failed
 * 
 * Even on failure, `value` contains successfully parsed declarations.
 */
```

---

## MEDIUM PRIORITY FIXES

### 6. Missing CssValue Kind Collision Test

**Fix:** Add to `property-system-integrity.test.ts`:

```typescript
it("property IR kinds do not collide with CssValue kinds", () => {
  const cssValueKinds = new Set([
    "keyword", "length", "percentage", "angle", "url",
    "var", "hex-color", "function", // etc.
  ]);
  
  const violations: string[] = [];
  
  for (const propName of propertyRegistry.getPropertyNames()) {
    const propDef = propertyRegistry.get(propName);
    // Parse sample IR and check kinds...
  }
});
```

---

### 9. Custom Properties CSS-Wide Guard

**Current:** Correctly excludes custom properties from CSS-wide handling.

**Fix:** Add comment:
```typescript
// Custom properties (--*) do NOT inherit CSS-wide keyword behavior
// per spec. They store raw values as-is.
if (!isCustomProperty(property) && wideKeywordCheck.ok) {
  // ...
}
```

---

### 10. runPropertyTests Coverage Invariants

**Fix:** Add to integrity tests:
```typescript
it("all properties have at least one test case", () => {
  // Check that every registered property has a test file
});

it("all multiValue properties test comma handling", () => {
  // Check that multiValue properties have comma tests
});
```

---

## Implementation Plan

### Phase 1: Critical Fixes (This Session)
1. ✅ Fix #5 (Hash → hex-color)
2. ✅ Fix #8 (Rename + document imports)
3. 🔄 Fix #1 (Single source of truth) - MOST COMPLEX
4. 🔄 Fix #2 (CSS-wide contract)

### Phase 2: High Priority (Next Session)
5. Documentation fixes (#3, #4, #7)

### Phase 3: Medium Priority (Future)
6. Add missing tests (#6, #10)
7. Add custom property guard comments (#9)

---

## Risk Assessment

**Before fixes:**
- 🔴 HIGH RISK: Silent failures at scale (contracts are fake)
- 🔴 HIGH RISK: Type unsafety (CSS-wide keywords, Hash bug)
- 🟡 MEDIUM RISK: Import confusion
- 🟢 LOW RISK: Documentation gaps

**After fixes:**
- 🟢 LOW RISK: Contracts are real and enforced
- 🟢 LOW RISK: Type safety is verifiable
- 🟢 LOW RISK: Clear layering boundaries

---

## Success Criteria

- [ ] Type-level contracts catch real violations
- [ ] All `as never` casts are justified or removed
- [ ] Hash nodes map to correct CssValue kind
- [ ] Import boundaries are documented and clear
- [ ] All tests pass
- [ ] No new TypeScript errors

**Target:** Complete Phase 1 in this session
