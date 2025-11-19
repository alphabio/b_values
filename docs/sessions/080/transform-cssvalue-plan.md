# Transform CssValue Support - Implementation Plan

**Date:** 2025-11-19T14:12:00Z
**Session:** 080
**Priority:** 🔴 HIGH - Core functionality

---

## 🎯 Problem Statement

**Transform functions CANNOT represent `var()` or `calc()`:**

```css
/* ALL INVALID in current IR */
transform: translateX(var(--offset));
transform: translateX(calc(50% + 10px));
transform: rotate(var(--angle));
transform: scale(var(--zoom));
```

**Root Cause:**

Transform functions use `lengthPercentageSchema` and `angleSchema` which are concrete types:

```typescript
// Current (WRONG)
export const lengthPercentageSchema = z.union([
  lengthSchema, // { value: number, unit: string }
  percentageSchema, // { value: number }
]);
// ← No CssValue support!
```

---

## 📊 Affected Components

### Transform Functions (ALL affected)

- translate, translateX, translateY, translateZ, translate3d
- rotate, rotateX, rotateY, rotateZ, rotate3d
- scale, scaleX, scaleY, scaleZ, scale3d
- skew, skewX, skewY
- matrix, matrix3d
- perspective (function)

### Base Type Schemas

- `lengthPercentageSchema` - Used by translate
- `angleSchema` - Used by rotate, skew
- `lengthSchema` - Used by translate, perspective
- Numbers (unitless) - Used by scale, rotate3d axis

---

## 🔍 Research Insights

From `docs/sessions/029/css-values-parse.md` and `CSS_VALUE_PATTERN_DETECTION.md`:

### Key Pattern: CssValue is Universal

**CssValue already supports everything we need:**

- Literals: `{ kind: "literal", value: 10, unit: "px" }`
- Variables: `{ kind: "variable", name: "--offset" }`
- Calc: `{ kind: "calc", value: CalcOperation }`
- Keywords: `{ kind: "keyword", value: "auto" }`

**Solution:** Transform functions should accept `cssValueSchema` directly!

---

## ✅ Recommended Approach

### Option C: Transform Functions Use CssValueSchema Directly

```typescript
// NEW (CORRECT)
export const translateSchema = z.object({
  kind: z.literal("translate"),
  x: cssValueSchema, // ← Direct CssValue!
  y: cssValueSchema,
});
```

**Why This is Best:**

1. ✅ **Consistent with existing patterns** - font-size, margin-_, padding-_ all use CssValue
2. ✅ **Future-proof** - Automatically handles new CSS features
3. ✅ **Simple** - No intermediate schemas needed
4. ✅ **Complete** - Supports var(), calc(), literals, keywords, ALL in one
5. ✅ **Parser-friendly** - `parseCssValueNode()` already handles everything

**Cons:**

- Loses specific type info (length vs percentage) - BUT this is CORRECT per ADR-001
- We're a representation engine, not a validator

---

## 📋 Implementation Steps

### Phase 1: Update Transform Schemas ✅ REQUIRED

**Files to change:**

- `packages/b_types/src/transform/translate.ts`
- `packages/b_types/src/transform/rotate.ts`
- `packages/b_types/src/transform/scale.ts`
- `packages/b_types/src/transform/skew.ts`
- `packages/b_types/src/transform/matrix.ts`
- `packages/b_types/src/transform/perspective.ts`

**Before:**

```typescript
// translate.ts
export const translateSchema = z.object({
  kind: z.literal("translate"),
  x: lengthPercentageSchema, // ← Concrete type
  y: lengthPercentageSchema,
});
```

**After:**

```typescript
// translate.ts
import { cssValueSchema } from "../values";

export const translateSchema = z.object({
  kind: z.literal("translate"),
  x: cssValueSchema, // ← Universal CssValue
  y: cssValueSchema,
});
```

### Phase 2: Update Parsers ✅ REQUIRED

**Files to change:**

- `packages/b_parsers/src/transform/*.ts` (if they exist)

**Strategy:**

- Use `Parsers.Utils.parseNodeToCssValue()` for ALL parameters
- Remove specific length/angle parsing
- Let CssValue handle everything

**Example:**

```typescript
// OLD
const xResult = Parsers.Length.parseLengthPercentageNode(node);

// NEW
const xResult = Parsers.Utils.parseNodeToCssValue(node);
```

### Phase 3: Update Generators ✅ REQUIRED

**Files to change:**

- `packages/b_generators/src/transform/*.ts` (if they exist)

**Strategy:**

- Use `Utils.cssValueToCss()` for ALL parameters
- Remove specific length/angle generation

**Example:**

```typescript
// OLD
const xCss = Length.generate(transform.x);

// NEW
const xCss = Utils.cssValueToCss(transform.x);
```

### Phase 4: Update Tests ✅ REQUIRED

**Test changes:**

- Update expectations to CssValue structure
- Add var() tests
- Add calc() tests
- Add mixed tests (literal + var)

**Example:**

```typescript
it("parses translateX with var", () => {
  const result = parseTransform("translateX(var(--offset))");
  expect(result.value).toEqual({
    kind: "transform-list",
    value: [
      {
        kind: "translateX",
        x: { kind: "variable", name: "--offset" },
      },
    ],
  });
});
```

---

## 🚨 Breaking Changes

**YES - This is a breaking change:**

- All transform function types change structure
- Old: `{ x: { value: 10, unit: "px" } }`
- New: `{ x: { kind: "literal", value: 10, unit: "px" } }`

**Impact:**

- ~7 transform function files
- ~7 parser files (if exist)
- ~7 generator files (if exist)
- Test files

**Philosophy:** "We break things to make them consistent" - NO deprecation cycles

---

## 🎯 Success Criteria

After implementation, these should ALL work:

```css
/* Literals */
transform: translateX(10px);
transform: rotate(45deg);
transform: scale(2);

/* Variables */
transform: translateX(var(--offset));
transform: rotate(var(--angle));
transform: scale(var(--zoom));

/* Calc */
transform: translateX(calc(50% + 10px));
transform: rotate(calc(90deg * 2));
transform: scale(calc(1 + var(--extra)));

/* Mixed */
transform: translate(10px, var(--y-offset));
transform: rotate3d(1, 0, 0, var(--angle));
```

---

## 📝 Additional Considerations

### Should lengthPercentageSchema Also Change?

**NO** - Keep as concrete type for now.

**Reason:** `lengthPercentageSchema` is used in non-transform contexts where concrete types are appropriate. Transform is the exception that needs full CssValue support.

**Future:** If other properties need it, revisit.

### Pattern for Other Complex Types?

**YES** - This establishes the pattern:

**Complex function parameters → Use `cssValueSchema` directly**

This will apply to:

- Filter functions (blur, brightness, etc.)
- Future function types

---

## 🚀 Next Actions

1. **Verify current transform implementation** - Check what files exist
2. **Create detailed file-by-file change list** - Surgical precision
3. **Implement changes** - One type at a time (translate first)
4. **Update tests** - Ensure full coverage
5. **Verify with `just check` and `just build`** - All green

**Ready to start?** Begin with translate as proof of concept, then expand.
