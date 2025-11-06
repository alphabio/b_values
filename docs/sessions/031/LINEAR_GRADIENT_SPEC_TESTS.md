# Linear Gradient Spec-Based Testing Plan

**Date:** 2025-11-06
**Goal:** Use CSS grammar to create comprehensive tests for linear-gradient
**Approach:** Start with generate, validate model matches spec, then add parse tests

---

## 📝 CSS Grammar Analysis

### Linear Gradient Syntax

```
<linear-gradient()> = 
  linear-gradient( [ <linear-gradient-syntax> ] )  

<linear-gradient-syntax> = 
  [ [ <angle> | <zero> | to <side-or-corner> ] || <color-interpolation-method> ]? , <color-stop-list>  
```

### Key Components to Test

1. **Direction (optional):**
   - `<angle>` - any angle value
   - `<zero>` - literal 0
   - `to <side-or-corner>` - keyword directions

2. **Color Interpolation Method (optional):**
   - Rectangular color spaces (srgb, display-p3, lab, oklab, etc.)
   - Polar color spaces (hsl, hwb, lch, oklch) with optional hue interpolation
   - Custom color spaces (dashed-ident)

3. **Color Stop List (required):**
   - At least 2 color stops
   - Optional color hints between stops
   - Each stop: color + optional 1-2 positions

---

## 🎯 Phase 1: Model Validation

### Current Type Schema Check

Location: `packages/b_types/src/gradient/linear.ts`

**Expected fields:**
```typescript
{
  kind: "linear"
  direction?: GradientDirection  // <angle> | to <side-or-corner>
  colorInterpolationMethod?: ColorInterpolationMethod
  colorStops: ColorStop[]  // minimum 2
  repeating: boolean
}
```

**Questions to answer:**
1. ✅ Does `GradientDirection` support all direction types?
   - angle values
   - `to <side-or-corner>` keywords
2. ✅ Does `ColorInterpolationMethod` match spec?
   - All rectangular spaces
   - All polar spaces + hue interpolation
   - Custom spaces (dashed-ident)
3. ✅ Does `ColorStop` support 0, 1, or 2 positions?
4. ❓ Are color hints modeled? (between stop positions)

---

## 🧪 Phase 2: Generator Test Matrix

### Test Structure

For each combination, generate CSS and verify:
1. Valid syntax
2. Matches expected pattern
3. Can be parsed back

### Test Cases by Grammar Rule

#### 1. Direction Variants (8 tests)

```typescript
// No direction (default)
{ kind: "linear", colorStops: [...], repeating: false }
// → "linear-gradient(red, blue)"

// Angle values
{ direction: { kind: "angle", value: { kind: "literal", value: 45, unit: "deg" } }, ... }
// → "linear-gradient(45deg, red, blue)"

{ direction: { kind: "angle", value: { kind: "literal", value: 0.25, unit: "turn" } }, ... }
// → "linear-gradient(0.25turn, red, blue)"

// Side keywords (4 tests)
{ direction: { kind: "to-side", value: "top" }, ... }
// → "linear-gradient(to top, red, blue)"

// Corner keywords (4 tests)  
{ direction: { kind: "to-corner", value: "top left" }, ... }
// → "linear-gradient(to top left, red, blue)"
```

#### 2. Color Interpolation Methods (20+ tests)

```typescript
// Rectangular spaces (9 tests)
{ colorInterpolationMethod: { colorSpace: "srgb" }, ... }
// → "linear-gradient(in srgb, red, blue)"

{ colorInterpolationMethod: { colorSpace: "display-p3" }, ... }
{ colorInterpolationMethod: { colorSpace: "lab" }, ... }
{ colorInterpolationMethod: { colorSpace: "oklab" }, ... }
// ... etc for all rectangular spaces

// Polar spaces without hue (4 tests)
{ colorInterpolationMethod: { colorSpace: "hsl" }, ... }
// → "linear-gradient(in hsl, red, blue)"

// Polar spaces with hue interpolation (16 tests = 4 spaces × 4 methods)
{ colorInterpolationMethod: { colorSpace: "hsl", hueInterpolation: "shorter" }, ... }
// → "linear-gradient(in hsl shorter hue, red, blue)"

{ colorInterpolationMethod: { colorSpace: "oklch", hueInterpolation: "longer" }, ... }
// → "linear-gradient(in oklch longer hue, red, blue)"

// xyz-space variants (3 tests)
{ colorInterpolationMethod: { colorSpace: "xyz" }, ... }
{ colorInterpolationMethod: { colorSpace: "xyz-d50" }, ... }
{ colorInterpolationMethod: { colorSpace: "xyz-d65" }, ... }
```

