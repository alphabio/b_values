# Feedback 02 - Comprehensive Architecture Review & Property Creation Protocol

**Captured:** 2025-11-10
**Source:** Detailed architectural review with focus on consistency, foundation, and scaling

---

## High-Level Architectural Review

### Strengths Identified

1. **Modular & Scalable Property Definitions**
   - `packages/b_declarations/src/properties` structure is **perfect pattern** for scaling to 50+ properties
   - Each property = self-contained module (types, parser, generator, definition)
   - Adding new property = copy template + fill logic

2. **Centralized Registry**
   - `PropertyRegistry` is clean implementation of registry pattern
   - `defineProperty` helper provides great DX - declarative and simple

3. **Robust Parsing Strategy**
   - Core `parseDeclaration` function is very powerful
   - Universal CSS-wide keyword check = brilliant optimization, architecturally sound
   - Distinction between `multiValue` (raw string) and single-value (AST node) is smart
   - `unsafeCallParser` and `unsafeGenerateDeclaration` = mature dynamic dispatch handling
   - Correctly identified as "type safety boundary" with excellent documentation

4. **Resilient List Parsing**
   - `createMultiValueParser` factory is standout feature
   - Solves notoriously difficult CSS parsing (comma-separated lists with partial failures and missing commas)
   - Generic, reusable, robust

5. **Type-Safe IR**
   - Zod for IR schemas = huge win
   - Provides runtime validation + auto-inferred TypeScript types
   - Ensures data integrity throughout system

---

## Recommendations for Improvement

### 1. Enhance Consistency

#### 🟠 Refactor `parseBackgroundImage` to Use `createMultiValueParser`

- **Issue:** Custom parser handles `none` keyword then delegates to list parser
- **Recommendation:** Use `preParse` option in `createMultiValueParser` (designed for this exact use case)
- **Location:** `packages/b_declarations/src/properties/background-image/parser.ts`
- **Approach:**

  ```typescript
  export const parseBackgroundImage = createMultiValueParser<Image, BackgroundImageIR>({
    preParse: (value: string): ParseResult<BackgroundImageIR> | null => {
      if (value.trim().toLowerCase() === "none") {
        return parseOk({ kind: "keyword", value: "none" });
      }
      return null; // Factory proceeds with list parsing
    },
    itemParser(valueNode: csstree.Value): ParseResult<Image> {
      return Parsers.Image.parseImageValue(valueNode);
    },
    aggregator(layers: Image[]): BackgroundImageIR {
      return { kind: "list", values: layers };
    },
  });
  ```

#### 🟠 Standardize Property Definition Files

- **Issue:** `background-size/definition.ts` inconsistencies
  - Doesn't export definition constant like others
  - Uses slightly different import path
- **Recommendation:** Standardize all definition files
- **Location:** `packages/b_declarations/src/properties/background-size/definition.ts`
- **Fix:**

  ```typescript
  import { defineProperty } from "../../core"; // Standardize path
  import { parseBackgroundSize } from "./parser";
  import { generateBackgroundSize } from "./generator";
  import type { BackgroundSizeIR } from "./types"; // Add type import

  export const backgroundSize = defineProperty<BackgroundSizeIR>({
    name: "background-size",
    syntax: "<bg-size>#",
    parser: parseBackgroundSize,
    generator: generateBackgroundSize,
    multiValue: true,
    inherited: false,
    initial: "auto",
  });
  ```

### 2. Simplification and Robustness

#### 🟡 Simplify Custom Property Handling in Registry

- **Issue:** Lazy-loading cache for `--*` adds complexity and runtime failure point
- **Recommendation:** Ensure `custom-property` always registered first, simplify lookup logic
- **Location:** `packages/b_declarations/src/core/registry.ts`
- **Approach:**
  1. In `properties/index.ts`: Import `custom-property` first
  2. Remove lazy-loaded cache logic (`_customPropertyCache`, `getCustomPropertyDefinition`)
  3. Simplify `getPropertyDefinition`:

     ```typescript
     export function getPropertyDefinition(name: string): PropertyDefinition | undefined {
       const definition = propertyRegistry.get(name);
       if (definition) return definition;

       if (isCustomProperty(name)) {
         return propertyRegistry.get("--*");
       }

       return undefined;
     }
     ```

#### 🟠 Refine `ok` Status in `parseDeclarationList`

- **Issue:** Parse considered `ok: true` if _any_ declaration succeeds, even with other errors
- **Impact:** Misleading - `Result.ok` should reflect absence of errors (warnings OK)
- **Location:** `packages/b_declarations/src/declaration-list-parser.ts`
- **Recommendation:**

  ```typescript
  const hasErrors = allIssues.some((issue) => issue.severity === "error");

  // Success = have declarations AND no errors, OR empty-but-valid
  if ((declarations.length > 0 && !hasErrors) || (declarations.length === 0 && allIssues.length === 0)) {
    return { ok: true, value: declarations, issues: allIssues };
  }

  // Otherwise failure (partial or total)
  return { ok: false, value: declarations, issues: allIssues };
  ```

