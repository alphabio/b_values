# Phase 5 Proposal: Source Context & Enrichment

**Session:** 046
**Date:** 2025-11-07
**Status:** Awaiting approval

---

## 🎯 Goal

Fix two related issues to improve error reporting UX:

1. **Wire up formatSourceContext** - Users currently get raw location objects instead of formatted visual context
2. **Fix enrichment bug** - Issues only enriched on success path, missing on failure path

---

## 📊 Current State Analysis

### What We Have (Already Built)

✅ **Utility function** - `Ast.formatSourceContext()` in `packages/b_utils/src/parse/ast.ts`

```typescript
export function formatSourceContext(source: string, loc: csstree.CssLocationRange): string {
  // Creates:
  //    1 | color: rgb(300, 0, 0)
  //                   ^
}
```

✅ **Issue type with location** - `packages/b_types/src/result/issue.ts`

```typescript
export interface Issue {
  location?: SourceLocationRange; // ← We capture this
  // Missing: sourceContext?: string;  ← We don't format it!
}
```

✅ **Correct `ok` semantics** - Already documented in `parse.ts`:

```typescript
* 1. **Success**: `ok: true`, `value` contains parsed data
* 2. **Total failure**: `ok: false`, `value` is `undefined`
* 3. **Partial success**: `ok: false`, `value` contains partial data
```

### What's Broken

❌ **No sourceContext field** - Issue type doesn't have field for formatted context

❌ **Enrichment only on success** - Bug in `packages/b_declarations/src/parser.ts` (lines 115-132):

```typescript
// Step 5: Return result
if (!parseResult.ok) {
  return {
    ok: false,
    value: parseResult.value as DeclarationResult | undefined,
    issues: allIssues,  // ← NOT enriched! No sourceContext, no property
    property,
  };
}

return {
  ...parseOk({...}),
  issues: allIssues,  // ← Also not enriched!
};
```

**Issues are never enriched with:**

- `property` field (property name context)
- `sourceContext` field (formatted visual context)

**Note:** The `ok` semantics are **intentionally correct** - `ok: false` with partial value is valid for multi-value parsers. The bug is simply that enrichment doesn't happen on either path!

---

## 🔧 Proposed Solution

### Task 1: Add `sourceContext` to Issue Type

**File:** `packages/b_types/src/result/issue.ts`

**Changes:**

1. Add `sourceContext?: string` field to `Issue` interface
2. Add to helper function parameters (`createError`, `createWarning`, `createInfo`)
3. Update JSDoc with example

**Affected lines:** 84, 119-125, 150-156, 180-186

**Estimate:** 10 minutes

---

### Task 2: Implement Enrichment in parseDeclaration

**File:** `packages/b_declarations/src/parser.ts`

**Current flow:**

```typescript
1. Parse CSS string/object
2. Look up property definition
3. Parse value (single or multi)
4. Collect issues from parser
5. Try generation (collect more issues)
6. Return result  ← Issues NEVER enriched
```

**Proposed flow:**

```typescript
1. Parse CSS string/object
2. Store sourceText for context formatting  ← NEW
3. Look up property definition
4. Parse value (single or multi)
5. Collect issues from parser
6. Try generation (collect more issues)
7. Enrich ALL issues before return  ← NEW
8. Return enriched result
```

**Implementation approach:**

```typescript
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  let property: string;
  let value: string;

  // NEW: Store source text for context formatting
  let sourceText: string;

  if (typeof input === "string") {
    sourceText = input; // Keep original
    const parsed = parseDeclarationString(input);
    if (!parsed.ok) {
      return forwardParseErr<DeclarationResult>(parsed);
    }
    property = parsed.value.property;
    value = parsed.value.value;
  } else {
    property = input.property;
    value = input.value;
    sourceText = `${property}: ${value}`; // Reconstruct
  }

  // ... existing logic (steps 1-4) ...

  // NEW: Enrich issues BEFORE returning
  const enrichedIssues = enrichIssues(allIssues, property, sourceText);

  // Step 5: Return result with enriched issues
  if (!parseResult.ok) {
    return {
      ok: false,
      value: parseResult.value as DeclarationResult | undefined,
      issues: enrichedIssues, // ← Now enriched!
      property,
    };
  }

  return {
    ...parseOk({
      property,
      ir: parseResult.value,
      original: value,
    }),
    issues: enrichedIssues, // ← Now enriched!
  };
}

// NEW: Helper function for enrichment
function enrichIssues(issues: Issue[], property: string, sourceText: string): Issue[] {
  return issues.map((issue) => {
    const enriched: Issue = {
      ...issue,
      property, // Always add property context
    };

    // Add formatted source context if location exists
    if (issue.location) {
      enriched.sourceContext = Ast.formatSourceContext(sourceText, issue.location);
    }

    return enriched;
  });
}
```

