# Intelligence Findings - Session 081

**Date:** 2025-11-19T17:29:31Z
**Status:** Complete - Ready for implementation

---

## 1. CssValue Discriminators ✅

**Source:** `packages/b_types/src/values/css-value.ts`

**Available discriminators:**

```typescript
type CssValue =
  // Structural
  | { kind: "list"; separator: " " | ","; values: CssValue[] }

  // Primitives
  | { kind: "literal"; value: number; unit?: string }
  | { kind: "keyword"; value: string }
  | { kind: "string"; value: string }
  | { kind: "variable"; name: string; fallback?: CssValue } // ← var()

  // Functions
  | { kind: "url"; url: string }
  | { kind: "function"; name: string; args: CssValue[] }
  | { kind: "calc"; value: CssValue }
  | { kind: "calc-operation"; operator: "+" | "-" | "*" | "/"; left: CssValue; right: CssValue }
  | { kind: "attr"; name: string; typeOrUnit?: string; fallback?: CssValue }
  | { kind: "clamp"; min: CssValue; preferred: CssValue; max: CssValue }
  | { kind: "min" | "max"; values: CssValue[] }
  | { kind: "hex-color"; value: string };
```

**Key findings:**

- ✅ Discriminator is `"variable"` NOT `"var"`
- ✅ Literals have optional `unit` field
- ✅ All math functions (calc, min, max, clamp) are separate discriminators

---

## 2. Time Type Structure ✅

**Source:** `packages/b_types/src/time.ts`

```typescript
export type Time = {
  value: number;
  unit: "s" | "ms"; // From timeUnitSchema
};
```

**Simple structure:** Just value + unit

---

## 3. Time Parser API ✅

**Source:** `packages/b_parsers/src/time.ts`

```typescript
export function parseTimeNode(node: csstree.CssNode): ParseResult<Type.Time>;
```

**Behavior:**

- ✅ Only accepts `Dimension` nodes
- ✅ Validates unit is in `TIME_UNITS` (s, ms)
- ❌ Returns error for wrong node type (e.g., Number, Percentage)
- ❌ Returns error for wrong unit (e.g., "px")

**Error cases:**

- `"1"` (Number node) → error: "Expected time dimension, but got node type Number"
- `"1px"` (Dimension with wrong unit) → error: "Invalid time unit: 'px'"

---

## 4. CssValue Fallback Parser ✅

**Source:** `packages/b_parsers/src/utils/css-value-parser.ts`

```typescript
export function parseNodeToCssValue(node: csstree.CssNode): ParseResult<CssValue>;
```

**Entry point:** `Parsers.Utils.parseNodeToCssValue()`

**Behavior:**

- Tries complex function dispatcher for Function nodes
- Falls back to basic parser for primitives
- Handles: var(), calc(), literals, keywords, etc.

**What it accepts:**

- ✅ `var(--custom)` → `{ kind: "variable", name: "--custom" }`
- ✅ `calc(1s + 200ms)` → `{ kind: "calc", ... }`
- ✅ `1s` → `{ kind: "literal", value: 1, unit: "s" }`
- ✅ Keywords → `{ kind: "keyword", value: "auto" }`

---

## 5. Working Example: background-color ✅

**Source:** `packages/b_declarations/src/properties/background-color/`

### Types (types.ts)

```typescript
export const backgroundColorIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("value"), value: colorSchema }),
]);
```

**Note:** `colorSchema` from `@b/types` already includes concrete color types + CssValue

### Parser (parser.ts)

```typescript
export function parseBackgroundColor(ast: csstree.Value): ParseResult<BackgroundColorIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return parseErr with "missing-value" error
  }

  const colorResult = Parsers.Color.parseNode(firstNode);

  if (colorResult.ok) {
    return { kind: "value", value: colorResult.value };
  }

  return colorResult as ParseResult<BackgroundColorIR>;
}
```

**Why this works:**

- `Parsers.Color.parseNode()` handles concrete (hex, rgb, hsl) AND CssValue (var, calc) internally
- Single call, no explicit fallback needed
- Returns appropriate type based on input

---

## 6. The Key Difference ⚠️

**Color parser:** Self-contained, handles concrete + CssValue internally

**Time parser:** Concrete-only, returns error for non-time nodes

**This means:**

- ✅ `background-color` can use single parser call
- ❌ `animation-delay` NEEDS explicit fallback pattern:
  1. Try Time parser first (concrete)
  2. If fails, try CssValue parser (var/calc)

---

## 7. Implementation Pattern for animation-delay

### Step 1: Update Types

```typescript
import { z } from "zod";
import { timeSchema, type CssValue } from "@b/types";
import * as Keywords from "@b/keywords";

export const animationDelayIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("time"), value: timeSchema }), // ← NEW
  z.object({ kind: z.literal("value"), value: CssValue }),
]);

export type AnimationDelayIR = z.infer<typeof animationDelayIRSchema>;
```

### Step 2: Update Parser

```typescript
export function parseAnimationDelay(ast: csstree.Value): ParseResult<AnimationDelayIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return parseErr("animation-delay", "missing-value");
  }

  // Try concrete Time first
  const timeResult = Parsers.Time.parseTimeNode(firstNode);
  if (timeResult.ok) {
    return {
      ok: true,
      property: "animation-delay",
      value: { kind: "time", value: timeResult.value },
      issues: timeResult.issues,
    };
  }

  // Fallback to CssValue (var, calc, etc.)
  const cssValueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
  if (cssValueResult.ok) {
    return {
      ok: true,
      property: "animation-delay",
      value: { kind: "value", value: cssValueResult.value },
      issues: cssValueResult.issues,
    };
  }

  // Both failed - forward CssValue error
  return cssValueResult as ParseResult<AnimationDelayIR>;
}
```

### Step 3: Update Generator

```typescript
export function generateAnimationDelay(ir: AnimationDelayIR): GenerateResult {
  switch (ir.kind) {
    case "keyword":
      return generateOk(ir.value);

    case "time": // ← NEW
      return Generators.Time.generate(ir.value);

    case "value":
      return Generators.Utils.cssValueToCss(ir.value);
  }
}
```

---

## 8. Test Cases Needed

```typescript
describe("animation-delay", () => {
  // Concrete time values
  test("1s", { kind: "time", value: { value: 1, unit: "s" } });
  test("200ms", { kind: "time", value: { value: 200, unit: "ms" } });
  test("0s", { kind: "time", value: { value: 0, unit: "s" } });
  test("-1s", { kind: "time", value: { value: -1, unit: "s" } });

  // CssValue fallbacks
  test("var(--delay)", { kind: "value", value: { kind: "variable", name: "--delay" } });
  test("calc(1s + 200ms)", { kind: "value", value: { kind: "calc", ... } });

  // Keywords
  test("initial", { kind: "keyword", value: "initial" });

  // Round-trip
  test("1s → generate → parse", expect same IR);
});
```

---

## 9. Estimated Time

**With this intel:**

- Type changes: 2 min
- Parser changes: 5 min
- Generator changes: 2 min
- Tests: 6 min
- Verification: 2 min

**Total per property:** ~15 minutes

**For 4 time properties:** ~1 hour

---

## 10. Ready to Execute ✅

All questions answered:

- ✅ CssValue discriminators documented
- ✅ Time type structure known
- ✅ Parser APIs understood
- ✅ Error behavior documented
- ✅ Working example analyzed
- ✅ Implementation pattern defined
- ✅ Test cases outlined

**Next:** Implement animation-delay using this pattern
