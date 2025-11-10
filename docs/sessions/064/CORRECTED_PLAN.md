# Session 064: Universal CSS Functions - CORRECTED Plan

**Date:** 2025-11-10
**Status:** ✅ CORRECTED - Back to injection approach
**Version:** 3.0 (Injection at abstraction points - ORIGINAL WAS CORRECT)

---

## 🔥 Critical Correction

**MISTAKE:** REVISED_MASTER_PLAN.md suggested per-property wrappers
**USER CAUGHT IT:** "So your proposal is to enforce the boilerplate for every property? This is exactly what we agreed not to do"

**CORRECT APPROACH:** Original MASTER_PLAN.md (injection at two abstraction points)

---

## ✅ Phase 0: Type Guards (COMPLETE)

**Files:**

- `packages/b_declarations/src/utils/type-guards.ts` ✅
- `packages/b_declarations/src/utils/type-guards.test.ts` ✅

**Exports:**

- `isCssValue(value)` - CssValue kind whitelist ✅
- `isUniversalFunction(node)` - AST function check ✅
- `isConcreteValue(value)` - Helper for narrowing ✅

**Status:** 19 tests passing, all quality checks green

---

## 📋 Phase 1: Inject into Multi-Value Parser

**File:** `packages/b_declarations/src/utils/create-multi-value-parser.ts`

**Location:** Line 139 (before `config.itemParser` call)

**Current code:**

```typescript
// 5. Delegate to the property-specific item parser with the validated AST chunk.
itemResults.push(config.itemParser(itemAst));
```

**New code:**

```typescript
// 5. Check for universal CSS functions first (var, calc, min, max, clamp, etc.)
// These are handled at the declaration layer, not by property-specific parsers.
// This follows the same pattern as CSS-wide keywords (Session 057).
if (isUniversalFunction(itemAst.children.first!)) {
  const universalResult = parseNodeToCssValue(itemAst);
  if (universalResult.ok) {
    itemResults.push(universalResult as ParseResult<TItem>);
    continue;
  }
  // Fall through if universal parsing failed
}

// 6. Delegate to the property-specific item parser with the validated AST chunk.
itemResults.push(config.itemParser(itemAst));
```

**Imports needed:**

```typescript
import { isUniversalFunction } from "./type-guards";
import { parseNodeToCssValue } from "@b/utils";
```

**Impact:**

- ✅ ALL multi-value properties automatically support var/calc/etc
- ✅ ZERO per-property changes
- ✅ background-image works immediately
- ✅ All future properties work automatically

---

## 📋 Phase 2: Inject into Single-Value Properties

**File:** `packages/b_declarations/src/parser.ts`

**Location:** Line ~95 (where single-value properties call parser)

**Current code:**

```typescript
} else {
  // Single-value property: Parse to AST first
  let valueAst: csstree.Value;
  try {
    valueAst = csstree.parse(value, {
      context: "value",
      positions: true,
    }) as csstree.Value;
  } catch (e: unknown) {
    // Fatal syntax error for single-value property
    const error = e as Error;
    return parseErr("declaration", createError("invalid-syntax", error.message));
  }

  // Pass validated AST to parser
  parseResult = unsafeCallParser(definition.parser, valueAst);
}
```

**New code:**

```typescript
} else {
  // Single-value property: Parse to AST first
  let valueAst: csstree.Value;
  try {
    valueAst = csstree.parse(value, {
      context: "value",
      positions: true,
    }) as csstree.Value;
  } catch (e: unknown) {
    // Fatal syntax error for single-value property
    const error = e as Error;
    return parseErr("declaration", createError("invalid-syntax", error.message));
  }

  // Check for universal CSS functions first (var, calc, min, max, clamp, etc.)
  // These are handled at the declaration layer, not by property-specific parsers.
  // This follows the same pattern as CSS-wide keywords (Session 057).
  const firstNode = valueAst.children.first;
  if (firstNode && isUniversalFunction(firstNode)) {
    const universalResult = parseNodeToCssValue(valueAst);
    if (universalResult.ok) {
      parseResult = universalResult;
    } else {
      // Fall through to property parser if universal parsing failed
      parseResult = unsafeCallParser(definition.parser, valueAst);
    }
  } else {
    // Pass validated AST to property-specific parser
    parseResult = unsafeCallParser(definition.parser, valueAst);
  }
}
```

**Imports needed:**

```typescript
import { isUniversalFunction } from "./utils/type-guards";
import { parseNodeToCssValue } from "@b/utils";
```

**Impact:**

- ✅ ALL single-value properties automatically support var/calc/etc
- ✅ ZERO per-property changes
- ✅ Future properties work automatically

---

