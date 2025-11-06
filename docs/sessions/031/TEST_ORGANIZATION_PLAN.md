# Linear Gradient Test Organization Plan

**Date:** 2025-11-06  
**Revision:** v2 - Organized with `__tests__` directories
**Goal:** Manageable test files (~200 lines each max)

---

## 📁 Proposed Directory Structure

### Generators

```
packages/b_generators/src/gradient/
├── linear.ts                           (4120 lines - implementation)
├── linear.test.ts                      (3459 lines - keep existing basic tests)
└── __tests__/
    └── linear/
        ├── direction.test.ts           (~200 lines - 35 tests)
        ├── color-interpolation.test.ts (~250 lines - 32 tests)
        ├── color-stops.test.ts         (~300 lines - 28 tests)
        ├── combinations.test.ts        (~150 lines - 15 tests)
        ├── round-trip.test.ts          (~150 lines - 12 tests)
        └── edge-cases.test.ts          (~100 lines - 10 tests)
```

**Total Generator Tests:** 6 existing + 132 new = **138 tests**

---

### Parsers

```
packages/b_parsers/src/gradient/
├── linear.ts                           (5525 lines - implementation)
├── linear.test.ts                      (3739 lines - keep existing basic tests)
└── __tests__/
    └── linear/
        ├── direction.test.ts           (~200 lines - 35 tests)
        ├── color-interpolation.test.ts (~250 lines - 32 tests)
        ├── color-stops.test.ts         (~300 lines - 28 tests)
        ├── combinations.test.ts        (~150 lines - 15 tests)
        ├── round-trip.test.ts          (~150 lines - 12 tests)
        ├── edge-cases.test.ts          (~150 lines - 14 tests)
        └── error-handling.test.ts      (~100 lines - 6 tests)
```

**Total Parser Tests:** 8 existing + 142 new = **150 tests**

---

## 📊 File Breakdown

### 1. Direction Tests (~35 tests, ~200 lines)

**File:** `__tests__/linear/direction.test.ts`

**Categories:**

- Angle units (deg, turn, grad, rad)
- To-side keywords (4 variations)
- To-corner keywords (4 variations)
- Default/no direction
- Dynamic values (var, calc, min, max, clamp)

**Size justification:** ~6 lines per test average

---

### 2. Color Interpolation Tests (~32 tests, ~250 lines)

**File:** `__tests__/linear/color-interpolation.test.ts`

**Categories:**

- Rectangular color spaces (12 tests)
- Polar color spaces without hue (4 tests)
- Polar color spaces with hue methods (16 tests)

**Size justification:** ~8 lines per test (slightly more complex IR)

---

### 3. Color Stop Tests (~28 tests, ~300 lines)

**File:** `__tests__/linear/color-stops.test.ts`

**Categories:**

- Basic structures (2, 3, 5, 10, 100+ stops)
- Position variations (percentage, length, mixed, double positions)
- Color type coverage (named, hex, rgb, hsl, lch, oklch, etc.)
- Dynamic values (var, calc in positions)

**Size justification:** ~11 lines per test (more complex stop arrays)

---

### 4. Combination Tests (~15 tests, ~150 lines)

**File:** `__tests__/linear/combinations.test.ts`

**Categories:**

- Direction + interpolation
- Direction + positions
- Interpolation + positions
- All features combined
- Repeating variants

**Size justification:** ~10 lines per test (complex IR structures)

---

### 5. Round-Trip Tests (~12 tests, ~150 lines)

**File:** `__tests__/linear/round-trip.test.ts`

**Categories:**

- Simple gradients
- All direction types
- With interpolation
- With positions
- Complex real-world examples

**Size justification:** ~13 lines per test (parse → gen → parse pattern)

---

### 6. Edge Cases (~10-14 tests, ~100-150 lines)

**File:** `__tests__/linear/edge-cases.test.ts` (generators)  
**File:** `__tests__/linear/error-handling.test.ts` (parsers)

**Categories:**

- Boundary conditions (very long, many stops)
- Whitespace handling
- Floating point precision
- Angle normalization

**Size justification:** ~10 lines per test

---

## 🛠️ Implementation Strategy

### Phase 1: Directory Setup (5 min)

```bash
# Generators
mkdir -p packages/b_generators/src/gradient/__tests__/linear

# Parsers
mkdir -p packages/b_parsers/src/gradient/__tests__/linear
```

---

### Phase 2: Create Test Files (30 min)

**Order of implementation:**

1. **Direction tests** (foundation)
   - Generators: `__tests__/linear/direction.test.ts`
   - Parsers: `__tests__/linear/direction.test.ts`

2. **Color interpolation tests**
   - Generators: `__tests__/linear/color-interpolation.test.ts`
   - Parsers: `__tests__/linear/color-interpolation.test.ts`

3. **Color stop tests**
   - Generators: `__tests__/linear/color-stops.test.ts`
   - Parsers: `__tests__/linear/color-stops.test.ts`

4. **Combination tests**
   - Generators: `__tests__/linear/combinations.test.ts`
   - Parsers: `__tests__/linear/combinations.test.ts`

5. **Round-trip tests**
   - Generators: `__tests__/linear/round-trip.test.ts`
   - Parsers: `__tests__/linear/round-trip.test.ts`

6. **Edge/error tests**
   - Generators: `__tests__/linear/edge-cases.test.ts`
   - Parsers: `__tests__/linear/error-handling.test.ts`

---

### Phase 3: Implement Tests (3-4 hours)

**Per file workflow:**

1. Create file with proper imports
2. Add describe block with category name
3. Implement tests from TEST_IMPLEMENTATION_PLAN
4. Run tests: `pnpm test <file>`
5. Fix any failures
6. Move to next file

**Incremental validation** - tests pass as we go!

---

