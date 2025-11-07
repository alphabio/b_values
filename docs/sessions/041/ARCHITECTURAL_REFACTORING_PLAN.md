# Architectural Refactoring Plan: AST-Native Pipeline

**Date:** 2025-11-06
**Status:** Planned for Session 042
**Priority:** High (foundational improvement)

---

## 🎯 Executive Summary

Transform parser architecture from multi-pass string-based validation to single-pass AST-native traversal.

**Current:** 3+ parsing passes with string manipulation
**Target:** 1 parse with direct AST traversal
**Expected Improvement:** 60-70% performance gain, perfect error locations

---

## 📊 Current Architecture Issues

### Problem 1: Multiple Parsing Passes

```
Pass 1: css-tree validate()        → Generic syntax errors
Pass 2: definition.parser(string)  → Custom string parsing
Pass 3: generateDeclaration(IR)    → Validation during generation
Result: Need to de-duplicate errors with Set
```

### Problem 2: Imprecise Error Locations

**Example:** `calc(50% & 20px)`

- ❌ Error: `")" is expected` (generic, unhelpful)
- ❌ Pointer: Points to `at center` (wrong location)
- ❌ Severity: `info` for hard syntax error (confusing)

### Problem 3: String Manipulation Complexity

- Fragile `splitByComma` logic
- Complex disambiguation for `calc()` vs color functions
- Doesn't handle whitespace/comments consistently
- Requires `as never` type assertions

---

## 🎯 Target Architecture: AST-Native Pipeline

### The Vision

```typescript
// Single parse at top level
parseDeclaration(css: string) {
  const ast = csstree.parse(css, { positions: true });

  // All parsers work on AST nodes
  const result = definition.parser(ast.value);

  // Errors bubble up with .loc data
  // Format context once at the end
  return enrichWithSourceContext(result);
}
```

### Key Signature Change

```typescript
// Before: String-based
export interface PropertyDefinition<T> {
  parser: (value: string) => ParseResult<T>;
}

// After: AST-native
export interface PropertyDefinition<T> {
  parser: (node: csstree.Value) => ParseResult<T>;
}
```

### Perfect Error Example

```json
{
  "code": "invalid-syntax",
  "message": "Unsupported operator in calc(): &",
  "property": "background-image",
  "sourceContext": "  11 |transparent calc(50% & 20px)\n     |                      ^"
}
```

✨ Single error, perfect pointer, actionable message!

---

## 📋 Implementation Plan

### Phase 1: Core Refactoring (Foundation)

#### Task 1.1: Update PropertyDefinition Interface

**File:** `packages/b_declarations/src/types.ts`
**Priority:** P0 (blocking)
**Time:** 15 minutes

```typescript
export interface PropertyDefinition<T = unknown> {
  name: string;
  syntax: string;
  parser: (node: csstree.Value) => ParseResult<T>; // ← CHANGED
  generator?: (ir: T) => GenerateResult;
  inherited: boolean;
  initial: string;
  computed?: string;
}
```

**Impact:** Breaking change requiring all parsers to update

---

#### Task 1.2: Create AST Utility Functions

**File:** `packages/b_utils/src/parse/ast.ts` (new)
**Priority:** P0
**Time:** 1 hour

```typescript
/**
 * Split AST nodes by comma operators
 */
export function splitNodesByComma(nodes: csstree.CssNode[]): csstree.CssNode[][] {
  const groups: csstree.CssNode[][] = [];
  let current: csstree.CssNode[] = [];

  for (const node of nodes) {
    if (node.type === "Operator" && node.value === ",") {
      if (current.length > 0) {
        groups.push(current);
        current = [];
      }
    } else {
      current.push(node);
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

/**
 * Format source context from location data
 */
export function formatSourceContext(source: string, loc: csstree.CssLocation): string {
  const lines = source.split("\n");
  const startLine = loc.start.line;
  const column = loc.start.column;

  // Build snippet with line numbers
  const snippet = lines
    .slice(Math.max(0, startLine - 2), startLine + 1)
    .map((line, idx) => {
      const lineNum = startLine - 1 + idx;
      const prefix = `${String(lineNum).padStart(4)} |`;
      return `${prefix}${line}`;
    })
    .join("\n");

  // Add pointer line
  const pointer = " ".repeat(column + 5) + "^";

  return `${snippet}\n${pointer}`;
}

/**
 * Check if node is a specific function
 */
export function isFunctionNode(node: csstree.CssNode, name?: string): node is csstree.FunctionNode {
  if (node.type !== "Function") return false;
  if (name) return node.name.toLowerCase() === name.toLowerCase();
  return true;
}
```

