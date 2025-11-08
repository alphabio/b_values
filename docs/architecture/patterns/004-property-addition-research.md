# Property Addition Research: Background-Image Deep Dive

**Date:** 2025-11-07
**Goal:** Understand EXACTLY what we use to build properties (based on background-image)

---

## 🔍 What background-image Actually Uses

### Parser Imports

```typescript
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers"; // ⚠️ Namespace import!
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import * as Ast from "@b/utils"; // ⚠️ Namespace import!
import type { BackgroundImageIR, ImageLayer } from "./types";
import type * as csstree from "@eslint/css-tree";
```

### Generator Imports

```typescript
import { generateOk, generateErr, createError, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators"; // ⚠️ Namespace import!
import type { BackgroundImageIR, ImageLayer } from "./types";
```

---

## 📦 Package Breakdown

### `@b/types` - Result & Issue System

**What we actually use:**

```typescript
// Result constructors
parseOk, parseErr, generateOk, generateErr

// Issue creators
createError, createWarning

// Result types
type ParseResult, type GenerateResult

// Error forwarding
forwardParseErr  // ⚠️ Key utility for chaining parse results!

// Complex types (reuse existing)
type Gradient  // From @b/types - DON'T recreate
```

### `@b/parsers` - Value Parsers (Namespace Import Pattern)

**Available parsers:**

```typescript
import * as Parsers from "@b/parsers";

// Used in background-image:
Parsers.Url.parseUrlFromNode(node)
Parsers.Gradient.parseFromNode(node)

// Also available:
Parsers.Color.*
Parsers.Length.*
Parsers.Angle.*
Parsers.Position.*
Parsers.Math.*  // calc(), min(), max()
```

### `@b/generators` - Value Generators (Namespace Import Pattern)

```typescript
import * as Generators from "@b/generators";

// Used in background-image:
Generators.Gradient.generate(ir, options)

// Also available:
Generators.Color.*
Generators.Length.*
Generators.Angle.*
Generators.Position.*
```

### `@b/utils` - AST Helpers (Namespace Import Pattern)

**Critical AST utilities:**

```typescript
import * as Ast from "@b/utils";

// Node type checks (with type guards!)
Ast.isFunctionNode(node, "url")     // Optional function name check
Ast.isIdentifier(node, "none")      // Optional value check
Ast.isDimension(node)
Ast.isPercentage(node)
Ast.isNumber(node)

// List manipulation
Ast.nodeListToArray(list)           // Convert css-tree List to Array
Ast.splitNodesByComma(nodes)        // Split by comma operators

// Location tracking
Ast.getNodeLocation(node)
Ast.convertLocation(...)
```

### `../../utils` - Declaration-Level Utilities

**Multi-value parsing:**

```typescript
import {
  createMultiValueParser, // ⚠️ KEY for comma-separated values!
  isCSSWideKeyword,
  parseCSSWideKeyword,
} from "../../utils";

// Factory for resilient list parsing:
createMultiValueParser<ItemType, FinalIR>({
  preParse, // Handle keywords before parsing list
  itemParser, // Parse single item
  aggregator, // Combine items into final IR
});
```

---

## 🎯 Key Patterns from background-image

### 1. Multi-Value Parser Factory

```typescript
export const parseBackgroundImage = createMultiValueParser<ImageLayer, BackgroundImageIR>({
  // Pre-parse: Handle global keywords
  preParse(value: string): ParseResult<BackgroundImageIR> | null {
    if (value === "none") return parseOk({ kind: "keyword", value: "none" });
    if (isCSSWideKeyword(value)) {
      const result = parseCSSWideKeyword(value);
      if (result.ok) return parseOk({ kind: "keyword", value: result.value });
    }
    return null; // Not a keyword, parse as list
  },

  // Item parser: Parse each layer
  itemParser(valueNode: csstree.Value): ParseResult<ImageLayer> {
    const children = Ast.nodeListToArray(valueNode.children);
    const firstNode = children[0];

    // Check node types...
    if (Ast.isIdentifier(firstNode, "none")) {
      return parseOk({ kind: "none" });
    }

    if (Ast.isFunctionNode(firstNode, "url")) {
      const urlResult = Parsers.Url.parseUrlFromNode(firstNode);
      if (urlResult.ok) return parseOk({ kind: "url", url: urlResult.value.value });
      return forwardParseErr<ImageLayer>(urlResult); // ⚠️ Forward errors!
    }

    // ... more checks
  },

  // Aggregator: Combine into final IR
  aggregator(layers: ImageLayer[]): BackgroundImageIR {
    return { kind: "layers", layers };
  },
});
```

