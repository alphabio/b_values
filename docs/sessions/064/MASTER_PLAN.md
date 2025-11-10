# Session 064: Universal CSS Functions Master Plan

**Date:** 2025-11-10
**Issue:** `var()`, `calc()`, and other universal CSS functions fail in some properties
**Root Cause:** Missing universal function handling before property-specific parsing
**Solution:** Inject universal function check at declaration layer abstraction points

---

## 🎯 Problem Statement

### User's Test Case (Fails)

```typescript
parseDeclarationList(`
  background-image: var(--gradient-overlay), url("pattern.svg"), none;
`);

// Result:
// ok: false
// issues: "Unsupported background-image value"
```

### Root Cause

**background-image parser only checks for:**

- `url()` functions
- `*gradient()` functions

**Missing:** Universal CSS functions (`var()`, `calc()`, `min()`, `max()`, `clamp()`, etc.)

### Why This Happens

Property parsers receive AST nodes and must handle:

1. Property-specific values (gradients, keywords, etc.)
2. Universal CSS functions (var/calc/etc)

**Currently:** Each parser responsible for #2 → boilerplate repeated 50+ times

---

## 🏗️ Architectural Insight

### The Pattern We Already Established (Session 057)

**CSS-wide keywords** (`inherit`, `initial`, `unset`, `revert`) are **universal concerns**:

- Apply to ALL properties
- Handled ONCE at `parseDeclaration` orchestrator
- Property parsers focus ONLY on property-specific syntax

**Decision quote (Session 057):**

> "CSS-wide keywords are a universal, cross-cutting concern. They apply to ALL properties and should be handled in ONE place: the entry point."

### The Same Logic Applies to Universal CSS Functions

| Concern                             | CSS-Wide Keywords | Universal CSS Functions |
| ----------------------------------- | ----------------- | ----------------------- |
| **Universal?**                      | ✅ ALL properties | ✅ ALL properties       |
| **Spec-level?**                     | ✅ CSS-wide spec  | ✅ CSS Values spec      |
| **Property-agnostic?**              | ✅ Yes            | ✅ Yes                  |
| **Should be in property parsers?**  | ❌ No             | ❌ No                   |
| **Should be in declaration layer?** | ✅ Yes            | ✅ Yes                  |

---

## 🎨 The Solution

### Two Injection Points

**parseDeclaration already routes through two abstraction points:**

1. **Multi-value properties** → `createMultiValueParser` (line 139)
2. **Single-value properties** → direct parser call (parseDeclaration.ts)

**Inject universal function check at BOTH points.**

---

## 📋 Implementation Plan

### Phase 1: Create Universal Function Utility

**File:** `packages/b_declarations/src/utils/universal-css-functions.ts` (NEW)

````typescript
import type * as csstree from "@eslint/css-tree";
import type { ParseResult, CssValue } from "@b/types";
import * as Ast from "@b/utils";
import { parseNodeToCssValue } from "@b/parsers";

/**
 * List of universal CSS functions that apply to all properties.
 * These should be handled by the declaration layer, not individual parsers.
 */
const UNIVERSAL_CSS_FUNCTIONS = [
  "var", // CSS Variables
  "calc", // Math
  "min", // Math
  "max", // Math
  "clamp", // Math
  "attr", // Attribute references
  "env", // Environment variables
] as const;

/**
 * Check if a CSS AST node is a universal CSS function.
 * Returns a ParseResult if it is, null if it should be handled by property parser.
 *
 * This implements the same architectural pattern as CSS-wide keywords:
 * universal concerns are handled once at the declaration layer.
 *
 * @param valueNode - CSS Value AST node
 * @returns ParseResult<CssValue> if universal function, null otherwise
 *
 * @example
 * ```typescript
 * const result = tryParseUniversalCssFunction(astNode);
 * if (result) {
 *   // It's var(), calc(), etc. - don't call property parser
 *   return result;
 * }
 * // Not universal - delegate to property-specific parser
 * return propertyParser(astNode);
 * ```
 */
export function tryParseUniversalCssFunction(valueNode: csstree.Value): ParseResult<CssValue> | null {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node) return null;

  // Check if it's a function node
  if (Ast.isFunctionNode(node)) {
    const funcName = node.name.toLowerCase();

    // Check if it's a universal CSS function
    if (UNIVERSAL_CSS_FUNCTIONS.includes(funcName as any)) {
      return parseNodeToCssValue(node);
    }
  }

  // Not a universal function - let property parser handle it
  return null;
}

/**
 * Type guard for universal CSS function names.
 */
export function isUniversalCssFunction(name: string): boolean {
  return UNIVERSAL_CSS_FUNCTIONS.includes(name.toLowerCase() as any);
}
````