**Benefits:**

- Clean AST manipulation utilities
- Consistent error formatting
- Type-safe node checking

---

#### Task 1.3: Refactor parseBackgroundImage (Template)

**File:** `packages/b_declarations/src/properties/background-image/parser.ts`
**Priority:** P1
**Time:** 2-3 hours

**Before:**

```typescript
export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  const layers = splitByComma(value);
  for (const layer of layers) {
    if (layer.startsWith("linear-gradient")) {
      const result = Parsers.Gradient.Linear.parse(layer);
      // ...
    }
  }
}
```

**After:**

```typescript
export function parseBackgroundImage(node: csstree.Value): ParseResult<BackgroundImageIR> {
  const children = node.children.toArray();

  // Handle single keywords like 'none'
  if (children.length === 1 && children[0].type === "Identifier") {
    const keyword = children[0].name.toLowerCase();
    if (keyword === "none") {
      return parseOk({ kind: "keyword", keyword });
    }
  }

  // Split by commas using AST utility
  const layerGroups = Ast.splitNodesByComma(children);
  const layerResults: ParseResult<ImageLayer>[] = [];

  for (const group of layerGroups) {
    if (group.length === 0) continue;
    const firstNode = group[0];

    // Natural type checking with AST
    if (Ast.isFunctionNode(firstNode)) {
      const funcName = firstNode.name.toLowerCase();

      if (funcName.includes("gradient")) {
        // Pass AST node directly
        const gradientResult = Parsers.Gradient.parseNode(firstNode);

        if (gradientResult.ok) {
          layerResults.push(
            parseOk({
              kind: "gradient",
              gradient: gradientResult.value,
            })
          );
        } else {
          // Preserve partial value for multi-error handling
          const value = gradientResult.value ? { kind: "gradient", gradient: gradientResult.value } : undefined;
          layerResults.push({
            ok: false,
            issues: gradientResult.issues,
            value,
          });
        }
      }
      // Handle url(), image(), etc.
    } else {
      layerResults.push(
        parseErr(
          createError(
            "invalid-value",
            "Unsupported image type",
            { location: firstNode.loc } // ← Natural location!
          )
        )
      );
    }
  }

  // Multi-error aggregation (existing logic preserved)
  return aggregateResults(layerResults);
}
```

**Key Improvements:**

- ✅ No string manipulation
- ✅ Natural type checking: `node.type === 'Function'`
- ✅ Errors have `.loc` attached automatically
- ✅ Handles whitespace/comments correctly

---

#### Task 1.4: Create Gradient AST Dispatcher

**File:** `packages/b_parsers/src/gradient/gradient.ts`
**Priority:** P1
**Time:** 30 minutes

```typescript
/**
 * Parse gradient from AST function node
 */
export function parseNode(node: csstree.FunctionNode): ParseResult<Type.Gradient> {
  const name = node.name.toLowerCase();

  if (name.includes("radial")) {
    return Radial.fromFunction(node);
  }
  if (name.includes("linear")) {
    return Linear.fromFunction(node);
  }
  if (name.includes("conic")) {
    return Conic.fromFunction(node);
  }

  return parseErr(createError("unsupported-kind", `Not a gradient function: ${name}`, { location: node.loc }));
}
```

**Benefits:**

- Clean dispatch logic
- Type-safe with FunctionNode
- Natural error locations

---

#### Task 1.5: Update Gradient Parsers

**Files:** `packages/b_parsers/src/gradient/{linear,radial,conic}.ts`
**Priority:** P1
**Time:** 1-2 hours

**Note:** These already accept AST nodes in `fromFunction()`!
Just need to verify they don't do intermediate string conversions.

**Changes needed:**

- Remove any `csstree.generate()` calls inside parsers
- Ensure all sub-parsers accept AST nodes
- Verify `parseCssValueNodeEnhanced` is used throughout

