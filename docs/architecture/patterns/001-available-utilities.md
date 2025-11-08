# Available Utilities Reference

**Purpose:** Quick reference for agents implementing parsers/generators

---

## `@b/parsers/src/utils` - AST Utilities

### `splitNodesByComma(nodes, options)`

Splits AST node array by comma operators. Essential for parsing function arguments.

```typescript
const groups = splitNodesByComma(children, {
  startIndex: 0, // Where to start
  trimWhitespace: true, // Skip whitespace nodes
  allowEmpty: false, // Allow empty groups
});
// Returns: csstree.CssNode[][]
```

**Use cases:** Parsing `min(a, b, c)`, `clamp(min, val, max)`, gradient color stops

### `findFunctionNode(ast, functionNames)`

Finds first function node with matching name (case-insensitive).

```typescript
const result = findFunctionNode(ast, ["calc", "min", "max"]);
if (result.ok) {
  // result.value is FunctionNode
}
```

### `parseCssString(css, context)`

Parses CSS string to AST with error handling.

```typescript
const result = parseCssString("calc(100% - 20px)", "value");
```

---

## `@b/utils/src/parse` - CssValue Parsing

### `parseCssValueNode(node)` ⭐ CRITICAL

**The core recursive parser.** Converts any CSS AST node to CssValue IR.

**Handles:**

- ✅ Numbers, percentages, dimensions
- ✅ Keywords (identifiers)
- ✅ String literals
- ✅ `var()` with fallbacks (inline)
- ✅ Generic functions (fallback)
- ❌ Complex functions (calc, colors) - delegate to specialized parsers

```typescript
const result = parseCssValueNode(astNode);
if (result.ok) {
  // result.value is CssValue (literal | keyword | variable | function)
}
```

**Key insight:** This enables recursive parsing. calc/min/max operands can themselves be calc/min/var!

### `getChildren(functionNode)`

Extracts non-whitespace children from function node.

```typescript
const children = getChildren(functionNode);
// Filters out WhiteSpace nodes
```

### `getValues(children)`

Extracts values, filtering out operator nodes.

```typescript
const values = getValues(children);
// Filters out Operator nodes (commas, etc)
```

### `extractFunctionFromValue(css)` - Test Utility

Extracts FunctionNode from CSS string for tests.

```typescript
const func = extractFunctionFromValue("calc(100% - 20px)");
const result = parseCalcFunction(func);
expect(result.ok).toBe(true);
```

**Pattern:** Use this in all function parser tests (see rgb.test.ts, gradient tests)

---

## `@b/generators` - CSS Generation

### `cssValueToCss(cssValue)`

Converts CssValue IR back to CSS string. Handles all CssValue variants.

```typescript
const css = cssValueToCss({ kind: "literal", value: 10, unit: "px" });
// Returns: "10px"
```

**Recursive:** Handles nested structures (var fallbacks, calc operations)

---

## Key Patterns

### ✅ DO: Recursive Parsing with `parseCssValueNode`

```typescript
// Inside parseCalcFunction
for (const node of operandNodes) {
  const result = parseCssValueNode(node); // Handles literals, vars, nested calcs!
  if (result.ok) values.push(result.value);
}
```

### ✅ DO: Split comma-separated arguments

```typescript
const groups = splitNodesByComma(children);
for (const group of groups) {
  // Parse each group
}
```

### ✅ DO: Use extractFunctionFromValue in tests

```typescript
it("parses calc", () => {
  const func = extractFunctionFromValue("calc(100% - 20px)");
  const result = parseCalcFunction(func);
  expect(result.ok).toBe(true);
});
```

### ❌ DON'T: Re-implement number/dimension parsing

Use `parseCssValueNode` - it already handles all primitives.

### ❌ DON'T: Put complex parsers in `@b/utils`

Complex domain logic belongs in `@b/parsers` to avoid circular deps.

---

## Test Patterns

**From existing tests (gradient, color):**

```typescript
describe("parseMyFunction", () => {
  it("parses simple case", () => {
    const css = "myfunc(arg1, arg2)";
    const result = MyParser.parse(css); // Uses extractFunctionFromValue internally

    expect(result.ok).toBe(true);
    if (!result.ok) return; // Type guard

    expect(result.value.kind).toBe("myfunc");
    expect(result.value.args).toHaveLength(2);
  });

  it("round-trips correctly", () => {
    const result = MyParser.parse(css);
    if (!result.ok) return;

    const genResult = MyGenerator.generate(result.value);
    expect(genResult.ok).toBe(true);
  });
});
```

---

## Architecture Principles

1. **Separation of Concerns**
   - `@b/utils` = Atomic utilities (parseCssValueNode, cssValueToCss)
   - `@b/parsers` = Complex domain parsers (calc, colors, gradients)

2. **Avoid Circular Dependencies**
   - `@b/utils` can import from `@b/types`
   - `@b/parsers` can import from `@b/utils` and `@b/types`
   - Never: `@b/utils` importing from `@b/parsers`

3. **Function Dispatcher Pattern** (Phase 2)
   - Central registry maps function names → specialized parsers
   - `parseCssValueNode` delegates known functions to dispatcher
   - Falls back to generic function for unknown functions

4. **Recursive CssValue**
   - CssValue can contain CssValue (calc operands, var fallbacks)
   - Use `parseCssValueNode` for all recursive parsing
   - Maintains consistent error handling throughout

---

**Updated:** 2025-11-06 (Session 030)
