# How to Add a CSS Property

**Based on the background-size refactor (Nov 2025) - the `cssValueSchema` pattern**

---

## 🎯 Core Principles

1. Use **`cssValueSchema`** for component values → get `var()`, `calc()`, literals **for free**
2. **CSS-wide keywords (`inherit`, `initial`, etc.) are handled by `parseDeclaration` automatically**

---

## 💡 Keyword Imports: The Namespace Pattern

**Always** import from `@b/keywords` using a namespace import. This is a critical convention for maintaining clean, scalable, and readable code.

```typescript
// ✅ DO THIS
import type * as Keywords from "@b/keywords";

// Usage
const schema = z.object({
  value: Keywords.bgSize, // Clean, contextual
  clip: Keywords.backgroundClip,
});
```

```typescript
// ❌ DON'T DO THIS
import { bgSize, backgroundClip } from "@b/keywords";
```

**Why?**

1. **Context:** The `Keywords.` prefix makes it immediately clear that `bgSize` is a keyword schema, not a local variable or a type.
2. **No Name Clashes:** It prevents naming collisions. Many properties share keyword names (e.g., `auto`, `none`). A local `bgSize` could clash with a `borderImageSize` if both were imported directly.
3. **Better DX:** Autocomplete is more helpful. Typing `Keywords.` shows a clean, organized list of all available keyword schemas.
4. **Scalability:** As we add more properties, this pattern prevents the import statements from becoming enormous and unmanageable.

---

## 🚦 What Type of Property?

### Type 1: Simple Keywords

`border-collapse: collapse | separate` → Inline validation.

### Type 2: Reusable Value Type ⭐

Property-specific keywords + component values → **Use this pattern**.

Example: `background-size: [ <length-percentage> | auto ]{1,2} | cover | contain`

---

## 📁 Structure for Type 2 (Complex)

```
@b/keywords/src/bg-size.ts          # Zod schema for property keywords
@b/types/src/bg-size.ts              # IR schemas (uses cssValueSchema!)
@b/parsers/src/background/size.ts    # Value parser (uses parseNodeToCssValue)
@b/generators/src/background/size.ts # Value generator (uses cssValueToCss)
@b/declarations/properties/background-size/
  ├── types.ts       # Re-export from @b/types
  ├── parser.ts      # Thin orchestrator
  ├── generator.ts   # Thin orchestrator
  └── definition.ts  # Register property
```

---

## 🛠️ Step-by-Step

### 1. Keywords (`@b/keywords`)

```typescript
// packages/b_keywords/src/bg-size.ts
import { z } from "zod";
import { getLiteralValues } from "./utils";

export const bgSize = z.union([z.literal("auto"), z.literal("cover"), z.literal("contain")]);

export const BG_SIZE = getLiteralValues(bgSize);
export type BgSize = z.infer<typeof bgSize>;
```

Export from `index.ts`.

---

### 2. Types (`@b/types`)

```typescript
// packages/b_types/src/bg-size.ts
import { z } from "zod";
import { cssValueSchema } from "./values/css-value";
import type * as Keywords from "@b/keywords";

// Value-level schema
export const bgSizeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.bgSize,
  }),
  z.object({
    kind: z.literal("explicit"),
    width: cssValueSchema, // ✨ Handles var(), calc(), etc.
    height: cssValueSchema,
  }),
]);

export type BgSize = z.infer<typeof bgSizeSchema>;

// Property-level schema
export const bgSizeListSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide, // For IR type completeness
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(bgSizeSchema).min(1),
  }),
]);

export type BgSizeList = z.infer<typeof bgSizeListSchema>;
```

Export from `index.ts`.

**Note:** CSS-wide keywords are in property-level schema for IR type completeness, but `parseDeclaration` handles them before property parsers execute.

---

### 3a. Value Parser (`@b/parsers`)

```typescript
// packages/b_parsers/src/background/size.ts
import type * as csstree from "@eslint/css-tree";
import { bgSize as bgSizeSchema } from "@b/keywords";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult, type BgSize } from "@b/types";
import * as Ast from "@b/utils";
import { parseNodeToCssValue } from "../utils/css-value-parser";

export function parseBackgroundSizeValue(valueNode: csstree.Value): ParseResult<BgSize> {
  const children = Ast.nodeListToArray(valueNode.children);

  // Single keyword?
  if (children.length === 1 && children[0].type === "Identifier") {
    const keyword = children[0].name;
    const result = bgSizeSchema.safeParse(keyword);
    if (result.success) {
      return parseOk({ kind: "keyword", value: result.data });
    }
    return parseErr(createError("invalid-syntax", `Invalid keyword: '${keyword}'`));
  }

  // Explicit size(s)
  if (children.length === 1 || children.length === 2) {
    const widthResult = parseNodeToCssValue(children[0]); // ✨ Generic!
    if (!widthResult.ok) return forwardParseErr<BgSize>(widthResult);

    if (children.length === 1) {
      return parseOk({
        kind: "explicit",
        width: widthResult.value,
        height: widthResult.value,
      });
    }

    const heightResult = parseNodeToCssValue(children[1]);
    if (!heightResult.ok) return forwardParseErr<BgSize>(heightResult);

    return parseOk({
      kind: "explicit",
      width: widthResult.value,
      height: heightResult.value,
    });
  }

  return parseErr(createError("invalid-syntax", "Expected 1-2 values"));
}
```

