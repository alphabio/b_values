# Conic Gradient Intelligence Gathering

**Date:** 2025-11-06
**Session:** 035
**Purpose:** Complete domain knowledge before comprehensive testing

---

## 📊 Current Test Coverage

### Existing Tests (10 total, ALL PASSING ✅)

**Parser Tests (`conic.test.ts` - 10 tests):**

1. Simple conic gradient (2 color stops)
2. Conic gradient with `from` angle
3. Conic gradient with `at` position
4. Conic gradient with `from` angle AND `at` position
5. Color interpolation method (`in oklch`)
6. Repeating conic gradient
7. Angle positions on color stops
8. Complex gradient (all options combined)
9. Complex gradient with var() and calc()
10. Generator roundtrip validation on all above

**Generator Tests (`conic.test.ts` - 9 tests):**

1. Simple conic gradient
2. With `from` angle
3. With `at` position
4. With both `from` angle and position
5. Repeating conic gradient
6. Color stops with angle positions
7. With `turn` unit
8. With color interpolation method
9. All options combined

**Total Coverage:** 19 tests (10 parser + 9 generator)

### Coverage Gaps Identified

Compared to radial (150 tests) and linear (similar), conic is missing:

❌ **No dedicated test files for:**

- Angle variations (deg/grad/rad/turn)
- Position variations (keywords, percentages, lengths, calc, var)
- Color stop variations (rgb/hsl/hwb/lab/lch/oklch/oklab)
- Edge cases (negative angles, >360deg, invalid syntax)
- Error handling (missing colors, invalid functions)
- Combinations (comprehensive matrix testing)

❌ **No tests for modern color functions:**

- rgb() / rgba()
- hsl() / hsla()
- hwb()
- lab() / lch()
- oklab() / oklch()
- color()

❌ **No tests for CSS value functions in colors:**

- var(--custom-property)
- calc() expressions
- clamp() / min() / max()

---

## 🔍 Type System Analysis

### ConicGradient Structure

```typescript
{
  kind: "conic",
  fromAngle?: CssValue,           // Starting angle (default: 0deg = up)
  position?: Position2D,          // Center position (default: center center)
  colorInterpolationMethod?: ColorInterpolationMethod,
  colorStops: ColorStop[],        // Min 2 required
  repeating: boolean
}
```

### Key Differences from Radial/Linear

**No Shape/Size:** Conic gradients are always circular sweeps

**Angular Positions:** Color stops use angles (deg/turn/etc), not lengths

