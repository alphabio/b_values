# Issue Concatenation Analysis

**Question:** Do we concat all issues across all declarations? How does it work?

---

## 🔍 Current Behavior

**YES - All issues are concatenated into a flat array.**

### Code Flow in `declaration-list-parser.ts`

```ts
// Line 47: Initialize empty array
const allIssues: Issue[] = [];

// Line 56-66: Add issues for syntax errors
allIssues.push(createError(...));

// Line 65-67: Add issues for missing values
allIssues.push(createError(..., { property }));

// Line 72: Parse individual declaration
const result = parseDeclaration({ property, value });

// Line 79: Concat ALL issues from that declaration
allIssues.push(...result.issues);  // ⚠️ Spreads all issues

// Line 88-89: Return all collected issues
return {
  value: declarations,
  issues: allIssues,  // Flat array from ALL declarations
};
```

---

## 📊 Example: Duplicates Problem

**Input:**

```ts
parseDeclarationList(`
  --color: bad1;   // ❌ Error
  --angle: 10deg;  // ✅ Valid
  --color: bad2;   // ❌ Error
  --color: red;    // ✅ Valid
`);
```

**Output:**

```ts
issues: [
  { property: "--color", message: "invalid bad1" }, // Which --color?
  { property: "--color", message: "invalid bad2" }, // Can't tell!
];
```

**Problem:** You know the property name, but NOT which instance!

---

## 💡 Solution: Add Declaration Index

```ts
interface Issue {
  property?: string;
  declarationIndex?: number; // NEW: 0, 1, 2, 3...
}
```

**Updated output:**

```ts
issues: [
  { property: "--color", declarationIndex: 0, message: "invalid bad1" },
  { property: "--color", declarationIndex: 2, message: "invalid bad2" },
];
```

Now you can map back to the exact declaration in the array!

---

## 🔧 Implementation

```ts
// In declaration-list-parser.ts
ast.children.forEach((node, index) => {
  // Track index
  // ... parsing logic ...

  // Enrich issues with declaration index
  const enrichedIssues = result.issues.map((issue) => ({
    ...issue,
    declarationIndex: index,
  }));

  allIssues.push(...enrichedIssues);
});
```

**Changes needed:**

1. Update `Issue` interface in `@b/types` (add optional field)
2. Track index in loop
3. Enrich issues before collecting

---

## ✅ Summary

- **Current:** Yes, all issues concatenated into flat array
- **Problem:** Can't identify which declaration with duplicate properties
- **Solution:** Add `declarationIndex` to Issue interface
- **Impact:** Small change, backward compatible, solves the problem