### 2. Namespace Import Pattern

**Why?** Cleaner, less verbose, organized by domain.

```typescript
// ❌ Don't do this:
import { parseColor } from "@b/parsers/color";
import { parseLength } from "@b/parsers/length";
import { parseAngle } from "@b/parsers/angle";
import { parseUrlFromNode } from "@b/parsers/url";

// ✅ Do this:
import * as Parsers from "@b/parsers";
import * as Generators from "@b/generators";
import * as Ast from "@b/utils";
```

### 3. Node Type Checking with Type Guards

```typescript
const firstNode = children[0];

// Type guards narrow the type!
if (Ast.isFunctionNode(firstNode, "url")) {
  // firstNode is now csstree.FunctionNode
  const name = firstNode.name; // TypeScript knows this exists
}

if (Ast.isIdentifier(firstNode, "none")) {
  // firstNode is now csstree.Identifier
  const value = firstNode.name;
}
```

### 4. Error Forwarding

```typescript
const urlResult = Parsers.Url.parseUrlFromNode(node);
if (urlResult.ok) {
  // Use the value
  return parseOk({ kind: "url", url: urlResult.value.value });
}

// Forward the error with proper typing
return forwardParseErr<ImageLayer>(urlResult);
```

### 5. Generator Iteration Pattern

```typescript
// Generate each layer
const layerStrings: string[] = [];
const allIssues: Issue[] = [];

for (let i = 0; i < ir.layers.length; i++) {
  const layer = ir.layers[i];
  const layerResult = generateImageLayer(layer, ["layers", i]);

  if (!layerResult.ok) {
    return layerResult; // Early return on error
  }

  layerStrings.push(layerResult.value);
  allIssues.push(...layerResult.issues);
}

return {
  ok: true,
  value: layerStrings.join(", "), // Comma-separated
  property: "background-image",
  issues: allIssues,
};
```

---

## 🛠️ Complete Utility Reference

### From `@b/types`

```typescript
// Results
parseOk(value), parseErr(error)
generateOk(value, property?), generateErr(error, property?)

// Issues
createError(code, message, options?)
createWarning(code, message, options?)

// Forwarding
forwardParseErr<T>(result)  // Type-safe error forwarding

// Types to reuse (DON'T recreate)
Gradient, Color, ColorStop, Position, Length, Angle, Percentage
```

### From `@b/parsers` (Namespace)

```typescript
Parsers.Color.*
Parsers.Length.*
Parsers.Angle.*
Parsers.Position.*
Parsers.Gradient.parseFromNode(node)
Parsers.Url.parseUrlFromNode(node)
Parsers.Math.*  // calc(), min(), max()
```

### From `@b/generators` (Namespace)

```typescript
Generators.Color.*
Generators.Length.*
Generators.Angle.*
Generators.Position.*
Generators.Gradient.generate(ir, options)
```

### From `@b/utils` (Namespace - AST)

```typescript
// Type guards
Ast.isFunctionNode(node, name?)
Ast.isIdentifier(node, value?)
Ast.isDimension(node)
Ast.isPercentage(node)
Ast.isNumber(node)

// List operations
Ast.nodeListToArray(list)
Ast.splitNodesByComma(nodes)

// Location
Ast.getNodeLocation(node)
```

### From `../../utils` (Declaration Utils)

```typescript
// Multi-value parsing
createMultiValueParser<ItemType, FinalIR>({ preParse, itemParser, aggregator });

// Keywords
isCSSWideKeyword(value);
parseCSSWideKeyword(value);
```

---

## ✅ Key Takeaways

1. **Use namespace imports** - `import * as Parsers from "@b/parsers"`
2. **Use createMultiValueParser** - For comma-separated values
3. **Use type guards** - `Ast.isFunctionNode()`, `Ast.isIdentifier()`
4. **Forward errors** - `forwardParseErr<T>(result)`
5. **Reuse types** - Don't recreate Gradient, Color, etc.
6. **Handle CSS-wide keywords** - `inherit`, `initial`, `unset`, `revert`
7. **Iterate for generation** - Collect results and issues
8. **Join with ", "** - For multi-value properties

---

## 🎯 This is the REAL blueprint

Everything needed to add a property - no research required.
