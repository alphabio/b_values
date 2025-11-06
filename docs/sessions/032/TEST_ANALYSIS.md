# Radial Gradient Test Analysis

**Date:** 2025-11-06
**Status:** All tests written, implementation needs fixing

---

## 📊 Test Summary

**Total Tests:** 131

- ✅ **Passing:** 102 (78%)
- ❌ **Failing:** 29 (22%)

**Test Files:**

- ✅ color-interpolation.test.ts - ALL PASSING
- ✅ color-stops.test.ts - ALL PASSING
- ❌ combinations.test.ts - 3 failing
- ❌ edge-cases.test.ts - 4 failing
- ❌ position.test.ts - 4 failing
- ❌ shape-size.test.ts - 18 failing

---

## 🔍 Root Cause Analysis

### Issue 1: Incomplete `generateSize()` function

**File:** `packages/b_generators/src/gradient/radial.ts`

**Problem:** The function was partially updated but has broken code:

```typescript
const radiusX = cssValueToCss(size.radiusX);
const radiusY = cssValueToCss(size.radiusY);

const ryResult = Length.generateLengthPercentage(size.radiusY); // ❌ Old code left in
if (!ryResult.ok) return ryResult;

return generateOk(`${radiusX} ${radiusY}`);
```

**Impact:** 18 failures in shape-size.test.ts

**Symptoms:**

- Circle explicit sizes generate empty string: `radial-gradient(, red, blue)`
- Ellipse explicit sizes generate `undefined undefined`
- Calc operations throw TypeError (undefined.kind)

### Issue 2: Edge case tests reference "angle"

**File:** `packages/b_generators/src/gradient/__tests__/radial/edge-cases.test.ts`

**Problem:** Tests were adapted from linear gradient but still reference `direction/angle` which doesn't exist in radial.

**Impact:** 4 failures in edge-cases.test.ts

**Examples:**

- "generates with floating point precision in angle"
- "generates with very large angle value"
- "generates with zero as unitless number"

**Fix needed:** Remove angle-specific tests or adapt to radial features (size precision, etc.)

### Issue 3: Type system incomplete

**File:** `packages/b_types/src/gradient/radial-size.ts`

**Status:** ✅ Already fixed (changed to `cssValueSchema`)

**But:** Generator implementation needs to match

---

## 🛠️ Fix Strategy

### Step 1: Fix `generateSize()` function

**Priority:** HIGH
**Impact:** Fixes 18 tests

```typescript
function generateSize(size: Type.RadialGradientSize): GenerateResult {
  if (size.kind === "keyword") {
    return generateOk(size.value);
  }

  if (size.kind === "circle-explicit") {
    return generateOk(cssValueToCss(size.radius));
  }

  const radiusX = cssValueToCss(size.radiusX);
  const radiusY = cssValueToCss(size.radiusY);

  return generateOk(`${radiusX} ${radiusY}`);
}
```

**Changes:**

- Remove leftover `Length.generateLengthPercentage()` calls
- Use `cssValueToCss()` consistently
- No need for error handling (cssValueToCss doesn't return Result)

### Step 2: Fix edge-cases.test.ts

**Priority:** MEDIUM
**Impact:** Fixes 4 tests

**Option A:** Remove angle-specific tests (they don't apply to radial)
**Option B:** Replace with radial-specific edge cases:

- Floating point precision in radius
- Very large radius values
- Zero radius values
- etc.

### Step 3: Verify calc() support

**Priority:** LOW
**Impact:** Already working in position, needs verification in size

Position calc() tests are passing, which means:

- `cssValueToCss()` handles calc correctly
- Type system supports it
- Just needs clean generator implementation

---

## 📋 Implementation Checklist

- [ ] Fix `generateSize()` function (remove old code)
- [ ] Clean up edge-cases.test.ts (remove angle refs)
- [ ] Run full test suite
- [ ] Verify all 131 tests pass
- [ ] Run `just check` (format, lint, typecheck)
- [ ] Run `just build` (production build)
- [ ] Commit changes

---

## 📈 Expected Outcome

After fixes:

- **131/131 tests passing** (100%)
- All quality gates green
- Dynamic value support complete (var, calc, clamp)
- Ready to start parser tests

---

## 💡 Lessons Learned

1. ✅ **Writing all tests first** exposes issues holistically
2. ✅ **Test-driven approach** prevented partial/incomplete fixes
3. ✅ **Type system changes** must be paired with implementation updates
4. ❌ **Sed-based test adaptation** can leave invalid test cases
5. ✅ **High test count** (131) gives confidence in implementation

---

**Next:** Fix implementation, verify all tests pass, then move to parser tests
