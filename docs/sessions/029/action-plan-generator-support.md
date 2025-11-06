# Action Plan: Complete Generator Support for CssValue

**Date:** 2025-11-06
**Focus:** Ensure all CssValue types can be generated back to CSS strings
**Status:** Planning Phase

---

## Current Generator Gap Analysis

### What Works (Has Generators)

✅ **Colors:**

- hex, named, rgb, hsl, hwb, lab, lch, oklab, oklch
- Components use `cssValueToCss` internally
- ⚠️ Missing: `variable` case

✅ **Gradients:**

- linear, radial, conic, repeating variants
- Use color generators for color stops
- Use `cssValueToCss` for positions/angles

✅ **Basic Values:**

- `cssValueToCss` utility handles:
  - literal (with/without units)
  - keyword
  - variable (var() with fallback)
  - list (space/comma separated)

### What's Missing (No Generators)

❌ **Math Functions:**

- calc()
- min() / max()
- clamp()
- calc-operation (nested operations)

❌ **Transform Functions:**

- translate family (translate, translateX/Y/Z, translate3d)
- rotate family (rotate, rotateX/Y/Z, rotate3d)
- scale family (scale, scaleX/Y/Z, scale3d)
- skew family
- matrix functions
- perspective

❌ **Advanced Types:**

- String literals
- Hex colors (as CssValue, not Color)
- URL functions
- attr() functions
- Generic function calls

❌ **Time/Frequency:**

- Time values (s, ms)
- Frequency values (Hz, kHz)

---

## Phase 1: Fix Color Variable Generator (IMMEDIATE)

### File: `packages/b_generators/src/color/color.ts`

**Current Code Missing:**

```typescript
case "variable":
  // NO HANDLER - Falls through to error
```

**Required Addition:**

```typescript
case "variable": {
  // Import at top: import { cssValueToCss } from "@b/utils";
  // Cast to CssValue since Color union includes VariableReference
  return generateOk(cssValueToCss(color as Type.CssValue));
}
```

**Validation:**

1. Import `cssValueToCss` from `@b/utils`
2. Add case before default
3. Test with: `var(--color-1)`, `var(--color, red)`, `var(--angle)`
4. Verify fallback colors are generated correctly

**Time:** 10 minutes

---

## Phase 2: Math Function Generators

### Files to Create

#### 2.1: `packages/b_generators/src/math/calc.ts`

```typescript
import { type GenerateResult, generateOk, type CalcFunction } from "@b/types";
import { cssValueToCss } from "@b/utils";

export function generate(calc: CalcFunction): GenerateResult {
  // Generate the inner expression recursively
  const inner = cssValueToCss(calc.value);
  return generateOk(`calc(${inner})`);
}
```

**Key Points:**

- `calc.value` is a CssValue (literal, variable, calc-operation, etc.)
- `cssValueToCss` handles all recursion automatically
- No validation needed here (done in parser)

**Time:** 15 minutes

#### 2.2: `packages/b_generators/src/math/minmax.ts`

```typescript
import { type GenerateResult, generateOk, type MinmaxFunction } from "@b/types";
import { cssValueToCss } from "@b/utils";

export function generate(fn: MinmaxFunction): GenerateResult {
  const args = fn.values.map(cssValueToCss).join(", ");
  return generateOk(`${fn.kind}(${args})`);
}
```

**Time:** 10 minutes

#### 2.3: `packages/b_generators/src/math/clamp.ts`

```typescript
import { type GenerateResult, generateOk, type ClampFunction } from "@b/types";
import { cssValueToCss } from "@b/utils";

export function generate(clamp: ClampFunction): GenerateResult {
  const min = cssValueToCss(clamp.min);
  const preferred = cssValueToCss(clamp.preferred);
  const max = cssValueToCss(clamp.max);
  return generateOk(`clamp(${min}, ${preferred}, ${max})`);
}
```

**Time:** 10 minutes

#### 2.4: `packages/b_generators/src/math/index.ts`

```typescript
export * as Calc from "./calc";
export * as Minmax from "./minmax";
export * as Clamp from "./clamp";
```

**Time:** 2 minutes

### Phase 2 Total: 40 minutes

---

## Phase 3: Extend cssValueToCss for New Types

### File: `packages/b_utils/src/generate/css-value.ts`

**Current Support:**

- literal, keyword, variable
- list (recursive)
- calc, calc-operation
- minmax, clamp
- attr
- url
- hex-color, rgb, hsl

**Missing Cases to Add:**

#### 3.1: String Literals

```typescript
case "string":
  return `"${value.value}"`;  // Escape quotes if needed
```

#### 3.2: Generic Function Calls

