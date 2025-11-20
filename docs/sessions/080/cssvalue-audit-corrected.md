# CORRECTED CssValue Audit - Deep Analysis

**Date:** 2025-11-19T14:05:00Z
**Session:** 080

---

## 🔍 Investigation Method

**Original audit was TOO SHALLOW** - only checked property-level `types.ts` files.

Need to check NESTED type definitions to see full CssValue support.

---

## ✅ Properties CORRECTLY Supporting CssValue

### Through Direct CssValue Wrapper (32 properties)

All properties with `{ kind: "value"; value: CssValue }` pattern.

**Examples:**

- margin-_, padding-_ (8 total)
- font-size, font-weight, line-height
- opacity, perspective
- animation-delay, transition-duration
- etc.

### Through Nested Schema CssValue (10 properties)

Properties that delegate to schemas which internally use `cssValueSchema`:

1. **color** - Uses `colorSchema` → includes `variableReferenceSchema`
2. **background-color** - Uses `colorSchema` → includes `variableReferenceSchema`
3. **border-bottom-color** - Uses `colorSchema`
4. **border-left-color** - Uses `colorSchema`
5. **border-right-color** - Uses `colorSchema`
6. **border-top-color** - Uses `colorSchema`
7. **perspective-origin** - Uses `Position2D` → uses `cssValueSchema`
8. **transform-origin** - Uses `Position2D` → uses `cssValueSchema`
9. **background-image** - Explicitly imports and uses `cssValueSchema`

**Evidence:**

```typescript
// packages/b_types/src/position.ts
export const position2DSchema = z.object({
  horizontal: z.union([cssValueSchema, positionEdgeOffsetSchema]),
  vertical: z.union([cssValueSchema, positionEdgeOffsetSchema]),
});

// packages/b_types/src/color/color.ts
export const colorSchema = z.union([
  hexColorSchema,
  namedColorSchema,
  // ... other color types
  variableReferenceSchema, // ← CssValue support!
]);
```

---

## 🔴 Properties MISSING CssValue Support

### Transform Property (1 property)

**transform** - Uses `TransformList` (array of `TransformFunction`)

**Problem:**

```typescript
// packages/b_types/src/transform/translate.ts
export const translateSchema = z.object({
  kind: z.literal("translate"),
  x: lengthPercentageSchema, // ← NOT cssValueSchema!
  y: lengthPercentageSchema, // ← NOT cssValueSchema!
});

// packages/b_types/src/length-percentage.ts
export const lengthPercentageSchema = z.union([
  lengthSchema, // { value: number, unit: string }
  percentageSchema, // { value: number }
]);
// ← Does NOT include cssValueSchema!
```

**Impact:** Cannot represent:

```css
transform: translateX(var(--offset));
transform: translateX(calc(50% + 10px));
transform: rotate(var(--angle));
transform: scale(var(--zoom));
```

**ALL transform functions affected:**

- translate, translateX, translateY, translateZ, translate3d
- rotate, rotateX, rotateY, rotateZ, rotate3d
- scale, scaleX, scaleY, scaleZ, scale3d
- skew, skewX, skewY
- matrix, matrix3d
- perspective (function, not property)

---

## 📊 Final Count

### ✅ HAVE CssValue Support: 42 properties (53%)

- 32 via direct wrapper
- 10 via nested schemas

### ❌ MISSING CssValue Support: 37 properties (47%)

- 1 critical (transform) - NEEDS fix
- 36 correctly without (keywords, identifiers)

---

## 🎯 Action Items

### Priority 1: Fix Transform Functions ✅ REQUIRED

**What needs fixing:**

- `lengthPercentageSchema` → should use `cssValueSchema` OR
- Transform functions should accept `cssValueSchema` directly

**Affected files:**

- `packages/b_types/src/length-percentage.ts`
- `packages/b_types/src/transform/*.ts` (7 files)

**Breaking change:** Yes - all transform types change structure

### Priority 2: Verify Other Complex Types

Need to check if other complex types properly use CssValue:

- ✅ `Position2D` - GOOD (uses cssValueSchema)
- ✅ `colorSchema` - GOOD (includes variableReferenceSchema)
- ✅ `imageSchema` - GOOD (background-image imports cssValueSchema)
- 🔴 `lengthPercentageSchema` - BAD (no cssValueSchema)
- 🔍 `angleSchema` - Need to check
- 🔍 `timeSchema` - Need to check

---

## 💡 Design Question

**How should lengthPercentageSchema support CssValue?**

### Option A: Make lengthPercentageSchema = cssValueSchema

```typescript
// Simple: length-percentage IS just a CssValue
export const lengthPercentageSchema = cssValueSchema;
```

**Pros:** Simple, consistent with CssValue philosophy
**Cons:** Loses specific length/percentage type info

### Option B: Union with cssValueSchema

```typescript
export const lengthPercentageSchema = z.union([lengthSchema, percentageSchema, cssValueSchema]);
```

**Pros:** Keeps length/percentage types, adds CssValue
**Cons:** Redundant (cssValueSchema already includes literals)

### Option C: Transform functions use cssValueSchema directly

```typescript
export const translateSchema = z.object({
  kind: z.literal("translate"),
  x: cssValueSchema, // ← Direct CssValue
  y: cssValueSchema,
});
```

**Pros:** Clear, explicit, follows existing patterns
**Cons:** More changes to transform function types

---

## 🚨 Conclusion

**Original audit was WRONG about color properties!**

They ALREADY support CssValue through `colorSchema` → `variableReferenceSchema`.

**Real problem:** Transform functions use `lengthPercentageSchema` which doesn't support CssValue.

**Fix:** Make transform functions accept `cssValueSchema` for all numeric parameters.
