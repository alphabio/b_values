# Linear Gradient Test Implementation Plan

**Date:** 2025-11-06  
**Goal:** Implement comprehensive linear gradient tests with zero guesswork  
**Status:** 📋 Planning Complete - Ready to Execute

---

## 📊 Intelligence Gathered

### Existing Test Structure

**3 Test Layers:**
1. **b_types** - Schema validation tests (7 tests in `linear.test.ts`)
2. **b_parsers** - Parse CSS → IR (8 tests in `linear.test.ts`)
3. **b_generators** - Generate IR → CSS (6 tests in `linear.test.ts`)

**Current Coverage:** 21 tests total for linear gradients

**Test Pattern:**
```typescript
// Parser test
const css = "linear-gradient(45deg, red, blue)";
const result = Linear.parse(css);
expect(result.ok).toBe(true);
if (result.ok) {
  expect(result.value.direction).toEqual(...);
}

// Generator test
const ir: Type.LinearGradient = { ... };
const result = Linear.generate(ir);
expect(result.ok).toBe(true);
if (result.ok) {
  expect(result.value).toBe("linear-gradient(45deg, red, blue)");
}
```

**No parameterized tests found** - using traditional `it()` blocks

---

## 🎯 Test Categories & Counts

### 1. Direction Tests (35 tests)

**Angle Units (8 tests):**
- deg: `45deg`, `0deg`, `180deg`, `360deg`
- turn: `0.25turn`, `0.5turn`, `1turn`
- grad: `100grad`, `200grad`
- rad: `1.57rad`, `3.14rad`

**To-Side (4 tests):**
- `to top`
- `to right`
- `to bottom`
- `to left`

**To-Corner (4 tests):**
- `to top left`
- `to top right`
- `to bottom left`
- `to bottom right`

**Default/Missing (2 tests):**
- No direction specified (defaults to `to bottom`)
- Zero angle: `0deg` vs `0`

**Dynamic Values (5 tests):**
- `var(--angle)`
- `calc(45deg + 10deg)`
- `min(45deg, var(--max))`
- `max(0deg, var(--min))`
- `clamp(0deg, 45deg, 90deg)`

**Invalid Cases (12 tests):**
- Invalid angle: `45px` (should fail)
- Invalid side: `to center`
- Invalid corner: `to left top` (wrong order)
- Invalid corner: `to top center`
- Malformed: `to`
- Malformed: `to to top`
- Multiple directions: `45deg to top`
- Empty string direction
- Non-angle units: `45em`, `45%`
- Negative angles: `-45deg` (should parse, but test behavior)
- Very large angles: `999999deg`
- Floating point precision: `45.123456789deg`

---

### 2. Color Interpolation Tests (32 tests)

**Rectangular Spaces (12 tests):**
- `in srgb`
- `in srgb-linear`
- `in display-p3`
- `in display-p3-linear`
- `in a98-rgb`
- `in prophoto-rgb`
- `in rec2020`
- `in lab`
- `in oklab`
- `in xyz`
- `in xyz-d50`
- `in xyz-d65`

**Polar Spaces - No Hue Method (4 tests):**
- `in hsl`
- `in hwb`
- `in lch`
- `in oklch`

**Polar Spaces - With Hue Method (16 tests = 4 spaces × 4 methods):**
- `in hsl shorter hue`
- `in hsl longer hue`
- `in hsl increasing hue`
- `in hsl decreasing hue`
- (repeat for hwb, lch, oklch)

---

### 3. Color Stop Tests (28 tests)

**Basic Structures (6 tests):**
- 2 stops, no positions
- 2 stops, single positions
- 3 stops, mixed positions
- 5 stops, various positions
- 10 stops (stress test)
- 100+ stops (extreme stress test)

**Position Variations (8 tests):**
- Percentage positions: `red 0%, blue 100%`
- Length positions: `red 0px, blue 100px`
- Mixed units: `red 10px, blue 50%`
- Double positions (color bands): `red 20% 40%, blue`
- All double positions: `red 0% 25%, blue 25% 75%, green 75% 100%`
- Out of order: `red 50%, blue 0%` (should parse)
- Negative positions: `red -10%`
- Over 100%: `red 150%`

