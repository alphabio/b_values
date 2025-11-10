# Feedback 04 - Implementation Protocol & Scaffolding

**Date:** 2025-11-10
**Source:** Refinement Review & Implementation Details

---

## Overview

This feedback focuses on **operationalizing** the previous architectural recommendations through concrete implementation protocols and tooling.

---

## 🔧 Additional Refinements (Beyond Previous Reviews)

### 1. Refactor `parseBackgroundImage` to Use `createMultiValueParser`

**Current State:** Custom parser with manual `none` keyword handling.

**Recommendation:** Leverage the `preParse` hook in `createMultiValueParser` for consistency.

```typescript
// packages/b_declarations/src/properties/background-image/parser.ts

export const parseBackgroundImage = createMultiValueParser<Image, BackgroundImageIR>({
  // Use the preParse hook for mutually exclusive keywords
  preParse: (value: string): ParseResult<BackgroundImageIR> | null => {
    if (value.trim().toLowerCase() === "none") {
      return parseOk({ kind: "keyword", value: "none" });
    }
    return null; // Proceed with list parsing
  },

  itemParser(valueNode: csstree.Value): ParseResult<Image> {
    return Parsers.Image.parseImageValue(valueNode);
  },

  aggregator(layers: Image[]): BackgroundImageIR {
    return { kind: "list", values: layers };
  },
});
```

**Impact:** Increases consistency across all multi-value parsers.

---

### 2. Simplify Custom Property Handling in Registry

**Current State:** Lazy-loaded cache for `--*` properties with potential runtime failure.

**Issue:** Complex and adds unnecessary failure point.

**Recommendation:** Ensure `custom-property` is imported first, then simplify registry lookup.

```typescript
// packages/b_declarations/src/properties/index.ts
// Import this first to ensure it's always registered
export * from "./custom-property";

export * from "./background-attachment";
// ... rest of properties
```

```typescript
// packages/b_declarations/src/core/registry.ts
// Remove lazy-loaded cache logic

export function getPropertyDefinition(name: string): PropertyDefinition | undefined {
  const definition = propertyRegistry.get(name);
  if (definition) return definition;

  // Fallback to generic '--*' definition
  if (isCustomProperty(name)) {
    return propertyRegistry.get("--*");
  }

  return undefined;
}
```

**Impact:** Simpler, more robust, eliminates potential error.

---

### 3. Refine `ok` Status in `parseDeclarationList`

**Current State:** `ok: true` if _any_ declaration succeeds, even with errors.

**Issue:** Misleading success status when errors exist.

**Recommendation:** Base `ok` flag on error severity.

```typescript
// packages/b_declarations/src/declaration-list-parser.ts

const hasErrors = allIssues.some((issue) => issue.severity === "error");

if ((declarations.length > 0 && !hasErrors) || (declarations.length === 0 && allIssues.length === 0)) {
  return {
    ok: true,
    value: declarations,
    issues: allIssues,
  };
}

return {
  ok: false,
  value: declarations, // Still return partial value
  issues: allIssues,
};
```

**Impact:** More accurate success/failure semantics.

---

### 4. Simplify `CustomPropertyIR`

**Current State:** Distinction between `keyword` and `value` kinds.

**Issue:** Adds complexity without clear benefit for custom properties.

**Recommendation:** Use single `raw` kind for clarity.

```typescript
// packages/b_declarations/src/properties/custom-property/types.ts

/**
 * Custom property IR (--*)
 * Stores value as an unparsed string per CSS spec.
 */
export type CustomPropertyIR = { kind: "raw"; value: string };
```

**Impact:** Clearer intent, simpler implementation.

---

### 5. Standardize Property Definition Files

**Issue:** Minor inconsistencies in export patterns and import paths.

**Recommendation:** Enforce standard template across all properties.

```typescript
// Standard pattern for all definition.ts files
import { defineProperty } from "../../core";
import { parsePropertyName } from "./parser";
import { generatePropertyName } from "./generator";
import type { PropertyNameIR } from "./types";

export const propertyName = defineProperty<PropertyNameIR>({
  name: "property-name",
  syntax: "<syntax>",
  parser: parsePropertyName,
  generator: generatePropertyName,
  multiValue: true, // or false
  inherited: false,
  initial: "initial-value",
});
```

