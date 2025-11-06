# Radial Gradient Intelligence Gathering

**Date:** 2025-11-06
**Session:** 032
**Purpose:** Complete domain knowledge before comprehensive testing

---

## 📊 Current Test Coverage

### Existing Tests (40 total, ALL PASSING ✅)

**Keywords (4 tests):**

- `radial-shape.test.ts` (2 tests) - circle, ellipse
- `radial-size.test.ts` (2 tests) - size keyword validation

**Types (15 tests):**

- `radial-size.test.ts` (7 tests) - Size schema validation
- `radial.test.ts` (8 tests) - RadialGradient schema validation

**Generators (11 tests):**

- Simple gradient, shapes, size keywords, explicit sizes
- Position, shape+size+position combos
- Repeating, color stops with positions
- Color interpolation method

**Parsers (10 tests):**

- Simple gradient, circle shape, size keyword
- Shape and size combos, position
- Explicit circle/ellipse sizes
- Color interpolation, repeating, complex gradients

---

## 🔍 Type System Analysis

### RadialGradient Structure

```typescript
{
  kind: "radial",
  shape?: "circle" | "ellipse",
  size?: RadialGradientSize,
  position?: Position2D,
  colorInterpolationMethod?: ColorInterpolationMethod,
  colorStops: ColorStop[],
  repeating: boolean
}
```

### RadialGradientSize (Union Type)

**1. Keyword Size:**

```typescript
{
  kind: "keyword",
  value: "closest-side" | "farthest-side" |
         "closest-corner" | "farthest-corner"
}
```

**2. Circle Explicit:**

```typescript
{
  kind: "circle-explicit",
  radius: LengthPercentage
}
```

**3. Ellipse Explicit:**

```typescript
{
  kind: "ellipse-explicit",
  radiusX: LengthPercentage,
  radiusY: LengthPercentage
}
```

### Position2D Structure

```typescript
{
  horizontal: CSSValue,  // keyword | literal | variable | calc | clamp
  vertical: CSSValue
}
```

**Horizontal keywords:** left, center, right
**Vertical keywords:** top, center, bottom

---

## 🎯 Radial-Specific Features

### Shape & Size Combinations

**Valid combinations:**

1. **Shape only:** `circle` or `ellipse`
2. **Size keyword only:** `closest-side`, etc.
3. **Shape + size keyword:** `circle closest-side`
4. **Size keyword + shape:** `closest-side circle`
5. **Shape + explicit size:**
   - Circle: `circle 50px`
   - Ellipse: `ellipse 50px 100px` (NOT: explicit ellipse requires shape)
6. **Explicit size without shape:**
   - Single value: `50px` → circle-explicit
   - Two values: `50px 100px` → ellipse-explicit

### Position Syntax

**Pattern:** `at <position>`

**Examples:**

- `at center`
- `at 50% 50%`
- `at left top`
- `at 10px 20px`
- `at center 25%`
- `at var(--pos-x) var(--pos-y)`
- `at calc(50% - 10px) top`

### Ordering Rules

**CSS Syntax order:**

```
radial-gradient(
  [<shape> || <size>] [at <position>]?,
  [in <color-interpolation>]?,
  <color-stop-list>
)
```

**IR Parse order in code:**

1. Parse shape and size (any order)
2. Check for `at` keyword → parse position
3. Check for `in` keyword → parse color interpolation
4. Parse color stops

---

## 🧪 Testing Gaps Analysis

### What's Already Tested ✅

- Basic structure (simple gradient)
- Shape variations (circle, ellipse)
- Size keywords (all 4)
- Shape + size combinations
- Explicit sizes (circle, ellipse)
- Position basics
- Color interpolation basics
- Repeating flag
- Complex combination

### What's MISSING 🔴

#### 1. Shape & Size Variations

- ❌ All size keywords with each shape
- ❌ Size keyword + shape (reverse order)
- ❌ Explicit sizes with all length units (px, em, rem, %, vw, etc.)
- ❌ Explicit ellipse with shape keyword
- ❌ Edge case: very large/small values

