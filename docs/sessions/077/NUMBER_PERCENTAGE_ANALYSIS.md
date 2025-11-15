# Number/Percentage Pattern Analysis

**Date:** 2025-11-15 06:02 UTC  
**Context:** Filter infrastructure introduced `parseNumberOrPercentage` helper

---

## 🔍 What We Created

**Helper:** `packages/b_parsers/src/filter/number-percentage.ts`

```typescript
export function parseNumberOrPercentage(node: csstree.CssNode): ParseResult<number | Type.Percentage> {
  // Try number first (e.g., "1.2")
  if (node.type === "Number") {
    const numberResult = parseNumberNode(node);
    if (numberResult.ok) return parseOk(numberResult.value);
  }

  // Try percentage (e.g., "120%")
  if (node.type === "Percentage") {
    const percentResult = parseLengthPercentageNode(node);
    if (percentResult.ok && percentResult.value.unit === "%") {
      return parseOk({ value: percentResult.value.value, unit: "%" });
    }
  }

  return parseErr("filter", createError("invalid-value", "Expected number or percentage"));
}
```

**Used by 8 filter functions:**

- `brightness(number|percentage?)`
- `contrast(number|percentage?)`
- `grayscale(number|percentage?)`
- `invert(number|percentage?)`
- `opacity(number|percentage?)` ← **Note: Different from `opacity` property!**
- `saturate(number|percentage?)`
- `sepia(number|percentage?)`
- (Also `drop-shadow` but uses color + lengths)

---

## 🎯 Impact on Existing Properties

### ✅ Properties Already Using Number

**1. `opacity` property** (packages/b_declarations/src/properties/opacity)

- **Current:** Only accepts `number` (e.g., `0.5`)
- **Spec:** Actually accepts `number | percentage` (0.5 or 50%)
- **Status:** ❌ Incomplete - missing percentage support
- **Fix needed:** Yes

**2. `animation-iteration-count`**

- **Current:** `number | "infinite"`
- **Spec:** Correct (only number, not percentage)
- **Status:** ✅ Complete

**3. `font-weight` (future property)**

- **Spec:** `number | keyword` (100-900 or bold/normal/etc.)
- **Pattern:** Will use similar approach (number + keyword)
- **Status:** Not yet implemented

---

## 📋 Properties That SHOULD Accept Number|Percentage

### Current Codebase

**1. `opacity` property** ❌ Broken

- Spec: `<number> | <percentage>`
- Current: Only `<number>`
- Fix: Add percentage support (can reuse our helper!)

### Future Properties (from CSS spec)

**Font & Text:**

- `font-size`: `length | percentage | keyword`
- `line-height`: `number | length | percentage | keyword`

**Layout:**

- `width`, `height`: `length | percentage | auto | ...`
- `flex-grow`, `flex-shrink`: `number` only
- `flex-basis`: `length | percentage | auto | content`

**Transforms:**

- (Already complete - uses length, angle, number separately)

**Filters:**

- ✅ Already handled by our new helper

---

## 🔧 Reusability Assessment

### Can We Reuse `parseNumberOrPercentage`?

**Current location:** `packages/b_parsers/src/filter/number-percentage.ts`

**Issues:**

1. **Scoped to filter:** File path suggests filter-specific
2. **Error message:** Hardcoded `"filter"` as property name
3. **Not exported:** Not in `@b/parsers` index

**Should we?**

❌ **NO - Here's why:**

### The Problem with Generic Helpers

**Different properties have different requirements:**

**Filter functions:**

```typescript
brightness(1.2)      // number: 120%
brightness(120%)     // percentage: 120%
// SAME MEANING
```

**Opacity property:**

```typescript
opacity: 0.5;        // number: 50%
opacity: 50%;        // percentage: 50%
// SAME MEANING
```

**Font-size:**

```typescript
font-size: 16px;     // length
font-size: 100%;     // percentage (relative to parent)
font-size: 1.2;      // ❌ INVALID (must have unit)
// DIFFERENT MEANINGS
```

**Width:**

```typescript
width: 100px;        // length
width: 50%;          // percentage (relative to container)
width: 2;            // ❌ INVALID
// DIFFERENT MEANINGS + more options (auto, min-content, etc.)
```

### Why Filter Helper Works

**Filters are special:**

- All 8 functions have IDENTICAL signature: `fn(number|percentage?)`
- Number and percentage have SAME semantic meaning (multiplier)
- Optional parameter with default values
- All within same domain (filter effects)

**This is NOT true for properties generally.**

---

## ✅ Recommendations

### 1. Keep Helper Filter-Specific

**Current:** `packages/b_parsers/src/filter/number-percentage.ts`  
**Action:** Leave it there, it's correctly scoped

**Rationale:**

- Only used by filter functions
- Avoids premature abstraction
- Clear ownership (filter domain)

### 2. Fix `opacity` Property

**Current:**

```typescript
// packages/b_declarations/src/properties/opacity/parser.ts
if (firstNode.type === "Number") {
  const num = Number.parseFloat(firstNode.value);
  // ... only handles number
}
```

**Fix:**

```typescript
if (firstNode.type === "Number") {
  const num = Number.parseFloat(firstNode.value);
  return parseOk({ kind: "number", value: num });
}

if (firstNode.type === "Percentage") {
  const result = Parsers.Length.parseLengthPercentageNode(firstNode);
  if (result.ok && result.value.unit === "%") {
    return parseOk({ kind: "percentage", value: result.value });
  }
}
```

**Or inline the logic** (since it's only one property).

### 3. Future Properties: Case-by-Case

**Don't create generic `parseNumberOrPercentage` in utils.**

Instead:

- **Simple properties** (opacity): Inline the logic
- **Complex properties** (font-size): Use existing length/percentage parsers
- **Domain-specific** (filters): Keep domain helpers

---

## 🎓 Architecture Lesson

### When to Create Shared Helpers

✅ **DO create helpers when:**

- Multiple uses within SAME DOMAIN (filter functions)
- Identical semantic meaning across uses
- Clear ownership/scope

❌ **DON'T create helpers when:**

- Different semantic meanings (width % vs font-size %)
- Different validation rules
- "Might be useful someday" (YAGNI)

### The Filter Case

**Why it works:**

- 8 filter functions with IDENTICAL requirements
- Same domain (visual effects)
- Same semantics (multiplier/scale factor)
- Located in domain directory (not utils)

**This is textbook good abstraction.**

---

## 📊 Action Items

### Immediate

1. ❌ **Don't** move `parseNumberOrPercentage` to utils
2. ❌ **Don't** promote it to `@b/parsers` index
3. ✅ **Do** document this decision (this file)

### Near-term

1. Fix `opacity` property to accept percentages
2. Add test: `opacity: 50%` should work

### Future

1. Implement font/text properties with appropriate parsers
2. Avoid premature abstraction of number/percentage handling

---

## 🔑 Key Takeaway

**The `parseNumberOrPercentage` helper is correctly scoped to filters.**

It's NOT a generic utility because `number | percentage` has different semantics across CSS:

- **Filters:** Multiplier (1.2 = 120%)
- **Opacity:** Alpha value (0.5 = 50%)
- **Font-size:** Relative size (120% of parent)
- **Width:** Portion of container (50% of width)

**Domain-specific helpers > Generic utilities.**

---

**Status:** ✅ No changes needed - current approach is correct