#### 🟡 Simplify `CustomPropertyIR`

- **Issue:** Distinction between `keyword` and `value` for custom property doesn't add value
- **Current:** `{ kind: "keyword"; value: string } | { kind: "value"; value: string }`
- **Impact:** Value always treated as unparsed string
- **Location:** `packages/b_declarations/src/properties/custom-property/types.ts`
- **Recommendation:**

  ```typescript
  /**
   * Custom property IR (--*)
   * Stores value as unparsed string per CSS spec.
   * "raw" kind distinguishes from standard keywords/values.
   * @see https://www.w3.org/TR/css-variables-1/#defining-variables
   */
  export type CustomPropertyIR = { kind: "raw"; value: string };
  ```

### 3. Future-Proofing and Developer Experience

#### 🔴 Auto-generate `PropertyIRMap`

- **Issue:** Manually maintaining map is single biggest scaling risk
- **Impact:** Someone will forget to add new property
- **Location:** `packages/b_declarations/src/types.map.ts`
- **Recommendation:** **PRIORITIZE** creating build script
- **Approach:**
  1. Use `ts-morph` or file system reads
  2. Scan `packages/b_declarations/src/properties` directory
  3. For each property folder: read `types.ts` (get `...IR` type), read `definition.ts` (get property name)
  4. Auto-generate `types.map.ts`
- **Result:** Truly "foolproof" scaling path

#### 🟢 Create Scaffolding Script (DETAILED SPEC INCLUDED)

- **Goal:** CLI to generate entire property boilerplate
- **Command:** `npm run new-property -- --name=border-radius --strategy=multi-value`
- **Outputs:**
  1. New directory: `packages/b_declarations/src/properties/border-radius/`
  2. Five pre-filled files: `definition.ts`, `parser.ts`, `generator.ts`, `types.ts`, `index.ts`
  3. Auto-update `properties/index.ts` to export new module
  4. Auto-update `types.map.ts` with new property IR type

---

## New Property Creation Protocol (HANDBOOK)

### 1. Introduction

Formal protocol ensuring consistency and quality at scale. **Mandatory** for all new property additions.

### 2. Prerequisites: Understanding the Property

- **ACTION:** Open MDN page for property
- **ACTION:** Identify:
  - Formal Syntax (value definition syntax)
  - Values (keywords, data types, functions)
  - Initial Value
  - Inherited status
  - Multiple Values (comma-separated = `#` multiplier)

### 3. Phase 1: File Scaffolding

- **ACTION:** Create directory: `packages/b_declarations/src/properties/<kebab-case-name>/`
- **ACTION:** Create 5 empty files:
  1. `types.ts` - (IR schema; **start here!**)
  2. `parser.ts` - (CSS string/AST → IR)
  3. `generator.ts` - (IR → CSS string)
  4. `definition.ts` - (System registration)
  5. `index.ts` - (Barrel exports)

### 4. Phase 2: Defining the IR

**IR = single source of truth for property structure**

- **ACTION:** Open `types.ts`
  1. Import `z` from `zod` + necessary schemas from `@b/keywords` or `@b/types`
  2. Define schema for single component value (if list property)
  3. Define main property IR schema using `z.discriminatedUnion("kind", ...)`
     - `z.object` for `"keyword"` case (value: `Keywords.cssWide`)
     - `z.object` for `"list"` case (multi-value) or `"value"` case (single-value)
  4. Infer TypeScript type from schema: `z.infer`
  5. Export both schema and inferred type

**Example provided:** `mask-mode/types.ts` with detailed implementation

### 5. Phase 3: Implementing the Parser

**Parser converts CSS string/AST node to IR**

- **ACTION:** Open `parser.ts`
- **ACTION:** Choose strategy from **Parser Decision Tree** (Appendix A)

#### Case A: Multi-Value (Comma-Separated)

- Use `createMultiValueParser` factory
- Implement `itemParser` (receives `csstree.Value` node)
- Implement `aggregator` (wraps array into final IR)
- Use `preParse` hook for mutually exclusive keywords (e.g., `none`)

#### Case B: Single Value (Not a List)

- Function accepts single `csstree.Value` node
- Analyze node's children to extract value
- Build IR
- Utilize component parsers from `@b/parsers`

### 6. Phase 4: Implementing the Generator

**Generator converts IR to valid CSS string**

