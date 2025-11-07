# How to Add a CSS Property

**THE Pattern - Established Nov 2025 (Session 058)**

This guide documents the finalized, consistent pattern for adding CSS properties to the b_values library.

---

## 🎯 Core Principles

### 1. **Atom vs. Molecule**
- **Atoms** (in `@b/keywords`): Simple keyword enums
- **Reusable Molecules** (in `@b/types`): Complex types used by multiple properties
- **Property-Specific** (in `@b/declarations`): Wrappers and property logic

### 2. **Spec-Driven Naming**
- Names match CSS spec production names exactly
- `<bg-size>` → `bgSize` (schema) / `BgSize` (type)
- `<image>` → `imageSchema` / `Image`
- `<repeat-style>` → `repeatStyleSchema` / `RepeatStyle`

### 3. **Namespace Imports for Keywords**
```typescript
import * as Keywords from "@b/keywords";

// Clean, contextual usage
Keywords.bgSize      // schema
Keywords.cssWide     // schema
```

### 4. **CSS-wide Keywords Automatic**
`inherit`, `initial`, `unset`, `revert`, `revert-layer` are handled by `parseDeclaration` automatically.
**Do NOT handle these in property parsers.**

---

## 🔍 Decision Tree

### Is it reusable across multiple properties?

**YES** → Create in `@b/types` (reusable molecule)
- Examples: `<image>`, `<repeat-style>`, `<bg-size>`, `<position>`

**NO** → Define in `@b/declarations/properties/*/types.ts` (property-specific)
- Example: `BackgroundImageIR` (wraps `Image[]` with keywords)

---

## 📁 File Structure

For a property like `background-size`:

```
packages/
├── b_keywords/src/
│   └── bg-size.ts              # Keyword enums (if any)
│
├── b_types/src/
│   └── bg-size.ts              # Reusable molecule (if reusable)
│
├── b_parsers/src/background/
│   └── size.ts                 # Value parser logic
│
├── b_generators/src/background/
│   └── size.ts                 # Value generator logic
│
└── b_declarations/src/properties/background-size/
    ├── types.ts                # Property IR (imports from @b/types)
    ├── parser.ts               # Orchestrator (thin)
    ├── generator.ts            # Orchestrator (thin)
    ├── definition.ts           # Property registration
    ├── parser.test.ts          # Parser tests
    └── generator.test.ts       # Generator tests
```

---

## 🛠️ Step-by-Step Guide

### Step 1: Check if Types Already Exist

**Does the CSS spec production already exist in `@b/types`?**

```typescript
// Common reusable types:
import { Image } from "@b/types";           // <image>
import { RepeatStyle } from "@b/types";     // <repeat-style>
import { BgSize } from "@b/types";          // <bg-size>
import { Position } from "@b/types";        // <position>
import { Gradient } from "@b/types";        // <gradient>
```

If YES → Skip to Step 4 (Property Types)
If NO → Continue to Step 2

---

### Step 2: Create Keywords (if needed)

**Only if property has specific keywords.**

```typescript
// packages/b_keywords/src/my-property.ts
import { z } from "zod";

export const myPropertyKeyword = z.union([
  z.literal("keyword1"),
  z.literal("keyword2"),
]);

export type MyPropertyKeyword = z.infer<typeof myPropertyKeyword>;
```

**Export from `packages/b_keywords/src/index.ts`:**
```typescript
export * from "./my-property";
```

**Pattern:**
- No "Keyword" suffix in export name
- Match CSS spec production name
- Always use namespace import in consumers

---

### Step 3: Create Reusable Molecule (if needed)

**Only if the type is reusable across multiple properties.**

```typescript
// packages/b_types/src/my-molecule.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * Represents CSS <my-molecule> production.
 * 
 * CSS Spec: <my-molecule> = ...
 * 
 * Used by:
 * - property-one
 * - property-two
 * 
 * @see https://www.w3.org/TR/...
 */
export const myMoleculeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("value1"),
    // ... fields
  }).strict(),
  z.object({
    kind: z.literal("value2"),
    // ... fields
  }).strict(),
]);

export type MyMolecule = z.infer<typeof myMoleculeSchema>;
```

**Export from `packages/b_types/src/index.ts`:**
```typescript
export * from "./my-molecule";
```

**Add tests in `packages/b_types/src/my-molecule.test.ts`**

---

### Step 4: Create Property Types

```typescript
// packages/b_declarations/src/properties/my-property/types.ts
import type { MyMolecule } from "@b/types";

/**
 * my-property value IR.
 * 
 * Property-level wrapper for the <my-property> property.
 * Supports CSS-wide keywords or a list of values.
 * 
 * @see https://www.w3.org/TR/...
 */
export type MyPropertyIR = 
  | { kind: "keyword"; value: string }  // CSS-wide keywords
  | { kind: "layers"; layers: MyMolecule[] };

// Re-export reusable type for internal use
export type { MyMolecule };
```

**Pattern:**
- Import reusable types from `@b/types`
- Define property-specific wrapper (`MyPropertyIR`)
- Re-export reusable types if needed by parser/generator
- Always handle CSS-wide keywords via `{ kind: "keyword"; value: string }`

---

### Step 5: Create Parser