**Key decisions:**

1. **Store sourceText early** - Need original input for formatting
2. **Reconstruct for objects** - When input is `{property, value}`, rebuild string
3. **Single enrichment point** - One function called before all returns
4. **Always add property** - Even without location, property context is valuable
5. **Import Ast utilities** - Add `import * as Ast from "@b/utils";`

**Estimate:** 30 minutes

---

### Task 3: Update Tests

**New test file:** `packages/b_declarations/src/parser.test.ts` (or add to existing)

**Test cases:**

1. **Error with source context**

```typescript
test("invalid value includes source context", () => {
  const result = parseDeclaration("color: notacolor");

  expect(result.ok).toBe(false);
  expect(result.issues[0]).toMatchObject({
    code: "invalid-value",
    property: "color",
    sourceContext: expect.stringContaining("notacolor"),
  });
  expect(result.issues[0].sourceContext).toContain("^");
});
```

2. **Multi-value partial failure**

```typescript
test("multi-value partial failure has source context", () => {
  const result = parseDeclaration("background-image: url(a.png), notafunction");

  expect(result.ok).toBe(false);
  expect(result.value).toBeDefined(); // Partial success
  expect(result.issues.length).toBeGreaterThan(0);
  expect(result.issues[0].sourceContext).toBeDefined();
});
```

3. **Object input reconstructs source**

```typescript
test("object input formats source context", () => {
  const result = parseDeclaration({
    property: "color",
    value: "notacolor",
  });

  expect(result.ok).toBe(false);
  expect(result.issues[0].sourceContext).toContain("color: notacolor");
});
```

4. **Success with warnings**

```typescript
test("warnings include source context", () => {
  // Need a property that generates warnings
  // (May need to create test case with deprecated syntax)
  // Skip if no warnings exist yet
});
```

5. **Pointer alignment**

```typescript
test("pointer aligns with error position", () => {
  const result = parseDeclaration("color: rgb(300, 0, 0)");

  expect(result.issues[0].sourceContext).toMatch(/\s+\^/);
  // Verify pointer is under "300"
});
```

**Estimate:** 30 minutes

---

## ⚠️ Open Questions

### Question 1: Location Data in Multi-Value Parsers

**Issue:** Multi-value parsers (like `background-image`) use string-split approach:

```typescript
// background-image parser
export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  const segments = splitByComma(value); // String split, no AST
  // How do we get locations for individual segments?
}
```

**Current behavior:**

- Single-value parsers: AST → location data available ✅
- Multi-value parsers: String split → no location data ❌

**Options:**

**Option A: Accept limitation (Recommended)**

- Multi-value issues won't have `location` → no `sourceContext`
- Still add `property` field for context
- Document limitation
- Future: Could enhance multi-value parsers to track positions

**Option B: Parse to AST for location tracking**

- Parse full value to AST before splitting
- Extract positions from AST nodes
- More complex, slower
- Better error messages

**Option C: Manual offset tracking**

- Track character offsets during string split
- Create synthetic SourceLocationRange objects
- Complex, error-prone
- Brittle to maintain

**Recommendation:** **Option A** - Accept limitation for now

- Most issues come from single-value parsing
- Multi-value failures still get property context
- Can enhance later if needed
- Document in code comments

---

### Question 2: Source Text Storage Strategy

**Issue:** What format should we store for source text?

**Options:**

**Option A: Store as-is (Recommended)**

```typescript
// String input: "color: red"
sourceText = "color: red";

// Object input: {property: "color", value: "red"}
sourceText = "color: red"; // Reconstructed
```

**Pros:** Simple, matches user input
**Cons:** Might not match exact format user provided for object

**Option B: Always normalize**

```typescript
sourceText = `${property}: ${value};`; // Always add semicolon
```

**Pros:** Consistent format
**Cons:** Doesn't match user input

**Option C: Store both**

```typescript
sourceText = originalInput || `${property}: ${value}`;
```

**Pros:** Most accurate
**Cons:** More complex

**Recommendation:** **Option A** - Keep it simple

- Users won't notice difference
- Focus on functionality, not format perfection

---

### Question 3: Enrichment Timing

**Issue:** When should we enrich issues?

