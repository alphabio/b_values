# Session 024 Review: Identifying Gaps & Patterns

**Date:** 2025-11-05
**Focus:** Deep analysis of Phase 2 work to ensure scalable patterns

---

## ✅ What Was Completed (Session 024)

### 1. Enhanced Issue Interface

**File:** `packages/b_types/src/result/issue.ts`

Added optional fields:

- `path?: (string | number)[]` - Path to error in IR
- `expected?: string` - Expected type/value
- `received?: string` - Received type/value

**Pattern Quality:** ⭐⭐⭐⭐⭐

- Backward compatible (all optional)
- Well documented
- Ready for 100s of properties

### 2. Levenshtein Distance Utility

**Files:**

- `packages/b_utils/src/string/levenshtein.ts`
- `packages/b_utils/src/string/levenshtein.test.ts`

**Pattern Quality:** ⭐⭐⭐⭐⭐

- Clean, focused implementation
- Well tested (9 tests)
- Configurable maxDistance
- Reusable utility (not tied to colors)

### 3. Enhanced zodErrorToIssues

**File:** `packages/b_utils/src/generate/validation.ts`

**Features:**

- `ZodErrorContext` for passing metadata
- Recursive union error handling
- Path formatting with `formatPath()`
- "Did you mean?" suggestions
- Maps Zod codes to Issue codes

**Pattern Quality:** ⭐⭐⭐⭐⭐

- Excellent separation of concerns
- Handles complex union errors
- Context-driven (not hardcoded)
- Will scale to 100s of generators

### 4. Generator Updates (8 color generators)

**Pattern:**

```typescript
const validation = schema.safeParse(color);
if (!validation.success) {
  return generateErr(
    zodErrorToIssues(validation.error, {
      typeName: "RGBColor",
      property: "color",
    }),
    "rgb-color"
  );
}
```

**Pattern Quality:** ⭐⭐⭐⭐⭐

- Consistent across all generators
- Minimal boilerplate
- Context provides rich errors
- Easy to replicate

---

## ❌ What's Missing (Tasks 2.7 & 2.8)

### The Gap: Semantic Validation

**Current behavior:**

```typescript
generate({ kind: "rgb", r: lit(-255), g: lit(128), b: lit(500) });
// → { ok: true, value: "rgb(-255 128 500)", issues: [] }
```

**Expected behavior (ADR-002):**

```typescript
generate({ kind: "rgb", r: lit(-255), g: lit(128), b: lit(500) });
// → {
//   ok: true,  // ✅ Can represent it
//   value: "rgb(-255 128 500)",
//   issues: [  // ⚠️ But warn about semantic issues
//     {
//       severity: "warning",
//       code: "invalid-value",
//       message: "r value -255 is out of valid range 0-255",
//       path: ["r"],
//       suggestion: "Use a value between 0 and 255"
//     },
//     {
//       severity: "warning",
//       code: "invalid-value",
//       message: "b value 500 is out of valid range 0-255",
//       path: ["b"],
//       suggestion: "Use a value between 0 and 255"
//     }
//   ]
// }
```

**Why it matters:**

- Core philosophy: `ok: true` = can represent, warnings = helpful feedback
- DX improvement: Users see problems without hard failures
- Production ready: Generates CSS but warns about issues

---

## 🔍 Pattern Analysis for Semantic Validation

### Challenge: Different Value Types

**The IR uses CssValue union:**

```typescript
type CssValue =
  | { kind: "literal"; value: number; unit?: string }
  | { kind: "variable"; name: string; fallback?: CssValue }
  | { kind: "keyword"; value: string }
  | { kind: "calc"; value: CssValue }
  | { kind: "min" | "max"; values: CssValue[] }
  | { kind: "clamp"; min: CssValue; preferred: CssValue; max: CssValue }
  | // ... more
```

**Problem:** Can't validate range for variables/calc/etc.

**Solution:** Only validate literals (the common case).

### Proposed Pattern (Scalable)

#### 1. Create Reusable Validators

**File:** `packages/b_utils/src/validation/semantic.ts` (NEW)

