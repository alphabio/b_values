# Missing Feature: Source Context Formatting

**Discovered:** Session 045 - Phase 5 (User catch)
**Issue:** We removed `validate()` but never implemented source context formatting
**Impact:** Users don't get nice formatted error messages with visual pointers

---

## 🔍 The Problem

### What We Removed (Phase 2)

```typescript
// OLD: css-tree validate() gave us nice formatted messages
const validation = validate(`${property}: ${value}`);
// Result: Beautiful error with line numbers and pointer
//   1 | color: rgb(300, 0, 0)
//                  ^
```

### What We Have Now

```typescript
// NEW: We have location data but DON'T format it
const issue = {
  code: "invalid-value",
  message: "Unknown named color 'notacolor'",
  location: { start: { line: 1, column: 15 }, end: {...} },
  // ❌ NO sourceContext field!
}
```

### What Users See

```json
{
  "issues": [{
    "code": "invalid-value",
    "message": "Unknown named color 'notacolor'",
    "location": { "start": { "line": 1, "column": 15 }, ... }
  }]
}
```

**Users have to manually interpret location data!** 😢

---

## ✅ What We Have (Already Built!)

### 1. formatSourceContext Utility

**File:** `packages/b_utils/src/parse/ast.ts`

```typescript
export function formatSourceContext(source: string, loc: csstree.CssLocationRange): string {
  // Creates beautiful formatted output:
  //   1 | color: rgb(300, 0, 0)
  //                  ^
}
```

### 2. Issue Type with Location

**File:** `packages/b_types/src/result/issue.ts`

```typescript
export interface Issue {
  code: IssueCode;
  message: string;
  location?: SourceLocationRange; // ← We have this!
  // Missing: sourceContext?: string;
}
```

---

## 🎯 What's Missing

### 1. Add `sourceContext` Field to Issue Type

**File:** `packages/b_types/src/result/issue.ts`

```typescript
export interface Issue {
  code: IssueCode;
  severity: "error" | "warning" | "info";
  message: string;
  property?: string;
  suggestion?: string;
  location?: SourceLocationRange;
  path?: (string | number)[];
  expected?: string;
  received?: string;
  // ADD THIS:
  sourceContext?: string; // ← Formatted error context with pointer
}
```

### 2. Enrich Issues in parseDeclaration

**File:** `packages/b_declarations/src/parser.ts`

**Current (missing enrichment):**

```typescript
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  // ... parsing logic ...

  // Step 5: Return result
  if (!parseResult.ok) {
    return {
      ok: false,
      value: parseResult.value as DeclarationResult | undefined,
      issues: allIssues,  // ← Raw issues, no sourceContext!
      property,
    };
  }

  return { ... };
}
```

**Should be:**

```typescript
import * as Ast from "@b/utils";

export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  // Store original input for context formatting
  const sourceText = typeof input === "string" ? input : `${input.property}: ${input.value}`;

  // ... parsing logic ...

  // Step 5: Enrich issues with source context
  if (!parseResult.ok || allIssues.length > 0) {
    const enrichedIssues = allIssues.map((issue) => {
      if (issue.location) {
        return {
          ...issue,
          property,
          sourceContext: Ast.formatSourceContext(sourceText, issue.location),
        };
      }
      return { ...issue, property };
    });

    if (!parseResult.ok) {
      return {
        ok: false,
        value: parseResult.value as DeclarationResult | undefined,
        issues: enrichedIssues,
        property,
      };
    }

    // Success with warnings
    return {
      ...parseOk({
        property,
        ir: parseResult.value,
        original: value,
      }),
      issues: enrichedIssues,
    };
  }

  // Success without issues
  return parseOk({
    property,
    ir: parseResult.value,
    original: value,
  });
}
```

---

## 📊 Expected Result

### Before (What Users Get Now)