#### 3. Color Stops (15+ tests)

```typescript
// Basic: 2 stops, no positions
{ 
  colorStops: [
    { color: { kind: "named", value: "red" } },
    { color: { kind: "named", value: "blue" } }
  ] 
}
// → "linear-gradient(red, blue)"

// With single position
{ 
  colorStops: [
    { color: { kind: "named", value: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
    { color: { kind: "named", value: "blue" }, position: { kind: "literal", value: 100, unit: "%" } }
  ] 
}
// → "linear-gradient(red 0%, blue 100%)"

// With double position (color band)
{ 
  colorStops: [
    { color: { kind: "named", value: "red" }, position: { kind: "list", values: [20%, 40%] } },
    { color: { kind: "named", value: "blue" } }
  ] 
}
// → "linear-gradient(red 20% 40%, blue)"

// 3+ stops
{ colorStops: [red, yellow, green, blue] }
// → "linear-gradient(red, yellow, green, blue)"

// Mixed: some with positions, some without
{ colorStops: [red, yellow 30%, green, blue 90%] }

// All color types
{ color: { kind: "hex", value: "#ff0000" } }
{ color: { kind: "rgb", r: 255, g: 0, b: 0 } }
{ color: { kind: "hsl", h: 0, s: 100, l: 50 } }
{ color: { kind: "lch", l: 50, c: 100, h: 0 } }
// ... etc
```

#### 4. Combinations (10+ tests)

```typescript
// Direction + interpolation
{ 
  direction: { kind: "angle", value: 45deg },
  colorInterpolationMethod: { colorSpace: "oklab" },
  colorStops: [...]
}
// → "linear-gradient(45deg in oklab, red, blue)"

// All features
{
  direction: { kind: "to-corner", value: "bottom right" },
  colorInterpolationMethod: { colorSpace: "oklch", hueInterpolation: "shorter" },
  colorStops: [
    { color: { kind: "named", value: "red" }, position: 0% },
    { color: { kind: "named", value: "blue" }, position: 100% }
  ],
  repeating: false
}
// → "linear-gradient(to bottom right in oklch shorter hue, red 0%, blue 100%)"

// Repeating variant
{ ...sameAsAbove, repeating: true }
// → "repeating-linear-gradient(...)"
```

#### 5. Edge Cases (10+ tests)

```typescript
// Minimum: 2 stops
{ colorStops: [red, blue] }

// Maximum: 100+ stops (stress test)
{ colorStops: [red, orange, yellow, ..., blue] } // 100 stops

// var() in all positions
{ 
  direction: { kind: "angle", value: { kind: "variable", name: "--angle" } },
  colorStops: [
    { color: { kind: "variable", name: "--color-1" } },
    { color: { kind: "variable", name: "--color-2" } }
  ]
}

// calc() in positions
{
  colorStops: [
    { color: red, position: { kind: "calc", value: "10% + 5px" } },
    { color: blue }
  ]
}

// Transparent colors
{ colorStops: [red, { kind: "keyword", value: "transparent" }] }

// All angle units
{ direction: { kind: "angle", value: { value: 45, unit: "deg" } } }
{ direction: { kind: "angle", value: { value: 0.5, unit: "turn" } } }
{ direction: { kind: "angle", value: { value: 100, unit: "grad" } } }
{ direction: { kind: "angle", value: { value: 1.57, unit: "rad" } } }
```

---

## 🔧 Implementation Plan

### Step 1: Audit Current Model (30 min)

```bash
# Check type schemas
cat packages/b_types/src/gradient/linear.ts
cat packages/b_types/src/gradient/direction.ts
cat packages/b_types/src/color-stop.ts
cat packages/b_types/src/color-interpolation-method.ts

# Questions:
# 1. Do we model color hints? (between-stop positions)
# 2. Does direction support all angle units?
# 3. Does ColorInterpolationMethod have all color spaces?
# 4. Does ColorStop support 0, 1, 2 positions correctly?
```

### Step 2: Create Generator Test Suite (2 hours)

