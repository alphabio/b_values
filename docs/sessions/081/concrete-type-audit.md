# Concrete Type Layer Audit

**Date:** 2025-11-19
**Session:** 081
**Issue:** Properties declare concrete type branches in IR but parsers skip them and go straight to `CssValue`

---

## The Problem

**Pattern seen in 32 properties:**

```typescript
// Type declares concrete type
export type PropertyIR =
  | { kind: "keyword"; value: ... }
  | { kind: "concrete"; value: ConcreteType }  // ← Declared but never produced
  | { kind: "value"; value: CssValue };        // ← Parser jumps straight here
```

**Parser skips concrete layer:**

```typescript
// ❌ Current: Skips concrete type parsing
const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
return { kind: "value", value: valueResult.value };
```

**Should be:**

```typescript
// ✅ Correct: Parse concrete type first
const concreteResult = Parsers.ConcreteType.parse(firstNode);
if (concreteResult.ok) {
  return { kind: "concrete", value: concreteResult.value };
}

// Only fallback to CssValue if concrete fails
const cssValueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
return { kind: "value", value: cssValueResult.value };
```

---

## Reference Implementation: background-color

**Type (correct):**

```typescript
export const backgroundColorIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("value"), value: colorSchema }), // colorSchema includes concrete + CssValue
]);
```

**Parser (correct):**

```typescript
const colorResult = Parsers.Color.parseNode(firstNode); // Returns Color (concrete + CssValue)
if (colorResult.ok) {
  return { kind: "value", value: colorResult.value };
}
```

**Why it works:** `Parsers.Color.parseNode` internally tries concrete color formats (hex, rgb, hsl) THEN falls back to CssValue (var, calc). The concrete layer is inside the parser, not exposed at the IR discriminator level.

---

## Properties Requiring Fixes

### Group 1: Time Properties (3)

**Missing:** `{ kind: "time"; value: Type.Time }`

1. **animation-delay** ✅ Type declares it
   - Currently: Skips straight to CssValue
   - Fix: Use `Parsers.Time.parseTimeNode(node)` first
   - Expected: `animation-delay: 1s` → `{ kind: "time", value: { value: 1, unit: "s" } }`

2. **animation-duration** ❌ Type missing concrete layer
   - Currently: Only `keyword | value`
   - Fix: Add `{ kind: "time"; value: Type.Time }` + use Time parser

3. **transition-delay** ❌ Type missing concrete layer
   - Currently: Only `keyword | value`
   - Fix: Add `{ kind: "time"; value: Type.Time }` + use Time parser

4. **transition-duration** ❌ Type missing concrete layer
   - Currently: Only `keyword | value`
   - Fix: Add `{ kind: "time"; value: Type.Time }` + use Time parser

**Available Parser:** `Parsers.Time.parseTimeNode(node): ParseResult<Type.Time>`

---

### Group 2: Length/Percentage Properties (20)

**Missing:** `{ kind: "length-percentage"; value: Type.LengthPercentage }`

**Margins (4):**

- margin-bottom
- margin-left
- margin-right
- margin-top

**Paddings (4):**

- padding-bottom
- padding-left
- padding-right
- padding-top

**Border Widths (4):**

- border-bottom-width
- border-left-width
- border-right-width
- border-top-width

**Border Radius (4):**

- border-bottom-left-radius (special: circular/elliptical already uses CssValue)
- border-bottom-right-radius (special: circular/elliptical already uses CssValue)
- border-top-left-radius (special: circular/elliptical already uses CssValue)
- border-top-right-radius (special: circular/elliptical already uses CssValue)

**Spacing (3):**

- letter-spacing
- text-indent
- word-spacing

**Other (1):**

- perspective

**Available Parsers:**

- `Parsers.Length.parseLengthPercentage(node): ParseResult<Type.LengthPercentage>`
- Check if Length parser handles both length and percentage internally

---

### Group 3: Position Properties (2)

**Missing:** Concrete position type?

- background-position-x
- background-position-y

**Question:** What's the concrete type? `Type.Position`? `Type.LengthPercentage`?

**Available Parser:** `Parsers.Position.*` - need to investigate

---

### Group 4: Number Properties (2)

**Missing:** `{ kind: "number"; value: number }`?

1. **animation-iteration-count**
   - Currently: `keyword ("infinite" | cssWide) | value (CssValue)`
   - Should add: `{ kind: "number"; value: number }` for `animation-iteration-count: 3`

2. **opacity**
   - Currently: `keyword (cssWide) | value (CssValue)`
   - Should add: `{ kind: "alpha-value"; value: Type.AlphaValue }` or `{ kind: "number"; value: number }`

**Question:** Is there a number parser? Or should we use a more specific type?

---

### Group 5: Complex Types (Already Correct?)

**filter** and **backdrop-filter**:

- Have: `keyword | css-value | filter-list`
- `filter-list` is concrete type
- Parser uses `Parsers.Filter.*`
- **Status:** Likely correct, need to verify

**font-size**:

- Type: `keyword (many) | value (CssValue)`
- Should add: `{ kind: "length-percentage"; value: Type.LengthPercentage }`
- Parser currently skips to CssValue

**font-weight**:

- Type: `keyword | value (CssValue)`
- Should add: `{ kind: "number"; value: number }` for numeric weights (100-900)
- Parser currently skips to CssValue

**line-height**:

- Type: `keyword ("normal") | value (CssValue)`
- Should add: `{ kind: "number"; value: number }` for unitless line-height
- Should add: `{ kind: "length-percentage"; value: Type.LengthPercentage }` for sized

---

## Analysis Summary

| Property Type     | Count | Missing Concrete Type           | Available Parser             |
| ----------------- | ----- | ------------------------------- | ---------------------------- |
| Time              | 4     | `Type.Time`                     | `Parsers.Time.parseTimeNode` |
| Length/Percentage | 16    | `Type.LengthPercentage`         | `Parsers.Length.*`           |
| Border Radius     | 4     | Already uses CssValue correctly | N/A                          |
| Position          | 2     | TBD                             | `Parsers.Position.*`         |
| Number            | 2+    | `number` or specific type       | TBD                          |
| Filter            | 2     | Already correct?                | `Parsers.Filter.*`           |

**Total:** 32 properties using `parseNodeToCssValue` directly

**Need fixing:** ~28 properties (excluding 4 border-radius that may be correct)

---

## Next Steps

1. **Verify border-radius properties** - Do they correctly handle concrete values in elliptical form?
2. **Check Position parser API** - What does it return?
3. **Check number parsing** - Is there a dedicated parser or should we use raw number extraction?
4. **Create fix template** - Standardize the pattern for adding concrete type layer
5. **Batch fix by group** - Fix all time properties, then length properties, etc.

---

## Questions for User

1. Should `animation-iteration-count` support `{ kind: "number", value: 3 }` or keep as CssValue?
2. Should `opacity` use `AlphaValue` type or plain `number`?
3. Are border-radius properties correct as-is (using CssValue in circular/elliptical)?
4. Should `line-height` support both `number` (unitless) and `LengthPercentage`?
5. What's the priority order? Time properties first?