#### 2. Position Variations

- ❌ All horizontal keywords (left, center, right)
- ❌ All vertical keywords (top, center, bottom)
- ❌ All keyword combinations (9 combos)
- ❌ Percentage positions (0%, 50%, 100%, 25%, 75%)
- ❌ Length positions (px, em, rem, vw, vh)
- ❌ Mixed keyword + length (left 10px, 50% bottom)
- ❌ Single position value (1-value vs 2-value syntax)
- ❌ Dynamic: var() in position
- ❌ Dynamic: calc() in position

#### 3. Color Interpolation

- ❌ All rectangular color spaces (srgb, srgb-linear, lab, oklab, xyz, etc.)
- ❌ All polar color spaces (hsl, hwb, lch, oklch)
- ❌ All hue methods (shorter, longer, increasing, decreasing)
- ❌ All space + hue combinations

#### 4. Color Stops

- ❌ Various stop counts (2, 3, 5, 10, 50+, 100+)
- ❌ Double position stops
- ❌ All length units in positions
- ❌ Mixed units (%, px, em)
- ❌ No positions vs all positions vs mixed
- ❌ Dynamic colors (var, rgb with calc)
- ❌ All color formats (hex, rgb, hsl, named, oklch, etc.)

#### 5. Combinations

- ❌ shape + size + position
- ❌ shape + size + position + interpolation
- ❌ All features + repeating
- ❌ Dynamic values in multiple places

#### 6. Edge Cases

- ❌ 100+ color stops (stress test)
- ❌ High precision decimals
- ❌ Whitespace variations
- ❌ Case insensitivity
- ❌ Zero values (0px, 0%)
- ❌ Negative positions

#### 7. Error Handling

- ❌ Single color stop (should fail)
- ❌ Invalid shape
- ❌ Invalid size keyword
- ❌ Invalid position syntax
- ❌ Invalid color space
- ❌ Empty gradient

---

## 📦 Implementation Details

### Parser Strategy (`radial.ts`)

1. **Parse shape and size** (`parseShapeAndSize` function)
   - Handles multiple orderings
   - Supports explicit circle/ellipse sizes
   - Returns shape, size, and next index

2. **Parse position**
   - Looks for `at` keyword
   - Collects nodes until comma or `in` keyword
   - Uses `parsePosition2D` utility

3. **Parse color interpolation**
   - Looks for `in` keyword
   - Uses `Utils.parseColorInterpolationMethod`

4. **Parse color stops**
   - Split remaining nodes by comma
   - Parse each stop group
   - Validate minimum 2 stops

### Generator Strategy (`radial.ts`)

1. **Generate size** (`generateSize` function)
   - Keyword: return value directly
   - Circle: single length
   - Ellipse: two lengths with space

2. **Generate interpolation**
   - Format: `in <space> [<hue-method>]`

3. **Assemble parts**
   - Collect shape, size, position into "first part"
   - Add interpolation if present
   - Generate all color stops
   - Join with commas

---

## 🔬 Dynamic Value Support

### Current Support (from linear gradient patterns)

**Variables (`var()`):**

- ✅ In color stops (color values)
- ❓ In size (radius)?
- ❓ In position?
- ❓ In multiple places?

**Calc (`calc()`):**

- ✅ In color stops (positions)
- ❓ In size (radius)?
- ❓ In position?
- ❓ In color values (rgb with calc)?

**Clamp/Min/Max:**

- ❓ In size?
- ❓ In position?
- ❓ In color stop positions?

### Test Requirements

Need to verify dynamic value support in:

1. Size (radius, radiusX, radiusY)
2. Position (horizontal, vertical)
3. Color stop positions
4. Color stop colors (rgb/hsl with calc)

---

## 📝 Test Organization Plan

### Proposed Structure