- **ACTION:** Open `generator.ts`
  1. Create function `generateMyProperty(ir: MyPropertyIR): GenerateResult`
  2. Handle `ir.kind === "keyword"` case first: `generateOk(ir.value)`
  3. Handle list/value case: iterate through `ir.values`
  4. Use component generators from `@b/generators`
  5. Join strings with correct separator (`,` for lists, ` ` for components)
  6. Return wrapped in `generateOk()`

### 7. Phase 5: Creating the Definition

**Definition registers property with `propertyRegistry`**

- **ACTION:** Open `definition.ts`
  1. Import `defineProperty` from `../../core`
  2. Import parser, generator, IR type
  3. Call `defineProperty` with config object
  4. **CRITICAL:** Set `multiValue: true` if using `createMultiValueParser`, else `false`
  5. Fill metadata from MDN: `name`, `syntax`, `inherited`, `initial`

### 8. Phase 6: Integration and Finalization

1. **ACTION:** Update `packages/b_declarations/src/properties/index.ts`
   - Add: `export * from "./<property-name>";`

2. **ACTION:** Update `packages/b_declarations/src/types.map.ts`
   - **CRITICAL manual step until automated**
   - Import new `...IR` type
   - Add entry to `PropertyIRMap`: `"my-property-name": MyPropertyNameIR;`

3. **ACTION:** Update property's `index.ts`
   - Export all four modules

4. **ACTION:** Use **Final Sanity Checklist** (Appendix B) before committing

---

## Parser Decision Tree (Appendix A)

**Mermaid flowchart provided:**

- Start: Read MDN Syntax
- Decision: Contains `#`?
  - Yes → Use `createMultiValueParser`
    - Special keyword? → `preParse` hook
    - No special → Implement `itemParser` + `aggregator`
  - No → Not comma-separated list
    - Simple keyword/data type? → Simple parser with `csstree.Value`, use component parsers
    - Complex grammar? → Custom parser walking `children` (advanced case)

---

## Final Sanity Checklist (Appendix B)

| Completed | Task                                                 | File(s)                         |
| --------- | ---------------------------------------------------- | ------------------------------- |
| [ ]       | Created new directory                                | `properties/<property-name>/`   |
| [ ]       | Created `types.ts` with Zod schema + inferred type   | `<property-name>/types.ts`      |
| [ ]       | Created `parser.ts` using correct strategy           | `<property-name>/parser.ts`     |
| [ ]       | Created `generator.ts` handling keyword + value/list | `<property-name>/generator.ts`  |
| [ ]       | Created `definition.ts` using `defineProperty`       | `<property-name>/definition.ts` |
| [ ]       | **`multiValue` flag matches parsing strategy**       | `<property-name>/definition.ts` |
| [ ]       | Created `index.ts` exporting all files               | `<property-name>/index.ts`      |
| [ ]       | Exported module from main properties index           | `properties/index.ts`           |
| [ ]       | **Added property + IR type to `PropertyIRMap`**      | `types.map.ts`                  |
| [ ]       | Added comprehensive unit tests                       | (test directory)                |

---

## Scaffolding Script - Detailed Implementation Guide

### Tools

- **Scripting:** Node.js (JavaScript/ES Modules `.mjs`)
- **Argument Parsing:** `yargs-parser` or `minimist`
- **File System:** Built-in `fs` and `path` modules

### Setup

1. Create `scripts/` directory in project root
2. Create `scripts/scaffold-property.mjs`
3. Install: `npm install yargs-parser --save-dev`
4. Add to `package.json`:

   ```json
   "scripts": {
     "new-property": "node ./scripts/scaffold-property.mjs"
   }
   ```

### Template Files

**Location:** `scripts/templates/`

#### 1. `definition.ts.template`

```typescript
import { defineProperty } from "../../core";
import { parse{{pascalCaseName}} } from "./parser";
import { generate{{pascalCaseName}} } from "./generator";
import type { {{pascalCaseName}}IR } from "./types";

/**
 * {{kebabCaseName}} property definition.
 * TODO: Review MDN for initial, inherited, and syntax.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/{{kebabCaseName}}
 */
export const {{camelCaseName}} = defineProperty<{{pascalCaseName}}IR>({
  name: "{{kebabCaseName}}",
  syntax: "<my-syntax>", // TODO: Update this
  parser: parse{{pascalCaseName}},
  multiValue: {{isMultiValue}},
  generator: generate{{pascalCaseName}},
  inherited: false, // TODO: Update this
  initial: "initial-value", // TODO: Update this
});
```

#### 2. `types.ts.template`