**Current proposal:** Enrich once at the end of parseDeclaration

**Alternative:** Enrich at each parser level

```typescript
// In gradient parser
issues.push({
  ...issue,
  property: "background-image",
  sourceContext: formatSourceContext(...)
});
```

**Pros of current (enrich at top):**

- ✅ Single responsibility
- ✅ Consistent enrichment
- ✅ Property context always correct
- ✅ Less code duplication

**Cons:**

- ❌ Lower-level parsers can't add context
- ❌ All enrichment in one place (coupling)

**Recommendation:** Keep enrichment at top level

- Simpler architecture
- Property-level context is what matters
- Lower parsers focus on parsing, not formatting

---

## 📋 Implementation Checklist

### Phase 5.1: Type Updates (10 min)

- [ ] Add `sourceContext?: string` to Issue interface
- [ ] Update helper functions (createError, createWarning, createInfo)
- [ ] Update JSDoc with examples
- [ ] Run typecheck: `just typecheck`

### Phase 5.2: Enrichment Logic (30 min)

- [ ] Add `import * as Ast from "@b/utils"` to parser.ts
- [ ] Store `sourceText` at start of parseDeclaration
- [ ] Create `enrichIssues()` helper function
- [ ] Call enrichment before all returns
- [ ] Run typecheck: `just typecheck`

### Phase 5.3: Testing (30 min)

- [ ] Write test for error with source context
- [ ] Write test for object input reconstruction
- [ ] Write test for pointer alignment
- [ ] Write test for multi-value partial failure
- [ ] Run tests: `just test`

### Phase 5.4: Validation (15 min)

- [ ] Test manually with invalid CSS
- [ ] Verify source context appears in output
- [ ] Verify pointer alignment
- [ ] Run full check: `just check && just build`

### Phase 5.5: Documentation (20 min)

- [ ] Update session handover
- [ ] Document limitation for multi-value parsers
- [ ] Document `ok` semantics in `docs/architecture/patterns/parser-architectures.md`
- [ ] Add section explaining when `ok: false` with value is correct (partial success)

**Total estimate:** ~1.5-2 hours

---

## 📊 Expected Impact

### Before

```json
{
  "ok": false,
  "issues": [
    {
      "code": "invalid-value",
      "message": "Unknown named color 'notacolor'",
      "location": {
        "start": { "line": 1, "column": 8 },
        "end": { "line": 1, "column": 18 }
      }
    }
  ]
}
```

User must manually interpret location 😢

### After

```json
{
  "ok": false,
  "property": "color",
  "issues": [
    {
      "code": "invalid-value",
      "severity": "error",
      "message": "Unknown named color 'notacolor'",
      "property": "color",
      "location": {
        "start": { "line": 1, "column": 8 },
        "end": { "line": 1, "column": 18 }
      },
      "sourceContext": "   1 | color: notacolor\n               ^"
    }
  ]
}
```

User gets visual pointer and context! 😊

---

## 🎓 Risk Assessment

### Low Risk

- ✅ Adding optional field to interface (backward compatible)
- ✅ Using existing utility function (already tested)
- ✅ Single enrichment point (easy to understand)
- ✅ No changes to parser logic (only enrichment)

### Medium Risk

- ⚠️ Multi-value parsers won't have source context (acceptable limitation)
- ⚠️ Need to test pointer alignment carefully
- ⚠️ Object input reconstruction might not match original format

### Mitigation

- Document multi-value limitation clearly
- Add comprehensive tests for pointer alignment
- Accept format differences for object input

---

## ✅ Acceptance Criteria

After implementation, verify:

- [ ] All issues from single-value parsers have `sourceContext` when `location` exists
- [ ] All issues have `property` field
- [ ] Pointer aligns correctly with error character
- [ ] Line numbers are correct
- [ ] Object input works (reconstructed source)
- [ ] Multi-value parsers still work (even without sourceContext)
- [ ] All tests passing (1959+ tests)
- [ ] All typechecks passing
- [ ] All builds passing
- [ ] Documentation updated

---

## 🚀 Recommendation

**Proceed with implementation using:**

- Question 1: **Option A** (Accept multi-value limitation)
- Question 2: **Option A** (Store as-is)
- Question 3: **Current proposal** (Enrich at top level)

This approach is:

- ✅ Simple and maintainable
- ✅ Low risk
- ✅ Achieves 90% of the value
- ✅ Can be enhanced later if needed

**Estimated time:** 1.5-2 hours

---

**Ready to proceed?** Please review and approve or suggest changes.
