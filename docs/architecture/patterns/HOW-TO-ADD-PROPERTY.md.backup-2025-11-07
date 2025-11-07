# How to Add a CSS Property

**Based on real refactoring experience: background-size, background-attachment, background-clip, background-origin, background-repeat**

---

## 🎯 The Architecture (Atom vs. Molecule Principle)

Every CSS property value flows through these layers:

```
┌─────────────────────────────────────────────────────┐
│  b_keywords     → Lexicon (string literals)         │
│  b_types        → IR Schemas (Zod + TypeScript)     │
│  b_parsers      → Value-level (CSS AST → IR)        │
│  b_generators   → Value-level (IR → CSS string)     │
│  b_declarations → Property-level orchestration      │
└─────────────────────────────────────────────────────┘
```

**Key Insight:** Value-level parsers/generators are reusable. Property-level code is thin glue.

---

## 🚦 Before You Start

**Ask yourself: Does this value type need its own parser/generator?**

| Value Type     | Reusable?      | Needs Parser/Generator? | Example                     |
| -------------- | -------------- | ----------------------- | --------------------------- |
| `<length>`     | ✅ Universal   | Yes (already exists)    | `10px`, `2rem`              |
| `<color>`      | ✅ Universal   | Yes (already exists)    | `#ff0000`, `rgb(...)`       |
| `<gradient>`   | ✅ Many props  | Yes (already exists)    | `linear-gradient(...)`      |
| `<bg-size>`    | ⚠️ 2-3 props   | Yes (create new)        | `cover`, `100px 50px`       |
| Simple keyword | ❌ Single prop | No (inline)             | `border-collapse: collapse` |

**Rule:** If the value is used by multiple properties OR has complex syntax → create value-level parser/generator.

---

## 📁 Directory Structure

### For Simple Properties (keyword-only values)

```
packages/b_declarations/src/properties/border-collapse/
├── definition.ts      # Property registration
├── generator.test.ts  # Generator tests
├── generator.ts       # Inline generator (simple)
├── index.ts           # Barrel export
├── parser.test.ts     # Parser tests
├── parser.ts          # Inline parser (simple)
└── types.ts           # IR type definition
```

### For Complex Properties (reusable values)

**FIRST:** Create value-level parsers/generators

```
packages/b_parsers/src/background/
├── attachment.ts      # parseBackgroundAttachmentValue
├── clip.ts            # parseBackgroundClipValue
├── origin.ts          # parseBackgroundOriginValue
├── repeat.ts          # parseBackgroundRepeatValue
├── size.ts            # parseBackgroundSizeValue
└── index.ts           # export *

packages/b_generators/src/background/
├── attachment.ts      # generateBackgroundAttachmentValue
├── clip.ts            # generateBackgroundClipValue
├── origin.ts          # generateBackgroundOriginValue
├── repeat.ts          # generateBackgroundRepeatValue
├── size.ts            # generateBackgroundSizeValue
└── index.ts           # export *
```

**THEN:** Create thin property-level orchestrators

```
packages/b_declarations/src/properties/background-size/
├── definition.ts      # Property registration
├── generator.test.ts  # Property-level tests
├── generator.ts       # Thin orchestrator (uses Generators.Background.*)
├── index.ts           # Barrel export
├── parser.test.ts     # Property-level tests
├── parser.ts          # Thin orchestrator (uses Parsers.Background.*)
└── types.ts           # Property IR type definition
```

---

## 🛠️ Step-by-Step: Simple Property (Keywords Only)

### Example: `border-collapse: collapse | separate`

**1. Define Types** (`types.ts`)

```typescript
import { z } from "zod";

export const borderCollapseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: z.enum(["inherit", "initial", "unset", "revert", "revert-layer"]),
  }),
  z.object({
    kind: z.literal("value"),
    value: z.enum(["collapse", "separate"]),
  }),
]);

export type BorderCollapse = z.infer<typeof borderCollapseSchema>;
```

**2. Generator** (`generator.ts`)

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import type { BorderCollapse } from "./types";

export function generateBorderCollapse(ir: BorderCollapse): GenerateResult {
  return generateOk(ir.value, "border-collapse");
}
```

**3. Parser** (`parser.ts`)

```typescript
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";
import { isCSSWideKeyword, parseCSSWideKeyword } from "../../utils";
import type { BorderCollapse } from "./types";

const VALID_VALUES = ["collapse", "separate"] as const;