```typescript
import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * TODO: Define schema for single component value.
 * For single-value: main value
 * For multi-value: one item in list
 */

export const {{camelCaseName}}IRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),

  z.object({
    kind: z.literal("list"),
    values: z.array(z.any()).min(1), // TODO: Replace z.any()
  }),

  // For single-value, replace 'list' with:
  // z.object({
  //   kind: z.literal("value"),
  //   value: z.any(), // TODO: Replace
  // }),
]);

export type {{pascalCaseName}}IR = z.infer<typeof {{camelCaseName}}IRSchema>;
```

#### 3. `parser-multi-value.ts.template`

```typescript
import type * as csstree from "@eslint/css-tree";
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { {{pascalCaseName}}IR } from "./types";

export const parse{{pascalCaseName}} = createMultiValueParser<any, {{pascalCaseName}}IR>({
  itemParser(valueNode: csstree.Value): ParseResult<any> {
    // TODO: Implement
    throw new Error("itemParser not implemented for {{pascalCaseName}}");
  },

  aggregator(items: any[]): {{pascalCaseName}}IR {
    return { kind: "list", values: items };
  },

  // Optional preParse for keywords like 'none'
});
```

#### 4. `parser-single-value.ts.template`

```typescript
import type * as csstree from "@eslint/css-tree";
import { type ParseResult, parseOk } from "@b/types";
import * as Parsers from "@b/parsers";
import { nodeListToArray } from "@b/utils";
import type { {{pascalCaseName}}IR } from "./types";

/**
 * Parses {{kebabCaseName}} (single-value property).
 * Receives pre-parsed `csstree.Value` (multiValue: false in definition).
 */
export function parse{{pascalCaseName}}(valueNode: csstree.Value): ParseResult<{{pascalCaseName}}IR> {
  const children = nodeListToArray(valueNode.children);

  // TODO: Implement parsing logic
  // Analyze children array to build IR
  // CSS-wide keywords handled for you

  throw new Error("Parser logic not implemented for {{pascalCaseName}}");
}
```

#### 5. `generator.ts.template`

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { {{pascalCaseName}}IR } from "./types";

export function generate{{pascalCaseName}}(ir: {{pascalCaseName}}IR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const valueStrings = ir.values.map(value => {
    // TODO: Implement generation for single value
    return String(value);
  });

  return generateOk(valueStrings.join(", "));
}
```

#### 6. `index.ts.template`

```typescript
export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
```

### Script Implementation: `scaffold-property.mjs`

**Key features:**

- Parse `--name` and `--strategy` flags
- Default strategy: `multi-value`
- Validate strategy: `multi-value` or `single-value`
- Generate naming conventions: kebab-case, camelCase, PascalCase
- Select correct parser template based on strategy
- Create all files with placeholder replacement
- Auto-update `properties/index.ts`
- Auto-update `types.map.ts`

**Placeholders:**

- `{{kebabCaseName}}` - CSS property name
- `{{camelCaseName}}` - JavaScript variable name
- `{{pascalCaseName}}` - TypeScript type name
- `{{isMultiValue}}` - `true` or `false` for definition

### Usage Examples

**Multi-value property (default):**

```bash
npm run new-property -- --name=background-image
# OR explicitly:
npm run new-property -- --name=background-image --strategy=multi-value
```

**Single-value property:**

```bash
npm run new-property -- --name=opacity --strategy=single-value
```

**Output:**

```
🚀 Scaffolding new property: opacity (strategy: single-value)
   ✅ Created packages/b_declarations/src/properties/opacity/types.ts
   ✅ Created packages/b_declarations/src/properties/opacity/parser.ts
   ✅ Created packages/b_declarations/src/properties/opacity/generator.ts
   ✅ Created packages/b_declarations/src/properties/opacity/definition.ts
   ✅ Created packages/b_declarations/src/properties/opacity/index.ts
   ✅ Updated packages/b_declarations/src/properties/index.ts
   ✅ Updated packages/b_declarations/src/types.map.ts

🎉 Done! Next steps:
   1. Fill in the // TODO: sections in packages/b_declarations/src/properties/opacity/
   2. Double-check the generated IR schema and parser to match your property's needs.
   3. Write unit tests for your new property.
```

---

## Summary

**System Assessment:** Exceptionally well-architected, professional-grade CSS parsing/generation library

**Key Strengths:**

- Robust, highly consistent, expertly designed for scalability
- Architecture supports scaling to 50+ properties

**Recommendations Priority:**

1. 🔴 Auto-generate `PropertyIRMap` - **highest priority**
2. 🟢 Create scaffolding script with `--strategy` flag
3. 🟠 Consistency improvements (refactor `parseBackgroundImage`, standardize definitions)
4. 🟡 Simplifications (custom property handling, `CustomPropertyIR`, `ok` status refinement)

**Conclusion:** "By implementing automated `PropertyIRMap` generation, you will achieve a truly 'foolproof path to scale.'"
