# Transform CssValue Migration - Complete Analysis

**Date:** 2025-11-19T14:30:00Z
**Session:** 080

---

## 🎯 Objective

Migrate all transform function schemas to use `cssValueSchema` instead of concrete types (`lengthPercentageSchema`, `angleSchema`, `z.number()`).

**Why:** Enable `var()` and `calc()` support in transform functions.

---

## 📊 Scope Analysis

### Files to Modify

#### 1. Type Schemas (6 files)

- `packages/b_types/src/transform/translate.ts` (63 lines)
- `packages/b_types/src/transform/rotate.ts` (63 lines)
- `packages/b_types/src/transform/scale.ts` (56 lines)
- `packages/b_types/src/transform/skew.ts` (~50 lines, estimated)
- `packages/b_types/src/transform/matrix.ts` (~60 lines, estimated)
- `packages/b_types/src/transform/perspective.ts` (~30 lines, estimated)

#### 2. Parsers (6 files)

- `packages/b_parsers/src/transform/translate.ts` (111 lines)
- `packages/b_parsers/src/transform/rotate.ts` (110 lines)
- `packages/b_parsers/src/transform/scale.ts` (115 lines)
- `packages/b_parsers/src/transform/skew.ts` (74 lines)
- `packages/b_parsers/src/transform/matrix.ts` (87 lines)
- `packages/b_parsers/src/transform/perspective.ts` (35 lines)
- `packages/b_parsers/src/transform/index.ts` (80 lines) - orchestrator

#### 3. Generators (1 file)

- `packages/b_generators/src/transform/index.ts` (141 lines) - single file handles all

#### 4. Tests

- Status: NO test files found for transform functions
- Action: Will need to add tests AFTER migration

**Total:** 13 files, ~753 lines of transform-specific code

---

## 🔍 Current Architecture

### Type Layer Pattern

```typescript
// BEFORE (translate.ts)
import { lengthPercentageSchema } from "../length-percentage";

export const translateXSchema = z.object({
  kind: z.literal("translateX"),
  x: lengthPercentageSchema, // ← Concrete type
});
```

**Issue:** `lengthPercentageSchema` = union of length + percentage only. No CssValue support.

### Parser Layer Pattern

```typescript
// BEFORE (translate.ts)
import { parseLengthPercentageNode } from "../length";

const xResult = parseLengthPercentageNode(args[0]); // ← Specific parser
if (!xResult.ok) return parseErr(...);
return parseOk({ kind: "translateX", x: xResult.value });
```

**Issue:** `parseLengthPercentageNode` returns concrete type, not CssValue.

### Generator Layer Pattern

```typescript
// BEFORE (index.ts)
import * as Length from "../length";

case "translateX": {
  const x = Length.generateLengthPercentage(ir.x); // ← Specific generator
  if (!x.ok) return x;
  return generateOk(`translateX(${x.value})`);
}
```

**Issue:** `generateLengthPercentage` expects concrete type, not CssValue.

---

## ✅ Target Architecture

### Type Layer (NEW)

```typescript
// AFTER (translate.ts)
import { cssValueSchema } from "../values";

export const translateXSchema = z.object({
  kind: z.literal("translateX"),
  x: cssValueSchema, // ← Universal CssValue
});
```

**Change:** Import `cssValueSchema`, replace all parameter types.

### Parser Layer (NEW)

```typescript
// AFTER (translate.ts)
import { parseNodeToCssValue } from "../utils/css-value-parser";

const xResult = parseNodeToCssValue(args[0]); // ← Universal parser
if (!xResult.ok) return parseErr(...);
return parseOk({ kind: "translateX", x: xResult.value });
```

**Change:** Import `parseNodeToCssValue`, replace all parse calls.

### Generator Layer (NEW)

```typescript
// AFTER (index.ts)
import { cssValueToCss } from "@b/utils";

case "translateX": {
  const x = cssValueToCss(ir.x); // ← Universal generator (no Result)
  return generateOk(`translateX(${x})`);
}
```

**Change:** Import `cssValueToCss`, replace all generate calls.
**Note:** `cssValueToCss` returns `string` directly, not `GenerateResult`.

---

## 🔧 Migration Strategy

### Phase 1: Types (Foundation)

Replace concrete schemas with `cssValueSchema` in all 6 type files.

**Impact:** Breaking change to type signatures.

### Phase 2: Parsers (Bridge)

