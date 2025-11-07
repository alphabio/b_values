# CRITICAL: Phase 2 Regression Analysis

**Date:** 2025-11-07
**Time:** 03:50 UTC
**Status:** 🔴 BLOCKING ISSUE

---

## 🐛 The Regression

**Symptom:** Multi-layer CSS values with syntax errors in ONE layer now return NO results instead of valid layers.

### Test Case

```typescript
parseDeclaration(`
  background-image:
    linear-gradient(blue, yellow),                    // ✅ VALID
    radial-gradient(..., calc(50% & 20px)),           // ❌ INVALID (& operator not allowed)
    conic-gradient(from -100grad, hsl(...) 0%);      // ✅ VALID
`);
```

### Expected (Before)

```json
{
  "ok": false,
  "value": {
    "layers": [
      { "gradient": { "kind": "linear", ... }},  // ✅ Returned
      { "gradient": { "kind": "conic", ... }}     // ✅ Returned
    ]
  },
  "issues": [{ "code": "invalid-syntax", "message": "...", ... }]
}
```

**Result:** 2 valid gradients + 1 error ✅

### Actual (After Phase 2)

```json
{
  "ok": false,
  "value": null,  // ❌ NO VALUE
  "issues": [{ "code": "invalid-syntax", "message": "...", ... }]
}
```

**Result:** No gradients, just error ❌

---

## 🔍 Root Cause Investigation

### Timeline

| Commit                         | Behavior                    | Gradients Returned |
| ------------------------------ | --------------------------- | ------------------ |
| Before Phase 1 (8b7a3a5)       | ✅ Working                  | [linear, conic]    |
| Phase 1 (76cb9cf)              | ❓ Can't test (build error) | ?                  |
| Before Phase 2 (7d43470)       | ❌ Broken                   | null               |
| After Phase 2 (49ead7d - HEAD) | ❌ Broken                   | null               |

**KEY FINDING:** Regression happened BEFORE Phase 2, likely during Phase 1 or location type migration!

### The Mechanism

**File:** `packages/b_declarations/src/parser.ts`

**Current Code (Broken):**

```typescript
// Step 2: Parse value to AST
let valueAst: csstree.Value;
try {
  valueAst = csstree.parse(value, {
    context: "value",
    positions: true,
  }) as csstree.Value;
} catch (e: unknown) {
  // ❌ EARLY RETURN - property parser never runs!
  return parseErr(createError("invalid-syntax", error.message));
}

// Step 3: Parse using property's AST-native parser
// This line is never reached when parse fails
const parseResult = definition.parser(valueAst);
```

**Problem:**

1. User provides: `linear-gradient(...), radial-gradient(..., calc(50% & 20px)), conic-gradient(...)`
2. css-tree tries to parse entire value
3. css-tree hits invalid calc syntax: `calc(50% & 20px)`
4. css-tree throws exception
5. We catch and return error immediately
6. **Property parser never runs** - it COULD have extracted valid gradients

### Why This Matters

The property parser (`parseBackgroundImage`) is designed to handle partial failures:

- Splits layers by comma
- Parses each layer individually
- Collects partial results
- Returns valid layers + issues

But it never gets a chance to run!

---

## 🤔 Why Did It Work Before?

Looking at commits before Phase 1, the parser must have been **NOT using css-tree.parse() at the top level** for multi-layer properties.

### Hypothesis

**Before Phase 1:**

- Property parsers worked on STRING values
- They split by comma themselves
- Parsed each layer independently
- One bad layer didn't stop others

**After Phase 1:**

- Switched to AST-native approach
- Top-level parse tries to parse entire value
- Exception in ANY part fails EVERYTHING

---

## 💡 Solutions

### Option 1: Error Recovery (Tried, Doesn't Work)

```typescript
onParseError(err) {
  errors.push(err);
  // Continue parsing...
}
```

**Problem:** css-tree still throws on `calc(50% & 20px)`, doesn't recover

### Option 2: Try/Catch + Fallback to String Parsing