```typescript
case "function":
  const args = value.args.map(cssValueToCss).join(", ");
  return `${value.name}(${args})`;
```

#### 3.3: Calc Operations (Nested)

```typescript
case "calc-operation":
  const left = cssValueToCss(value.left);
  const right = cssValueToCss(value.right);
  return `(${left} ${value.operator} ${right})`;
```

**Verification Needed:**

- Check if these cases already exist
- Add if missing
- Add tests for each case

**Time:** 30 minutes

---

## Phase 4: Transform Function Generators

### Files to Create

#### 4.1: `packages/b_generators/src/transform/translate.ts`

```typescript
import { type GenerateResult, generateOk, type Translate } from "@b/types";
import { cssValueToCss } from "@b/utils";

export function generate(fn: Translate): GenerateResult {
  switch (fn.kind) {
    case "translate":
      return generateOk(`translate(${cssValueToCss(fn.tx)}, ${cssValueToCss(fn.ty)})`);
    case "translateX":
      return generateOk(`translateX(${cssValueToCss(fn.tx)})`);
    case "translateY":
      return generateOk(`translateY(${cssValueToCss(fn.ty)})`);
    case "translateZ":
      return generateOk(`translateZ(${cssValueToCss(fn.tz)})`);
    case "translate3d":
      return generateOk(`translate3d(${cssValueToCss(fn.tx)}, ${cssValueToCss(fn.ty)}, ${cssValueToCss(fn.tz)})`);
  }
}
```

**Time:** 20 minutes

#### 4.2: `packages/b_generators/src/transform/rotate.ts`

```typescript
import { type GenerateResult, generateOk, type Rotate } from "@b/types";
import { cssValueToCss } from "@b/utils";

export function generate(fn: Rotate): GenerateResult {
  switch (fn.kind) {
    case "rotate":
    case "rotateX":
    case "rotateY":
    case "rotateZ":
      return generateOk(`${fn.kind}(${cssValueToCss(fn.angle)})`);
    case "rotate3d":
      return generateOk(`rotate3d(${fn.x}, ${fn.y}, ${fn.z}, ${cssValueToCss(fn.angle)})`);
  }
}
```

**Time:** 15 minutes

#### 4.3: `packages/b_generators/src/transform/scale.ts`

```typescript
import { type GenerateResult, generateOk, type Scale } from "@b/types";

export function generate(fn: Scale): GenerateResult {
  switch (fn.kind) {
    case "scaleX":
      return generateOk(`scaleX(${fn.sx})`);
    case "scaleY":
      return generateOk(`scaleY(${fn.sy})`);
    case "scaleZ":
      return generateOk(`scaleZ(${fn.sz})`);
    case "scale":
      return generateOk(`scale(${fn.sx}${fn.sy ? `, ${fn.sy}` : ""})`);
    case "scale3d":
      return generateOk(`scale3d(${fn.sx}, ${fn.sy}, ${fn.sz})`);
  }
}
```

**Time:** 15 minutes

#### 4.4: `packages/b_generators/src/transform/index.ts`

```typescript
import { type GenerateResult, generateErr, createError, type TransformFunction } from "@b/types";
import * as Translate from "./translate";
import * as Rotate from "./rotate";
import * as Scale from "./scale";

export function generate(fn: TransformFunction): GenerateResult {
  if ("tx" in fn || "ty" in fn || "tz" in fn) {
    return Translate.generate(fn as any);
  }
  if ("angle" in fn) {
    return Rotate.generate(fn as any);
  }
  if ("sx" in fn || "sy" in fn || "sz" in fn) {
    return Scale.generate(fn as any);
  }

  return generateErr(createError("unsupported-kind", "Unknown transform function"));
}
```

**Time:** 10 minutes

### Phase 4 Total: 60 minutes

---

## Phase 5: Top-Level Generator Integration

### File: `packages/b_generators/src/index.ts`

**Add Exports:**

```typescript
export * as Math from "./math";
export * as Transform from "./transform";
```

**Time:** 2 minutes

---

## Phase 6: Testing Strategy

### Unit Tests for Each Generator

#### 6.1: Math Function Tests

**File:** `packages/b_generators/src/math/*.test.ts`

```typescript
describe("Calc.generate", () => {
  it("generates simple calc", () => {
    const ir: CalcFunction = {
      kind: "calc",
      value: { kind: "literal", value: 100, unit: "%" },
    };
    expect(Calc.generate(ir)).toEqual({ ok: true, value: "calc(100%)" });
  });

  it("generates nested calc", () => {
    const ir: CalcFunction = {
      kind: "calc",
      value: {
        kind: "calc-operation",
        operator: "+",
        left: { kind: "literal", value: 100, unit: "px" },
        right: { kind: "literal", value: 2, unit: "em" },
      },
    };
    expect(Calc.generate(ir)).toEqual({ ok: true, value: "calc((100px + 2em))" });
  });

  it("generates calc with var()", () => {
    const ir: CalcFunction = {
      kind: "calc",
      value: {
        kind: "variable",
        name: "--size",
      },
    };
    expect(Calc.generate(ir)).toEqual({ ok: true, value: "calc(var(--size))" });
  });
});
```

