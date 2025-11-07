# Declaration List Audit - Session 052

**Date:** 2025-11-07
**Status:** Analysis Complete - Requires Design Decisions

---

## Context

User tested `parseDeclarationList` and noticed the `original` field only contains values, not full declarations:

```ts
parseDeclarationList(`
  --angle: 10deg;
  --color-1: red;
  --color-4: blue;
  background-image: repeating-conic-gradient(...);
`)

// Result:
// original: "10deg", "red", "blue", "repeating-conic-gradient(...)"
// ❌ Missing property names
```

This led to a deeper audit revealing **multiple design gaps**.

---

## Issues Identified

### 1. `original` Field Problem

**Current behavior:**
- Single declaration: `original: "10deg"` (just value)
- Declaration list: Same - just values for each declaration
- Value is **regenerated** by `csstree.generate()`, not extracted from source

**Problems:**
- Loses original user input (whitespace, formatting)
- Not useful for debugging ("what did user type?")
- Unclear purpose: is it for clients or internal use?

**Question:** Should we keep `original` field at all?

### 2. No Issue Context

**Current:**
```ts
parseDeclarationList(`
  --angle: 10deg;
  background-image: INVALID;
  --color: red;
`)

// Issues: [{ code: "invalid-value", property: "background-image" }]
// ❌ Can't tell which line/position
// ❌ Can't tell which declaration index (was it 2nd declaration?)
```

**Problems:**
- No source positions (line/column)
- No declaration index
- Can't map issues back to specific declarations
- `DeclarationResult` has no `issues` field - only top-level `ParseResult.issues`

### 3. No Duplicate Handling

**Test case:**
```ts
parseDeclarationList(`
  --color: red;
  --color: blue;
  --color: green;
`)

// Returns: 3 declarations (all of them)
// Expected: CSS spec says "last wins" (only green)
```

**Problems:**
- Returns all duplicates, not just last
- Client must implement cascade logic themselves
- Unclear if this is intentional (CSSOM-like) or bug

### 4. Unclear Partial Failure Semantics

**Observed:**
```ts
parseDeclarationList(`
  --angle: 10deg;
  background-image: INVALID;
  --color: red;
`)

// Returns: { ok: true, value: [...2 valid decls...], issues: [...1 error...] }
```

**Questions:**
- When is `ok: true` vs `ok: false`?
- Currently: `ok: true` if **any** declaration parsed
- Is this correct? Should it be "all valid" or "some valid"?

---

## Design Questions

### Purpose of `parseDeclarationList`

**Option A: CSSOM-like (declaration array)**
- Keep all declarations in order (including duplicates)
- Client decides cascade/duplicate handling
- Good for: tooling, validation, analysis
- Current implementation is closest to this

**Option B: Property map (last wins)**
- Filter duplicates automatically (CSS cascade)
- Return `Map<property, DeclarationResult>`
- Good for: inline styles, computed values

**Option C: Both APIs**
- `parseDeclarationList()` → array (all declarations)
- `parseDeclarationMap()` → map (deduplicated, last wins)

### Issue Propagation

**Option A: Per-declaration issues**
```ts
interface DeclarationResult {
  property: string;
  ir: T;
  issues: Issue[];  // NEW: Per-declaration issues
  // Remove: original field
}
```

**Option B: Enhanced top-level issues**
```ts
// Keep current structure but enrich issues:
interface Issue {
  code: string;
  message: string;
  property?: string;       // Already have
  declarationIndex?: number;  // NEW
  position?: { line: number; column: number };  // NEW (from css-tree AST)
}
```

### Source Position Tracking

Should we use `css-tree` positions to track exact source locations?

```ts
csstree.parse(input, { positions: true })
// AST nodes have: node.loc = { start: { line, column }, end: { line, column } }
```

Benefits:
- Precise error reporting
- Better developer experience
- Can extract original substring from input

Cost:
- More complex implementation
- Need to pass original input through the chain

---

## Test Results

Created temporary tests (cleaned up) showing:

1. ✅ Single invalid declaration: Issues propagate correctly with property context
2. ✅ Multiple declarations with one invalid: Partial success works (ok: true, 2 valid, 1 issue)
3. ✅ All invalid: Returns ok: false with all issues
4. ❌ Syntax error: Returns ok: true (should this be false?)
5. ❌ Duplicates: Returns all 3, not last wins
6. ❌ Issue context: No way to tell which declaration had issue (no index, no position)

---

## Recommendations for Next Session

### Immediate Decisions Needed

1. **`original` field:** Keep, remove, or redesign?
2. **Duplicate handling:** Return all or last wins?
3. **API design:** Array-only, map-only, or both?
4. **Issue tracking:** Per-declaration or enhanced top-level?

### Implementation Plan (After Decisions)

**Phase 1: Issue Context**
- Add `declarationIndex` to issues
- Extract source positions from css-tree AST
- Add tests for issue context

**Phase 2: Duplicate Handling**
- Decide on semantics (all vs last wins)
- Implement chosen approach
- Document behavior clearly

**Phase 3: `original` Field**
- If keeping: Extract from source using AST positions
- If removing: Update types and tests
- Update documentation

**Phase 4: API Clarity**
- Add second function if needed (`parseDeclarationMap`)
- Document use cases clearly
- Add comprehensive examples

---

## Files Analyzed

- `packages/b_declarations/src/declaration-list-parser.ts` (main implementation)
- `packages/b_declarations/src/declaration-list-parser.test.ts` (21 tests - all passing)
- `packages/b_declarations/src/parser.ts` (single declaration parsing)
- `packages/b_declarations/src/types.ts` (type definitions)

---

## Status

**Session 052:** ✅ Audit complete - awaiting design decisions for session 053

The implementation **works** but lacks clarity on:
- Purpose (CSSOM vs property map)
- Issue propagation (context lost)
- Duplicate handling (undefined behavior)
- `original` field utility

All tests pass, but tests may not reflect real-world needs.