### Phase 4: Validate & Document (30 min)

```bash
# Run all linear gradient tests
pnpm test linear

# Run specific test directories
pnpm test "**/__tests__/linear/**"

# Coverage report
pnpm test --coverage packages/b_generators/src/gradient/
pnpm test --coverage packages/b_parsers/src/gradient/
```

---

## 📋 File Templates

### Generator Test Template

**File:** `packages/b_generators/src/gradient/__tests__/linear/direction.test.ts`

```typescript
// b_path:: packages/b_generators/src/gradient/__tests__/linear/direction.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Linear from "../../linear";

describe("Linear Gradient Generator - Direction", () => {
  describe("Angle Units", () => {
    it("generates with degrees", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 45, unit: "deg" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(45deg, red, blue)");
      }
    });

    // ... more angle unit tests
  });

  describe("To-Side Keywords", () => {
    it("generates 'to top'", () => {
      /* ... */
    });
    it("generates 'to right'", () => {
      /* ... */
    });
    it("generates 'to bottom'", () => {
      /* ... */
    });
    it("generates 'to left'", () => {
      /* ... */
    });
  });

  describe("To-Corner Keywords", () => {
    it("generates 'to top left'", () => {
      /* ... */
    });
    // ... 3 more corners
  });

  describe("Dynamic Values", () => {
    it("generates with var() in direction", () => {
      /* ... */
    });
    it("generates with calc() in direction", () => {
      /* ... */
    });
    // ... more dynamic value tests
  });
});
```

---

### Parser Test Template

**File:** `packages/b_parsers/src/gradient/__tests__/linear/direction.test.ts`

```typescript
// b_path:: packages/b_parsers/src/gradient/__tests__/linear/direction.test.ts
import { describe, it, expect } from "vitest";
import * as Linear from "../../linear";

describe("Linear Gradient Parser - Direction", () => {
  describe("Angle Units", () => {
    it("parses degrees", () => {
      const css = "linear-gradient(45deg, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({
          kind: "angle",
          value: { kind: "literal", value: 45, unit: "deg" },
        });
        expect(result.value.colorStops).toHaveLength(2);
      }
    });

    // ... more angle unit tests
  });

  describe("To-Side Keywords", () => {
    it("parses 'to top'", () => {
      /* ... */
    });
    // ... 3 more sides
  });

  // ... more describe blocks
});
```

---

## 🎯 Benefits of This Approach

### 1. Maintainability ✅

- Small, focused files (~150-300 lines)
- Easy to find specific test categories
- Clear separation of concerns

### 2. Performance ✅

- Vitest can parallelize test files
- Faster test runs with file-level parallelism
- Can run specific categories: `pnpm test direction.test.ts`

### 3. Collaboration ✅

- Multiple people can work on different test files
- Reduced merge conflicts
- Clear ownership boundaries

### 4. Discoverability ✅

- `__tests__/linear/` clearly shows what's tested
- Test file names match feature categories
- Mirrors TEST_IMPLEMENTATION_PLAN structure

### 5. Consistency ✅

- Follows existing pattern (`background-image/__tests__/`)
- Scales well to radial/conic gradients later
- Clean separation from implementation

---

## 📊 Test Count Summary

| File                        | Tests         | Lines                    | Location                                      |
| --------------------------- | ------------- | ------------------------ | --------------------------------------------- |
| **Generators**              | -             | -                        | -                                             |
| direction.test.ts           | 35            | ~200                     | `b_generators/src/gradient/__tests__/linear/` |
| color-interpolation.test.ts | 32            | ~250                     | "                                             |
| color-stops.test.ts         | 28            | ~300                     | "                                             |
| combinations.test.ts        | 15            | ~150                     | "                                             |
| round-trip.test.ts          | 12            | ~150                     | "                                             |
| edge-cases.test.ts          | 10            | ~100                     | "                                             |
| **Parser**                  | -             | -                        | -                                             |
| direction.test.ts           | 35            | ~200                     | `b_parsers/src/gradient/__tests__/linear/`    |
| color-interpolation.test.ts | 32            | ~250                     | "                                             |
| color-stops.test.ts         | 28            | ~300                     | "                                             |
| combinations.test.ts        | 15            | ~150                     | "                                             |
| round-trip.test.ts          | 12            | ~150                     | "                                             |
| edge-cases.test.ts          | 14            | ~150                     | "                                             |
| error-handling.test.ts      | 6             | ~100                     | "                                             |
| **TOTALS**                  | -             | -                        | -                                             |
| **New test files**          | **12**        | **~2,400 lines**         | -                                             |
| **New tests**               | **274**       | -                        | -                                             |
| **Existing tests**          | **14**        | (keep in linear.test.ts) | -                                             |
| **Grand Total**             | **288 tests** | -                        | -                                             |

---

## ⚠️ File Size Comparison

**Current largest test files:**

- `background-image/generator.test.ts`: 563 lines
- `color/roundtrip.test.ts`: 540 lines
- `color/lch.test.ts`: 330 lines

**Our proposed files:**

- Largest: `color-stops.test.ts` at ~300 lines ✅
- Average: ~200 lines per file ✅
- Well within acceptable range ✅

---

## 🚀 Execution Plan

**Time estimate:** 4-5 hours total

1. **Setup directories** (5 min)
2. **Create generator direction tests** (30 min)
3. **Create generator color-interpolation tests** (30 min)
4. **Create generator color-stops tests** (45 min)
5. **Create generator combinations tests** (20 min)
6. **Create generator round-trip tests** (30 min)
7. **Create generator edge-cases tests** (15 min)
8. **Create parser tests** (1.5 hours - mirror generators)
9. **Run all tests & fix issues** (30 min)
10. **Update documentation** (15 min)

**Ready to proceed with organized approach!** ✅