**Default Starting Angle:** 0deg = top (12 o'clock position)

**Wrapping:** Angles wrap at 360deg (or 1turn)

---

## 🎯 Conic-Specific Features

### 1. From Angle

**Syntax:** `from <angle>`

**Valid Units:**

- `deg` - Degrees (0-360)
- `grad` - Gradians (0-400)
- `rad` - Radians (0-2π)
- `turn` - Turns (0-1)

**Examples:**

```css
conic-gradient(from 0deg, red, blue)      /* Start at top */
conic-gradient(from 90deg, red, blue)     /* Start at right */
conic-gradient(from 0.25turn, red, blue)  /* Start at right */
conic-gradient(from -45deg, red, blue)    /* Negative angles OK */
conic-gradient(from 450deg, red, blue)    /* >360deg wraps */
```

**CSS Value Functions:**

```css
conic-gradient(from var(--angle), red, blue)
conic-gradient(from calc(45deg + 90deg), red, blue)
conic-gradient(from clamp(0deg, var(--a), 360deg), red, blue)
```

### 2. Position (at <position>)

**Syntax:** `at <position>`

**Identical to radial gradient position:**

- Keyword pairs: `center center`, `left top`, etc
- Length/percentage: `50% 50%`, `100px 200px`
- Mixed: `center 20%`, `left 100px`
- CSS functions: `var()`, `calc()`

**Examples:**

```css
conic-gradient(at center, red, blue)
conic-gradient(at 25% 75%, red, blue)
conic-gradient(at left top, red, blue)
conic-gradient(at var(--x) var(--y), red, blue)
```

### 3. Angular Color Stops

**Unlike linear/radial which use lengths, conic uses angles:**

```css
/* Explicit angles */
conic-gradient(red 0deg, yellow 90deg, blue 180deg, red 360deg)

/* Percentages (0% = 0deg, 100% = 360deg) */
conic-gradient(red 0%, yellow 25%, blue 50%, green 75%, red 100%)

/* Mixed */
conic-gradient(red, yellow 90deg, blue 50%, green)

/* Transition hints */
conic-gradient(red 0deg, 30deg, blue 90deg)  /* 30deg is midpoint */
```

**CSS Functions:**

```css
conic-gradient(red var(--angle1), blue var(--angle2))
conic-gradient(red calc(var(--base) * 2), blue 180deg)
```

### 4. Angle Wrapping Behavior

**Angles beyond 360deg wrap around:**

```css
conic-gradient(red 0deg, blue 360deg)     /* Full circle */
conic-gradient(red 0deg, blue 720deg)     /* Two full circles (repeating) */
conic-gradient(red -90deg, blue 270deg)   /* Negative = counter-clockwise */
```

### 5. No Ambiguity Issues

**Unlike linear gradients, conic has NO parsing ambiguity:**

✅ **Explicit keywords required:**

- `from` keyword for starting angle
- `at` keyword for position

✅ **No ambiguous first argument:**

```css
/* Linear: ambiguous - is var() direction or color? */
linear-gradient(var(--x), red, blue)

/* Conic: unambiguous - var() must be color (no "from" keyword) */
conic-gradient(var(--x), red, blue)        /* var = color */
conic-gradient(from var(--x), red, blue)   /* var = angle */
```

---

## 📚 CSS Specification Reference

**CSS Images Module Level 4**

- Section: Conic Gradients
- URL: https://drafts.csswg.org/css-images-4/#conic-gradients

**Key Spec Points:**

1. **Syntax:**

   ```
   conic-gradient(
     [ from <angle> ]?
     [ at <position> ]?
     [ in <color-interpolation-method> ]?,
     <angular-color-stop-list>
   )
   ```

2. **Default Values:**
   - from angle: 0deg (pointing up)
   - position: center center
   - color-interpolation: oklab

3. **Angular Color Stop List:**
   - At least 2 color stops required
   - Positions are angles or percentages
   - Auto-distribution if positions omitted

4. **Repeating:**
   - `repeating-conic-gradient()` function
   - Pattern repeats around the circle
   - Useful for patterns like pie charts, wheels

---

## 🧪 Test Strategy (Following Session 032/033 Pattern)

### Test File Structure (Recommended)

```
packages/b_parsers/src/gradient/__tests__/conic/
├── from-angle.test.ts          ← All angle variations (50-75 tests)
├── position.test.ts            ← All position variations (50-75 tests)
├── color-stops.test.ts         ← All color types + functions (40-60 tests)
├── color-interpolation.test.ts ← Color space variations (15-20 tests)
├── combinations.test.ts        ← Multi-feature combos (20-30 tests)
├── edge-cases.test.ts          ← Wrapping, negatives, etc (15-20 tests)
└── error-handling.test.ts      ← Invalid inputs (10-15 tests)
```

**Total Target:** ~200-260 tests (comprehensive coverage like radial)

### Priority Order

**Phase 1: Core Features (75-100 tests)**

1. `from-angle.test.ts` - All angle units, CSS functions
2. `position.test.ts` - All position variations
3. `color-stops.test.ts` - All color types, modern functions

**Phase 2: Advanced Features (40-50 tests)** 4. `color-interpolation.test.ts` - Color spaces, hue methods 5. `combinations.test.ts` - Multi-feature integration

**Phase 3: Edge Cases & Errors (30-40 tests)** 6. `edge-cases.test.ts` - Wrapping, negatives, boundaries 7. `error-handling.test.ts` - Invalid syntax, missing values

---

## 🔬 Specific Test Cases to Add

### From Angle Tests

**Angle Units:**

```typescript
"conic-gradient(from 45deg, red, blue)";
"conic-gradient(from 50grad, red, blue)";
"conic-gradient(from 0.785rad, red, blue)";
"conic-gradient(from 0.125turn, red, blue)";
```

**Negative/Large Angles:**

```typescript
"conic-gradient(from -45deg, red, blue)";
"conic-gradient(from 450deg, red, blue)";
"conic-gradient(from -0.25turn, red, blue)";
"conic-gradient(from 2turn, red, blue)";
```

**CSS Value Functions:**

```typescript
"conic-gradient(from var(--angle), red, blue)";
"conic-gradient(from calc(45deg + 90deg), red, blue)";
"conic-gradient(from clamp(0deg, var(--a), 360deg), red, blue)";
"conic-gradient(from min(90deg, var(--max)), red, blue)";
"conic-gradient(from max(0deg, var(--min)), red, blue)";
```

### Position Tests

**Keywords:**

```typescript
"conic-gradient(at center, red, blue)";
"conic-gradient(at left top, red, blue)";
"conic-gradient(at right bottom, red, blue)";
"conic-gradient(at center top, red, blue)";
```

**Lengths/Percentages:**

```typescript
"conic-gradient(at 50% 50%, red, blue)";
"conic-gradient(at 100px 200px, red, blue)";
"conic-gradient(at 0% 100%, red, blue)";
"conic-gradient(at 25% 75%, red, blue)";
```

**Mixed:**

```typescript
"conic-gradient(at center 20%, red, blue)";
"conic-gradient(at left 100px, red, blue)";
"conic-gradient(at 50% bottom, red, blue)";
```

**CSS Functions:**

```typescript
"conic-gradient(at var(--x) var(--y), red, blue)";
"conic-gradient(at calc(50% - 20px) 50%, red, blue)";
"conic-gradient(at clamp(0%, var(--x), 100%) center, red, blue)";
```

### Color Stop Tests (RGB/HSL/Modern)

**RGB/RGBA:**

```typescript
"conic-gradient(rgb(255, 0, 0), blue)";
"conic-gradient(rgba(255, 0, 0, 0.5), blue)";
"conic-gradient(rgb(255 0 0), blue)"; /* Space-separated */
"conic-gradient(rgb(255 0 0 / 0.5), blue)";
"conic-gradient(rgb(100% 0% 0%), blue)";
```

**HSL/HSLA:**

```typescript
"conic-gradient(hsl(0, 100%, 50%), blue)";
"conic-gradient(hsla(120, 50%, 50%, 0.5), blue)";
"conic-gradient(hsl(0deg 100% 50%), blue)";
"conic-gradient(hsl(0deg 100% 50% / 0.5), blue)";
```

**Modern Color Functions:**

```typescript
"conic-gradient(hwb(0deg 0% 0%), blue)";
"conic-gradient(lab(50% 40 60), blue)";
"conic-gradient(lch(50% 70 120deg), blue)";
"conic-gradient(oklab(0.5 0.1 0.1), blue)";
"conic-gradient(oklch(0.5 0.15 120deg), blue)";
"conic-gradient(color(srgb 1 0 0), blue)";
```

**With Angle Positions:**

```typescript
"conic-gradient(rgb(255,0,0) 0deg, blue 180deg)";
"conic-gradient(hsl(0,100%,50%) 90deg, blue 270deg)";
"conic-gradient(oklch(0.5 0.15 120) 0%, blue 100%)";
```

**CSS Functions in Colors:**

```typescript
"conic-gradient(var(--color1), blue)";
"conic-gradient(var(--color1) 90deg, blue 270deg)";
"conic-gradient(rgb(var(--r), var(--g), var(--b)), blue)";
"conic-gradient(hsl(var(--h), 100%, 50%), blue)";
```

### Angular Color Stop Positions

**Explicit Angles:**

```typescript
"conic-gradient(red 0deg, blue 180deg, red 360deg)";
"conic-gradient(red 0grad, blue 200grad, red 400grad)";
"conic-gradient(red 0turn, blue 0.5turn, red 1turn)";
```

**Percentages:**

```typescript
"conic-gradient(red 0%, blue 50%, red 100%)";
"conic-gradient(red 25%, blue 75%)";
```

**Multiple Positions:**

```typescript
"conic-gradient(red 0deg 90deg, blue 180deg 270deg)";
"conic-gradient(red 0% 25%, blue 50% 75%)";
```

**CSS Functions:**

```typescript
"conic-gradient(red var(--angle1), blue var(--angle2))";
"conic-gradient(red calc(var(--base) * 2), blue 180deg)";
```

### Edge Cases

**Angle Wrapping:**

```typescript
"conic-gradient(red 0deg, blue 360deg)"; /* Full circle */
"conic-gradient(red 0deg, blue 720deg)"; /* Wraps */
"conic-gradient(red -90deg, blue 270deg)"; /* Negative */
```

**Out-of-Order Stops:**

```typescript
"conic-gradient(red 180deg, blue 90deg, green 0deg)"; /* Browser handles */
```

**Single Color (Edge Case):**

```typescript
"conic-gradient(red)"; /* Should fail - need 2+ stops */
```

### Combinations

**All Features:**

```typescript
"conic-gradient(from 45deg at 25% 75%, in oklch, red 0deg, blue 180deg, red 360deg)";
"repeating-conic-gradient(from var(--angle) at center, in hsl longer hue, red 0%, blue 25%)";
```

---

## 🎨 Generator Analysis

**Current generator (`conic.ts`) supports:**

- ✅ Simple gradients
- ✅ `from` angle
- ✅ `at` position
- ✅ Color interpolation
- ✅ Repeating
- ✅ All angle units
- ✅ All color stop types

**Generator is complete.** No changes needed.

---

## ⚡ No Disambiguation Needed

**Unlike linear gradients (session 034), conic has NO ambiguity:**

**Reason:** Explicit keywords (`from`, `at`) make parsing unambiguous.

```css
/* Linear: AMBIGUOUS */
linear-gradient(var(--x), red, blue)
/* Could be: direction OR color */

/* Conic: UNAMBIGUOUS */
conic-gradient(var(--x), red, blue)
/* Must be: color (no "from" keyword) */

conic-gradient(from var(--x), red, blue)
/* Must be: angle ("from" keyword present) */
```

**No need for lookahead or disambiguation utility.**

---

## 📋 Implementation Plan

### Phase 1: Test Structure Setup

1. Create `__tests__/conic/` directory
2. Create 7 test files (from-angle, position, color-stops, etc)
3. Set up test templates and patterns

### Phase 2: Core Feature Tests (TDD)

1. Write `from-angle.test.ts` (~60 tests)
2. Write `position.test.ts` (~60 tests)
3. Write `color-stops.test.ts` (~50 tests)

### Phase 3: Advanced & Edge Cases

4. Write `color-interpolation.test.ts` (~20 tests)
5. Write `combinations.test.ts` (~25 tests)
6. Write `edge-cases.test.ts` (~20 tests)
7. Write `error-handling.test.ts` (~15 tests)

### Phase 4: Verification

- Run all tests (expect 1489 + ~250 = ~1740 total)
- Run quality checks (`just check && just build`)
- Update session handover
- Archive intel doc

**Expected Time:** 2-3 hours

**Expected Result:** ~250 new tests, 100% passing, comprehensive coverage

---

## 🚀 Ready to Execute

**Status:** Intel gathering complete ✅

**Next:** Create test file structure and begin TDD

**Pattern:** Follow sessions 032-034 (proven successful)

**Goal:** Conic gradient parser with radial/linear-level test coverage