export function parseBorderCollapse(value: string): ParseResult<BorderCollapse> {
  // Handle CSS-wide keywords
  if (isCSSWideKeyword(value)) {
    const result = parseCSSWideKeyword(value);
    if (result.ok) return parseOk({ kind: "keyword", value: result.value });
    return parseErr(result.issues[0]);
  }

  // Handle property values
  const normalized = value.toLowerCase().trim();
  if (VALID_VALUES.includes(normalized as any)) {
    return parseOk({ kind: "value", value: normalized as "collapse" | "separate" });
  }

  return parseErr(
    createError("invalid-value", `Invalid border-collapse value: '${value}'. Expected: collapse or separate`)
  );
}
```

**4. Register** (`definition.ts`)

```typescript
import { defineProperty } from "../../core/registry";
import { parseBorderCollapse } from "./parser";
import { generateBorderCollapse } from "./generator";

defineProperty({
  name: "border-collapse",
  syntax: "collapse | separate",
  parser: parseBorderCollapse,
  generator: generateBorderCollapse,
  inherited: true,
  initial: "separate",
});
```

---

## 🎨 Step-by-Step: Complex Property (Reusable Values)

### Example: `background-size: <bg-size>#`

Where `<bg-size> = [ <length-percentage> | auto ]{1,2} | cover | contain`

### Phase 1: Value-Level (Reusable)

**1a. Create Value Parser** (`packages/b_parsers/src/background/size.ts`)

```typescript
import type * as csstree from "@eslint/css-tree";
import {
  createError,
  parseErr,
  parseOk,
  forwardParseErr,
  type ParseResult,
  type SizeLayer,
  type SizeValue,
} from "@b/types";
import * as Ast from "@b/utils";
import * as Length from "../length";

/**
 * Parse a single <bg-size> value from a CSS AST node.
 *
 * Syntax: [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain
 */
export function parseBackgroundSizeValue(valueNode: csstree.Value): ParseResult<SizeLayer> {
  const children = Ast.nodeListToArray(valueNode.children);

  // Handle keywords: cover, contain
  if (children.length === 1 && Ast.isIdentifier(children[0])) {
    const keyword = children[0].name;
    if (keyword === "cover" || keyword === "contain") {
      return parseOk({ kind: "keyword", value: keyword });
    }
    if (keyword === "auto") {
      return parseOk({
        kind: "explicit",
        width: { kind: "auto" },
        height: { kind: "auto" },
      });
    }
  }

  // Handle explicit sizes: 1 or 2 values (width [height])
  if (children.length === 1 || children.length === 2) {
    const widthResult = parseSizeValue(children[0]);
    if (!widthResult.ok) return forwardParseErr<SizeLayer>(widthResult);

    if (children.length === 1) {
      return parseOk({
        kind: "explicit",
        width: widthResult.value,
        height: widthResult.value,
      });
    }

    const heightResult = parseSizeValue(children[1]);
    if (!heightResult.ok) return forwardParseErr<SizeLayer>(heightResult);

    return parseOk({
      kind: "explicit",
      width: widthResult.value,
      height: heightResult.value,
    });
  }

  return parseErr(createError("invalid-syntax", `Expected 1-2 size values, got ${children.length}`));
}

function parseSizeValue(node: csstree.CssNode): ParseResult<SizeValue> {
  if (Ast.isIdentifier(node, "auto")) {
    return parseOk({ kind: "auto" });
  }

  if (Ast.isDimension(node)) {
    const lengthResult = Length.parseLengthNode(node);
    if (lengthResult.ok) {
      return parseOk({ kind: "length", value: lengthResult.value });
    }
    return forwardParseErr<SizeValue>(lengthResult);
  }

  if (Ast.isPercentage(node)) {
    const value = Number(node.value);
    return parseOk({
      kind: "percentage",
      value: { value, unit: "%" },
    });
  }

  return parseErr(createError("invalid-syntax", "Expected auto, length, or percentage"));
}
```

**1b. Create Value Generator** (`packages/b_generators/src/background/size.ts`)

```typescript
import { generateOk, generateErr, createError, type GenerateResult, type SizeLayer, type SizeValue } from "@b/types";
import * as Length from "../length";

/**
 * Generate CSS string for a single <bg-size> value.
 */
export function generateBackgroundSizeValue(layer: SizeLayer): GenerateResult {
  if (layer.kind === "keyword") {
    return generateOk(layer.value);
  }

  // Explicit size
  const widthResult = generateSizeValue(layer.width);
  if (!widthResult.ok) return widthResult;

  const heightResult = generateSizeValue(layer.height);
  if (!heightResult.ok) return heightResult;

  // If both values are the same, output only one
  if (widthResult.value === heightResult.value) {
    return generateOk(widthResult.value);
  }

  return generateOk(`${widthResult.value} ${heightResult.value}`);
}

function generateSizeValue(value: SizeValue): GenerateResult {
  if (value.kind === "auto") {
    return generateOk("auto");
  }

  if (value.kind === "length") {
    const result = Length.generate(value.value);
    if (!result.ok) {
      return generateErr(createError("invalid-value", "Failed to generate length"));
    }
    return generateOk(result.value);
  }

  if (value.kind === "percentage") {
    return generateOk(`${value.value.value}${value.value.unit}`);
  }

  return generateErr(createError("invalid-value", `Unknown size value kind`));
}
```

