# Testing Patterns for CSS Value Library

**Context:** Patterns discovered during comprehensive linear gradient testing (Session 031)

**Purpose:** Document reusable patterns, utilities, and approaches for future test development

---

## 📁 Test Organization Pattern

### Structure

```
packages/{package}/src/
├── {feature}/
│   ├── implementation.ts
│   ├── implementation.test.ts      ← Basic smoke tests
│   └── __tests__/{feature}/        ← Comprehensive tests
│       ├── direction.test.ts
│       ├── color-interpolation.test.ts
│       ├── color-stops.test.ts
│       ├── combinations.test.ts
│       ├── edge-cases.test.ts
│       └── error-handling.test.ts
```

### Benefits

- ✅ **Scalable**: Keeps feature root clean
- ✅ **Organized**: Groups related comprehensive tests
- ✅ **Discoverable**: Clear naming convention
- ✅ **Manageable**: Each file 150-500 lines

### When to Use

- Use `__tests__/` subdirectory when feature has >30 test cases
- Keep simple features with <20 tests co-located
- Mirror structure between parser and generator packages

---

## 🧪 Test File Patterns

### 1. Parser Test Template

```typescript
// b_path:: packages/b_parsers/src/{feature}/__tests__/{aspect}.test.ts
import { describe, it, expect } from "vitest";
import * as Feature from "../../{feature}";

describe("Feature Parser - Aspect", () => {
  describe("Category Name", () => {
    it("parses basic case", () => {
      const css = "feature-value(...)";
      const result = Feature.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.property).toEqual(expectedValue);
      }
    });

    it("parses edge case", () => {
      // Test pattern...
    });
  });

  describe("Dynamic Values", () => {
    it("parses var() in property", () => {
      const css = "feature-value(var(--custom))";
      const result = Feature.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.property).toEqual({
          kind: "variable",
          name: "--custom"
        });
      }
    });

    it("parses calc() in property", () => {
      const css = "feature-value(calc(10px + 5px))";
      const result = Feature.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const value = result.value.property;
        if (value && !Array.isArray(value)) {
          expect(value.kind).toBe("calc");
        }
      }
    });
  });
});
```

### 2. Generator Test Template

```typescript
// b_path:: packages/b_generators/src/{feature}/__tests__/{aspect}.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Feature from "../../{feature}";

describe("Feature Generator - Aspect", () => {
  describe("Category Name", () => {
    it("generates basic case", () => {
      const ir: Type.FeatureType = {
        kind: "feature",
        property: { kind: "literal", value: 42, unit: "px" },
      };

      const result = Feature.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("feature-value(42px)");
      }
    });
  });

  describe("Dynamic Values", () => {
    it("generates var() in property", () => {
      const ir: Type.FeatureType = {
        kind: "feature",
        property: { kind: "variable", name: "--custom" },
      };

      const result = Feature.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("feature-value(var(--custom))");
      }
    });
  });
});
```

---

## 🔍 Common Test Categories

### Standard Test Suite Structure

1. **Basic Structures** - Simple, common cases
2. **Value Variations** - Different units, formats, types
3. **Dynamic Values** - var(), calc(), clamp(), min(), max()
4. **Combinations** - Multiple features together
5. **Edge Cases** - Boundary conditions, stress tests
6. **Error Handling** - Invalid input, validation

### Gradient-Specific Categories (Reusable Pattern)

1. **Direction Tests**
   - All angle units (deg, turn, grad, rad)
   - Keyword directions (to-side, to-corner)
   - Dynamic values (var, calc)

2. **Color Interpolation Tests**
   - Rectangular color spaces (srgb, display-p3, lab, etc.)
   - Polar color spaces (hsl, lch, oklch)
   - Hue interpolation methods (shorter, longer, increasing, decreasing)

3. **Color Stop Tests**
   - Basic structures (2, 3, 5+ stops)
   - Position variations (%, px, em, etc.)
   - Double position stops
   - Mixed positioned/non-positioned stops

