# validate() Integration Issues & Findings

**Date:** 2025-11-06
**Session:** 028

---

## 🔍 Issue #1: Missing Generator Warnings During Parse

### Problem

**Experiment 2:** Out-of-range oklab values not reported during parse

```typescript
const css = "background-image: radial-gradient(oklab(-255 255 255), red)";
parseDeclaration(css); // ✅ ok: true, issues: []
```

**BUT** when generating:

```typescript
generateDeclaration({
  property: "background-image",
  ir: result.value.ir,
});
// ✅ ok: true, issues: [3 warnings about out-of-range values]
```

### Analysis

✅ **This is CORRECT behavior** - by design!

**Our 3-phase architecture:**

1. **Parse** - Convert CSS → IR (structural validation)
2. **Transform** - Manipulate IR (pure data)
3. **Generate** - Convert IR → CSS (semantic validation + warnings)

**Why warnings come during generation:**

- oklab(-255 255 255) is **structurally valid CSS**
- Values are out of spec range but not syntax errors
- **Generators** add warnings when creating CSS
- This allows round-trip: parse → transform → generate with warnings

### User Feedback

> "We should be adding our own warning here.. this is an issue that we captured that csstree ignores... let's improve on csstree"

**Response:** We DO add warnings - but during **generation**, not parsing. This is intentional and valuable:

1. **Separation of concerns** - Parse focuses on structure, Generate focuses on semantics
2. **Transformation flexibility** - IR can be modified without re-parsing
3. **Round-trip support** - Can parse invalid CSS, fix IR, generate with warnings

**Recommendation:** ✅ Keep current behavior, but enhance documentation explaining the 3-phase model.

---

## 🔍 Issue #2: css-tree validate() ok:true Doesn't Mean Parseable

### Problem

**Experiment 3:** Malformed CSS

```typescript
const css = "background-image: radial-gradient(circle at )";

parseDeclaration(css);
// ❌ ok: false - "radial-gradient requires at least 2 color stops"

validate(css);
// ✅ ok: true - css-tree parsed the structure successfully
```

### Analysis

**css-tree validate() behavior:**

