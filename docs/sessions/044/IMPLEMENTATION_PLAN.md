# Multi-Value Parser Architecture - Implementation Plan

**Date:** 2025-11-07
**Status:** Ready to implement
**Based on:** User's refined architecture + regression analysis

---

## 🎯 The Solution

**Golden Rule:**

1. **Single-value properties** → Parse entire value to AST, pass AST to parser
2. **Multi-value properties** → Split string by comma, parse EACH chunk to AST individually

**Why this works:**

- Resilient: One bad layer doesn't break others (splitting happens first)
- Robust: All semantic parsing uses validated AST (no string manipulation)
- Maintainable: Clean type signatures, lower-level parsers unchanged

---

## 📋 Implementation Steps

### Step 1: Update Type System ✅

**File:** `packages/b_declarations/src/types.ts`

```typescript
// Single value: receives pre-parsed AST
export type SingleValueParser<T> = (node: csstree.Value) => ParseResult<T>;

// Multi-value: receives raw string, handles splitting + partial failures
export type MultiValueParser<T> = (value: string) => ParseResult<T>;

export interface PropertyDefinition<T = unknown> {
  name: string;
  syntax: string;
  parser: SingleValueParser<T> | MultiValueParser<T>;
  multiValue?: boolean; // Flag to distinguish parser types
  generator?: (ir: T) => GenerateResult;
  inherited: boolean;
  initial: string;
  computed?: string;
}
```

### Step 2: Update Orchestrator ✅

**File:** `packages/b_declarations/src/parser.ts`

```typescript
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  // ... extract property & value ...

  const definition = propertyRegistry.get(property);
  if (!definition) {
    /* error */
  }

  let parseResult: ParseResult<any>;

  if (definition.multiValue) {
    // Multi-value: Pass raw string to parser
    // Parser will split and parse each chunk
    const listParser = definition.parser as MultiValueParser<any>;
    parseResult = listParser(value);
  } else {
    // Single-value: Parse to AST first
    try {
      const valueAst = csstree.parse(value, {
        context: "value",
        positions: true,
      }) as csstree.Value;
      const singleParser = definition.parser as SingleValueParser<any>;
      parseResult = singleParser(valueAst);
    } catch (e: any) {
      // Fatal syntax error for single-value property
      return parseErr(createError("invalid-syntax", e.message));
    }
  }

  // ... collect issues, generator validation, etc ...
}
```

### Step 3: Refactor background-image Parser ✅

**File:** `packages/b_declarations/src/properties/background-image/parser.ts`

**NEW signature - MultiValueParser:**

```typescript
export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  // Handle keywords first
  const trimmed = value.trim();
  if (isCSSWideKeyword(trimmed) || trimmed === "none") {
    // ... keyword handling ...
  }

  // Split by top-level commas
  const layerStrings = splitByComma(trimmed);
  const layerResults: ParseResult<ImageLayer>[] = [];

  for (const layerStr of layerStrings) {
    // ✨ Parse EACH layer to AST individually
    let layerAst: csstree.Value;
    try {
      layerAst = csstree.parse(layerStr, {
        context: "value",
        positions: true,
      }) as csstree.Value;
    } catch (e: any) {
      // This layer has syntax error - continue to next
      const issue = createError("invalid-syntax", `Invalid syntax in background layer: ${e.message}`);
      layerResults.push(parseErr(issue));
      continue;
    }

    // Parse the validated AST node
    const children = Ast.nodeListToArray(layerAst.children);
    if (children.length === 0) {
      layerResults.push(parseErr(createError("missing-value", "Empty background layer")));
      continue;
    }

    const layerResult = parseImageLayerNode(children[0]);
    layerResults.push(layerResult);
  }

  // Aggregate results (existing logic)
  return aggregateLayerResults(layerResults);
}

// Helper: Parse a single layer from AST node
function parseImageLayerNode(node: csstree.CssNode): ParseResult<ImageLayer> {
  // Handle 'none' keyword
  if (Ast.isIdentifier(node, "none")) {
    return parseOk({ kind: "none" });
  }

  // Handle url()
  if (node.type === "Url" || Ast.isFunctionNode(node, "url")) {
    // ... existing url parsing ...
  }

  // Handle gradients
  if (Ast.isFunctionNode(node)) {
    const funcName = node.name.toLowerCase();
    if (funcName.includes("gradient")) {
      const gradientResult = Parsers.Gradient.parseNode(node);
      if (gradientResult.ok) {
        return parseOk({ kind: "gradient", gradient: gradientResult.value });
      }
      return forwardParseErr<ImageLayer>(gradientResult);
    }
  }

  return parseErr(createError("invalid-value", "Unsupported image type"));
}
```