```
packages/b_generators/src/gradient/__tests__/radial/
├── shape-size.test.ts        (~40-50 tests)
├── position.test.ts          (~30-40 tests)
├── color-interpolation.test.ts (~30 tests)
├── color-stops.test.ts       (~25 tests)
├── combinations.test.ts      (~15 tests)
├── edge-cases.test.ts        (~15 tests)
└── error-handling.test.ts    (~10 tests)

packages/b_parsers/src/gradient/__tests__/radial/
├── shape-size.test.ts
├── position.test.ts
├── color-interpolation.test.ts
├── color-stops.test.ts
├── combinations.test.ts
├── edge-cases.test.ts
└── error-handling.test.ts
```

**Estimated:** ~165-185 tests per package = ~330-370 total new tests

---

## 🎯 Test Categories

### 1. Shape & Size Tests (~40-50)

- All 4 size keywords
- Both shapes (circle, ellipse)
- Shape + keyword combos (8 tests)
- Keyword + shape combos (8 tests)
- Explicit circle: all units (px, em, rem, %, vw, vh, cm, etc.)
- Explicit ellipse: various unit combos
- Dynamic values: var() and calc() in radius

### 2. Position Tests (~30-40)

- Keyword combinations (left/center/right × top/center/bottom = 9)
- Percentage positions (common values)
- Length positions (various units)
- Single vs two-value syntax
- Mixed keyword + length
- Offset syntax (left 10px, etc.)
- Dynamic: var() in horizontal/vertical
- Dynamic: calc() in horizontal/vertical

### 3. Color Interpolation Tests (~30)

- All rectangular color spaces (7+)
- All polar color spaces (4+)
- Hue interpolation methods (4)
- Space + hue combos for polar spaces

### 4. Color Stops Tests (~25)

- Various counts (2, 3, 5, 10, 20, 50, 100)
- Position types (%, px, em, rem, etc.)
- Double positions
- Mixed positioned/non-positioned
- All color formats
- Dynamic colors (var, calc)

### 5. Combinations Tests (~15)

- Shape + size + position
- All features combined
- Repeating variations
- Multiple dynamic values

### 6. Edge Cases Tests (~15)

- Stress: 100+ stops
- Precision: many decimals
- Whitespace variations
- Zero values
- Negative positions
- Case insensitivity

### 7. Error Handling Tests (~10)

- Single color stop
- Invalid keywords
- Invalid syntax
- Missing values
- Type mismatches

---

## 🚀 Implementation Strategy

### Phase 1: Generator Tests

Start with generator (easier, no parsing complexity)

**Order:**

1. shape-size.test.ts - Core radial concepts
2. position.test.ts - Position variations
3. color-interpolation.test.ts - Reuse linear patterns
4. color-stops.test.ts - Reuse linear patterns
5. combinations.test.ts - Integration
6. edge-cases.test.ts - Stress testing
7. error-handling.test.ts - Validation (if applicable)

### Phase 2: Parser Tests

Apply same patterns to parser

**Order:**

1. shape-size.test.ts
2. position.test.ts
3. color-interpolation.test.ts
4. color-stops.test.ts
5. combinations.test.ts
6. edge-cases.test.ts
7. error-handling.test.ts

### Phase 3: Fix Any Bugs

- If parser fails, fix parser implementation
- If generator fails, fix generator implementation
- Update types if needed

---

## 📚 Reference Materials

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient

**CSS Spec:** https://drafts.csswg.org/css-images-3/#radial-gradients

**Similar Patterns:**

- `docs/sessions/031/` - Linear gradient testing approach
- `packages/b_parsers/src/gradient/__tests__/linear/`
- `packages/b_generators/src/gradient/__tests__/linear/`

---

## ✅ Intel Gathering Complete

**Summary:**

- ✅ Type system understood
- ✅ Current implementation reviewed
- ✅ Existing tests analyzed (40 passing)
- ✅ Testing gaps identified
- ✅ Test organization planned
- ✅ Estimated ~330-370 new tests
- ✅ Implementation strategy defined

**Ready to begin test implementation!**

---

**Next Step:** Create comprehensive generator tests, starting with shape-size.test.ts