```typescript
import { type Issue, createWarning } from "@b/types";
import type { CssValue } from "@b/types";

/**
 * Check if a literal value is in expected range.
 * Returns warning if out of range, undefined if OK or not applicable.
 *
 * Only validates literal values - returns undefined for variables, calc, etc.
 */
export function checkLiteralRange(
  value: CssValue,
  min: number,
  max: number,
  context: {
    field: string;
    unit?: string;
    typeName?: string;
  }
): Issue | undefined {
  // Only validate literals
  if (value.kind !== "literal") return undefined;

  const numericValue = value.value;

  if (numericValue < min || numericValue > max) {
    const unit = context.unit ?? value.unit ?? "";
    return createWarning(
      "invalid-value",
      `${context.field} value ${numericValue}${unit} is out of valid range ${min}-${max}${unit}${context.typeName ? ` in ${context.typeName}` : ""}`,
      {
        suggestion: `Use a value between ${min}${unit} and ${max}${unit}`,
        path: [context.field],
      }
    );
  }

  return undefined;
}

/**
 * Check RGB component (0-255 for integers, 0-100 for percentages).
 */
export function checkRGBComponent(value: CssValue, field: string, typeName?: string): Issue | undefined {
  if (value.kind !== "literal") return undefined;

  // Percentage (0-100%)
  if (value.unit === "%") {
    return checkLiteralRange(value, 0, 100, { field, unit: "%", typeName });
  }

  // Integer (0-255)
  return checkLiteralRange(value, 0, 255, { field, typeName });
}

/**
 * Check alpha value (0-1 for numbers, 0-100% for percentages).
 */
export function checkAlpha(value: CssValue, field: string, typeName?: string): Issue | undefined {
  if (value.kind !== "literal") return undefined;

  // Percentage (0-100%)
  if (value.unit === "%") {
    return checkLiteralRange(value, 0, 100, { field, unit: "%", typeName });
  }

  // Number (0-1)
  return checkLiteralRange(value, 0, 1, { field, typeName });
}

/**
 * Check hue value (0-360 degrees, wraps around).
 * Note: Hue can technically be any value (wraps), but warn if unreasonable.
 */
export function checkHue(value: CssValue, field: string, typeName?: string): Issue | undefined {
  if (value.kind !== "literal") return undefined;

  // Allow any degree unit
  if (value.unit && !["deg", "rad", "grad", "turn"].includes(value.unit)) {
    return createWarning(
      "invalid-value",
      `${field} has unsupported unit '${value.unit}'${typeName ? ` in ${typeName}` : ""}`,
      {
        suggestion: "Use deg, rad, grad, or turn units for hue",
        path: [field],
      }
    );
  }

  // Warn if way outside 0-360 (even though it wraps)
  if (value.unit === "deg" || !value.unit) {
    if (value.value < -360 || value.value > 720) {
      return createWarning(
        "invalid-value",
        `${field} value ${value.value}deg is unusually large${typeName ? ` in ${typeName}` : ""}`,
        {
          suggestion: "Hue typically ranges from 0-360 degrees",
          path: [field],
        }
      );
    }
  }

  return undefined;
}

/**
 * Check percentage (0-100%).
 */
export function checkPercentage(value: CssValue, field: string, typeName?: string): Issue | undefined {
  if (value.kind !== "literal") return undefined;

  return checkLiteralRange(value, 0, 100, { field, unit: "%", typeName });
}

/**
 * Collect all warnings from validators.
 * Filters out undefined values.
 */
export function collectWarnings(...validators: (Issue | undefined)[]): Issue[] {
  return validators.filter((issue): issue is Issue => issue !== undefined);
}
```

#### 2. Updated Generator Pattern

