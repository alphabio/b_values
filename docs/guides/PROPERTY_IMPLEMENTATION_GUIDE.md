# Property Implementation Guide

**DATE:** 2025-11-12
**CRITICAL:** This guide is based on actual codebase patterns, not assumptions.

---

## 🎯 Architectural Boundaries

### Level 1: Parse/Generate (Property-Specific)
- **Scope:** Property-specific value types ONLY
- **Does NOT handle:** CSS-wide keywords (inherit, initial, etc.), !important
- **Location:** `@b/declarations/src/properties/<name>/`

### Level 2: Declaration Parser (Universal)
- **Scope:** CSS-wide keywords, !important, property lookup
- **Location:** `@b/declarations/src/parser.ts`
- **Handles:** inherit, initial, unset, revert, revert-layer

**KEY:** Property parsers are called by `parseDeclaration`, which handles CSS-wide keywords BEFORE delegating to property parsers.

---

## 📊 Pattern Analysis Results

Analyzed all 8 existing background properties:

### Pattern: Multi-Value Properties (Layer-Based)
- `background-attachment`, `background-clip`, `background-image`, `background-origin`, `background-position`, `background-repeat`, `background-size`

**Consistent Pattern:**
1. ❌ **NO preParse** (except `background-image` for "none" - property-specific keyword)
2. ✅ **ALL have keyword variant**: `{ kind: "keyword", value: Keywords.cssWide }`
3. ✅ **ALL use createMultiValueParser**
4. ✅ **itemParser** delegates to namespace parser (e.g., `Parsers.Background.parseXxx`)

---

## 🚨 STOP - Read This Before Implementing