**Time:** 2 hours (all math tests)

#### 6.2: Transform Function Tests

**File:** `packages/b_generators/src/transform/*.test.ts`

Similar pattern for all transform variants.

**Time:** 2 hours (all transform tests)

#### 6.3: Integration Tests

**File:** `packages/b_generators/src/integration.test.ts`

Test complex nesting:

- calc(var(--base) + 10px)
- translate(calc(50% - 20px), var(--y))
- Colors with var() fallbacks

**Time:** 1 hour

### Phase 6 Total: 5 hours

---

## Phase 7: Validation & Documentation

### 7.1: Round-Trip Testing

Ensure parse → generate → parse produces identical IR

**Strategy:**

- For each value type, create valid CSS
- Parse to IR
- Generate back to CSS
- Parse again
- Compare IRs (should be identical or semantically equivalent)

**Time:** 2 hours

### 7.2: Update Documentation

**Files:**

- `docs/architecture/generators.md` (create if missing)
- Update README with new capabilities
- Add examples to each generator module

**Time:** 2 hours

### Phase 7 Total: 4 hours

---

## Summary: Time Estimates

| Phase     | Task                 | Time            |
| --------- | -------------------- | --------------- |
| Phase 1   | Color variable fix   | 10 min          |
| Phase 2   | Math generators      | 40 min          |
| Phase 3   | Extend cssValueToCss | 30 min          |
| Phase 4   | Transform generators | 60 min          |
| Phase 5   | Integration          | 2 min           |
| Phase 6   | Testing              | 5 hrs           |
| Phase 7   | Validation & Docs    | 4 hrs           |
| **TOTAL** |                      | **~10.5 hours** |

---

## Critical Path

```
Phase 1 (Color fix) → Immediate validation
    ↓
Phase 2 (Math generators) → Can work in parallel with Phase 3
    ↓
Phase 3 (cssValueToCss extensions) → Required for Phase 4
    ↓
Phase 4 (Transform generators) → Depends on Phase 3
    ↓
Phase 5 (Integration) → Quick wiring
    ↓
Phase 6 & 7 (Testing/Docs) → Can overlap
```

---

## Recommended Execution Order

### Session 029 (Current): Phase 1 Only

**Goal:** Fix var() in colors
**Time:** 15 minutes
**Deliverable:** var() works as complete color

### Session 030: Phases 2-3

**Goal:** Math function support
**Time:** ~1.5 hours
**Deliverable:** calc(), min(), max(), clamp() work end-to-end

### Session 031: Phase 4

**Goal:** Transform function support
**Time:** ~1.5 hours
**Deliverable:** All transform functions generate correctly

### Session 032: Phases 6-7

**Goal:** Comprehensive testing and documentation
**Time:** ~6 hours
**Deliverable:** Production-ready, fully tested generator system

---

## Success Criteria

✅ **Phase 1 Complete:**

- `var(--color-1)` generates correctly
- `var(--angle)` in gradients works
- No regressions in existing tests

✅ **Phase 2 Complete:**

- All math functions generate valid CSS
- Nested structures work (calc inside min, etc.)
- Round-trip parsing successful

✅ **Phase 3 Complete:**

- String literals render correctly
- Generic functions preserve structure
- Calc operations nest properly

✅ **Phase 4 Complete:**

- All transform variants generate correctly
- Transform lists (multiple functions) work
- Variable/calc support in transforms

✅ **Phases 6-7 Complete:**

- 100% test coverage for new generators
- All round-trip tests pass
- Documentation updated
- No quality check failures

---

## Risk Mitigation

**Risk 1:** cssValueToCss might not handle all edge cases

- **Mitigation:** Comprehensive test suite first, fix gaps incrementally

**Risk 2:** Circular dependencies between packages

- **Mitigation:** Follow established pattern (generators → utils, never reverse)

**Risk 3:** Breaking existing functionality

- **Mitigation:** Run full test suite after each phase, never commit broken builds

**Risk 4:** Type mismatches in discriminated unions

- **Mitigation:** Use type guards, never use unsafe casts without comments

---

## Next Actions

1. ✅ Review and approve this plan
2. → Execute Phase 1 (var() fix)
3. → Validate with user's original test case
4. → Get approval for Phase 2 scope
5. → Begin Phase 2 implementation