**Color Type Coverage (10 tests):**
- Named: `red`, `blue`, `transparent`
- Hex: `#ff0000`, `#f00`, `#ff0000ff`
- RGB: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
- HSL: `hsl(0, 100%, 50%)`
- LCH: `lch(50% 100 0)`
- OKLCH: `oklch(0.5 0.2 0)`
- LAB: `lab(50% 100 0)`
- OKLAB: `oklab(0.5 0.2 0)`
- HWB: `hwb(0 0% 0%)`
- Special: `currentColor`

**Dynamic Values in Stops (4 tests):**
- `var(--color-1)`
- Position with var: `red var(--position)`
- Position with calc: `red calc(50% - 10px)`
- All dynamic: `var(--c1) var(--p1), var(--c2) var(--p2)`

---

### 4. Combination Tests (15 tests)

**Feature Combinations:**
- Direction + interpolation: `45deg in oklch, red, blue`
- Direction + positions: `to right, red 0%, blue 100%`
- Interpolation + positions: `in srgb, red 0%, blue 100%`
- All features: `to top right in oklch shorter hue, red 0%, blue 50%, green 100%`
- Repeating + direction: `repeating-linear-gradient(45deg, red, blue)`
- Repeating + positions: `repeating-linear-gradient(red 0px, blue 20px)`
- Repeating + interpolation: `repeating-linear-gradient(in srgb, red, blue)`
- Dynamic direction + stops: `var(--angle), var(--c1), var(--c2)`
- Complex real-world gradients (5+ combinations)

---

### 5. Round-Trip Tests (12 tests)

**Coverage:**
- Simple gradient: `red, blue`
- With angle: `45deg, red, blue`
- With to-side: `to right, red, blue`
- With to-corner: `to top left, red, blue`
- With interpolation: `in oklch, red, blue`
- With positions: `red 0%, blue 100%`
- With double positions: `red 0% 25%, blue 75% 100%`
- Repeating variant: `repeating-linear-gradient(...)`
- All features combined
- Dynamic values preserved: `var(--angle), var(--c1), calc(50%)`
- Complex gradient with 5+ stops
- Edge case: very long gradient

---

### 6. Edge Cases & Error Handling (20 tests)

**Boundary Cases:**
- Single color stop (should fail - min 2 required)
- Empty color stops array (should fail)
- 100+ color stops (should succeed but stress test)
- Very long CSS string (10KB+)

**Whitespace Handling:**
- Extra spaces: `linear-gradient(  45deg  ,  red  ,  blue  )`
- No spaces: `linear-gradient(45deg,red,blue)`
- Newlines in gradient
- Tabs vs spaces

**Invalid Syntax:**
- Missing commas: `linear-gradient(red blue)`
- Extra commas: `linear-gradient(red,, blue)`
- Trailing comma: `linear-gradient(red, blue,)`
- Missing function name: `(red, blue)`
- Unclosed function: `linear-gradient(red, blue`
- Wrong function: `radial-gradient(45deg, red, blue)` (angle invalid for radial)

**Type Mismatches:**
- String instead of number in IR
- Missing required fields
- Extra fields in strict mode
- Wrong kind field

**Parser Recovery:**
- Partial parse success (some stops fail)
- Continue parsing after error
- Issue collection

---

## 📁 File Structure

### New Test Files to Create

```
packages/b_parsers/src/gradient/
├── linear.test.ts                    (exists - 8 tests)
└── linear.spec.test.ts               (NEW - comprehensive suite)

packages/b_generators/src/gradient/
├── linear.test.ts                    (exists - 6 tests)
└── linear.spec.test.ts               (NEW - comprehensive suite)

packages/b_types/src/gradient/
├── linear.test.ts                    (exists - 7 tests)
└── (no new file - schema tests adequate)
```

**Naming Convention:** `.spec.test.ts` for comprehensive spec-driven tests

---

## 🛠️ Implementation Strategy

### Phase 1: Generator Tests (2 hours)

**File:** `packages/b_generators/src/gradient/linear.spec.test.ts`