### Step 4: Update background-image Definition ✅

**File:** `packages/b_declarations/src/properties/background-image/definition.ts`

```typescript
export const backgroundImageDefinition: PropertyDefinition<BackgroundImageIR> = {
  name: "background-image",
  syntax: "<bg-image>#",
  parser: parseBackgroundImage,
  multiValue: true, // ← Add this flag
  generator: generateBackgroundImage,
  inherited: false,
  initial: "none",
};
```

### Step 5: Add Test for Partial Failures ✅

**File:** `packages/b_declarations/src/properties/background-image/__tests__/partial-failures.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import * as decl from "../../../index";

describe("background-image: Partial failure handling", () => {
  it("should return valid layers when one has syntax error", () => {
    const result = decl.parseDeclaration(`
      background-image:
        linear-gradient(red, blue),
        radial-gradient(10em 20%, at center, #ff00ff, transparent calc(50% & 20px)),
        conic-gradient(from -100grad, red 0%, blue 100%)
    `);

    // Should fail but have partial value
    expect(result.ok).toBe(false);
    expect(result.value).toBeDefined();
    expect(result.value?.ir).toBeDefined();

    const layers = (result.value!.ir as any).layers;
    expect(layers).toHaveLength(2); // linear + conic
    expect(layers[0].gradient.kind).toBe("linear");
    expect(layers[1].gradient.kind).toBe("conic");

    // Should have syntax error issue
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((i) => i.code === "invalid-syntax")).toBe(true);
  });

  it("should handle all layers invalid", () => {
    const result = decl.parseDeclaration(`
      background-image:
        calc(50% & 20px),
        invalid syntax here,
        @#$%^&*()
    `);

    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("should handle mix of valid url and invalid gradient", () => {
    const result = decl.parseDeclaration(`
      background-image:
        url(image.png),
        linear-gradient(calc(50% & 20px), blue)
    `);

    expect(result.ok).toBe(false);
    expect(result.value?.ir).toBeDefined();
    const layers = (result.value!.ir as any).layers;
    expect(layers).toHaveLength(1); // Only url
    expect(layers[0].kind).toBe("url");
  });
});
```

---

## 🎯 Benefits

1. **Resilience restored** - One bad layer doesn't break others
2. **AST-native maintained** - All semantic parsing uses validated AST
3. **Clean architecture** - Clear type distinction between single/multi parsers
4. **Lower-level unchanged** - Gradient/color parsers remain AST-native
5. **Type-safe** - Compiler enforces correct parser type usage

---

## 📊 Impact Analysis

**Properties affected (need multiValue flag):**

- `background-image` ✅ Implementing
- `background` (shorthand) - TODO
- `font-family` - TODO
- Any comma-separated property - Audit needed

**Properties unchanged (single-value):**

- `color`
- `opacity`
- `width`
- All single-value properties

---

## ✅ Success Criteria

1. Test case passes: 3 gradients, 1 invalid → returns 2 valid + error
2. All existing tests pass (1984/1984)
3. Build passes
4. Typecheck passes
5. No performance regression

---

**Ready to implement** 🚀