**1c. Export from Background Module** (`packages/b_parsers/src/background/index.ts`)

```typescript
export * from "./size";
// ... other background exports
```

**1d. Export from Main Index** (`packages/b_parsers/src/index.ts`)

```typescript
export * as Background from "./background";
// ... other exports
```

### Phase 2: Property-Level (Thin Orchestrator)

**2a. Define Property Types** (`packages/b_declarations/src/properties/background-size/types.ts`)

```typescript
import { z } from "zod";
import { sizeLayerSchema } from "@b/types"; // Reuse!

export const backgroundSizeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: z.enum(["inherit", "initial", "unset", "revert", "revert-layer"]),
  }),
  z.object({
    kind: z.literal("layers"),
    layers: z.array(sizeLayerSchema).min(1),
  }),
]);

export type BackgroundSize = z.infer<typeof backgroundSizeSchema>;
```

**2b. Property Parser** (`parser.ts`) - **THIN!**

```typescript
import { parseErr, parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundSize } from "./types";
import type { SizeLayer } from "@b/types";

export const parseBackgroundSize = createMultiValueParser<SizeLayer, BackgroundSize>({
  preParse(value: string): ParseResult<BackgroundSize> | null {
    if (isCSSWideKeyword(value)) {
      const result = parseCSSWideKeyword(value);
      if (result.ok) return parseOk({ kind: "keyword", value: result.value });
      return parseErr(result.issues[0]);
    }
    return null;
  },

  itemParser(valueNode: csstree.Value): ParseResult<SizeLayer> {
    // Delegate to value-level parser!
    return Parsers.Background.parseBackgroundSizeValue(valueNode);
  },

  aggregator(layers: SizeLayer[]): BackgroundSize {
    return { kind: "layers", layers };
  },
});
```

**2c. Property Generator** (`generator.ts`) - **THIN!**

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BackgroundSize } from "./types";

export function generateBackgroundSize(ir: BackgroundSize): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value, "background-size");
  }

  const layerStrings: string[] = [];

  for (const layer of ir.layers) {
    // Delegate to value-level generator!
    const result = Generators.Background.generateBackgroundSizeValue(layer);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "), "background-size");
}
```

**2d. Register Property** (`definition.ts`)

```typescript
import { defineProperty } from "../../core/registry";
import { parseBackgroundSize } from "./parser";
import { generateBackgroundSize } from "./generator";

defineProperty({
  name: "background-size",
  syntax: "<bg-size>#",
  parser: parseBackgroundSize,
  generator: generateBackgroundSize,
  multiValue: true, // ⚠️ Comma-separated values!
  inherited: false,
  initial: "auto auto",
});
```

---

## 🧪 Testing Strategy

### Value-Level Tests (in b_parsers/b_generators)

```typescript
// packages/b_parsers/src/background/size.test.ts
describe("parseBackgroundSizeValue", () => {
  it("should parse cover", () => {
    const ast = parse("cover");
    const result = parseBackgroundSizeValue(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "cover" });
    }
  });

  it("should parse explicit size", () => {
    const ast = parse("100px 50px");
    const result = parseBackgroundSizeValue(ast);
    // ... assertions
  });
});
```

### Property-Level Tests (in b_declarations)

```typescript
// packages/b_declarations/src/properties/background-size/parser.test.ts
describe("parseBackgroundSize", () => {
  it("should parse single layer", () => {
    const result = parseBackgroundSize("cover");
    expect(result.ok).toBe(true);
  });

  it("should parse multiple layers", () => {
    const result = parseBackgroundSize("cover, 100px 50px, contain");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.layers).toHaveLength(3);
    }
  });
});
```

---

## 📋 Import Patterns

### In Value-Level Code (`b_parsers`, `b_generators`)

```typescript
// Parsers
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";
import * as Length from "../length";
import * as Color from "../color";