**Tests:** `universal-css-functions.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import * as csstree from "@eslint/css-tree";
import { tryParseUniversalCssFunction, isUniversalCssFunction } from "./universal-css-functions";

describe("tryParseUniversalCssFunction", () => {
  it("should parse var() as universal function", () => {
    const ast = csstree.parse("var(--color)", { context: "value" }) as csstree.Value;
    const result = tryParseUniversalCssFunction(ast);

    expect(result).not.toBeNull();
    expect(result?.ok).toBe(true);
    expect(result?.value).toMatchObject({
      kind: "variable",
      name: "--color",
    });
  });

  it("should parse calc() as universal function", () => {
    const ast = csstree.parse("calc(100% - 20px)", { context: "value" }) as csstree.Value;
    const result = tryParseUniversalCssFunction(ast);

    expect(result).not.toBeNull();
    expect(result?.ok).toBe(true);
    expect(result?.value?.kind).toBe("calc");
  });

  it("should return null for property-specific functions", () => {
    const ast = csstree.parse("linear-gradient(red, blue)", { context: "value" }) as csstree.Value;
    const result = tryParseUniversalCssFunction(ast);

    expect(result).toBeNull();
  });

  it("should return null for keywords", () => {
    const ast = csstree.parse("red", { context: "value" }) as csstree.Value;
    const result = tryParseUniversalCssFunction(ast);

    expect(result).toBeNull();
  });

  it("should handle min(), max(), clamp()", () => {
    const minAst = csstree.parse("min(50vw, 500px)", { context: "value" }) as csstree.Value;
    const maxAst = csstree.parse("max(100px, 10%)", { context: "value" }) as csstree.Value;
    const clampAst = csstree.parse("clamp(10px, 5vw, 50px)", { context: "value" }) as csstree.Value;

    expect(tryParseUniversalCssFunction(minAst)).not.toBeNull();
    expect(tryParseUniversalCssFunction(maxAst)).not.toBeNull();
    expect(tryParseUniversalCssFunction(clampAst)).not.toBeNull();
  });
});

describe("isUniversalCssFunction", () => {
  it("should identify universal functions", () => {
    expect(isUniversalCssFunction("var")).toBe(true);
    expect(isUniversalCssFunction("calc")).toBe(true);
    expect(isUniversalCssFunction("min")).toBe(true);
    expect(isUniversalCssFunction("max")).toBe(true);
    expect(isUniversalCssFunction("clamp")).toBe(true);
    expect(isUniversalCssFunction("attr")).toBe(true);
    expect(isUniversalCssFunction("env")).toBe(true);
  });

  it("should reject property-specific functions", () => {
    expect(isUniversalCssFunction("linear-gradient")).toBe(false);
    expect(isUniversalCssFunction("rgb")).toBe(false);
    expect(isUniversalCssFunction("url")).toBe(false);
  });

  it("should be case-insensitive", () => {
    expect(isUniversalCssFunction("VAR")).toBe(true);
    expect(isUniversalCssFunction("Calc")).toBe(true);
  });
});
```

---

### Phase 2: Inject into Multi-Value Parser

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
const universalResult = tryParseUniversalCssFunction(itemAst);
if (universalResult) {
  itemResults.push(universalResult as ParseResult<TItem>);
  continue;
}

// 6. Delegate to the property-specific item parser with the validated AST chunk.
itemResults.push(config.itemParser(itemAst));
```

**Import needed:**

```typescript
import { tryParseUniversalCssFunction } from "./universal-css-functions";
```

**Impact:** All multi-value properties automatically support universal CSS functions:

- `background-image` ✅
- `background-clip` ✅
- `background-size` ✅
- `background-repeat` ✅
- `background-attachment` ✅
- `background-origin` ✅
- All future multi-value properties ✅

---

### Phase 3: Inject into Single-Value Properties

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
  const universalResult = tryParseUniversalCssFunction(valueAst);
  if (universalResult) {
    parseResult = universalResult;
  } else {
    // Pass validated AST to property-specific parser
    parseResult = unsafeCallParser(definition.parser, valueAst);
  }
}
```

**Import needed:**

```typescript
import { tryParseUniversalCssFunction } from "./utils/universal-css-functions";
```

**Impact:** All single-value properties automatically support universal CSS functions.

---

### Phase 4: Integration Tests

**File:** `packages/b_declarations/src/__tests__/universal-css-functions.integration.test.ts` (NEW)