---

### Phase 2: Simplify parseDeclaration

#### Task 2.1: Streamline Top-Level Parser

**File:** `packages/b_declarations/src/parser.ts`
**Priority:** P2
**Time:** 2 hours

**Before (complex):**

```typescript
export function parseDeclaration(input: string): ParseResult<DeclarationResult> {
  // 1. Validate with css-tree
  const validationIssues = validate(input);

  // 2. Parse with our parser
  const parseResult = definition.parser(value);

  // 3. Generate to catch more issues
  try {
    const genResult = generateDeclaration(ir);
    // Extract generator issues...
  } catch (e) {
    // Handle generator errors...
  }

  // 4. De-duplicate with Set
  const allIssues = [...new Set([...issues])];
}
```

**After (simple):**

```typescript
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  const sourceText = typeof input === "string" ? input : `${input.property}: ${input.value}`;

  // 1. Single authoritative parse
  let ast: csstree.Declaration;
  try {
    ast = csstree.parse(sourceText, {
      context: "declaration",
      positions: true, // ← Critical for error locations
    }) as csstree.Declaration;
  } catch (e: any) {
    // Catch fatal parse errors
    return parseErr(createError("invalid-syntax", e.message, { location: extractLocationFromError(e, sourceText) }));
  }

  // 2. Get property definition
  const { property, value: valueNode } = ast;
  const definition = propertyRegistry.get(property);

  if (!definition) {
    return parseErr(createError("unsupported-property", `Unknown property: ${property}`, { property }));
  }

  // 3. Delegate to AST-native parser
  const parseResult = definition.parser(valueNode);

  // 4. Enrich issues with source context
  if (!parseResult.ok) {
    const enrichedIssues = parseResult.issues.map((issue) => {
      if (issue.location) {
        return {
          ...issue,
          property,
          sourceContext: Ast.formatSourceContext(sourceText, issue.location),
        };
      }
      return { ...issue, property };
    });

    return {
      ok: false,
      issues: enrichedIssues,
      value: parseResult.value,
    };
  }

  // 5. Success!
  return parseOk({
    property,
    ir: parseResult.value,
    original: csstree.generate(valueNode),
  });
}
```

**Improvements:**

- 🚀 Single pass (3+ passes → 1 pass)
- 🎯 No try/catch workarounds
- 🧩 No `as never` assertions
- 🛡️ Type-safe throughout
- ✨ Perfect error locations

---

### Phase 3: Cleanup

#### Task 3.1: Deprecate String Utilities

**File:** `packages/b_utils/src/parse/split.ts`
**Priority:** P3
**Time:** 30 minutes

**Action:**

- Mark `splitByComma` as deprecated
- Add migration note to use `Ast.splitNodesByComma`
- Update all internal usages

---

#### Task 3.2: Remove Disambiguation Logic

**File:** `packages/b_parsers/src/gradient/disambiguation.ts`
**Priority:** P3
**Time:** 1 hour

**Rationale:**
With AST-native parsing, function detection is trivial:

```typescript
// Before: Complex string heuristics
if (value.includes("calc(") && countParens(value) > 2) {
  // Maybe it's calc? Or a color function?
}

// After: Natural AST checking
if (node.type === "Function" && node.name === "calc") {
  return parseCalcFunction(node);
}
```

**Action:**

- Remove disambiguation.ts
- Update imports in gradient parsers
- Verify tests still pass

---

### Phase 4: Testing & Validation

#### Task 4.1: Update All Tests

**Priority:** P2
**Time:** 3-4 hours

**Test Pattern Change:**

```typescript
// Before: String input
test("parses simple gradient", () => {
  const result = parseBackgroundImage("linear-gradient(red, blue)");
  expect(result.ok).toBe(true);
});

// After: AST input
test("parses simple gradient", () => {
  const valueAst = csstree.parse("linear-gradient(red, blue)", {
    context: "value",
    positions: true,
  }) as csstree.Value;

  const result = parseBackgroundImage(valueAst);
  expect(result.ok).toBe(true);
});

// Or use helper
test("parses simple gradient", () => {
  const result = parseProperty("background-image: linear-gradient(red, blue)");
  expect(result.ok).toBe(true);
});
```

**Files to Update:**