```typescript
// packages/b_declarations/src/properties/my-property/parser.ts
import type * as csstree from "@eslint/css-tree";
import { parseOk, parseErr, createError, type ParseResult } from "@b/types";
import type { MyPropertyIR } from "./types";

/**
 * Parse my-property value from CSS AST.
 * 
 * CSS-wide keywords are handled by parseDeclaration.
 * This only handles property-specific values.
 */
export function parseMyProperty(valueNode: csstree.Value): ParseResult<MyPropertyIR> {
  // Parse logic here
  // Return parseOk({ kind: "layers", layers: [...] })
  // or parseErr(createError(...))
}
```

**Key points:**
- Don't handle CSS-wide keywords (automatic)
- Use `parseNodeToCssValue` for component values (gets var/calc free)
- Return structured IR matching `MyPropertyIR`

---

### Step 6: Create Generator

```typescript
// packages/b_declarations/src/properties/my-property/generator.ts
import { generateOk, generateErr, type GenerateResult, type GenerateContext } from "@b/types";
import type { MyPropertyIR } from "./types";

/**
 * Generate CSS string from my-property IR.
 */
export function generateMyProperty(ir: unknown, context?: GenerateContext): GenerateResult {
  // Validate structure
  // Generate CSS string
  // Return generateOk("css-string")
  // or generateErr([...issues])
}
```

---

### Step 7: Create Definition

```typescript
// packages/b_declarations/src/properties/my-property/definition.ts
import { defineProperty } from "../../core";
import { parseMyProperty } from "./parser";
import { generateMyProperty } from "./generator";
import { myPropertySchema } from "./types";

export const myProperty = defineProperty({
  name: "my-property",
  parser: parseMyProperty,
  generator: generateMyProperty,
  schema: myPropertySchema,
});
```

**Register in `packages/b_declarations/src/properties/index.ts`:**
```typescript
export * from "./my-property";
```

---

### Step 8: Create Tests

**Parser tests:**
```typescript
// packages/b_declarations/src/properties/my-property/parser.test.ts
import { describe, it, expect } from "vitest";
import { parseDeclaration } from "../../parser";

describe("my-property parser", () => {
  it("parses valid values", () => {
    const result = parseDeclaration("my-property: value");
    expect(result.ok).toBe(true);
  });

  it("handles CSS-wide keywords automatically", () => {
    const result = parseDeclaration("my-property: inherit");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ir.kind).toBe("keyword");
    }
  });
});
```

**Generator tests:**
```typescript
// packages/b_declarations/src/properties/my-property/generator.test.ts
import { describe, it, expect } from "vitest";
import { generateMyProperty } from "./generator";

describe("my-property generator", () => {
  it("generates valid CSS", () => {
    const result = generateMyProperty({ kind: "layers", layers: [...] });
    expect(result.ok).toBe(true);
  });
});
```

---

## 📋 Checklist

Before submitting:

- [ ] Types in correct location (@b/types if reusable, @b/declarations if not)
- [ ] Names match CSS spec productions exactly
- [ ] Using namespace imports for keywords: `import * as Keywords`
- [ ] CSS-wide keywords NOT handled in parser (automatic)
- [ ] Property-level types.ts imports and re-exports correctly
- [ ] Parser tests cover valid values and edge cases
- [ ] Generator tests cover roundtrip scenarios
- [ ] All tests passing: `just test`
- [ ] Typecheck passing: `just check`
- [ ] Build successful: `just build`
- [ ] Documentation updated if needed

---

## 🎨 Example: background-image (Refactored Pattern)

### Files:

**1. Reusable molecule in @b/types:**
```typescript
// packages/b_types/src/image.ts
export const imageSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("url"), url: z.string() }).strict(),
  z.object({ kind: z.literal("gradient"), gradient: z.lazy(...) }).strict(),
]);

export type Image = z.infer<typeof imageSchema>;
```

**2. Property types:**
```typescript
// packages/b_declarations/src/properties/background-image/types.ts
import type { Image } from "@b/types";

export type BackgroundImageIR = 
  | { kind: "keyword"; value: string }
  | { kind: "layers"; layers: ImageLayer[] };

export type ImageLayer = Image | { kind: "none" };

export type { Image }; // Re-export for parser/generator
```

**3. Property parser:**
```typescript
// Uses Image from @b/types via local re-export
import type { ImageLayer } from "./types";

function parseImageLayer(node: csstree.Value): ParseResult<ImageLayer> {
  // Parse logic
}
```

---

## 🚀 Quick Reference

**Where types live:**
- `@b/keywords` → Keyword enums
- `@b/types` → Reusable molecules (<image>, <repeat-style>, etc.)
- `@b/declarations` → Property-specific wrappers

**Naming convention:**
- CSS `<bg-size>` → `bgSize` / `BgSize`
- CSS `<image>` → `imageSchema` / `Image`
- No "Keyword" or "Schema" suffixes

**Import patterns:**
```typescript
import * as Keywords from "@b/keywords";      // Keywords (namespace)
import { Image } from "@b/types";             // Reusable molecules
import type { MyPropertyIR } from "./types";  // Property types
```

**The Rule:**
> Follow the CSS spec productions exactly. If it's `<image>`, call it `imageSchema`.
> If it's reusable, put it in `@b/types`. If it's property-specific, keep it local.

---

**Session 058 - Nov 2025**
**Pattern finalized and proven across 2340+ tests**