```typescript
// packages/b_generators/src/color/rgb.ts
import { checkRGBComponent, checkAlpha, collectWarnings } from "@b/utils";
import { addGenerateIssue } from "@b/types";

export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (EXISTING - catches structure errors)
  const validation = rgbColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "RGBColor",
        property: "color",
      }),
      "rgb-color"
    );
  }

  const { r, g, b, alpha } = validation.data;

  // 2. Semantic validation (NEW - checks ranges)
  const warnings = collectWarnings(
    checkRGBComponent(r, "r", "RGBColor"),
    checkRGBComponent(g, "g", "RGBColor"),
    checkRGBComponent(b, "b", "RGBColor"),
    alpha ? checkAlpha(alpha, "alpha", "RGBColor") : undefined
  );

  // 3. Generate CSS (EXISTING)
  const rgbPart = `${cssValueToCss(r)} ${cssValueToCss(g)} ${cssValueToCss(b)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`rgb(${rgbPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`rgb(${rgbPart})`);
  }

  // 4. Attach warnings (NEW)
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
```

**Pattern Quality:** ⭐⭐⭐⭐⭐

- Reusable validators (not color-specific)
- Clean separation: schema validation vs semantic validation
- Non-invasive: doesn't change existing logic
- Scales to 100s of properties

---

## 📋 Generators to Update

### Color Space Ranges

| Color Space | Components | Ranges           |
| ----------- | ---------- | ---------------- |
| **RGB**     | r, g, b    | 0-255 or 0-100%  |
|             | alpha      | 0-1 or 0-100%    |
| **HSL**     | h          | 0-360deg (wraps) |
|             | s, l       | 0-100%           |
|             | alpha      | 0-1 or 0-100%    |
| **HWB**     | h          | 0-360deg (wraps) |
|             | w, b       | 0-100%           |
|             | alpha      | 0-1 or 0-100%    |
| **LAB**     | l          | 0-100            |
|             | a, b       | -125 to 125      |
|             | alpha      | 0-1 or 0-100%    |
| **LCH**     | l          | 0-100            |
|             | c          | 0-150            |
|             | h          | 0-360deg (wraps) |
|             | alpha      | 0-1 or 0-100%    |
| **OKLAB**   | l          | 0-1              |
|             | a, b       | -0.4 to 0.4      |
|             | alpha      | 0-1 or 0-100%    |
| **OKLCH**   | l          | 0-1              |
|             | c          | 0-0.4            |
|             | h          | 0-360deg (wraps) |
|             | alpha      | 0-1 or 0-100%    |

**Validators needed:**

- `checkRGBComponent()` - ✅ (handles both integer and %)
- `checkAlpha()` - ✅ (handles both number and %)
- `checkHue()` - ✅ (lenient, warns on extremes)
- `checkPercentage()` - ✅ (generic 0-100%)
- `checkLiteralRange()` - ✅ (generic min-max)

### Generators to Update (7)

1. ✅ `rgb.ts` - checkRGBComponent × 3, checkAlpha
2. ✅ `hsl.ts` - checkHue, checkPercentage × 2, checkAlpha
3. ✅ `hwb.ts` - checkHue, checkPercentage × 2, checkAlpha
4. ✅ `lab.ts` - checkLiteralRange × 3, checkAlpha
5. ✅ `lch.ts` - checkLiteralRange × 2, checkHue, checkAlpha
6. ✅ `oklab.ts` - checkLiteralRange × 3, checkAlpha
7. ✅ `oklch.ts` - checkLiteralRange × 2, checkHue, checkAlpha

**Do NOT update:**

- `hex.ts` - single string value, no components
- `named.ts` - single keyword value, no components
- `special.ts` - single keyword value, no components
- `color.ts` - dispatcher, delegates to others

---

## 🧪 Test Strategy

### Unit Tests (per validator)

```typescript
// packages/b_utils/src/validation/semantic.test.ts
describe("checkRGBComponent", () => {
  it("should warn for negative values", () => {
    const warning = checkRGBComponent(lit(-255), "r", "RGBColor");
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe("warning");
    expect(warning?.message).toContain("out of valid range");
  });

  it("should warn for values over 255", () => {
    const warning = checkRGBComponent(lit(500), "r", "RGBColor");
    expect(warning).toBeDefined();
  });

  it("should not warn for valid values", () => {
    expect(checkRGBComponent(lit(0), "r")).toBeUndefined();
    expect(checkRGBComponent(lit(128), "g")).toBeUndefined();
    expect(checkRGBComponent(lit(255), "b")).toBeUndefined();
  });

  it("should not warn for variables", () => {
    const varValue = { kind: "variable" as const, name: "--color" };
    expect(checkRGBComponent(varValue, "r")).toBeUndefined();
  });

  it("should check percentage range", () => {
    const warning = checkRGBComponent(lit(150, "%"), "r", "RGBColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("0-100%");
  });
});
```

### Integration Tests (per generator)

```typescript
// packages/b_generators/src/color/rgb.test.ts
describe("RGB semantic validation", () => {
  it("should warn for out-of-range components", () => {
    const result = generate({
      kind: "rgb",
      r: lit(-255),
      g: lit(128),
      b: lit(500),
    });

    expect(result.ok).toBe(true); // Still generates!
    expect(result.value).toBe("rgb(-255 128 500)");
    expect(result.issues).toHaveLength(2); // r and b warnings

    expect(result.issues[0]).toMatchObject({
      severity: "warning",
      code: "invalid-value",
      message: expect.stringContaining("out of valid range"),
      path: ["r"],
    });
  });

  it("should not warn for valid components", () => {
    const result = generate({
      kind: "rgb",
      r: lit(255),
      g: lit(128),
      b: lit(0),
    });

    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0); // No warnings
  });

  it("should not warn for variables", () => {
    const result = generate({
      kind: "rgb",
      r: { kind: "variable", name: "--r" },
      g: lit(128),
      b: lit(0),
    });

    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0); // Can't validate variables
  });
});
```

---

## 🚀 Rollout Plan

### Phase 1: Foundation (30 min)

1. Create `packages/b_utils/src/validation/semantic.ts`
2. Create `packages/b_utils/src/validation/semantic.test.ts`
3. Export from `packages/b_utils/src/validation/index.ts`
4. Export from `packages/b_utils/src/index.ts`
5. Run tests: `pnpm test packages/b_utils`

### Phase 2: Proof of Concept (20 min)

1. Update `packages/b_generators/src/color/rgb.ts`
2. Update `packages/b_generators/src/color/rgb.test.ts`
3. Run tests: `pnpm test packages/b_generators/src/color/rgb`
4. Manual validation: Check warning messages

### Phase 3: Rollout (60 min)

1. Update remaining 6 color generators
2. Update their tests
3. Run full test suite: `pnpm test`
4. Quality gates: `just check`

### Phase 4: Documentation (15 min)

1. Update SESSION_HANDOVER.md
2. Add examples to ADR-002
3. Document patterns for future properties

**Total Time: ~2 hours**

---

## 🎯 Success Criteria

- [ ] All validators implemented and tested
- [ ] RGB generator updated (proof of concept)
- [ ] All 7 color generators updated
- [ ] All 953+ tests passing
- [ ] New tests for semantic warnings
- [ ] Quality gates pass (typecheck, lint, build)
- [ ] Zero breaking changes
- [ ] Documentation updated

---

## 💡 Key Insights

### ⭐ What Makes These Patterns Scalable

1. **Separation of Concerns**
   - Schema validation (structure) separate from semantic validation (ranges)
   - Validators independent of generators
   - Reusable across property types

2. **Opt-in Validation**
   - Only validates literals (common case)
   - Gracefully skips variables, calc, etc.
   - No false positives

3. **Consistent Error Structure**
   - Uses existing Issue infrastructure
   - Warning severity (doesn't break generation)
   - Path field for precise location
   - Suggestion field for fixes

4. **Minimal Boilerplate**
   - `collectWarnings()` helper
   - `addGenerateIssue()` for attaching
   - Validators handle complexity

5. **Type Safety**
   - Leverages CssValue discriminated union
   - TypeScript catches missing checks
   - No runtime type errors

### 🚨 Potential Pitfalls (Avoided)

1. **Don't validate non-literals**
   - ❌ Trying to validate calc() expressions
   - ❌ Trying to validate variables
   - ✅ Return undefined for non-literals

2. **Don't break generation**
   - ❌ Returning `ok: false` for warnings
   - ✅ Generate CSS + attach warnings

3. **Don't over-engineer**
   - ❌ Complex validation DSL
   - ❌ Configurable validation rules
   - ✅ Simple functions, clear logic

4. **Don't couple to color**
   - ❌ colorRangeValidator()
   - ✅ checkLiteralRange() (generic)

---

## 📝 Next Session Tasks

1. Implement semantic validators
2. Update RGB generator (POC)
3. Update remaining 6 generators
4. Add tests
5. Verify all tests pass
6. Update documentation

**Ready to execute!**
