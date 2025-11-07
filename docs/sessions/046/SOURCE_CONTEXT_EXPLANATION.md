# Source Context Enrichment - Explanation

**Session 046 - Phase 5**
**Date:** 2025-11-07

---

## 🎯 What We Built

We successfully implemented **issue enrichment** in `parseDeclaration`:

1. ✅ **Property context**: ALL issues now have `property` field
2. ✅ **Source context**: Issues with `location` data get formatted `sourceContext`

---

## 📊 Current Behavior

### What Gets Enriched

```typescript
// Before enrichment (from parser/generator)
{
  code: "invalid-value",
  message: "Unknown named color 'notacolor'",
  // Missing: property field
  // Missing: sourceContext field (if location exists)
}

// After enrichment (in parseDeclaration)
{
  code: "invalid-value",
  message: "Unknown named color 'notacolor'",
  property: "background-image",  // ← ALWAYS added
  sourceContext: "   1 | color: notacolor\n               ^"  // ← Added IF location exists
}
```

---

## ⚠️ Why You Don't See sourceContext

Your example:

```typescript
parseDeclaration(`
  background-image: linear-gradient(red, notacolor, blue)
`);
```

**Result:**

```json
{
  "issues": [
    {
      "code": "invalid-value",
      "message": "Unknown named color 'notacolor'",
      "property": "background-image", // ✅ Has this!
      // ❌ NO sourceContext
      "path": ["layers", 0, "gradient", "colorStops", 1, "color", "name"]
    }
  ]
}
```

### Why No sourceContext?

**The issue comes from the GENERATOR, not the parser!**

#### Phase 1: Parsing (String-Split Approach)

```typescript
// background-image parser (multi-value)
const value = "linear-gradient(red, notacolor, blue)";

// Step 1: Split by commas (STRING OPERATION - no AST!)
const segments = value.split(","); // ["linear-gradient(red", "notacolor", "blue)"]
// ❌ Wait, this doesn't work for nested commas!

// Actually uses: splitByComma utility (still string-based)
const segments = splitByComma(value); // Gets the whole gradient as one segment

// Step 2: Parse each segment individually
for (const segment of segments) {
  // Parses "linear-gradient(red, notacolor, blue)"
  // Internally splits color stops by comma: ["red", "notacolor", "blue"]
  // Each color parsed as named color
  // "notacolor" is VALID SYNTAX (just a name)
  // ✅ Parser succeeds!
}
```

**Key point:** String-split approach means **no AST**, therefore **no location data**.

#### Phase 2: Generation/Validation

```typescript
// Generator validates the IR
const ir = {
  layers: [
    {
      gradient: {
        colorStops: [
          { color: { kind: "named", name: "red" } },
          { color: { kind: "named", name: "notacolor" } }, // ← Check this!
          { color: { kind: "named", name: "blue" } },
        ],
      },
    },
  ],
};

// Generator checks: is "notacolor" a valid CSS named color?
if (!isValidNamedColor("notacolor")) {
  // ❌ Invalid!
  return {
    ok: false,
    issues: [
      {
        code: "invalid-value",
        message: "Unknown named color 'notacolor'",
        path: ["layers", 0, "gradient", "colorStops", 1, "color", "name"],
        // ❌ NO location field (generator doesn't have source text reference)
      },
    ],
  };
}
```

**Key point:** Generator operates on IR (data structures), not source text. It doesn't know where in the original string "notacolor" appeared.

#### Phase 3: Enrichment

```typescript
// In parseDeclaration
function enrichIssues(issues, property, sourceText) {
  return issues.map((issue) => {
    const enriched = {
      ...issue,
      property, // ✅ Always added
    };

    // Only add sourceContext if location exists
    if (issue.location) {
      // ← This is undefined for generator issues!
      enriched.sourceContext = formatSourceContext(sourceText, issue.location);
    }

    return enriched;
  });
}
```

**Key point:** No `location` means no `sourceContext`.

---

## ✅ When You WILL See sourceContext

### Scenario 1: Single-Value Parser with AST