4. **Combination Tests**
   - Direction + interpolation + stops
   - Repeating variations
   - Complex nested values

5. **Edge Case Tests**
   - 100+ items (stress test)
   - High precision decimals
   - Whitespace variations
   - Case insensitivity

---

## 💡 Type Safety Patterns

### Problem: Array of Named Colors

```typescript
// ❌ BAD - TypeScript error
const colors = ["red", "blue", "green"];
const colorStops = colors.map((name) => ({ 
  color: { kind: "named", name } 
}));
// Error: 'string' is not assignable to named color union
```

### Solution 1: Type Assertion on Array

```typescript
// ✅ GOOD - Use const assertion on array
const colors = ["red", "blue", "green"] as const;
const colorStops = colors.map((name) => ({ 
  color: { kind: "named" as const, name } 
}));
```

### Solution 2: Type Annotation on Function

```typescript
// ✅ GOOD - Type the return value
const colorStops = Array.from({ length: 100 }, (_, i): Type.ColorStop => ({
  color: { kind: "named", name: i % 2 === 0 ? "red" : "blue" },
}));
```

### Problem: Position Array vs Single Value

```typescript
// Position can be single value OR array (double position)
position?: CssValue | CssValue[]

// ❌ BAD - Assumes single value
expect(result.value.colorStops[0].position?.kind).toBe("calc");
```

### Solution: Type Guard

```typescript
// ✅ GOOD - Check if array first
const pos = result.value.colorStops[0].position;
if (pos && !Array.isArray(pos)) {
  expect(pos.kind).toBe("calc");
}

// For double position:
if (pos && Array.isArray(pos)) {
  expect(pos[0]).toEqual({ kind: "literal", value: 20, unit: "%" });
  expect(pos[1]).toEqual({ kind: "literal", value: 40, unit: "%" });
}
```

---

## 🐛 Common Parser Issues & Solutions

### Issue 1: Parser Doesn't Handle Dynamic Values

**Symptom:** Tests fail when using `var()` or `calc()` in expected positions

**Debug Pattern:**

```typescript
// Create debug test
it("debug var()", () => {
  const css = "feature(var(--value))";
  const result = Feature.parse(css);
  console.log("Result:", JSON.stringify(result, null, 2));
});
```

**Solution:** Check if parser handles `Function` node type:

```typescript
// In parser implementation:
if (node.type === "Dimension" || 
    node.type === "Number" || 
    node.type === "Function") {  // ← Add Function support
  const valueResult = parseCssValueNodeEnhanced(node);
  // ...
}
```

### Issue 2: Parser Treats Values as Wrong Type

**Symptom:** Parser succeeds but puts values in wrong field

**Debug Pattern:** Check AST flow - ensure direction/color-interpolation parsed BEFORE color stops

```typescript
// Parser must check special positions BEFORE generic parsing
const firstNode = children[idx];
if (firstNode?.type === "Function" || firstNode?.type === "Dimension") {
  // Try parsing as direction FIRST
  const dirResult = parseDirection(children, idx);
  if (dirResult.ok) {
    direction = dirResult.value.direction;
    idx = dirResult.value.nextIdx;
  }
}
// THEN parse color stops
```

---

## 📊 IR Structure Discoveries

### Common IR Patterns

```typescript
// Literal Values
{ kind: "literal", value: 45, unit: "deg" }
{ kind: "literal", value: 50, unit: "%" }

// Variables
{ kind: "variable", name: "--custom-prop" }
{ kind: "variable", name: "--prop", fallback: {...} }

// Calc
{ 
  kind: "calc", 
  value: {
    kind: "calc-operation",
    operator: "+",
    left: { kind: "literal", value: 10, unit: "px" },
    right: { kind: "literal", value: 5, unit: "px" }
  }
}

// Clamp (has 'preferred' field)
{
  kind: "clamp",
  min: {...},
  preferred: {...},  // ← Note: not 'value'
  max: {...}
}

// Named Colors (strict union type)
{ kind: "named", name: "red" }  // Must be exact color name
```

### Color Interpolation Method