Replace specific parsers with `parseNodeToCssValue`.

**Impact:** All parsers now produce CssValue structures.

### Phase 3: Generators (Adapter)

Replace specific generators with `cssValueToCss`.

**Impact:** Generators adapt to new CssValue input.

### Phase 4: Tests (Validation)

Add comprehensive tests for var() and calc() support.

**Impact:** New test files needed.

---

## 📋 Type-by-Type Changes

### Translate Functions

**Parameters:** x, y, z (all `lengthPercentageSchema`)
**Change:** → `cssValueSchema`
**Files:** translate.ts (types, parser, generator case)

### Rotate Functions

**Parameters:** angle (`angleSchema`)
**Change:** → `cssValueSchema`
**Special:** rotate3d has x,y,z (`z.number()`) → keep as is (axis, not values)
**Files:** rotate.ts (types, parser, generator case)

### Scale Functions

**Parameters:** x, y, z (all `z.number()`)
**Change:** → `cssValueSchema`
**Rationale:** Scale can use calc(1 + var(--extra))
**Files:** scale.ts (types, parser, generator case)

### Skew Functions

**Parameters:** x, y (both `angleSchema`)
**Change:** → `cssValueSchema`
**Files:** skew.ts (types, parser, generator case)

### Matrix Functions

**Parameters:** a,b,c,d,e,f (all `z.number()`)
**Change:** → `cssValueSchema`
**Rationale:** Matrix can use calc() expressions
**Files:** matrix.ts (types, parser, generator case)

### Perspective Function

**Parameters:** length (`lengthSchema`)
**Change:** → `cssValueSchema`
**Files:** perspective.ts (types, parser, generator case)

---

## ⚠️ Special Considerations

### rotate3d Axis Values

**Current:** `x: z.number(), y: z.number(), z: z.number()` (axis direction)
**Decision:** Keep as `z.number()` - these are axis direction vectors, not CSS values
**Change:** Only `angle` parameter → `cssValueSchema`

### Scale Default Behavior

**Current:** scale(x) defaults y to x if omitted
**Future:** scale(var(--x)) should default y to same var
**Action:** Parser must preserve this behavior with CssValue

### Generator Error Handling

**Current:** Generators return `GenerateResult`
**New:** `cssValueToCss` returns `string` directly
**Impact:** Simplifies generator code (no error propagation needed)

---

## 🧪 Test Coverage Needed

### Basic Literal Tests

```css
transform: translateX(10px);
transform: rotate(45deg);
transform: scale(2);
```

### Variable Tests

```css
transform: translateX(var(--offset));
transform: rotate(var(--angle));
transform: scale(var(--zoom));
```

### Calc Tests

```css
transform: translateX(calc(50% + 10px));
transform: rotate(calc(90deg * 2));
transform: scale(calc(1 + var(--extra)));
```

### Mixed Tests

```css
transform: translate(10px, var(--y));
transform: rotate3d(1, 0, 0, var(--angle));
```

### Edge Cases

```css
transform: translateX(var(--x, 10px)); /* fallback */
transform: rotate(clamp(0deg, var(--angle), 90deg));
```

---

## 🚨 Breaking Changes

### IR Structure Change

**Before:**

```typescript
{
  kind: "translateX",
  x: { value: 10, unit: "px" }
}
```

**After:**

```typescript
{
  kind: "translateX",
  x: { kind: "literal", value: 10, unit: "px" }
}
```

**Impact:** Any code consuming transform IR must update.

### No Deprecation Cycle

Per AGENTS.md philosophy: "We break things to make them consistent."

---

## ✅ Success Criteria

1. All transform functions accept CssValue parameters
2. Parser uses `parseNodeToCssValue` exclusively
3. Generator uses `cssValueToCss` exclusively
4. Tests cover literals, var(), calc(), mixed cases
5. `just check && just build` passes
6. No test regressions

---

## 📝 Implementation Order

1. **translate.ts** - Simplest, proof of concept
2. **rotate.ts** - Similar pattern, test axis handling
3. **scale.ts** - Number → CssValue migration
4. **skew.ts** - Similar to rotate
5. **perspective.ts** - Single parameter, simple
6. **matrix.ts** - Most parameters, comprehensive test

---

## 🎯 Next Action

Start with translate.ts as proof of concept:

1. Update type schema
2. Update parser
3. Update generator case
4. Add basic tests
5. Verify build passes

Then apply pattern to remaining 5 transform types.
