# CSS-Wide Keywords Architecture Refactor

**Date:** 2025-11-08
**Session:** 057

---

## 📋 Problem Statement

**Current State:** Every property parser checks for CSS-wide keywords (`inherit`, `initial`, `unset`, etc.) in their `preParse` function. This is a DRY violation and architectural misalignment.

**Example (current code):**

```typescript
// packages/b_declarations/src/properties/background-size/parser.ts
export const parseBackgroundSize = createMultiValueParser({
  preParse(value: string): ParseResult<BackgroundSize> | null {
    if (isCSSWideKeyword(value)) {
      const result = parseCSSWideKeyword(value);
      if (result.ok) return parseOk({ kind: "keyword", value: result.value });
      return parseErr(result.issues[0]);
    }
    return null;
  },
  // ...
});
```

**This pattern is repeated in:**

- `background-image/parser.ts`
- `background-repeat/parser.ts`
- `background-size/parser.ts`
- `background-attachment/parser.ts`
- `background-origin/parser.ts`
- `background-clip/parser.ts`
- Every future property...

---

## 🎯 Proposed Solution

**Move CSS-wide keyword check to top-level `parseDeclaration` orchestrator.**

### Architecture Principle

CSS-wide keywords are a **universal, cross-cutting concern**. They apply to ALL properties and should be handled in ONE place: the entry point.

### Benefits

1. **DRY** - Logic written exactly once
2. **Separation of Concerns** - Property parsers focus only on their specific syntax
3. **Architectural Purity** - Models how CSS parsers actually work (browser behavior)
4. **Simplified `preParse`** - Now clearly for property-specific keywords only (e.g., `none`)
5. **Future-proof** - New properties get CSS-wide keywords for free

---

## 🏗️ Implementation Plan

### Step 1: Update `parseDeclaration` Orchestrator

**File:** `packages/b_declarations/src/parser.ts`

**Current flow:**

1. Parse input string → extract property/value
2. Get property definition
3. Call property-specific parser
4. Handle result

**New flow:**

1. Parse input string → extract property/value
2. **✨ CHECK CSS-WIDE KEYWORDS (NEW)** → short-circuit if match
3. Get property definition
4. Call property-specific parser
5. Handle result

**Code change:**

```typescript
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  // ... existing parsing logic to extract property/value ...

  // ✨ STEP 2: UNIVERSAL CSS-WIDE KEYWORD CHECK ✨
  const trimmedValue = value.trim().toLowerCase();
  const wideKeywordCheck = cssWideKeywordSchema.safeParse(trimmedValue);

  if (wideKeywordCheck.success) {
    // It's a CSS-wide keyword - short-circuit!
    return parseOk({
      property,
      ir: { kind: "keyword", value: wideKeywordCheck.data },
    });
  }
  // ✨ END UNIVERSAL CHECK ✨

  // Step 3: Look up property definition (existing)
  const definition = getPropertyDefinition(property);
  // ... rest of existing logic ...
}
```

### Step 2: Remove CSS-Wide Checks from Property Parsers

**Remove from ALL property parsers:**

```typescript
// ❌ DELETE THIS FROM preParse:
if (isCSSWideKeyword(value)) {
  const result = parseCSSWideKeyword(value);
  if (result.ok) return parseOk({ kind: "keyword", value: result.value });
  return parseErr(result.issues[0]);
}
```

**Affected files:**

- `packages/b_declarations/src/properties/background-image/parser.ts`
- `packages/b_declarations/src/properties/background-repeat/parser.ts`
- `packages/b_declarations/src/properties/background-size/parser.ts`
- `packages/b_declarations/src/properties/background-attachment/parser.ts`
- `packages/b_declarations/src/properties/background-origin/parser.ts`
- `packages/b_declarations/src/properties/background-clip/parser.ts`

### Step 3: Update `preParse` Documentation

**File:** `packages/b_declarations/src/utils/create-multi-value-parser.ts`

Update JSDoc to clarify that `preParse` is for **property-specific** keywords only:

```typescript
/**
 * Optional: A function to handle property-specific keywords (like 'none')
 * before list splitting occurs.
 *
 * NOTE: CSS-wide keywords (inherit, initial, etc.) are handled by the
 * top-level parseDeclaration orchestrator. Do NOT check for them here.
 *
 * If it returns a result, the list parsing is skipped.
 */
preParse?: (value: string) => ParseResult<TFinal> | null;
```

### Step 4: Clean Up Unused Utility Functions

**File:** `packages/b_declarations/src/utils/keywords.ts`

This entire file may become unused (check references first):

- `CSS_WIDE_KEYWORDS` array
- `isCSSWideKeyword()` function
- `parseCSSWideKeyword()` function

**Decision:** Keep or delete based on whether any other code references them.

**Alternative:** Keep as internal utilities but mark as deprecated/internal.

---

## 📊 Impact Analysis

### Changed Behavior

**None.** This is a pure refactor. External API remains identical.

### Test Changes

**None at top level.** Existing tests for CSS-wide keywords should continue to pass.

**Property-level tests:** May need updates if they test CSS-wide keywords at the property parser level (they shouldn't, but check).

### Breaking Changes

**None.** Internal refactor only.

---

## ✅ Validation Checklist

After implementation:

- [ ] All existing tests pass (especially CSS-wide keyword tests)
- [ ] `just check` passes (typecheck, lint, format)
- [ ] `just build` succeeds
- [ ] Manual smoke test: `parseDeclaration("background-image: inherit")`
- [ ] Manual smoke test: `parseDeclaration("background-size: initial")`
- [ ] Property parsers simplified (no CSS-wide keyword checks)
- [ ] Documentation updated

---

## 🎯 Success Criteria

1. **Single source of truth** - CSS-wide keywords checked in ONE place only
2. **Simplified property parsers** - No CSS-wide keyword logic in any property parser
3. **All tests green** - No regressions
4. **Clearer architecture** - `preParse` is now clearly for property-specific keywords

---

## 📝 Notes

### Why This Matters

This refactor establishes a critical architectural pattern:

**Universal concerns → Top-level orchestrator**
**Property-specific concerns → Property parsers**

This makes the codebase more maintainable and prevents accidental omissions (e.g., forgetting to check for `inherit` in a new property).

### Connection to Session 056

Session 056 established the `cssValueSchema` pattern for component values. This refactor completes the architectural picture by establishing where CSS-wide keywords belong (NOT in component values, but at the property level).

**Layering:**

```
parseDeclaration (top-level)
  ↓ checks CSS-wide keywords (inherit, initial, etc.)
  ↓
Property Parser (background-image, etc.)
  ↓ checks property-specific keywords (none, etc.)
  ↓
Component Value Parser (cssValueSchema)
  ↓ parses literal values, var(), calc(), etc.
```

Clean separation of concerns at each level.

---

**Status:** 📝 **Analysis Complete - Ready for Implementation**
