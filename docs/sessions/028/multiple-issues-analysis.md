# Multiple Issues Problem - Root Cause Analysis

**Date:** 2025-11-06
**Issue:** Not seeing oklab warnings when parse fails with named(invalid) error

---

## 🔍 The Problem

**CSS:** `linear-gradient(oklab(-255 255 255), named(invalid))`

**Current output:**

```json
{
  "ok": false,
  "issues": [{ "message": "Unsupported color function: named" }, { "message": "css-tree visual context..." }]
}
```

**Expected output:**

```json
{
  "ok": false,
  "issues": [
    { "message": "Unsupported color function: named" },
    { "message": "css-tree visual context..." },
    { "message": "l value -255 out of range" },
    { "message": "a value 255 out of range" },
    { "message": "b value 255 out of range" }
  ]
}
```

---

## 🎯 Root Cause

Generator warnings come from generating CSS from IR. To get oklab warnings, we need:

1. ✅ Parse oklab successfully (this works!)
2. ✅ Build partial IR with oklab color (this works!)
3. ❌ **PROBLEM:** Generate CSS from partial IR (this doesn't happen!)

**Why it doesn't happen:**

- parseDeclaration Step 5 only tries generation if `parseResult.value` exists
- When linear gradient parser fails, it returns `{ ok: false, issues: [...] }` WITHOUT value
- No value → no IR → no generation → no oklab warnings

---

## 📊 Current Flow

```
CSS: linear-gradient(oklab(-255 255 255), named(invalid))
  ↓
Linear Gradient Parser:
  ├─ Parse stop 1: oklab(-255 255 255) → ✅ SUCCESS (stored in colorStops array)
  ├─ Parse stop 2: named(invalid) → ❌ FAIL (adds to issues array)
  ├─ Check issues.length > 0 → TRUE
  └─ Return { ok: false, issues: [...] }  ← NO VALUE!

Background-image Parser:
  ├─ Receives linear gradient error
  ├─ forwardParseErr → strips value (by design)
  └─ Returns { ok: false, value: { layers: [] }, issues: [...] }

parseDeclaration:
  ├─ parseResult.ok = false
  ├─ parseResult.value = { layers: [] }  ← Empty!
  ├─ Tries generation → generates empty gradient
  └─ No oklab in IR → No warnings
```

---

## 💡 Design Decisions to Consider

### The Core Question

**Should parsers return partial IR when they fail?**

**Current design:**

- ✅ background-image: Returns partial (successful layers)
- ❌ linear-gradient: Returns nothing (early fail)
- ❌ radial-gradient: Returns nothing (early fail)
- ❌ conic-gradient: Returns nothing (early fail)

**Implications:**

### Option A: Keep Current Design (Fail Fast)

**Philosophy:** "If I can't parse completely, don't return partial data"

**Pros:**

- ✅ Clear semantics: `ok: false` + no value = total failure
- ✅ Prevents generating invalid CSS from incomplete IR
- ✅ forwardParseErr works as designed
- ✅ Type-safe (value type matches IR type exactly)

**Cons:**

- ❌ Can't run generator on partial IR
- ❌ Miss semantic warnings from successfully parsed parts
- ❌ User must fix errors progressively (one at a time)

**User experience:**

```
Pass 1: "Fix: unsupported function named"
  ↓ User fixes
Pass 2: "Warning: oklab values out of range"
```

---

### Option B: Return Partial IR (Multi-Error)

**Philosophy:** "Return what I could parse, even if incomplete"

**Pros:**

- ✅ Can run generator on partial IR
- ✅ Show all issues in one go (parse + generate)
- ✅ Better DX - see everything at once

**Cons:**

- ❌ Incomplete IR might not be valid for generation
- ❌ forwardParseErr needs changes (or don't use it)
- ❌ More complex error handling
- ❌ Might generate "nonsense" CSS from partial IR

**User experience:**

```
Pass 1: Shows everything:
  - Parse error: unsupported function named
  - Warning: oklab l out of range
  - Warning: oklab a out of range
  - Warning: oklab b out of range
```

---

## 🤔 Key Insight

**The real question:** Is a gradient with 1 color stop valid enough to generate?

**Gradient requirements:**

- Minimum: 2 color stops
- We have: 1 color stop (oklab successfully parsed)

**Can we generate from 1 color stop?**

- ❌ Not a valid CSS gradient
- ❌ Would fail css-tree validation
- ❌ Browsers won't render it

**But:** We could still inspect the 1 color stop we DID parse and show warnings!

---

## 🎯 Proposed Solution

### Option C: Inspect Partial IR Before Generation (Hybrid)

**Don't generate invalid CSS, but DO inspect what we parsed**

```typescript
// In parseDeclaration after parse fails:
if (!parseResult.ok && parseResult.value) {
  // Don't try full generation (might produce invalid CSS)
  // Instead: Walk the partial IR and collect warnings
  const inspectionWarnings = inspectIR(parseResult.value);
  allIssues.push(...inspectionWarnings);
}

function inspectIR(ir: unknown): Issue[] {
  const warnings: Issue[] = [];

  // Walk IR and check for semantic issues
  // For colors: check ranges
  // For lengths: check units
  // etc.

  return warnings;
}
```

**Pros:**

- ✅ Show all issues without generating invalid CSS
- ✅ forwardParseErr unchanged
- ✅ No type safety issues
- ✅ Parsers keep fail-fast behavior

**Cons:**

- ❌ Need to build IR inspection logic
- ❌ Duplicates some generator logic
- ❌ More code to maintain

---

### Option D: Make Parsers Return Partial IR (Targeted Changes)

**Only change gradient parsers to return partial value**

```typescript
// In linear.ts:
if (issues.length > 0) {
  // Return partial gradient (even if invalid)
  return {
    ok: false,
    value: {
      kind: "linear",
      colorStops, // Whatever we parsed
      repeating: isRepeating,
    },
    issues,
  };
}
```

**Then in parseDeclaration:**

- Try generation even if IR is incomplete
- Catch generator errors (it might fail on invalid IR)
- Collect any warnings it produces before failing

**Pros:**

- ✅ Uses existing generator logic
- ✅ Minimal changes (just gradient parsers)
- ✅ parseDeclaration already has try-catch

**Cons:**

- ❌ Might break assumptions about IR validity
- ❌ Generator might throw on incomplete IR
- ❌ forwardParseErr still strips value

---

## 📋 Recommendation

**Option D with a twist:** Return partial value but make it clear it's incomplete

**Changes needed:**

1. Linear/radial/conic gradient parsers return partial value when they fail
2. Keep forwardParseErr unchanged
3. Background-image parser wraps partial gradient if it exists
4. parseDeclaration already tries generation with try-catch

**Implementation:**

1. ✅ Modify 3 gradient parsers (linear, radial, conic)
2. ✅ Modify background-image to handle partial gradients
3. ✅ parseDeclaration already handles this (existing code)
4. ✅ Generator might throw - that's OK, we catch it

**Risk level:** Low

- Generator has try-catch
- Partial IR is still valid IR (just incomplete)
- Tests will validate behavior

---

## 🚀 Detailed Implementation Plan

### Step 1: Update Linear Gradient Parser

**File:** `packages/b_parsers/src/gradient/linear.ts:140`

**Current:**

```typescript
if (issues.length > 0) {
  return { ok: false, issues };
}
```

**Proposed:**

```typescript
if (issues.length > 0) {
  // Return partial gradient to enable generator warnings on successfully parsed stops
  return {
    ok: false,
    value: {
      kind: "linear",
      direction,
      colorInterpolationMethod,
      colorStops, // May have 0, 1, or more stops
      repeating: isRepeating,
    },
    issues,
  };
}
```

### Step 2: Same for Radial and Conic

Apply same pattern to radial and conic gradient parsers.

### Step 3: Background-image Parser Handles Partial

**File:** `packages/b_declarations/src/properties/background-image/parser.ts:80`

**Current:** Uses `forwardParseErr` which strips value

**Proposed:** Manually forward with value preserved

```typescript
if (gradientResult.ok) {
  layerResults.push(parseOk({ kind: "gradient", gradient: gradientResult.value }));
} else {
  // Manually forward error WITH partial value if it exists
  if (gradientResult.value) {
    layerResults.push({
      ok: false,
      value: { kind: "gradient", gradient: gradientResult.value },
      issues: gradientResult.issues,
    });
  } else {
    layerResults.push(forwardParseErr<ImageLayer>(gradientResult));
  }
}
```

### Step 4: Collect Partial Layers

**File:** `packages/b_declarations/src/properties/background-image/parser.ts:128`

**Current:** Only collects `r.ok` layers

**Proposed:** Also collect partial layers

```typescript
const successfulLayers = layerResults.filter((r) => r.ok).map((r) => r.value);
const partialLayers = layerResults.filter((r) => !r.ok && r.value).map((r) => r.value);
const allLayers = [...successfulLayers, ...partialLayers];

const finalValue: BackgroundImageIR = {
  kind: "layers",
  layers: allLayers, // Include partial for generation
};
```

### Step 5: No Changes Needed in parseDeclaration!

It already:

- Tries generation if `parseResult.value` exists ✅
- Has try-catch around generation ✅
- Deduplicates issues ✅

---

## ✅ Validation Plan

1. Run existing tests → should all pass
2. Test case: `linear-gradient(oklab(-255 255 255), named(invalid))`
   - Should see parse error + oklab warnings
3. Test case: `linear-gradient(named(invalid), named(invalid2))`
   - Should see 2 parse errors, no generator warnings
4. Test case: Valid gradient → should work as before

---

## 🎓 Design Philosophy

**Progressive disclosure with partial results:**

- Parse what you can
- Return partial IR when failure happens
- Let generator inspect partial IR
- Show all issues we can find

**Type safety:**

- Partial IR is still valid IR type
- Just might not meet semantic requirements (e.g., 2+ stops)
- Generator handles this gracefully

**No breaking changes:**

- forwardParseErr unchanged
- Existing successful parses unchanged
- Only affects error cases (improves them)
