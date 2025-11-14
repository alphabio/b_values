# Property Implementation Guide

**Status:** Production-ready, validated against codebase  
**Goal:** Scale to 50+ properties efficiently

---

## 🎯 The Two Patterns

Every property is **exactly one** of these:

### Pattern A: Multi-Value List

- **When:** Applies per background/mask layer
- **Examples:** background-image, background-position, background-blend-mode
- **IR:** `{ kind: "list", values: T[] }`
- **Time:** 15-20 min

### Pattern B: Single Value

- **When:** Applies to entire element
- **Examples:** background-color, opacity, mix-blend-mode
- **IR:** `{ kind: "value", value: T }`
- **Time:** 10-15 min

---

## 📋 Implementation Checklist

### Step 1: Check Dependencies

```bash
# Does keyword enum exist?
grep -r "export.*BlendMode" packages/b_keywords/src/

# Does parser exist?
grep -r "export.*as BlendMode" packages/b_parsers/src/

# Does generator exist?
grep -r "export.*as BlendMode" packages/b_generators/src/
```

**If missing → Step 2. If exists → Step 3.**

---

### Step 2: Create Dependencies (if needed)

#### Keyword Enum (@b/keywords)

**File:** `packages/b_keywords/src/blend-mode.ts`

```typescript
import { getLiteralValues } from "./utils";
import { z } from "zod";

export const blendMode = z.union([
  z.literal("normal"),
  z.literal("multiply"),
  // ... all keywords
]);

export const BLEND_MODE = getLiteralValues(blendMode);
export type BlendMode = z.infer<typeof blendMode>;
```

**Export:** Add to `packages/b_keywords/src/index.ts`:

```typescript
export * from "./blend-mode";
```

#### Parser (@b/parsers)

**File:** `packages/b_parsers/src/blend-mode.ts`

```typescript
import type * as csstree from "@eslint/css-tree";
import { BLEND_MODE, type BlendMode } from "@b/keywords";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

export function parse(valueNode: csstree.Value): ParseResult<BlendMode> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr("blend-mode", createError("invalid-syntax", "Expected blend-mode value"));
  }

  const val = node.name.toLowerCase();
  if (BLEND_MODE.includes(val as BlendMode)) {
    return parseOk(val as BlendMode);
  }

  return parseErr("blend-mode", createError("invalid-value", `Invalid blend-mode: '${val}'`));
}
```

**Export:** Add to `packages/b_parsers/src/index.ts`:

```typescript
export * as BlendMode from "./blend-mode";
```

#### Generator (@b/generators)

**File:** `packages/b_generators/src/blend-mode.ts`

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import type { BlendMode } from "@b/keywords";

export function generate(value: BlendMode): GenerateResult {
  return generateOk(value);
}
```

**Export:** Add to `packages/b_generators/src/index.ts`:

```typescript
export * as BlendMode from "./blend-mode";
```

---

### Step 3: Implement Property

Create directory: `packages/b_declarations/src/properties/background-blend-mode/`

#### 3A. Types (`types.ts`)

**Pattern A (Multi-Value):**

```typescript
import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

const backgroundBlendModeValueSchema = z.union([Keywords.blendMode, cssValueSchema]);

export type BackgroundBlendModeValue = z.infer<typeof backgroundBlendModeValueSchema>;

export const backgroundBlendModeIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundBlendModeValueSchema).min(1),
  }),
]);

export type BackgroundBlendModeIR = z.infer<typeof backgroundBlendModeIRSchema>;
```

**Pattern B (Single Value):**

```typescript
// Change "list" to "value" and use single value instead of array
z.object({
  kind: z.literal("value"),
  value: backgroundBlendModeValueSchema,
});
```

#### 3B. Parser (`parser.ts`)

**Pattern A (Multi-Value):**

```typescript
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundBlendModeIR, BackgroundBlendModeValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundBlendMode = createMultiValueParser<BackgroundBlendModeValue, BackgroundBlendModeIR>({
  propertyName: "background-blend-mode",

  itemParser(valueNode: csstree.Value): ParseResult<BackgroundBlendModeValue> {
    return Parsers.BlendMode.parse(valueNode);
  },

  aggregator(values: BackgroundBlendModeValue[]): BackgroundBlendModeIR {
    return { kind: "list", values };
  },
});
```

**Pattern B (Single Value):**

```typescript
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundBlendModeIR } from "./types";