- `packages/b_declarations/src/properties/background-image/__tests__/*.test.ts`
- All property parser tests
- Integration tests

---

#### Task 4.2: Error Quality Verification

**Priority:** P2
**Time:** 2 hours

**Test Cases:**

```typescript
describe("Error Quality", () => {
  test("precise error for invalid calc operator", () => {
    const result = parseProperty("background-image: linear-gradient(red calc(50% & 20px), blue)");

    expect(result.ok).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({
      code: "invalid-syntax",
      message: expect.stringContaining("Unsupported operator: &"),
      property: "background-image",
      sourceContext: expect.stringMatching(/calc\(50% & 20px\)[\s\n]+\^/),
    });
  });

  test("error points to exact character", () => {
    const result = parseProperty("color: rgb(300, 0, 0)");

    expect(result.ok).toBe(false);
    const context = result.issues[0].sourceContext;

    // Verify pointer aligns with "300"
    const lines = context.split("\n");
    const pointerLine = lines[lines.length - 1];
    const valueLine = lines[lines.length - 2];
    const pointerIndex = pointerLine.indexOf("^");
    const valueIndex = valueLine.indexOf("300");

    expect(pointerIndex).toBe(valueIndex);
  });
});
```

---

## 📊 Success Metrics

### Performance

- **Baseline:** Measure current parse time for complex CSS
- **Target:** 60-70% improvement
- **Benchmark:** `linear-gradient(...), radial-gradient(...), conic-gradient(...)`

### Error Quality

- **Baseline:** Multiple errors, wrong pointers
- **Target:** Single error, perfect pointer
- **Test:** `calc(50% & 20px)` example

### Code Quality

- **Baseline:** ~200 lines of string manipulation
- **Target:** Remove all string-based utilities
- **Metric:** Lines of code reduction

---

## 🗓️ Timeline

### Week 1: Foundation

- **Day 1:** Tasks 1.1-1.2 (Interface + utilities)
- **Day 2-3:** Task 1.3 (parseBackgroundImage refactor)
- **Day 4-5:** Tasks 1.4-1.5 (Gradient AST integration)

### Week 2: Core Implementation

- **Day 1-2:** Task 2.1 (parseDeclaration simplification)
- **Day 3-4:** Task 4.1 (Update tests)
- **Day 5:** Task 4.2 (Error quality verification)

### Week 3: Polish & Cleanup

- **Day 1:** Tasks 3.1-3.2 (Deprecate old utilities)
- **Day 2-3:** Performance benchmarking
- **Day 4-5:** Documentation and final testing

**Total Time:** 15-20 hours

---

## 🎯 Migration Strategy

### Backward Compatibility

Keep old `parse(string)` convenience functions:

```typescript
// New primary interface (AST-native)
export function parseBackgroundImage(node: csstree.Value): ParseResult<BackgroundImageIR> {
  // AST-native implementation
}

// Keep for convenience (delegates to AST version)
export function parseBackgroundImageFromString(css: string): ParseResult<BackgroundImageIR> {
  const ast = csstree.parse(css, { context: "value" });
  return parseBackgroundImage(ast as csstree.Value);
}
```

### Gradual Rollout

1. Update one property (background-image) as proof-of-concept
2. Verify tests pass and error quality improves
3. Roll out to remaining properties
4. Remove deprecated utilities last

---

## ✅ Acceptance Criteria

- [ ] All 1971+ tests passing
- [ ] No TypeScript errors
- [ ] Error messages point to exact characters
- [ ] Single error for each issue (no duplicates)
- [ ] Performance improvement verified (60%+ faster)
- [ ] Code complexity reduced (string utils removed)
- [ ] Documentation updated

---

## 🚀 Expected Outcome

**Before:**

```json
{
  "ok": false,
  "issues": [{ "message": "\")\" is expected" }, { "message": "at center\n^^" }]
}
```

**After:**

```json
{
  "ok": false,
  "issues": [
    {
      "message": "Unsupported operator: &",
      "sourceContext": "calc(50% & 20px)\n          ^"
    }
  ]
}
```

✨ **Single precise error with perfect pointer!**

---

**This refactoring represents the final architectural evolution to make the parser production-grade: fast, precise, and maintainable.**
