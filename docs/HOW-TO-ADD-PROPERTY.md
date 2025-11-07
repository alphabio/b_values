# How to Add a CSS Property

**Lean, actionable guide based on background-image implementation.**

---

## 📋 You Need

1. MDN schema (property name, syntax, inherited, initial)
2. 30-60 minutes

---

## 🎯 Flow

```
1. Generate (IR → CSS) - test first, you control the IR
2. Parse (CSS → IR) - test first, handle edge cases
3. Register - wire it up
```

---

## 📦 Import Pattern (Use Namespaces!)

```typescript
// ✅ Parser
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import * as Ast from "@b/utils";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import type * as csstree from "@eslint/css-tree";

// ✅ Generator
import { generateOk, generateErr, createError, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
```

---

## 🛠️ Utilities Reference

### `@b/types` - Results & Issues

```typescript
parseOk(value), parseErr(error)
generateOk(value, property?), generateErr(error, property?)
createError(code, message, options?), createWarning(...)
forwardParseErr<T>(result)  // ⚠️ Chain parse results!

// Reuse existing types - DON'T recreate:
Gradient, Color, ColorStop, Position, Length, Angle, Percentage
```

### `@b/parsers` - Namespace

```typescript
Parsers.Color.*
Parsers.Length.*
Parsers.Angle.*
Parsers.Position.*
Parsers.Gradient.parseFromNode(node)
Parsers.Url.parseUrlFromNode(node)
Parsers.Math.*  // calc(), min(), max()
```

### `@b/generators` - Namespace

```typescript
Generators.Color.*
Generators.Length.*
Generators.Angle.*
Generators.Position.*
Generators.Gradient.generate(ir, options)
```

### `@b/utils` - AST (Namespace)

```typescript
// Type guards (with type narrowing!)
Ast.isFunctionNode(node, name?)
Ast.isIdentifier(node, value?)
Ast.isDimension(node), Ast.isPercentage(node), Ast.isNumber(node)

// List operations
Ast.nodeListToArray(list)  // css-tree List → Array
Ast.splitNodesByComma(nodes)

// Location
Ast.getNodeLocation(node)
```

### `../../utils` - Declaration Utils

```typescript
// Multi-value parsing (for comma-separated values)
createMultiValueParser<ItemType, FinalIR>({
  preParse, // Handle keywords first
  itemParser, // Parse each item
  aggregator, // Combine into final IR
});

// CSS-wide keywords
isCSSWideKeyword(value); // inherit, initial, unset, revert
parseCSSWideKeyword(value);
```

---

## 📝 Steps

### 1. Create Directory

```bash
mkdir -p packages/b_declarations/src/properties/{property-name}
```

### 2. Define IR (`types.ts`)

```typescript
import type { Gradient } from "@b/types"; // Reuse!

// Always use discriminated unions with `kind`
export type BackgroundImageIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: ImageLayer[] };

export type ImageLayer =
  | { kind: "url"; url: string }
  | { kind: "gradient"; gradient: Gradient } // Reuse!
  | { kind: "none" };
```

### 3. Generator Test → Implementation

```typescript
// generator.test.ts
it("should generate url layer", () => {
  const ir = { kind: "layers", layers: [{ kind: "url", url: "img.png" }] };
  const result = generateBackgroundImage(ir);
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.value).toBe("url(img.png)");
});

// generator.ts - Pattern for multi-value
const layerStrings: string[] = [];
const allIssues: Issue[] = [];

for (let i = 0; i < ir.layers.length; i++) {
  const result = generateLayer(ir.layers[i], ["layers", i]);
  if (!result.ok) return result; // Early return
  layerStrings.push(result.value);
  allIssues.push(...result.issues);
}

return { ok: true, value: layerStrings.join(", "), property: "...", issues: allIssues };
```

### 4. Parser Test → Implementation

```typescript
// parser.test.ts
it("should parse url layer", () => {
  const result = parseBackgroundImage("url(img.png)");
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value.kind).toBe("layers");
    expect(result.value.layers[0].kind).toBe("url");
  }
});

// parser.ts - Multi-value pattern
export const parseBackgroundImage = createMultiValueParser<ImageLayer, BackgroundImageIR>({
  preParse(value: string): ParseResult<BackgroundImageIR> | null {
    if (value === "none") return parseOk({ kind: "keyword", value: "none" });
    if (isCSSWideKeyword(value)) {
      const result = parseCSSWideKeyword(value);
      if (result.ok) return parseOk({ kind: "keyword", value: result.value });
    }
    return null;
  },

  itemParser(valueNode: csstree.Value): ParseResult<ImageLayer> {
    const children = Ast.nodeListToArray(valueNode.children);
    const firstNode = children[0];

    if (Ast.isIdentifier(firstNode, "none")) {
      return parseOk({ kind: "none" });
    }

    if (Ast.isFunctionNode(firstNode, "url")) {
      const urlResult = Parsers.Url.parseUrlFromNode(firstNode);
      if (urlResult.ok) return parseOk({ kind: "url", url: urlResult.value.value });
      return forwardParseErr<ImageLayer>(urlResult); // ⚠️ Forward!
    }

    // ... more checks
  },

  aggregator(layers: ImageLayer[]): BackgroundImageIR {
    return { kind: "layers", layers };
  },
});
```

### 5. Register (`definition.ts`)

```typescript
import { defineProperty } from "../../core/registry";
import { parseBackgroundImage } from "./parser";
import { generateBackgroundImage } from "./generator";

defineProperty({
  name: "background-image",
  syntax: "<bg-image>#",
  parser: parseBackgroundImage,
  generator: generateBackgroundImage,
  multiValue: true, // ⚠️ For comma-separated values!
  inherited: false,
  initial: "none",
});
```

### 6. Export (`index.ts`)

```typescript
export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
```

### 7. Wire Up (`properties/index.ts`)

```typescript
export * from "./background-image";
```

### 8. Verify

```bash
pnpm test background-image  # All property tests
just check                   # Format, lint, typecheck
just build                   # Production build
```

---

## 🎯 Key Patterns

### Multi-Value Parser

Use `createMultiValueParser` for comma-separated values. Handles resilience, missing commas, partial failures.

### Type Guards

```typescript
if (Ast.isFunctionNode(firstNode, "url")) {
  // TypeScript knows firstNode is FunctionNode here
  const name = firstNode.name;
}
```

### Error Forwarding

```typescript
const result = Parsers.Url.parseUrlFromNode(node);
if (!result.ok) return forwardParseErr<YourType>(result);
```

### CSS-Wide Keywords

Always handle `inherit`, `initial`, `unset`, `revert` in `preParse`.

---

## ✅ Checklist

- [ ] Created property directory with 8 files
- [ ] Defined IR types (with `kind` discriminator)
- [ ] Generator: test → implement
- [ ] Parser: test → implement
- [ ] Registered in `definition.ts`
- [ ] Exported from `index.ts`
- [ ] Added to `properties/index.ts`
- [ ] All tests pass
- [ ] `just check` passes
- [ ] `just build` passes

---

## 🚨 Don't Forget

1. **`multiValue: true`** for comma-separated properties
2. **Namespace imports** (`import * as Parsers`)
3. **Type guards** for AST node checking
4. **`forwardParseErr`** when chaining parse results
5. **Reuse types** from `@b/types` (Gradient, Color, etc.)
6. **CSS-wide keywords** in `preParse`

---

**Example:** See `properties/background-image/` for complete implementation.

**Deep dive:** See `docs/sessions/054/property-addition-research.md` for detailed patterns.