export function parseBackgroundBlendMode(ast: csstree.Value): ParseResult<BackgroundBlendModeIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "background-blend-mode",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value" }],
    };
  }

  const result = Parsers.BlendMode.parse(ast);

  if (result.ok) {
    return {
      ok: true,
      property: "background-blend-mode",
      value: { kind: "value", value: result.value },
      issues: result.issues,
    };
  }

  return result as ParseResult<BackgroundBlendModeIR>;
}
```

#### 3C. Generator (`generator.ts`)

**Pattern A (Multi-Value):**

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundBlendModeIR } from "./types";

export function generateBackgroundBlendMode(ir: BackgroundBlendModeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const layerStrings: string[] = [];
  for (const value of ir.values) {
    const result = generateValue(value, Generators.BlendMode.generate);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "));
}
```

**Pattern B (Single Value):**

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundBlendModeIR } from "./types";

export function generateBackgroundBlendMode(ir: BackgroundBlendModeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  return generateValue(ir.value, Generators.BlendMode.generate);
}
```

#### 3D. Definition (`definition.ts`)

```typescript
import { defineProperty } from "../../core";
import { parseBackgroundBlendMode } from "./parser";
import { generateBackgroundBlendMode } from "./generator";
import type { BackgroundBlendModeIR } from "./types";

export const backgroundBlendMode = defineProperty<BackgroundBlendModeIR>({
  name: "background-blend-mode",
  syntax: "<blend-mode>#",
  parser: parseBackgroundBlendMode,
  multiValue: true, // false for single value
  generator: generateBackgroundBlendMode,
  inherited: false,
  initial: "normal",
});
```

#### 3E. Index (`index.ts`)

```typescript
export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
```

#### 3F. Register

Add to `packages/b_declarations/src/properties/index.ts`:

```typescript
export * from "./background-blend-mode";
```

---

### Step 4: Validate

```bash
pnpm typecheck
pnpm build
just check
```

---

## 🎯 Quick Reference: Which Pattern?

| Property              | Pattern    | Why             |
| --------------------- | ---------- | --------------- |
| background-blend-mode | A (Multi)  | Per layer       |
| background-image      | A (Multi)  | Per layer       |
| background-position   | A (Multi)  | Per layer       |
| background-color      | B (Single) | Element-level   |
| mix-blend-mode        | B (Single) | Element-level   |
| opacity               | B (Single) | Element-level   |
| width                 | B (Single) | Element-level   |
| padding               | B (Single) | Element-level\* |

\*Structural shorthands (padding, margin) still use single value pattern with composite types

---

## 📦 Batch Strategy

### Phase 1: Keyword Properties (Day 1)

- background-blend-mode ← **START HERE**
- mix-blend-mode
- isolation
- visibility
- object-fit

**Dependencies:** 1 keyword enum → reused by 5+ properties

### Phase 2: Length Properties (Day 2)

- width, height
- min-width, max-width
- top, right, bottom, left

**Dependencies:** Already exists (length-percentage)

### Phase 3: Box Model (Day 3)

- padding-{top,right,bottom,left}
- margin-{top,right,bottom,left}

**Dependencies:** Already exists (length-percentage)

### Phase 4: Structural Shorthands (Day 4)

- padding, margin (BoxSides4)
- border-radius (BoxCorners4)

**Dependencies:** Need to create BoxSides4, BoxCorners4

---

## ✅ Success Criteria

- [ ] Typecheck passes
- [ ] Build succeeds
- [ ] Pattern matches existing properties
- [ ] No custom utilities in property dir
- [ ] Exports added to index files

---

## 🚨 Common Mistakes

1. ❌ Creating utilities in property directory → Put in shared packages
2. ❌ Not checking existing parsers → Always grep first
3. ❌ Wrong pattern choice → Multi-value ONLY for layered properties
4. ❌ Missing exports → Must export from all index files
5. ❌ Type namespace collisions → Import with alias if needed

---

**Time per property:** 15-25 min (with existing dependencies)  
**50 properties:** ~20-30 hours total