```typescript
// NOT IMPLEMENTED YET - but this is how it would work
parseDeclaration("color: rgb(999 100 50)");

// Single-value parser:
// 1. Parse full value to AST (positions enabled)
// 2. Traverse AST nodes
// 3. Find "999" is out of range
// 4. Create error with location from AST node

// Result:
{
  "issues": [{
    "code": "invalid-value",
    "message": "RGB value out of range: 999 (must be 0-255)",
    "property": "color",
    "location": {
      "start": { "line": 1, "column": 11 },
      "end": { "line": 1, "column": 14 }
    },
    "sourceContext": "   1 | color: rgb(999 100 50)\n                  ^"  // ✅ Has this!
  }]
}
```

### Scenario 2: Parse-Time Syntax Errors

```typescript
parseDeclaration("background-image: url(");  // Unclosed function

// css-tree throws parse error with location
// Result:
{
  "issues": [{
    "code": "invalid-syntax",
    "message": "\")\" is expected",
    "property": "background-image",
    "location": { ... },  // ✅ Has location from css-tree
    "sourceContext": "   1 | background-image: url(\n                            ^"  // ✅ Has this!
  }]
}
```

---

## 📋 Summary

### What Works Now

| Enrichment      | Always? | Condition                    |
| --------------- | ------- | ---------------------------- |
| `property`      | ✅ YES  | Always added                 |
| `sourceContext` | ❌ NO   | Only if issue has `location` |

### Where Location Comes From

| Source                             | Has Location? | Example                              |
| ---------------------------------- | ------------- | ------------------------------------ |
| Parser (single-value, AST-based)   | ✅ YES        | `color` parser (not implemented yet) |
| Parser (multi-value, string-split) | ❌ NO         | `background-image` parser (current)  |
| Generator (IR validation)          | ❌ NO         | Named color validation (your case)   |
| css-tree parse errors              | ✅ YES        | Syntax errors                        |

### Your Specific Case

```
Input: linear-gradient(red, notacolor, blue)
                            ^^^^^^^^^
                            This part

Phase 1 (Parser): ✅ Succeeds - "notacolor" is valid syntax
Phase 2 (Generator): ❌ Fails - "notacolor" is not a valid CSS color
Issue created: Has path ✅, NO location ❌
Enrichment: Adds property ✅, NO sourceContext ❌
```

---

## 🚀 Future Improvements

To get `sourceContext` for your case, we would need:

### Option 1: AST-Based Multi-Value Parsing

```typescript
// Instead of string-split, parse to AST first
const ast = csstree.parse(value, { context: "value", positions: true });
const segments = splitNodesByComma(ast.children); // AST nodes with location!

// Then when generator finds error, map back to AST node location
```

**Pros:** Accurate location data
**Cons:** More complex, slower, requires significant refactoring

### Option 2: Manual Position Tracking

```typescript
// Track character offsets during string-split
const segments = splitByComma(value, { trackPositions: true });
// segments = [
//   { value: "red", start: 0, end: 3 },
//   { value: "notacolor", start: 5, end: 14 },  // ← We know where it is!
//   { value: "blue", start: 16, end: 20 }
// ]
```

**Pros:** Still relatively fast
**Cons:** Complex bookkeeping, error-prone

### Option 3: Accept Limitation (Current Choice)

- Multi-value validation errors don't get `sourceContext`
- Single-value parsers (future) will have `sourceContext`
- `property` context is still valuable
- Can enhance later if needed

**Pros:** Simple, maintainable, gets 80% of value
**Cons:** Some errors lack visual context

---

## ✅ Verification

Run the test to see all scenarios:

```bash
npx tsx docs/sessions/046/test-source-context.ts
```

You'll see:

- ✅ All scenarios have `property` enrichment
- ❌ No scenarios have `sourceContext` (multi-value limitations)
- 📊 This is expected behavior as documented

---

**Conclusion:** Your issue enrichment IS working! You're seeing `property` added. The missing `sourceContext` is an expected limitation of multi-value parsers that we documented in the proposal.