```typescript
try {
  valueAst = csstree.parse(value, { context: "value", positions: true });
} catch (e) {
  // Fallback: Let property parser handle it layer-by-layer
  return definition.legacyStringParser(value);
}
```

**Problem:** We removed string parsers in Phase 1

### Option 3: Layer-by-Layer Parsing (RECOMMENDED)

For properties that support multiple values (like `background-image`):

```typescript
// Don't parse entire value at once
// Let property parser split and parse each layer

// Skip top-level parse for multi-value properties
if (definition.supportsMultipleValues) {
  // Pass raw value string to property parser
  const parseResult = definition.parser(value);
} else {
  // Parse as AST for single-value properties
  valueAst = csstree.parse(value, { context: "value", positions: true });
  const parseResult = definition.parser(valueAst);
}
```

### Option 4: Hybrid Approach

Keep AST parsing but handle exception better:

```typescript
try {
  valueAst = csstree.parse(value, { context: "value", positions: true });
  const parseResult = definition.parser(valueAst);
} catch (e) {
  // css-tree couldn't parse - try property parser directly
  // Property parser will handle layer-by-layer
  const parseResult = definition.fallbackParser?.(value) || parseErr(...);
}
```

---

## 🎯 Recommended Fix

**Approach:** Revert to string-based parsing for top-level multi-value properties

**Why:**

- css-tree can't handle partial syntax errors in comma-separated lists
- Property parsers ARE designed to handle this
- They parse each layer's AST individually
- One bad layer doesn't stop others

**Implementation:**

1. Add flag to property definition: `multiValue: boolean`
2. For `multiValue` properties, pass raw string to parser
3. Property parser splits by comma, parses each layer's AST
4. Collects partial results

**Changes needed:**

```typescript
// packages/b_declarations/src/types.ts
export interface PropertyDefinition<T = unknown> {
  name: string;
  syntax: string;
  parser: (node: csstree.Value | string) => ParseResult<T>; // ← Accept string OR AST
  multiValue?: boolean; // ← New flag
  // ...
}
```

```typescript
// packages/b_declarations/src/parser.ts
if (definition.multiValue) {
  // Pass raw string - parser will handle layer-by-layer
  const parseResult = definition.parser(value);
} else {
  // Parse to AST first
  valueAst = csstree.parse(value, { context: "value", positions: true });
  const parseResult = definition.parser(valueAst);
}
```

```typescript
// packages/b_declarations/src/properties/background-image/parser.ts
export function parseBackgroundImage(input: csstree.Value | string): ParseResult<BackgroundImageIR> {
  if (typeof input === "string") {
    // Parse layer-by-layer with individual error handling
    return parseLayersFromString(input);
  } else {
    // AST input (single value case)
    return parseFromAST(input);
  }
}
```

---

## ⚠️ Impact

**Severity:** CRITICAL
**Affects:** All multi-value CSS properties
**User Impact:** Valid CSS values rejected when one layer has syntax error

**Examples of affected properties:**

- `background-image` (multiple gradients/images)
- `background` (shorthand with multiple layers)
- `font-family` (fallback list)
- Any property with comma-separated values

---

## 📋 Action Items

1. ❌ **DO NOT** proceed with performance benchmarking
2. ❌ **DO NOT** merge Phase 2 changes
3. ✅ **REVERT** Phase 2 commit
4. ✅ **INVESTIGATE** when regression was introduced (Phase 1?)
5. ✅ **IMPLEMENT** proper multi-value handling
6. ✅ **ADD TESTS** for partial failure scenarios
7. ✅ **RE-RUN** full test suite with edge cases

---

## 🧪 Test Cases to Add

```typescript
describe("Partial failure handling", () => {
  it("should return valid layers when one has syntax error", () => {
    const result = parseDeclaration(`
      background-image:
        linear-gradient(red, blue),
        url(invalid syntax here),
        conic-gradient(red, blue)
    `);

    expect(result.ok).toBe(false);
    expect(result.value).toBeDefined();
    expect(result.value.layers.length).toBe(2); // linear + conic
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
```

---

**STOP WORK. FIX REGRESSION FIRST.** 🛑
