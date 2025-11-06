# Session 033 Cleanup Tasks

## Priority 1: Extract isCssValueFunction Utility

**Create:** `packages/b_parsers/src/utils/css-value-functions.ts`

````typescript
// b_path:: packages/b_parsers/src/utils/css-value-functions.ts
import type * as csstree from "css-tree";

/**
 * Check if a Function node is a CSS value function (var, calc, clamp, min, max)
 * and not a color function (rgb, hsl, hwb, lab, lch, oklch, oklab, etc.)
 *
 * Used by gradient parsers to distinguish between:
 * - CSS value functions that can be sizes/positions: var(), calc(), clamp(), min(), max()
 * - Color functions that should be color stops: rgb(), hsl(), oklch(), etc.
 *
 * @param node - CSS AST node to check
 * @returns true if node is a CSS value function, false otherwise
 *
 * @example
 * ```typescript
 * if (isCssValueFunction(node)) {
 *   // Parse as size: circle calc(50px + 10px)
 * } else {
 *   // Parse as color: rgb(255, 0, 0)
 * }
 * ```
 */
export function isCssValueFunction(node: csstree.CssNode): boolean {
  if (node.type !== "Function") return false;
  const funcName = node.name.toLowerCase();
  return ["var", "calc", "clamp", "min", "max"].includes(funcName);
}
````

**Update index:** `packages/b_parsers/src/utils/index.ts`

```typescript
export * from "./css-value-functions";
```

**Replace in:** `packages/b_parsers/src/gradient/radial.ts`

```typescript
// Remove inline function (lines 11-19)
// Add import
import { isCssValueFunction } from "../utils/css-value-functions";
```

## Priority 2: Test Linear Gradient with RGB/HSL/var

**File:** `packages/b_parsers/src/gradient/__tests__/linear/color-stops.test.ts`

Add after existing color tests:

```typescript
describe("Color Formats", () => {
  it("parses rgb colors", () => {
    const css = "linear-gradient(rgb(255, 0, 0), rgb(0, 0, 255))";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.colorStops).toHaveLength(2);
      expect(result.value.colorStops[0].color.kind).toBe("rgb");
      expect(result.value.colorStops[1].color.kind).toBe("rgb");
    }
  });

  it("parses hsl colors", () => {
    const css = "linear-gradient(hsl(0, 100%, 50%), hsl(240, 100%, 50%))";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.colorStops).toHaveLength(2);
      expect(result.value.colorStops[0].color.kind).toBe("hsl");
      expect(result.value.colorStops[1].color.kind).toBe("hsl");
    }
  });

  it("parses var() in color", () => {
    const css = "linear-gradient(var(--color1), var(--color2))";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.colorStops[0].color).toEqual({
        kind: "variable",
        name: "--color1",
      });
      expect(result.value.colorStops[1].color).toEqual({
        kind: "variable",
        name: "--color2",
      });
    }
  });
});
```

**Expected:** Should pass with splitNodesByComma fix.

## Priority 3: Document Bug Fixes

**File:** `docs/sessions/033/BUG_FIXES.md`

Document the three bugs discovered and their fixes for future reference.

## Quality Checks

Run after cleanup:

```bash
just check   # Format, lint, typecheck
just test    # All tests should pass (1461 tests)
just build   # Production build
```

## Commit Message

```
fix(parsers): handle nested functions in gradients (rgb, hsl, var)

- Fix splitNodesByComma to handle nested functions
- Add isCssValueFunction utility to distinguish CSS value vs color functions
- Fix radial parser consuming color functions as sizes
- Add comprehensive tests for rgb/hsl/var in gradients

Discovered via TDD approach in Session 033.

BREAKING: Bare var() without shape keyword now treated as color, not size.
Use 'circle var(--radius)' instead of 'var(--radius)'.

Tests: 150 new radial parser tests, all passing
Fixes: #[issue] if applicable
```