```json
{
  "ok": false,
  "issues": [
    {
      "code": "invalid-value",
      "message": "Unknown named color 'notacolor'",
      "location": {
        "start": { "line": 1, "column": 42, "offset": 41 },
        "end": { "line": 1, "column": 52, "offset": 51 }
      }
    }
  ]
}
```

**User must:**

1. Parse location object
2. Find line 1, column 42
3. Manually visualize where error is
4. 😢 Bad UX

### After (What Users Should Get)

```json
{
  "ok": false,
  "issues": [
    {
      "code": "invalid-value",
      "message": "Unknown named color 'notacolor'",
      "property": "background-image",
      "location": {
        "start": { "line": 1, "column": 42, "offset": 41 },
        "end": { "line": 1, "column": 52, "offset": 51 }
      },
      "sourceContext": "   1 | background-image: linear-gradient(notacolor, blue)\n                                          ^"
    }
  ]
}
```

**User gets:**

1. ✅ Exact line with line number
2. ✅ Visual pointer to error character
3. ✅ Context (property name, surrounding code)
4. 😊 Great UX!

---

## 🚀 Implementation Plan

### Task 5.1: Add sourceContext to Issue Type (5 min)

- [ ] Add `sourceContext?: string;` to `Issue` interface
- [ ] Update JSDoc with example
- [ ] Update `createError`, `createWarning`, `createInfo` functions

### Task 5.2: Implement Enrichment in parseDeclaration (30 min)

- [ ] Import `Ast.formatSourceContext`
- [ ] Store `sourceText` at top of function
- [ ] Enrich issues before returning
- [ ] Handle both error and warning cases
- [ ] Test with invalid CSS

### Task 5.3: Create Tests (30 min)

- [ ] Test error formatting with invalid syntax
- [ ] Test multi-error formatting
- [ ] Test that sourceContext appears in output
- [ ] Test pointer alignment
- [ ] Verify line numbers are correct

### Task 5.4: Update Documentation (15 min)

- [ ] Update error quality docs
- [ ] Add examples to parser architecture doc
- [ ] Note in session handover

**Total time:** ~1.5 hours

---

## 🎓 Why We Missed This

### Root Cause Analysis

1. **Phase 1 (Sessions 042-043):** Implemented AST-native parsing
   - Added `location` to issues ✅
   - But didn't add formatting ❌

2. **Phase 2 (Session 044):** Removed `validate()`
   - Lost beautiful formatted messages ❌
   - Assumed location was enough ❌

3. **Phase 3 (Session 045):** Cleanup
   - Focused on removing obsolete code
   - Didn't notice missing feature ❌

4. **Phase 4 (Session 045):** Audit
   - Checked for technical debt
   - But didn't test actual error output ❌

### Lessons

- ✅ Always test the user-facing output
- ✅ Compare before/after features, not just code
- ✅ "Location data" ≠ "Formatted context"
- ✅ Build utilities but remember to USE them!

---

## 📈 Priority

**HIGH** - This is a regression in user experience

- ❌ Users lost beautiful error messages
- ❌ Location objects are hard to interpret
- ✅ We have all the pieces (just need to connect them)
- ✅ Quick fix (~1.5 hours)

---

## ✅ Acceptance Criteria

After implementation:

- [ ] All issues have `sourceContext` when `location` exists
- [ ] Formatted context matches old `validate()` quality
- [ ] Pointer aligns with error character
- [ ] Line numbers are correct
- [ ] Multi-line errors handled properly
- [ ] Tests verify formatting quality
- [ ] Documentation updated

---

## 🔗 References

- **Original plan:** `docs/sessions/041/ARCHITECTURAL_REFACTORING_PLAN.md` (lines 250-320)
- **Utility function:** `packages/b_utils/src/parse/ast.ts::formatSourceContext`
- **Issue type:** `packages/b_types/src/result/issue.ts`
- **Parser:** `packages/b_declarations/src/parser.ts`

---

**Next step:** Implement Phase 5 - Source Context Formatting