```typescript
import { describe, it, expect } from "vitest";
import { parseDeclaration, generateDeclaration } from "..";

describe("Universal CSS Functions Integration", () => {
  describe("var() support", () => {
    it("should parse var() in background-image (multi-value)", () => {
      const result = parseDeclaration("background-image: var(--gradient), url(img.png)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ir).toMatchObject({
          kind: "list",
          values: [
            { kind: "variable", name: "--gradient" },
            { kind: "url", url: "img.png" },
          ],
        });
      }
    });

    it("should parse var() with fallback in background-image", () => {
      const result = parseDeclaration("background-image: var(--bg, linear-gradient(red, blue))");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ir.kind).toBe("list");
      }
    });

    it("should parse var() in single-value properties", () => {
      // Note: We may not have single-value properties implemented yet
      // Add tests when we have them
    });
  });

  describe("calc() support", () => {
    it("should parse calc() in background-size (multi-value)", () => {
      const result = parseDeclaration("background-size: calc(100% - 20px)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ir.kind).toBe("list");
        const firstLayer = result.value.ir.values[0];
        expect(firstLayer.kind).toBe("explicit");
        expect(firstLayer.width.kind).toBe("calc");
      }
    });
  });

  describe("min/max/clamp support", () => {
    it("should parse min() in background-size", () => {
      const result = parseDeclaration("background-size: min(50vw, 500px)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const firstLayer = result.value.ir.values[0];
        expect(firstLayer.width.kind).toBe("min");
      }
    });

    it("should parse max() in background-size", () => {
      const result = parseDeclaration("background-size: max(100px, 10%)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const firstLayer = result.value.ir.values[0];
        expect(firstLayer.width.kind).toBe("max");
      }
    });

    it("should parse clamp() in background-size", () => {
      const result = parseDeclaration("background-size: clamp(100px, 50%, 500px)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const firstLayer = result.value.ir.values[0];
        expect(firstLayer.width.kind).toBe("clamp");
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

    it("should handle nested calc with var", () => {
      const result = parseDeclaration("background-size: calc(var(--base) * 2)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const firstLayer = result.value.ir.values[0];
        expect(firstLayer.width.kind).toBe("calc");
      }
    });
  });

  describe("round-trip (parse → generate)", () => {
    it("should round-trip var() in background-image", () => {
      const input = "background-image: var(--gradient)";
      const parsed = parseDeclaration(input);

      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        const generated = generateDeclaration({
          property: "background-image",
          ir: parsed.value.ir,
        });

        expect(generated.ok).toBe(true);
        expect(generated.value).toBe(input);
      }
    });
  });

  describe("property-specific functions still work", () => {
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
  });
});
```

---

### Phase 5: Update Existing Tests

**Verify existing test suite still passes:**

```bash
just test
```

**Expected:** All 944+ tests pass (no regressions)

---

### Phase 6: Documentation Updates

**File:** `docs/architecture/patterns/004-css-values-functions.md`

Add section on universal CSS function handling:

```markdown
## Universal CSS Functions

**Functions that apply to ALL properties:**

- `var()` - CSS custom properties
- `calc()` - Mathematical expressions
- `min()`, `max()`, `clamp()` - Range functions
- `attr()` - Attribute references
- `env()` - Environment variables

**Architecture Decision (Session 064):**

These are handled at the declaration layer (same pattern as CSS-wide keywords from Session 057):

1. **Multi-value properties:** `createMultiValueParser` checks before calling `itemParser`
2. **Single-value properties:** `parseDeclaration` checks before calling property parser

**Why?**

- Universal concerns should be handled once, not repeated 50+ times
- Property parsers focus ONLY on property-specific syntax
- Matches browser behavior (universal features handled before property-specific parsing)

**Implementation:**

- `tryParseUniversalCssFunction()` utility in `universal-css-functions.ts`
- Injected at two abstraction points in declaration layer
- Zero boilerplate in property parsers
```

---

## 🎯 Success Criteria

- [ ] Phase 1: `universal-css-functions.ts` created with tests passing
- [ ] Phase 2: `createMultiValueParser` injection complete
- [ ] Phase 3: `parseDeclaration` injection complete
- [ ] Phase 4: Integration tests passing
- [ ] Phase 5: All existing tests still pass (no regressions)
- [ ] Phase 6: Documentation updated
- [ ] User's test case works: `background-image: var(--gradient), url(img.png), none`
- [ ] All background-\* properties support var/calc/etc automatically
- [ ] Property parsers require ZERO boilerplate for universal functions

---

## 📊 Impact Summary

### Before

- ❌ `background-image: var(--x)` fails
- ❌ Each property parser must add var/calc handling (boilerplate)
- ❌ Easy to forget → inconsistent support

### After

- ✅ `background-image: var(--x)` works
- ✅ `background-size: calc(100% - 20px)` works
- ✅ All multi-value properties support universal functions automatically
- ✅ All single-value properties support universal functions automatically
- ✅ Zero boilerplate in property parsers
- ✅ Future properties get support for free

---

## 🔗 Related Sessions

- **Session 057:** CSS-wide keywords refactor (established the pattern)
- **Session 030:** Added var()/calc() support to gradients
- **Session 063:** Feedback consolidation (identified this gap)

---

## 💡 Key Architectural Insight

**User's insight:**

> "Parser/generate are clean honest reps of the CSS spec capabilities.
> Declaration parse/generate understand the wider CSS spec for all props."

**This is correct.** The solution implements exactly this:

- **Property parsers:** Clean, focused on property-specific syntax
- **Declaration layer:** Handles universal CSS spec concerns (CSS-wide keywords + universal functions)

**The pattern:** Same as Session 057's CSS-wide keywords, now applied consistently to universal CSS functions.