**Structure:**
```typescript
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Linear from "./linear";

describe("Linear Gradient Generator - Spec Compliance", () => {
  describe("Direction Variants", () => {
    describe("Angle Units", () => {
      it("generates with degrees", () => { ... });
      it("generates with turns", () => { ... });
      it("generates with grads", () => { ... });
      it("generates with radians", () => { ... });
    });
    
    describe("To-Side Keywords", () => {
      it("generates 'to top'", () => { ... });
      // ... all 4 sides
    });
    
    describe("To-Corner Keywords", () => {
      it("generates 'to top left'", () => { ... });
      // ... all 4 corners
    });
    
    describe("Dynamic Values", () => {
      it("generates with var() in direction", () => { ... });
      it("generates with calc() in direction", () => { ... });
    });
  });

  describe("Color Interpolation Methods", () => {
    describe("Rectangular Color Spaces", () => {
      it("generates 'in srgb'", () => { ... });
      // ... all 12 rectangular spaces
    });
    
    describe("Polar Color Spaces", () => {
      it("generates 'in hsl'", () => { ... });
      it("generates 'in hsl shorter hue'", () => { ... });
      // ... all 20 polar combinations
    });
  });

  describe("Color Stops", () => {
    describe("Basic Structures", () => { ... });
    describe("Position Variations", () => { ... });
    describe("Color Type Coverage", () => { ... });
    describe("Dynamic Values", () => { ... });
  });

  describe("Feature Combinations", () => { ... });

  describe("Round-Trip", () => {
    it("parse → generate → parse produces identical IR", () => { ... });
  });
});
```

**Utilities to Use:**
- `Type.LinearGradient` from `@b/types`
- `Linear.generate()` function
- Standard vitest matchers: `toBe()`, `toEqual()`, `toHaveLength()`

**Test Template:**
```typescript
it("generates gradient with X", () => {
  const ir: Type.LinearGradient = {
    kind: "linear",
    // ... IR structure
    colorStops: [
      { color: { kind: "named", name: "red" } },
      { color: { kind: "named", name: "blue" } }
    ],
    repeating: false
  };
  
  const result = Linear.generate(ir);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toBe("linear-gradient(...)");
  }
});
```

---

### Phase 2: Parser Tests (1.5 hours)

**File:** `packages/b_parsers/src/gradient/linear.spec.test.ts`

**Structure:** Mirrors generator tests exactly

```typescript
import { describe, it, expect } from "vitest";
import * as Linear from "./linear";
import * as Generate from "@b/generators";

describe("Linear Gradient Parser - Spec Compliance", () => {
  describe("Direction Parsing", () => {
    describe("Angle Units", () => {
      it("parses degrees", () => {
        const css = "linear-gradient(45deg, red, blue)";
        const result = Linear.parse(css);
        
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.direction).toEqual({
            kind: "angle",
            value: { kind: "literal", value: 45, unit: "deg" }
          });
        }
      });
      // ... mirror all generator tests
    });
  });

  describe("Error Handling", () => {
    it("fails with single color stop", () => {
      const css = "linear-gradient(red)";
      const result = Linear.parse(css);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]?.code).toBe("invalid-value");
      }
    });
  });

  describe("Round-Trip", () => {
    it("parse → generate → parse produces identical IR", () => {
      const css = "linear-gradient(45deg in oklch, red 0%, blue 100%)";
      
      // Parse 1
      const parse1 = Linear.parse(css);
      expect(parse1.ok).toBe(true);
      if (!parse1.ok) return;
      
      // Generate
      const gen = Generate.Gradient.Linear.generate(parse1.value);
      expect(gen.ok).toBe(true);
      if (!gen.ok) return;
      
      // Parse 2
      const parse2 = Linear.parse(gen.value);
      expect(parse2.ok).toBe(true);
      if (!parse2.ok) return;
      
      // Compare IRs
      expect(parse2.value).toEqual(parse1.value);
    });
  });
});
```

---

### Phase 3: Run & Validate (30 min)

