# Property Implementation Protocol v2

**Date:** 2025-11-12  
**Goal:** Scale to 50+ properties with minimal friction

---

## 🎯 Core Philosophy

**Properties are 95% identical. Implement the 5% difference, reuse the 95%.**

Every property follows ONE of two patterns:
1. **Multi-value list** (comma-separated, per layer)
2. **Single value** (applies to element)

The pattern determines EVERYTHING. Follow it exactly.

---

## 📊 The Two Patterns

### Pattern 1: Multi-Value List

**When:** Property applies per background/mask layer

**Examples:** background-image, background-position, background-blend-mode

**Parser lines:** ~18 lines  
**Generator lines:** ~25 lines  
**Types lines:** ~29 lines

**Implementation time:** 15-20 minutes

### Pattern 2: Single Value

**When:** Property applies to entire element

**Examples:** background-color, mix-blend-mode, opacity

**Parser lines:** ~30 lines  
**Generator lines:** ~15 lines  
**Types lines:** ~20 lines

**Implementation time:** 10-15 minutes

---

## 🚀 Implementation Steps

### Step 0: Validate Dependencies

**Check what exists:**

```bash
# Does the value type exist?
grep -r "export.*MyType" packages/b_keywords/src/
grep -r "export.*MyType" packages/b_types/src/

# Does the parser exist?
grep -r "export.*as MyType" packages/b_parsers/src/

# Does the generator exist?
grep -r "export.*as MyType" packages/b_generators/src/
```

**If missing → implement dependencies first (Step 1)**  
**If exists → skip to Step 2**

---

### Step 1: Dependencies (if needed)

#### 1A. Keyword Enum (@b/keywords)

**Location:** `packages/b_keywords/src/my-type.ts`

**Template:**

```typescript
import { getLiteralValues } from "./utils";
import { z } from "zod";

/**
 * Description
 * @see https://spec-url
 */
export const myType = z.union([
  z.literal("value1"),
  z.literal("value2"),
  // ... all keywords
]);

export const MY_TYPE = getLiteralValues(myType);
export type MyType = z.infer<typeof myType>;
```

**Export:** Add `export * from "./my-type";` to `packages/b_keywords/src/index.ts`

#### 1B. Parser (@b/parsers)

**Location:** `packages/b_parsers/src/my-type.ts` OR `packages/b_parsers/src/namespace/my-type.ts`

**Template (keyword enum):**

```typescript
import type * as csstree from "@eslint/css-tree";
import { MY_TYPE, type MyType } from "@b/keywords";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

/**
 * Parse <my-type> value
 * @see https://spec-url
 */
export function parse(valueNode: csstree.Value): ParseResult<MyType> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr("my-type", createError("invalid-syntax", "Expected my-type value"));
  }

  const val = node.name.toLowerCase();
  if (MY_TYPE.includes(val as MyType)) {
    return parseOk(val as MyType);
  }

  return parseErr(
    "my-type",
    createError("invalid-value", `Invalid my-type: '${val}'`),
  );
}
```

**Export:** 
- Top-level: `export * as MyType from "./my-type";` in `packages/b_parsers/src/index.ts`
- Nested: `export * from "./my-type";` in namespace index, then `export * as Namespace from "./namespace";` in main index

#### 1C. Generator (@b/generators)

**Location:** `packages/b_generators/src/my-type.ts` OR `packages/b_generators/src/namespace/my-type.ts`

**Template (simple value):**

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import type { MyType } from "@b/keywords";

/**
 * Generate <my-type> value
 */
export function generate(value: MyType): GenerateResult {
  return generateOk(value);
}
```

**Export:** Same pattern as parser

---

### Step 2: Property Implementation

#### 2A. Types

**Location:** `packages/b_declarations/src/properties/my-property/types.ts`

**Pattern 1: Multi-Value List**

```typescript
import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

/**
 * my-property value with universal CSS function support.
 */
const myPropertyValueSchema = z.union([
  Keywords.myType,  // The actual value type
  cssValueSchema,   // var(), attr(), etc.
]);

export type MyPropertyValue = z.infer<typeof myPropertyValueSchema>;

/**
 * The final IR for the entire `my-property` property.
 */
export const myPropertyIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(myPropertyValueSchema).min(1),
  }),
]);

export type MyPropertyIR = z.infer<typeof myPropertyIRSchema>;
```

**Pattern 2: Single Value**

```typescript
import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

/**
 * my-property value with universal CSS function support.
 */
const myPropertyValueSchema = z.union([
  Keywords.myType,  // The actual value type
  cssValueSchema,   // var(), attr(), etc.
]);

export type MyPropertyValue = z.infer<typeof myPropertyValueSchema>;

/**
 * The final IR for the entire `my-property` property.
 */
export const myPropertyIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("value"),
    value: myPropertyValueSchema,
  }),
]);