## 📋 Phase 3: Integration Tests

**File:** `packages/b_declarations/src/__tests__/universal-css-functions.integration.test.ts` (NEW)

Test the user's original failing case:

```typescript
import { describe, it, expect } from "vitest";
import { parseDeclaration } from "..";

describe("Universal CSS Functions Integration", () => {
  describe("var() support in multi-value properties", () => {
    it("should parse var() in background-image", () => {
      const result = parseDeclaration("background-image: var(--gradient), url(img.png), none");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ir.kind).toBe("list");
        expect(result.value.ir.values).toHaveLength(3);
        expect(result.value.ir.values[0]).toMatchObject({
          kind: "variable",
          name: "--gradient",
        });
        expect(result.value.ir.values[1]).toMatchObject({
          kind: "url",
          url: "img.png",
        });
        expect(result.value.ir.values[2]).toMatchObject({
          kind: "keyword",
          value: "none",
        });
      }
    });

    it("should parse calc() in background-size", () => {
      const result = parseDeclaration("background-size: calc(100% - 20px)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const firstLayer = result.value.ir.values[0];
        expect(firstLayer.kind).toBe("explicit");
        expect(firstLayer.width.kind).toBe("calc");
      }
    });

    it("should parse min/max/clamp", () => {
      const minResult = parseDeclaration("background-size: min(50vw, 500px)");
      const maxResult = parseDeclaration("background-size: max(100px, 10%)");
      const clampResult = parseDeclaration("background-size: clamp(100px, 50%, 500px)");

      expect(minResult.ok).toBe(true);
      expect(maxResult.ok).toBe(true);
      expect(clampResult.ok).toBe(true);
    });
  });

  describe("property-specific values still work", () => {
    it("should still parse gradients", () => {
      const result = parseDeclaration("background-image: linear-gradient(red, blue)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const firstLayer = result.value.ir.values[0];
        expect(firstLayer.kind).toBe("gradient");
        expect(firstLayer.gradient.kind).toBe("linear");
      }
    });

    it("should still parse url()", () => {
      const result = parseDeclaration("background-image: url(img.png)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const firstLayer = result.value.ir.values[0];
        expect(firstLayer.kind).toBe("url");
      }
    });

    it("should still parse keywords", () => {
      const result = parseDeclaration("background-image: none");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ir.kind).toBe("keyword");
        expect(result.value.ir.value).toBe("none");
      }
    });
  });

  describe("mixed values", () => {
    it("should handle mix of var() and concrete values", () => {
      const result = parseDeclaration("background-image: var(--overlay), url(pattern.svg), none");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ir.values).toHaveLength(3);
        expect(result.value.ir.values[0].kind).toBe("variable");
        expect(result.value.ir.values[1].kind).toBe("url");
        expect(result.value.ir.values[2].kind).toBe("keyword");
      }
    });
  });
});
```

---

## 🎯 Success Criteria

- [x] **Phase 0:** Type guards implemented with tests passing ✅
- [ ] **Phase 1:** Multi-value parser injection complete
- [ ] **Phase 2:** Single-value parser injection complete
- [ ] **Phase 3:** Integration tests passing
- [ ] **User's test case works:** `background-image: var(--gradient), url(img.png), none`
- [ ] **All existing tests pass:** No regressions
- [ ] **Zero per-property changes:** Confirm no property files modified

---

## 🔥 Key Architecture Points

### What Changed from Feedback

**ONLY the type guard implementation changed:**

- ❌ Was: `typeof value === "object" && "kind" in value`
- ✅ Now: Whitelist of CssValue kinds

**Everything else stays as original MASTER_PLAN:**

- ✅ Injection at `createMultiValueParser` (line 139)
- ✅ Injection at `parseDeclaration` (single-value)
- ✅ ZERO per-property changes

### Why This Works

**CSS-wide keywords (Session 057):**

- Pre-checked in `parseDeclaration` BEFORE property parser
- Entire value is the keyword

**Universal CSS functions (Session 064):**

- Checked in `createMultiValueParser` BEFORE itemParser
- Checked in `parseDeclaration` BEFORE property parser
- Mixed with property-specific values

**Both follow same pattern:** Universal concerns handled at declaration layer

---

## 📊 Implementation Effort

**Total changes:**

- 2 injection points (multi-value + single-value)
- 1 integration test file
- ~50 lines of code total

**Impact:**

- ALL properties (current + future) support var/calc/etc automatically
- ZERO boilerplate in property parsers
- Property parsers stay pure (property-specific only)

---

## 🚀 Next Action

**Proceed with Phase 1:** Inject into `createMultiValueParser` (line 139)

This is the correct approach. The wrapper pattern was a misinterpretation of the feedback.