```bash
# Run new generator tests
pnpm test packages/b_generators/src/gradient/linear.spec.test.ts

# Run new parser tests
pnpm test packages/b_parsers/src/gradient/linear.spec.test.ts

# Run all linear gradient tests
pnpm test linear

# Coverage report
pnpm test --coverage packages/b_generators/src/gradient/linear
pnpm test --coverage packages/b_parsers/src/gradient/linear
```

**Expected Outcome:**
- ~142 total tests (21 existing + ~60 generator + ~61 parser)
- All tests passing ✅
- Coverage >95% for linear gradient code
- Zero gaps in spec compliance

---

### Phase 4: Documentation (30 min)

Update `SESSION_HANDOVER.md`:
- Test count: 21 → 142
- Coverage: basic → comprehensive
- Spec compliance: validated
- Missing features: documented
- Known issues: documented

---

## 📊 Test Count Summary

| Category | Generator | Parser | Total |
|----------|-----------|--------|-------|
| Direction | 35 | 35 | 70 |
| Color Interpolation | 32 | 32 | 64 |
| Color Stops | 28 | 28 | 56 |
| Combinations | 15 | 15 | 30 |
| Round-Trip | 6 | 6 | 12 |
| Edge Cases | 10 | 20 | 30 |
| **TOTAL NEW** | **126** | **136** | **262** |
| **Existing** | 6 | 8 | 14 |
| **GRAND TOTAL** | **132** | **144** | **276** |

**Note:** Some tests may overlap (round-trip tests both parse and generate)

---

## 🎨 IR Construction Utilities

**Color Helpers:**
```typescript
const namedColor = (name: string): Type.Color => ({ kind: "named", name });
const hexColor = (value: string): Type.Color => ({ kind: "hex", value });
const rgbColor = (r: number, g: number, b: number): Type.Color => 
  ({ kind: "rgb", r, g, b });
```

**Position Helpers:**
```typescript
const pct = (value: number): Type.CssValue => 
  ({ kind: "literal", value, unit: "%" });
const px = (value: number): Type.CssValue => 
  ({ kind: "literal", value, unit: "px" });
const deg = (value: number): Type.CssValue => 
  ({ kind: "literal", value, unit: "deg" });
```

**Gradient Helpers:**
```typescript
const linearGradient = (overrides: Partial<Type.LinearGradient>): Type.LinearGradient => ({
  kind: "linear",
  colorStops: [namedColor("red"), namedColor("blue")],
  repeating: false,
  ...overrides
});
```

**Consider adding these to a helper file if reused extensively.**

---

## ⚠️ Potential Issues to Watch For

1. **Floating Point Precision:**
   - Test with: `45.123456789deg`
   - Expect: May round to fewer decimal places
   - Action: Document rounding behavior

2. **Color Format Preservation:**
   - Test: Parse `#f00` → generate → should stay `#f00` (not `#ff0000`)
   - Current: May convert formats
   - Action: Verify current behavior, document

3. **Whitespace Normalization:**
   - Test: Parse with extra spaces → generate → normalized
   - Expect: Generator produces canonical format
   - Action: Document canonical format rules

4. **Angle Normalization:**
   - Test: `360deg` → may normalize to `0deg`
   - Test: `450deg` → may normalize to `90deg`
   - Action: Check if normalization happens, document

5. **var() Preservation:**
   - Critical: `var(--angle)` must stay `var(--angle)` in IR
   - Test extensively: direction, positions, colors
   - Action: Verify CssValue preserves variable references

---

## 🚀 Execution Checklist

- [ ] Create `linear.spec.test.ts` in generators
- [ ] Implement 126 generator tests (grouped by category)
- [ ] Run generator tests - all pass
- [ ] Create `linear.spec.test.ts` in parsers
- [ ] Implement 136 parser tests (mirror + error handling)
- [ ] Run parser tests - all pass
- [ ] Run all gradient tests together
- [ ] Check coverage report (target >95%)
- [ ] Document any spec deviations found
- [ ] Document any bugs discovered
- [ ] Update SESSION_HANDOVER.md
- [ ] Commit with message: `test(gradients): add comprehensive linear gradient spec tests`

---

**Status:** 📋 Plan complete - ready to execute
**Estimated Time:** 4-5 hours total
**Expected Outcome:** Production-ready linear gradient support with full spec compliance