- `ok: false` = **Syntax error** (CSS won't parse at all)
- `ok: true` = **Structure parsed**, but may have semantic issues
- `warnings: [...]` = Property validation found issues

**Our parseDeclaration() catches:**

- Semantic requirements (e.g., "needs 2+ color stops")
- Business logic (e.g., "oklab needs 3 params")
- Type constraints (e.g., "position must be percentage or length")

### User Feedback

> "What should we do in this situation? Currently we return false... I think we should return false since we do not want to assume how to populate the model. My takeaway on this is we cannot always rely on csstree ok: true sentiment. But we can rely on csstree ok: false statement"

**Response:** ✅ **CORRECT! This is the key insight!**

**Use css-tree validate() strategically:**

- ✅ Trust `ok: false` (syntax error - CSS is malformed)
- ⚠️ Don't trust `ok: true` (structure parsed, but may be incomplete/invalid)
- ✅ Use `warnings` for additional context on WHERE errors are

**Integration strategy:**

```typescript
function parseDeclaration(css: string): ParseResult {
  const validation = validate(css);

  // Only fail fast on TRUE syntax errors
  if (!validation.ok) {
    return {
      ok: false,
      issues: convertSyntaxErrors(validation.errors),
    };
  }

  // Continue with our parser (catches semantic issues)
  const result = ourParser(css);

  // Merge css-tree warnings for rich context
  if (validation.warnings.length > 0) {
    result.issues.push(...convertWarnings(validation.warnings));
  }

  return result;
}
```

---

## 🔍 Issue #3: Multiple Parser Errors Not Collected

### Problem

**Experiment 5:** Multiple issues but only first returned

```typescript
const css = "linear-gradient(oklab(-255 255 255), named(invalid))";

parseDeclaration(css);
// ❌ ok: false
// issues: [{ message: "Unsupported color function: named" }]
//
// ❌ MISSING: oklab out-of-range warning (would come from generator)
```

### Root Cause Analysis

**Found in `packages/b_parsers/src/gradient/linear.ts:129-142`:**

```typescript
const colorStops: Type.ColorStop[] = [];
const issues: Type.Issue[] = [];

for (const stopNodes of stopGroups) {
  const stopResult = ColorStop.fromNodes(stopNodes);
  if (stopResult.ok) {
    colorStops.push(stopResult.value);
  } else {
    issues.push(...stopResult.issues); // ✅ Collects issues
  }
}

if (issues.length > 0) {
  return { ok: false, issues }; // ✅ Returns ALL issues
}
```

**This looks correct!** But the problem is in `color-stop.ts:22-25`:

```typescript
const colorResult = Color.parseNode(firstNode);
if (!colorResult.ok) {
  return parseErr(
    createError(
      "invalid-value",
      `Invalid color value: ${colorResult.issues[0]?.message}` // ❌ Only first issue!
    )
  );
}
```

### The Real Problem

**Two separate issues:**

1. **`named(invalid)` - caught during PARSE**
   - `packages/b_parsers/src/color/color.ts:46`
   - Returns error immediately
   - Stops parsing this color stop

2. **`oklab(-255 255 255)` - caught during GENERATE**
   - Only happens if parse succeeds
   - But parse fails on second color stop
   - So we never get to generation

### User Feedback

> "This is a problem with the validator... we don't return both issues.. we need to investigate why"

**Response:** ⚠️ This is complex - involves both parse AND generate phases:

**Why we don't see both:**

1. First color stop: `oklab(-255 255 255)` parses OK (structural)
2. Second color stop: `named(invalid)` fails parse (unsupported function)
3. Parse returns early with error from step 2
4. Never reach generation phase where oklab warning would be added

**Possible solutions:**

**Option A: Continue parsing despite errors (collect all parse errors)**

```typescript
// In linear.ts
for (const stopNodes of stopGroups) {
  const stopResult = ColorStop.fromNodes(stopNodes);
  if (stopResult.ok) {
    colorStops.push(stopResult.value);
  } else {
    issues.push(...stopResult.issues);
    // ❌ Don't return early - continue collecting
  }
}

// Return error with ALL collected issues
if (issues.length > 0) {
  return {
    ok: false,
    value: partialGradient, // Include what we could parse
    issues,
  };
}
```

**Option B: Add "try generate anyway" mode**

```typescript
// If parse had errors but created partial IR, try generating
if (!parseResult.ok && parseResult.value) {
  const genResult = tryGenerate(parseResult.value);
  if (genResult.issues.length > 0) {
    // Merge generator warnings with parse errors
    parseResult.issues.push(...genResult.issues);
  }
}
```

**Option C: Keep current behavior**

- Parse errors take precedence
- Fix parse errors first, then see generator warnings
- Clearer separation of concerns

**Recommendation:** Start with **Option C** (current), enhance with **css-tree warnings** for context.

---

## 📋 Summary of Findings

### Issue #1: Generator Warnings

- ✅ **Working as designed**
- Keep 3-phase architecture
- Enhance documentation

### Issue #2: css-tree ok:true

- ✅ **Key insight confirmed**
- Trust `ok: false` (syntax errors)
- Don't trust `ok: true` (may still be invalid)
- Use warnings for visual context

### Issue #3: Multiple Issues

- ⚠️ **Complex problem**
- Involves both parse AND generate phases
- Current behavior: fail fast on parse errors
- Future: Could collect all parse errors + run generate for warnings

---

## 🎯 Revised Integration Strategy

```typescript
function parseDeclaration(css: string): ParseResult {
  const validation = validate(css);

  // Step 1: Check for TRUE syntax errors
  if (!validation.ok) {
    return {
      ok: false,
      issues: convertSyntaxErrors(validation.errors),
      property,
    };
  }

  // Step 2: Parse with our system
  const parseResult = ourParser(css);

  // Step 3: Add css-tree warnings for context
  if (validation.warnings.length > 0) {
    const contextIssues = validation.warnings.map((w) => ({
      code: "css-tree-validation",
      severity: "info" as const, // Lower priority than our errors
      message: w.formattedWarning,
      source: "css-tree",
    }));
    parseResult.issues.push(...contextIssues);
  }

  // Step 4: If parse succeeded, optionally try generate for warnings
  if (parseResult.ok) {
    const genResult = tryGenerate({
      property: parseResult.value.property,
      ir: parseResult.value.ir,
    });
    if (genResult.issues.length > 0) {
      // Add generator warnings
      parseResult.issues.push(...genResult.issues);
    }
  }

  return parseResult;
}
```

---

## 🚀 Next Steps

1. **Confirm approach** with user
2. **Decide on Issue #3** - collect all errors or fail fast?
3. **Implement integration** with confirmed strategy
4. **Add tests** for edge cases
5. **Update documentation** explaining 3-phase model
