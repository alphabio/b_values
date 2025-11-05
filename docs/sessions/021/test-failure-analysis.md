# Test Failure Analysis: Zod Validation Changes

**Date:** 2025-11-05
**Session:** 021
**Task:** Phase 2 Task 2.1 - Zod Validation

---

## Summary

8 tests failing across 7 color generator files due to mismatch between expected error codes and Zod validation error format.

---

## Root Cause

**Before (manual validation):**

```typescript
if (!("r" in color) || !("g" in color) || !("b" in color)) {
  return generateErr(createError("missing-required-field", "RGBColor must have 'r', 'g', 'b' fields"));
}
```

**After (Zod validation):**

```typescript
const validation = rgbColorSchema.safeParse(color);
if (!validation.success) {
  const issue = validation.error.issues[0];
  return generateErr(createError("invalid-ir", `Invalid RGBColor: ${issue?.path.join(".")}: ${issue?.message}`));
}
```

**Problem:** Tests expect `code` to be:

- `"invalid-ir"` for null/undefined
- `"missing-required-field"` for missing fields

But Zod validation always returns `"invalid-ir"` as the code with the detailed message in the message field.

---

## Failed Tests Breakdown

### 1. RGB Generator (2 failures)

- `should return error for null color`
  - Expected: `code = "Invalid RGBColor: : Invalid input: expected object, received null"`
  - Got: `code = "invalid-ir"`
  - **Issue:** Test expects the FULL MESSAGE in the `code` field
- `should return error for missing fields`
  - Expected: `code = "Invalid RGBColor: g: Expected"`
  - Got: `code = "invalid-ir"`
  - **Issue:** Test expects the FULL MESSAGE in the `code` field

### 2. HSL, HWB, LAB, OKLAB, OKLCH, LCH (6 failures)

- All failing on: `should return error for missing fields`
  - Expected: `code = "missing-required-field"`
  - Got: `code = "invalid-ir"`

---

## Test Inconsistency Analysis

Looking at the test files:

**RGB tests (packages/b_generators/src/color/rgb.test.ts):**

```typescript
// Line 49 - expects FULL MESSAGE in code field
expect(result.issues[0]?.code).toBe("Invalid RGBColor: : Invalid input: expected object, received null");

// Line 58 - expects PARTIAL MESSAGE in code field
expect(result.issues[0]?.code).toBe("Invalid RGBColor: g: Expected");
```

**Other color tests (hsl, hwb, lab, etc.):**

```typescript
// Expects just the error type in code field
expect(result.issues[0]?.code).toBe("missing-required-field");
```

**LCH tests are correct:**

```typescript
// Line 317 - for null
expect(result.issues[0]?.code).toBe("invalid-ir");

// Line 326 - for missing fields
expect(result.issues[0]?.code).toBe("missing-required-field");
```

---

## Issue Structure

The `createError()` function signature:

```typescript
createError(code: string, message: string): Issue
```

The `Issue` type has:

- `code`: Error type (e.g., "invalid-ir", "missing-required-field")
- `message`: Human-readable description

**The RGB tests are WRONG** - they're checking the `code` field expecting it to contain the full message.

**The other tests are CORRECT** - they expect specific error codes.

---

## Proposal: Fix Tests (Recommended)

**Why:** The RGB tests are incorrectly using `code` as a message container. The Zod approach is correct and cleaner.

**Changes needed:**

### 1. Fix RGB test expectations

**File:** `packages/b_generators/src/color/rgb.test.ts`

```typescript
// Line 45-50: Fix null color test
it("should return error for null color", () => {
  const result = RGB.generate(null as unknown as RGBColor);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.issues[0]?.code).toBe("invalid-ir");
    expect(result.issues[0]?.message).toContain("Invalid RGBColor");
  }
});

// Line 53-60: Fix missing fields test
it("should return error for missing fields", () => {
  const color = { kind: "rgb", r: lit(255) } as RGBColor;
  const result = RGB.generate(color);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.issues[0]?.code).toBe("invalid-ir");
    expect(result.issues[0]?.message).toContain("Invalid RGBColor");
  }
});
```

### 2. Fix other color tests (HSL, HWB, LAB, OKLAB, OKLCH)

All have the same pattern - expecting `"missing-required-field"` but Zod returns `"invalid-ir"`.

**Change:**

```typescript
// FROM:
expect(result.issues[0]?.code).toBe("missing-required-field");

// TO:
expect(result.issues[0]?.code).toBe("invalid-ir");
```

**Files to update:**

- `packages/b_generators/src/color/hsl.test.ts:50`
- `packages/b_generators/src/color/hwb.test.ts:32`
- `packages/b_generators/src/color/lab.test.ts:32`
- `packages/b_generators/src/color/oklab.test.ts:32`
- `packages/b_generators/src/color/oklch.test.ts:32`

**LCH is already correct** - no changes needed.

---

## Alternative: Keep Old Behavior (Not Recommended)

Could manually inspect Zod errors and map to specific codes:

```typescript
const validation = rgbColorSchema.safeParse(color);
if (!validation.success) {
  const issue = validation.error.issues[0];

  // Map Zod issues to our error codes
  if (issue?.code === "invalid_type" && issue?.received === "null") {
    return generateErr(createError("invalid-ir", `RGBColor must not be null or undefined`));
  }

  if (issue?.code === "invalid_type") {
    const field = issue?.path[0];
    return generateErr(createError("missing-required-field", `RGBColor must have '${field}' field`));
  }

  return generateErr(createError("invalid-ir", `Invalid RGBColor: ${issue?.message}`));
}
```

**Why not:**

- Adds complexity
- Defeats the purpose of using Zod
- Hard to maintain as schemas evolve
- The tests are the ones that are wrong, not the implementation

---

## Recommendation

**Fix the tests** (Option 1):

1. Update RGB tests to check `code` and `message` separately
2. Update other color tests to expect `"invalid-ir"` instead of `"missing-required-field"`
3. Total changes: 8 test assertions across 6 files

**Benefits:**

- Cleaner implementation
- Consistent error handling
- Leverages Zod properly
- Future-proof (Zod gives us detailed errors automatically)

**Impact:**

- Low risk: Only test assertions change
- No production code changes
- Consistent with Phase 1 patterns

---

## Next Steps

1. ✅ Confirm approach with user
2. Update test assertions (6 files, ~8 lines)
3. Run tests to verify
4. Continue with Task 2.2 (Extract color interpolation utility)

---

**Estimated time:** 5 minutes to fix tests