export type MyPropertyIR = z.infer<typeof myPropertyIRSchema>;
```

#### 2B. Parser

**Location:** `packages/b_declarations/src/properties/my-property/parser.ts`

**Pattern 1: Multi-Value List**

```typescript
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { MyPropertyIR, MyPropertyValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseMyProperty = createMultiValueParser<MyPropertyValue, MyPropertyIR>({
  propertyName: "my-property",

  itemParser(valueNode: csstree.Value): ParseResult<MyPropertyValue> {
    return Parsers.MyType.parse(valueNode);
  },

  aggregator(layers: MyPropertyValue[]): MyPropertyIR {
    return { kind: "list", values: layers };
  },
});
```

**Pattern 2: Single Value**

```typescript
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { MyPropertyIR } from "./types";

export function parseMyProperty(ast: csstree.Value): ParseResult<MyPropertyIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "my-property",
      value: undefined,
      issues: [{ 
        code: "missing-value", 
        severity: "error", 
        message: "Empty value for my-property" 
      }],
    };
  }

  const result = Parsers.MyType.parse(ast);

  if (result.ok) {
    return {
      ok: true,
      property: "my-property",
      value: { kind: "value", value: result.value },
      issues: result.issues,
    };
  }

  return result as ParseResult<MyPropertyIR>;
}
```

#### 2C. Generator

**Location:** `packages/b_declarations/src/properties/my-property/generator.ts`

**Pattern 1: Multi-Value List**

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { MyPropertyIR } from "./types";

export function generateMyProperty(ir: MyPropertyIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const layerStrings: string[] = [];
  for (const value of ir.values) {
    const result = generateValue(value, Generators.MyType.generate);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "));
}
```

**Pattern 2: Single Value**

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { MyPropertyIR } from "./types";

export function generateMyProperty(ir: MyPropertyIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  return generateValue(ir.value, Generators.MyType.generate);
}
```

#### 2D. Definition

**Location:** `packages/b_declarations/src/properties/my-property/definition.ts`

**Template:**

```typescript
import { defineProperty } from "../../core";
import { parseMyProperty } from "./parser";
import { generateMyProperty } from "./generator";
import type { MyPropertyIR } from "./types";

export const myProperty = defineProperty<MyPropertyIR>({
  name: "my-property",
  syntax: "<my-type>#",  // Or just "<my-type>" for single value
  parser: parseMyProperty,
  multiValue: true,  // false for single value
  generator: generateMyProperty,
  inherited: false,  // Check spec
  initial: "normal",  // Check spec
});
```

#### 2E. Index

**Location:** `packages/b_declarations/src/properties/my-property/index.ts`

```typescript
export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
```

#### 2F. Register Property

**Location:** `packages/b_declarations/src/properties/index.ts`

Add in alphabetical order:

```typescript
export * from "./my-property";
```

---

## ✅ Validation

```bash
# Typecheck
pnpm typecheck

# Tests (add tests later in batch)
pnpm test

# Build
pnpm build

# Full check
just check
```

---

## 🎯 Batch Strategy for 50+ Properties

### Phase 1: Simple Keyword Properties (10 properties, 1 day)

Properties with existing keyword parsers:
- background-blend-mode (blend-mode)
- isolation (isolate | auto)
- mix-blend-mode (blend-mode + plus-lighter)
- object-fit (fill | contain | cover | none | scale-down)
- object-position (position)
- opacity (number 0-1)
- z-index (integer | auto)
- visibility (visible | hidden | collapse)
- cursor (keyword | url)
- pointer-events (keyword)

**Time:** 15-20 min each = 3-4 hours implementation

### Phase 2: Length/Percentage Properties (15 properties, 1-2 days)

Reuse existing length-percentage parser:
- width, height, min-width, max-width, min-height, max-height
- top, right, bottom, left
- margin-{top,right,bottom,left}
- padding-{top,right,bottom,left}

**Time:** 10-15 min each = 3-4 hours implementation

### Phase 3: Structural Shorthands (5 properties, 1 day)

Need BoxSides4, BoxCorners4:
- margin (box-sides-4)
- padding (box-sides-4)
- border-radius (box-corners-4)
- border-width (box-sides-4)
- border-color (box-sides-4)

**Time:** Core types (2h) + properties (15 min each) = 3-4 hours

### Phase 4: Complex Properties (20+ properties, 2-3 days)

Flex, grid, animation, transition, transform, filter, etc.

**Time:** 20-30 min each = 8-12 hours implementation

---

## 🚨 Critical Rules

1. **NEVER implement utilities in property directories** - they belong in shared packages
2. **ALWAYS check existing patterns** - don't invent new approaches
3. **Copy-paste is OK** - properties are 95% identical
4. **Validate dependencies FIRST** - saves massive rework
5. **Batch test writing** - implement 10 properties, then write all tests

---

## 📊 Time Budget Per Property

- Dependencies (if new): 30-45 min
- Property implementation: 15-20 min
- Tests: 10-15 min
- Total: 25-35 min per property (with existing dependencies)

**50 properties = 20-30 hours total** (less than 1 week)

---

## ✅ Success Metrics

- [ ] Typecheck passes
- [ ] Build succeeds
- [ ] Pattern matches existing properties exactly
- [ ] No custom utilities in property directory
- [ ] Exports added to index files
- [ ] Git commit with clear message