---

## 📋 New Property Creation Protocol

### Phase 1: Research (Before Code)

**Critical First Step:** Understand the property completely.

1. **ACTION:** Visit [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS) for the property
2. **ACTION:** Document:
   - Formal syntax (determines parsing strategy)
   - Accepted values (keywords, data types, functions)
   - Initial value
   - Inheritance behavior
   - Whether it accepts comma-separated lists (`#` multiplier)

---

### Phase 2: File Scaffolding

**ACTION:** Create property directory structure.

```
packages/b_declarations/src/properties/<property-name>/
├── types.ts          ← IR schema (START HERE)
├── parser.ts         ← CSS → IR
├── generator.ts      ← IR → CSS
├── definition.ts     ← Registration
└── index.ts          ← Exports
```

---

### Phase 3: Define the IR (types.ts)

**Goal:** Create the single source of truth for the property's structure.

**Standard Pattern:**

```typescript
import { z } from "zod";
import * as Keywords from "@b/keywords";

// For multi-value properties: define component schema first
const componentSchema = z.object({
  // ... component structure
});

// Main IR schema
export const propertyIRSchema = z.discriminatedUnion("kind", [
  // CSS-wide keywords
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),

  // For multi-value properties
  z.object({
    kind: z.literal("list"),
    values: z.array(componentSchema).min(1),
  }),

  // OR for single-value properties
  z.object({
    kind: z.literal("value"),
    value: componentSchema,
  }),
]);

export type PropertyIR = z.infer<typeof propertyIRSchema>;
```

---

### Phase 4: Parser Decision Tree

```
Does syntax contain '#'?
├─ YES → Multi-value (comma-separated)
│   └─ Use createMultiValueParser
│       ├─ Implement itemParser (single component)
│       ├─ Implement aggregator (wrap in list IR)
│       └─ Optional: preParse hook for special keywords
│
└─ NO → Single-value
    └─ Write custom parser (receives csstree.Value node)
        ├─ Use component parsers from @b/parsers
        └─ Build IR from node.children
```

---

### Phase 5: Implement Generator

**Pattern:**

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import type { PropertyIR } from "./types";

export function generateProperty(ir: PropertyIR): GenerateResult {
  // Handle CSS-wide keywords first
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  // Handle list/value cases
  const valueStrings = ir.values.map((value) => {
    // Use component generators from @b/generators
    return generateComponentValue(value);
  });

  return generateOk(valueStrings.join(", "));
}
```

---

### Phase 6: Create Definition

```typescript
import { defineProperty } from "../../core";
import { parseProperty } from "./parser";
import { generateProperty } from "./generator";
import type { PropertyIR } from "./types";

export const property = defineProperty<PropertyIR>({
  name: "property-name",
  syntax: "<syntax>",
  parser: parseProperty,
  generator: generateProperty,
  multiValue: true, // CRITICAL: matches parser strategy
  inherited: false,
  initial: "initial-value",
});
```

---

### Phase 7: Integration

1. **ACTION:** Export from `properties/index.ts`:

   ```typescript
   export * from "./property-name";
   ```

2. **ACTION:** Update `types.map.ts`:

   ```typescript
   import type { PropertyNameIR } from "./properties";

   export interface PropertyIRMap {
     "property-name": PropertyNameIR;
   }
   ```

3. **ACTION:** Export all from property's `index.ts`:

   ```typescript
   export * from "./types";
   export * from "./parser";
   export * from "./generator";
   export * from "./definition";
   ```

---

### Phase 8: Final Sanity Checklist

- [ ] Created directory under `properties/`
- [ ] Created `types.ts` with Zod schema and inferred type
- [ ] Created `parser.ts` using correct strategy (decision tree)
- [ ] Created `generator.ts` handling both keyword and value cases
- [ ] Created `definition.ts` with `defineProperty`
- [ ] **`multiValue` flag matches parsing strategy**
- [ ] Created `index.ts` with all exports
- [ ] Updated `properties/index.ts`
- [ ] **Updated `types.map.ts` with property and IR type**
- [ ] Added unit tests

---

## 🤖 Scaffolding Script Implementation

### Script Structure

```
scripts/
├── scaffold-property.mjs          ← Main script
└── templates/
    ├── types.ts.template
    ├── parser-multi-value.ts.template
    ├── parser-single-value.ts.template
    ├── generator.ts.template
    ├── definition.ts.template
    └── index.ts.template