Export from `background/index.ts` and main `index.ts` as namespace.

---

### 3b. Value Generator (`@b/generators`)

```typescript
// packages/b_generators/src/background/size.ts
import { generateOk, type GenerateResult, type BgSize } from "@b/types";
import { cssValueToCss } from "@b/utils";

export function generateBackgroundSizeValue(size: BgSize): GenerateResult {
  if (size.kind === "keyword") {
    return generateOk(size.value);
  }

  const widthCss = cssValueToCss(size.width); // ✨ Generic!
  const heightCss = cssValueToCss(size.height);

  // Optimize: same value → output once
  if (widthCss === heightCss) {
    return generateOk(widthCss);
  }

  return generateOk(`${widthCss} ${heightCss}`);
}
```

Export same pattern as parser.

---

### 4a. Property Types (`@b/declarations`)

```typescript
// packages/b_declarations/src/properties/background-size/types.ts
import { bgSizeListSchema, type BgSizeList } from "@b/types";

export type BackgroundSize = BgSizeList;
export const backgroundSizeSchema = bgSizeListSchema;
```

---

### 4b. Property Parser

```typescript
// packages/b_declarations/src/properties/background-size/parser.ts
import { type ParseResult, type BgSize } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundSize } from "./types";

export const parseBackgroundSize = createMultiValueParser<BgSize, BackgroundSize>({
  // NOTE: No preParse for CSS-wide keywords! They're handled by parseDeclaration.
  // Only use preParse for property-specific keywords like 'none'.

  itemParser(valueNode: csstree.Value): ParseResult<BgSize> {
    return Parsers.Background.parseBackgroundSizeValue(valueNode);
  },

  aggregator(values: BgSize[]): BackgroundSize {
    return { kind: "list", values };
  },
});
```

**Thin!** Just comma-separation. CSS-wide keywords handled automatically.

---

### 4c. Property Generator

```typescript
// packages/b_declarations/src/properties/background-size/generator.ts
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BackgroundSize } from "./types";

export function generateBackgroundSize(ir: BackgroundSize): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const valueStrings: string[] = [];
  for (const value of ir.values) {
    const result = Generators.Background.generateBackgroundSizeValue(value);
    if (!result.ok) return result;
    valueStrings.push(result.value);
  }

  return generateOk(valueStrings.join(", "));
}
```

**Thin!** Just join comma-separated values.

---

### 4d. Register

```typescript
// packages/b_declarations/src/properties/background-size/definition.ts
import { defineProperty } from "../../core/registry";
import { parseBackgroundSize } from "./parser";
import { generateBackgroundSize } from "./generator";

defineProperty({
  name: "background-size",
  syntax: "<bg-size>#",
  parser: parseBackgroundSize,
  generator: generateBackgroundSize,
  multiValue: true, // Comma-separated
  inherited: false,
  initial: "auto",
});
```

---

## 🔧 Key Utilities

```typescript
// From @b/utils
parseNodeToCssValue(node)  // Parse any CSS value
cssValueToCss(value)       // Generate any CSS value
forwardParseErr(result)    // Preserve error context
Ast.nodeListToArray(list)
Ast.isIdentifier(node, value?)

// From @b/declarations/utils
createMultiValueParser({ itemParser, aggregator, preParse? })

// From @b/types
createError(code, message)
parseOk(value)
parseErr(error)
generateOk(css, property?)
```

---

## ✅ Checklist

- [ ] **Keywords**: Zod schema in `@b/keywords`
- [ ] **Types**: Use `cssValueSchema` in `@b/types`
- [ ] **Parser**: Use `parseNodeToCssValue` in `@b/parsers`
- [ ] **Generator**: Use `cssValueToCss` in `@b/generators`
- [ ] **Property**: Thin orchestrators in `@b/declarations`
- [ ] **Tests**: Cover var(), calc(), edge cases
- [ ] **Verify**: `pnpm test && just check && just build`

---

## 🚨 Pitfalls

1. ❌ Checking CSS-wide keywords in property parser → ✅ `parseDeclaration` handles them
2. ❌ CSS-wide keywords in `cssValueSchema` → ✅ Property-level IR only
3. ❌ Custom parsers for common values → ✅ Use `parseNodeToCssValue`
4. ❌ Inline value logic in property → ✅ Delegate to value-level
5. ❌ Lose error context → ✅ Use `forwardParseErr`

---

## 💡 The Magic

### Using `cssValueSchema` gives you:

✅ Literals: `100px`, `50%`  
✅ Keywords: `auto`, `none`  
✅ Variables: `var(--size)`, `var(--x, 100px)`  
✅ Functions: `calc(50% + 10px)`, `min()`, `max()`, `clamp()`  
✅ Nested: `calc(var(--base) * 2)`

**Future-proof:** New CSS features work automatically  
**No duplication:** One parser/generator, many properties

---

## 📚 Study These

- `packages/b_types/src/bg-size.ts`
- `packages/b_parsers/src/background/size.ts`
- `packages/b_generators/src/background/size.ts`
- `packages/b_declarations/src/properties/background-size/`

---

**Last Updated:** 2025-11-08  
**Pattern:** `cssValueSchema` for values, `parseDeclaration` for CSS-wide keywords