```typescript
// packages/b_generators/src/gradient/linear.spec-tests.ts

describe("Linear Gradient Generator - Spec Compliance", () => {
  describe("Direction Variants", () => {
    test("no direction (default to bottom)", () => { ... });
    test("angle in degrees", () => { ... });
    test("angle in turns", () => { ... });
    test("angle in grads", () => { ... });
    test("angle in radians", () => { ... });
    test("to top", () => { ... });
    test("to bottom right", () => { ... });
    // ... all 8 tests
  });

  describe("Color Interpolation Methods", () => {
    describe("Rectangular Color Spaces", () => {
      test("in srgb", () => { ... });
      test("in display-p3", () => { ... });
      // ... all rectangular spaces
    });

    describe("Polar Color Spaces", () => {
      test("in hsl", () => { ... });
      test("in hsl shorter hue", () => { ... });
      // ... all polar spaces with hue variants
    });

    describe("XYZ Spaces", () => {
      test("in xyz", () => { ... });
      test("in xyz-d50", () => { ... });
      test("in xyz-d65", () => { ... });
    });
  });

  describe("Color Stops", () => {
    test("2 stops without positions", () => { ... });
    test("2 stops with single positions", () => { ... });
    test("stops with double positions (color bands)", () => { ... });
    test("3+ stops", () => { ... });
    test("mixed positions", () => { ... });
    // ... test all color types
  });

  describe("Combinations", () => {
    test("direction + interpolation", () => { ... });
    test("all features combined", () => { ... });
    test("repeating variant", () => { ... });
  });

  describe("Edge Cases", () => {
    test("var() in direction", () => { ... });
    test("calc() in positions", () => { ... });
    test("100+ color stops", () => { ... });
    test("transparent colors", () => { ... });
  });

  describe("Round-trip", () => {
    test("generate → parse → generate produces same CSS", () => { ... });
  });
});
```

### Step 3: Run Tests & Fix Gaps (variable)

```bash
# Run new tests
pnpm test packages/b_generators/src/gradient/linear.spec-tests.ts

# For each failing test:
# 1. Determine if it's a model issue or generator issue
# 2. Fix the code
# 3. Re-run tests
# 4. Document any spec deviations
```

### Step 4: Create Parser Test Suite (2 hours)

Mirror the generator tests but for parsing:

```typescript
// packages/b_parsers/src/gradient/linear.spec-tests.ts

describe("Linear Gradient Parser - Spec Compliance", () => {
  describe("Direction Parsing", () => {
    test("45deg", () => {
      const result = parseLinearGradient("linear-gradient(45deg, red, blue)");
      expect(result.ok).toBe(true);
      expect(result.value.direction).toEqual({ kind: "angle", ... });
    });
    // ... all direction variants
  });

  describe("Color Interpolation Method Parsing", () => {
    test("in oklab", () => {
      const result = parseLinearGradient("linear-gradient(in oklab, red, blue)");
      expect(result.ok).toBe(true);
      expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "oklab" });
    });
    // ... all interpolation methods
  });

  // ... mirror all generator tests
});
```

### Step 5: Document Findings (30 min)

Create an ADR or report documenting:
- ✅ What works perfectly
- ⚠️ What has issues
- ❌ What's missing from the model
- 📝 Any intentional spec deviations
- 🔮 Future enhancements needed

---

## 📊 Expected Outcomes

After completing this plan:

✅ **~100+ generator tests** covering all grammar combinations
✅ **~100+ parser tests** mirroring generator tests
✅ **Model validated** against CSS spec
✅ **Gaps identified** and documented
✅ **Round-trip tested** for all variants
✅ **Production-ready** linear gradient support

---

## 🚀 Quick Start Commands

```bash
# Create the test file
touch packages/b_generators/src/gradient/linear.spec-tests.ts

# Run just linear gradient tests
pnpm test linear.spec-tests

# Run all gradient tests
pnpm test gradient

# Check current test coverage
pnpm test --coverage packages/b_generators/src/gradient/
```

---

## 📝 Next: Radial & Conic

Once linear is complete, repeat this process for:
- `radial-gradient()` - similar approach with shape/size/position variants
- `conic-gradient()` - similar approach with from-angle/position variants

Each gradient type gets its own `.spec-tests.ts` file with exhaustive coverage.

---

**Ready to start with linear-gradient generator tests!** 🚀