```

### Usage

```bash
# Multi-value property (default)
npm run new-property -- --name=border-color

# Single-value property
npm run new-property -- --name=opacity --strategy=single-value
```

### Script Features

1. **Intelligent Template Selection**: Chooses correct parser template based on `--strategy` flag
2. **Automatic Naming**: Converts property name to kebab-case, camelCase, PascalCase
3. **File Generation**: Creates all 5 required files with placeholders
4. **Auto-Integration**: Updates `properties/index.ts` and `types.map.ts`
5. **TODO Markers**: Embeds clear instructions for developer to complete

### Key Template Placeholders

- `{{kebabCaseName}}` → `border-color`
- `{{camelCaseName}}` → `borderColor`
- `{{pascalCaseName}}` → `BorderColor`
- `{{isMultiValue}}` → `true` or `false`

### Template: Multi-Value Parser

```typescript
// parser-multi-value.ts.template
import { createMultiValueParser } from "../../utils";
import type { {{pascalCaseName}}IR } from "./types";

export const parse{{pascalCaseName}} = createMultiValueParser<any, {{pascalCaseName}}IR>({
  itemParser(valueNode: csstree.Value): ParseResult<any> {
    // TODO: Implement parsing for single component
    throw new Error("itemParser not implemented for {{pascalCaseName}}");
  },

  aggregator(items: any[]): {{pascalCaseName}}IR {
    return { kind: "list", values: items };
  },

  // Optional: Handle special keywords
  // preParse(value: string) {
  //   if (value.trim().toLowerCase() === 'none') {
  //     return parseOk({ kind: 'keyword', value: 'none' });
  //   }
  //   return null;
  // }
});
```

### Template: Single-Value Parser

```typescript
// parser-single-value.ts.template
import type * as csstree from "@eslint/css-tree";
import { parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { nodeListToArray } from "@b/utils";
import type { {{pascalCaseName}}IR } from "./types";

export function parse{{pascalCaseName}}(valueNode: csstree.Value): ParseResult<{{pascalCaseName}}IR> {
  const children = nodeListToArray(valueNode.children);

  // TODO: Implement parsing logic
  // Example: const result = Parsers.Color.parseNode(children[0]);

  throw new Error("Parser not implemented for {{pascalCaseName}}");
}
```

---

## 🎯 Benefits of Scaffolding

### Time Savings

- **Before:** ~30 minutes per property (manual file creation, copy-paste, search-replace)
- **After:** ~30 seconds to scaffold + focus on implementation logic

### Consistency Enforcement

- All properties follow identical structure
- No forgotten files or missing exports
- Correct `multiValue` flag every time

### Reduced Cognitive Load

- Developer doesn't need to remember file structure
- TODO markers guide implementation
- Clear separation: scaffolding vs. business logic

### Scaling Confidence

- Adding 50 properties becomes mechanical
- Quality doesn't degrade with volume
- New contributors have clear starting point

---

## 🔗 Cross-References

- Implements recommendations from **FEEDBACK_01.md** (scaffolding CLI)
- Addresses consistency issues from **FEEDBACK_02.md** (refactoring patterns)
- Builds on architecture from **FEEDBACK_03.md** (automation strategy)
- Complements **FEEDBACK_ANALYSIS.md** Phase 3a (Property Scaffolding)

---

## 💡 Next Steps

1. **Immediate:** Implement the scaffolding script using provided templates
2. **Short-term:** Test script on 2-3 new properties to validate templates
3. **Medium-term:** Automate `types.map.ts` generation (Phase 3b)
4. **Long-term:** Add test generation to scaffolding script