// Generators
import { generateOk, generateErr, createError, type GenerateResult } from "@b/types";
import * as Length from "../length";
import * as Color from "../color";
```

### In Property-Level Code (`b_declarations`)

```typescript
// Parsers
import { parseErr, parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import type * as csstree from "@eslint/css-tree";

// Generators
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
```

---

## 🔑 Key Utilities

### AST Utilities (`@b/utils`)

```typescript
// Type guards (with TypeScript narrowing!)
Ast.isIdentifier(node, "value"?)    // Check if identifier (optionally match value)
Ast.isFunctionNode(node, "name"?)   // Check if function (optionally match name)
Ast.isDimension(node)               // Check if dimension (e.g., 10px)
Ast.isPercentage(node)              // Check if percentage
Ast.isNumber(node)                  // Check if number

// List operations
Ast.nodeListToArray(list)           // Convert css-tree List to Array
Ast.splitNodesByComma(nodes)        // Split array by comma nodes

// Location
Ast.getNodeLocation(node)           // Get source location for errors
```

### Multi-Value Parser (`b_declarations/utils`)

```typescript
createMultiValueParser<ItemType, FinalIR>({
  // Handle keywords before parsing
  preParse(value: string): ParseResult<FinalIR> | null {
    if (isCSSWideKeyword(value)) {
      // Handle inherit, initial, etc.
    }
    return null; // Continue to item parsing
  },

  // Parse each comma-separated item
  itemParser(valueNode: csstree.Value): ParseResult<ItemType> {
    // Parse single value
  },

  // Combine items into final IR
  aggregator(items: ItemType[]): FinalIR {
    return { kind: "layers", layers: items };
  },
});
```

### Error Handling

```typescript
// Create errors
createError("invalid-value", "Description");
createError("invalid-syntax", "Description", { got: "...", expected: "..." });

// Forward parse errors (preserves context!)
const result = Parsers.Length.parse(node);
if (!result.ok) return forwardParseErr<YourType>(result);

// Return errors
return parseErr(error);
return generateErr(error, "property-name");
```

---

## ✅ Checklist

### For Simple Properties:

- [ ] Create property directory in `b_declarations/src/properties/`
- [ ] Define IR types in `types.ts` (with `kind` discriminator)
- [ ] Write generator tests
- [ ] Implement generator
- [ ] Write parser tests
- [ ] Implement parser
- [ ] Register in `definition.ts`
- [ ] Export from `index.ts`
- [ ] Add to `properties/index.ts`
- [ ] Run `pnpm test {property-name}`
- [ ] Run `just check`
- [ ] Run `just build`

### For Complex Properties:

- [ ] **Phase 1: Value-Level**
  - [ ] Create parser in `b_parsers/src/{category}/{value}.ts`
  - [ ] Create generator in `b_generators/src/{category}/{value}.ts`
  - [ ] Write value-level tests
  - [ ] Export from category `index.ts`
  - [ ] Export from main `index.ts`
- [ ] **Phase 2: Property-Level**
  - [ ] Create property directory in `b_declarations/src/properties/`
  - [ ] Define property IR in `types.ts`
  - [ ] Implement thin parser (delegates to `Parsers.*`)
  - [ ] Implement thin generator (delegates to `Generators.*`)
  - [ ] Write property-level tests (multi-value, edge cases)
  - [ ] Register in `definition.ts`
  - [ ] Export from `index.ts`
  - [ ] Add to `properties/index.ts`
- [ ] **Verification**
  - [ ] Run `pnpm test {property-name}`
  - [ ] Run `just check`
  - [ ] Run `just build`

---

## 🚨 Common Mistakes

1. **Mixing layers:** Don't put value-level logic in property parsers/generators
2. **Forgetting CSS-wide keywords:** Always handle in `preParse`
3. **Not using `forwardParseErr`:** Loses error context when chaining parsers
4. **Skipping tests:** Write tests FIRST (TDD)
5. **Missing `multiValue: true`:** Required for comma-separated properties
6. **Not reusing types:** Check `b_types` before creating new types

---

## 📚 Examples

**Simple properties:**

- `packages/b_declarations/src/properties/custom-property/`

**Complex properties (thin orchestrators):**

- `packages/b_declarations/src/properties/background-size/`
- `packages/b_declarations/src/properties/background-repeat/`
- `packages/b_declarations/src/properties/background-image/`

**Value-level parsers/generators:**

- `packages/b_parsers/src/background/`
- `packages/b_generators/src/background/`
- `packages/b_parsers/src/gradient/`
- `packages/b_generators/src/gradient/`

---

**Last Updated:** 2025-11-07
**Based On:** Refactoring 5 background properties following Atom vs. Molecule principle