### DO NOT:
1. ❌ Add CSS-wide keyword handling in property parsers (`preParse` for inherit/initial/etc.)
2. ❌ Test CSS-wide keywords in property parser tests
3. ❌ Export namespace objects from implementation files (index.ts does this)
4. ❌ Use `createParseSuccess` / `createGenerateSuccess` (doesn't exist)
5. ❌ Import from `"css-tree"` (use `"@eslint/css-tree"`)
6. ❌ Test property parsers expecting CSS-wide keywords to work

### DO:
1. ✅ Define keyword variant as `{ kind: "keyword", value: Keywords.cssWide }`
2. ✅ Use `parseOk`, `parseErr`, `createError` from `@b/types`
3. ✅ Use `generateOk` (NOT `createGenerateSuccess`)
4. ✅ Export functions directly (let index.ts create namespaces)
5. ✅ Test CSS-wide keywords at the DECLARATION level (not property level)

---

## 📋 Implementation Steps

### Step 1: Keywords (@b/keywords/src/<name>.ts)

```typescript
export const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay",
  // ... all 16 modes
] as const;

export type BlendMode = (typeof BLEND_MODES)[number];

export function isBlendMode(value: string): value is BlendMode {
  return BLEND_MODES.includes(value as BlendMode);
}
```

**Update index.ts:**
```typescript
export * from "./blend-mode";
```

---

### Step 2: Types (@b/types/src/<name>.ts)

```typescript
import { z } from "zod";
import { BLEND_MODES } from "@b/keywords";

export const BlendModeSchema = z.enum(BLEND_MODES);
export type BlendMode = z.infer<typeof BlendModeSchema>;

export function isBlendMode(value: unknown): value is BlendMode {
  return BlendModeSchema.safeParse(value).success;
}
```

**Update index.ts:**
```typescript
export * from "./blend-mode";
```

---

### Step 3: Parser (@b/parsers/src/<name>.ts)

```typescript
import type * as csstree from "@eslint/css-tree";  // ✅ @eslint/css-tree
import { BlendModeSchema, type BlendMode } from "@b/types";
import type { ParseResult } from "@b/types";
import { parseOk, parseErr, createError } from "@b/types";  // ✅ These functions

export function parse(node: csstree.CssNode): ParseResult<BlendMode> {  // ✅ Return proper type
  if (node.type !== "Identifier") {
    return parseErr("blend-mode", createError("invalid-syntax", `Expected keyword, got ${node.type}`));
  }
  
  const result = BlendModeSchema.safeParse(node.name);
  if (!result.success) {
    return parseErr("blend-mode", createError("invalid-value", `Invalid: ${node.name}`));
  }
  
  return parseOk(result.data);
}

// ✅ NO namespace export - index.ts does this
```

**Update index.ts:**
```typescript
export * as BlendMode from "./blend-mode";  // ✅ Creates namespace
```

---

### Step 4: Generator (@b/generators/src/<name>.ts)

```typescript
import type { BlendMode } from "@b/types";
import { generateOk } from "@b/types";  // ✅ generateOk, not createGenerateSuccess
import type { GenerateResult } from "@b/types";

export function generate(value: BlendMode): GenerateResult {
  return generateOk(value);  // ✅ Returns { ok, value, issues }
}

// ✅ NO namespace export
```

**Update index.ts:**
```typescript
export * as BlendMode from "./blend-mode";
```

---

### Step 5: Property Types (@b/declarations/src/properties/<name>/types.ts)

```typescript
import { BlendModeSchema, cssValueSchema } from "@b/types";
import { z } from "zod";
import * as Keywords from "@b/keywords";

const backgroundBlendModeValueSchema = z.union([BlendModeSchema, cssValueSchema]);

export const backgroundBlendModeIR = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,  // ✅ ALWAYS Keywords.cssWide (not blend modes!)
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundBlendModeValueSchema).min(1),
  }),
]);

export type BackgroundBlendModeIR = z.infer<typeof backgroundBlendModeIR>;
```

---

### Step 6: Property Parser (@b/declarations/src/properties/<name>/parser.ts)

```typescript
import type { ParseResult } from "@b/types";
import { parseErr, createError } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundBlendModeIR } from "./types";
import type { BlendMode } from "@b/types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundBlendMode = createMultiValueParser<BlendMode, BackgroundBlendModeIR>({
  propertyName: "background-blend-mode",
  
  // ❌ NO preParse for CSS-wide keywords - parseDeclaration handles this
  
  itemParser(valueNode: csstree.Value): ParseResult<BlendMode> {
    const first = valueNode.children.first;
    if (!first) {
      return parseErr("background-blend-mode", createError("invalid-syntax", "Empty value"));
    }
    return Parsers.BlendMode.parse(first);
  },
  
  aggregator(modes: BlendMode[]): BackgroundBlendModeIR {
    return { kind: "list", values: modes };
  },
});
```

---

### Step 7: Property Generator (@b/declarations/src/properties/<name>/generator.ts)

```typescript
import type { GenerateResult, Issue } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";  // ✅ Handles CssValue unions
import type { BackgroundBlendModeIR } from "./types";

export function generateBackgroundBlendMode(ir: BackgroundBlendModeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return { ok: true, value: ir.value, issues: [] };
  }
  
  const modeStrings: string[] = [];
  const allIssues: Issue[] = [];
  
  for (const mode of ir.values) {
    const result = generateValue(mode, (m) => Generators.BlendMode.generate(m));
    if (!result.ok) return result;
    modeStrings.push(result.value);
    allIssues.push(...result.issues);
  }
  
  return { ok: true, value: modeStrings.join(", "), issues: allIssues };
}
```

---

### Step 8: Property Definition (@b/declarations/src/properties/<name>/definition.ts)

```typescript
import { defineProperty } from "../../core";
import { parseBackgroundBlendMode } from "./parser";
import { generateBackgroundBlendMode } from "./generator";
import type { BackgroundBlendModeIR } from "./types";

export const backgroundBlendMode = defineProperty<BackgroundBlendModeIR>({
  name: "background-blend-mode",
  syntax: "<blend-mode>#",
  parser: parseBackgroundBlendMode,
  multiValue: true,  // ✅ REQUIRED for multi-value
  generator: generateBackgroundBlendMode,
  inherited: false,
  initial: "normal",
});
```

---

### Step 9: Registration

**properties/index.ts:**
```typescript
export * from "./background-blend-mode";
```

**properties/definitions.ts:**
```typescript
import { backgroundBlendMode } from "./background-blend-mode/definition";

export const PROPERTY_DEFINITIONS = {
  // ...
  "background-blend-mode": backgroundBlendMode,
  // ...
} as const;
```

---

## 🧪 Testing Guidelines

### Parser Tests
- ✅ Test property-specific values
- ❌ DO NOT test CSS-wide keywords (inherit, initial, etc.)
- ✅ Test invalid values
- ✅ Test multiple values (for multi-value properties)

### Definition Tests (Integration)
- ✅ Round-trip tests
- ❌ DO NOT test CSS-wide keywords HERE either
- Test at declaration level instead

### Field Names
- ✅ `ParseResult.value` (NOT `.ir`)
- ✅ `GenerateResult.value` (NOT `.css`)
- ✅ PropertyDefinition has `.parser()` and `.generator()` methods

---

## ⚠️ Common Errors & Fixes

| Error | Wrong | Correct |
|-------|-------|---------|
| Import | `from "css-tree"` | `from "@eslint/css-tree"` |
| Parser return | `createParseSuccess()` | `parseOk()` |
| Generator return | `createGenerateSuccess()` | `generateOk()` |
| Parse result field | `result.ir` | `result.value` |
| Generate result field | `result.css` | `result.value` |
| CSS-wide in parser | `preParse: cssWide check` | ❌ Don't add - handled by parseDeclaration |
| Namespace export | `export const X = { fn }` | Export `fn` directly, index creates namespace |

---

## 🎯 Validation Checklist

Before committing:
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test <property-name>` passes  
- [ ] `just check` (format + lint) passes
- [ ] NO `preParse` for CSS-wide keywords
- [ ] Keyword variant uses `Keywords.cssWide`
- [ ] Parser uses `parseOk`/`parseErr`/`createError`
- [ ] Generator uses `generateOk`
- [ ] Tests check `.value` fields (not `.ir` or `.css`)
- [ ] Property registered in definitions.ts

---

**AUTOMATION READY:** This pattern is now mechanically reproducible.