```typescript
// Simple color space
{ colorSpace: "srgb" }

// With hue interpolation (full string)
{ 
  colorSpace: "lch", 
  hueInterpolationMethod: "longer hue"  // ← Full string, not just "longer"
}
```

### Position Handling

```typescript
// Single position
position: { kind: "literal", value: 50, unit: "%" }

// Double position (array!)
position: [
  { kind: "literal", value: 20, unit: "%" },
  { kind: "literal", value: 40, unit: "%" }
]
```

---

## 🧰 Utility Patterns

### Test Data Generation

```typescript
// Generate many test cases
const angles = [
  { value: 0, unit: "deg" },
  { value: 90, unit: "deg" },
  { value: 0.25, unit: "turn" },
  { value: 100, unit: "grad" },
  { value: 1.57, unit: "rad" },
];

for (const angle of angles) {
  it(`parses ${angle.value}${angle.unit}`, () => {
    const css = `linear-gradient(${angle.value}${angle.unit}, red, blue)`;
    // ...
  });
}
```

### Stress Testing

```typescript
// Generate 100+ items
it("handles 100+ items", () => {
  const items = Array.from({ length: 101 }, (_, i): Type.Item => ({
    // Generate item
  }));
  
  const ir: Type.Feature = {
    kind: "feature",
    items: items,
  };
  
  const result = Feature.generate(ir);
  expect(result.ok).toBe(true);
});
```

---

## 📝 Documentation Patterns

### Test File Header

```typescript
// b_path:: packages/{package}/src/{feature}/__tests__/{aspect}.test.ts
import { describe, it, expect } from "vitest";
import * as Feature from "../../{feature}";

describe("{Feature} {Parser|Generator} - {Aspect}", () => {
  // Tests organized by category
});
```

### Test Case Naming

```typescript
// ✅ GOOD - Descriptive, clear intent
it("parses gradient with 100+ color stops")
it("generates 'in oklch shorter hue'")
it("handles whitespace variations")
it("fails on single color stop")

// ❌ BAD - Vague, unclear
it("works")
it("test1")
it("edge case")
```

---

## 🚀 Quick Start Checklist

When creating comprehensive tests for a new feature:

1. **Gather Intel**
   - ✅ Check existing implementation
   - ✅ Review type definitions
   - ✅ Test current behavior with debug tests
   - ✅ Check similar features for patterns

2. **Plan Structure**
   - ✅ Decide on test organization (`__tests__/` subdirectory?)
   - ✅ List test categories needed
   - ✅ Estimate test count per file
   - ✅ Verify test file naming convention

3. **Create Tests**
   - ✅ Start with parser OR generator (not both simultaneously)
   - ✅ Write one category at a time
   - ✅ Run tests frequently (`pnpm test {file}`)
   - ✅ Fix type errors immediately

4. **Quality Gates**
   - ✅ `just test` - All tests passing
   - ✅ `just check` - Format, lint, typecheck
   - ✅ `just build` - Production build
   - ✅ Commit with conventional commit message

---

## 📚 Reference Examples

**Best Examples to Study:**

- `packages/b_parsers/src/gradient/__tests__/linear/` - Parser tests
- `packages/b_generators/src/gradient/__tests__/linear/` - Generator tests
- Session 031 documents in `docs/sessions/031/`

**Key Files:**
- `color-interpolation.test.ts` - Complex enum testing
- `edge-cases.test.ts` - Stress testing patterns
- `combinations.test.ts` - Integration testing

---

## 🎯 Success Metrics

A well-tested feature should have:

- ✅ 80%+ test coverage of implementation
- ✅ All common use cases covered
- ✅ Dynamic value support (var, calc) tested
- ✅ Edge cases and boundary conditions tested
- ✅ Error handling validated
- ✅ Files sized 150-500 lines each
- ✅ All tests passing, all quality gates green
- ✅ Type-safe, maintainable test code

---

**Last Updated:** Session 031 (2025-11-06)
**Author:** AI Agent
**Status:** Production-Ready Patterns
