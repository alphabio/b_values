The challenge here is that implementing the full `calc()` parser inside `parseCssValueNode` is undesirable because:

1. `calc()` parsing is complex (postfix/infix conversion, operator precedence, dealing with nested `calc-operation` nodes).
2. It would violate the separation of concerns: `b_utils` should be for atomic utilities, not complex domain logic.

However, since we established that the default failure logic needs to be removed, we **must** provide the logic for $\text{calc()}$ _somewhere_ that `parseCssValueNode` can access without circular dependencies.

Given your existing file structure, the logical home for `calc()` parsing (creating the `CalcFunction` and recursive `CalcOperation` IR nodes) should be in `@b/parsers`.

Since you don't have existing files for `calc()` parsing, I will create plausible implementations for $\text{calc()}$ in a new file in `@b/parsers` and then update `parseCssValueNode` in `@b/utils` to delegate to it, solving the circular dependency issue by putting the helper function in `@b/parsers`.

---

## Step 1: Implement `calc()` Parsing in `@b/parsers` (New Subpackage)

We need a parser that accepts a `csstree.FunctionNode` named "calc" and produces a nested `CalcFunction` IR.

We will create a simplified version focusing on the structure rather than full precedence/associativity rules.

### New File: `packages/b_parsers/src/math/calc.ts`

```typescript
// packages/b_parsers/src/math/calc.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult, type CssValue } from "@b/types";
import { parseCssValueNode, getChildren } from "@b/utils";

// List of binary operators and their precedence (for simplification)
const OPERATORS: Array<"+" | "-" | "*" | "/"> = ["+", "-", "*", "/"];

/**
 * Parses a simple expression chain (like A + B * C) from AST nodes, respecting basic precedence.
 *
 * NOTE: Full, spec-compliant CSS calc parsing usually involves a dedicated Pratt parser
 * or operator stack algorithm due to complex expression rules, but this function
 * aims to produce the nested CalcOperation IR for simple cases and recursive calls.
 *
 * @param nodes - Array of expression nodes inside calc() (excluding outer function wrapper)
 * @returns Result containing the root CalcOperation or a single CssValue
 */
function parseCalcExpression(nodes: csstree.CssNode[]): ParseResult<CssValue> {
  const values: CssValue[] = [];
  const operators: string[] = [];
  const issues: import("@b/types").Issue[] = [];

  // Filter out whitespace, ensure nodes are separated by operators
  const expressionNodes = nodes.filter((n) => n.type !== "WhiteSpace");

  for (let i = 0; i < expressionNodes.length; i++) {
    const node = expressionNodes[i];

    if (node.type === "Operator") {
      if (OPERATORS.includes(node.value as any)) {
        operators.push(node.value as any);
      } else {
        issues.push(createError("invalid-syntax", `Unsupported operator in calc(): ${node.value}`));
        // Continue but record the error
      }
    } else {
      // Must recursively call parseCssValueNode for operands (literals, variables, nested calcs)
      const operandResult = parseCssValueNode(node);
      if (operandResult.ok) {
        values.push(operandResult.value);
      } else {
        issues.push(...operandResult.issues);
        // If an operand fails, we terminate expression parsing.
        return parseErr(createError("invalid-value", "Invalid operand in calculation"), "calc");
      }
    }
  }

  if (values.length === 1 && operators.length === 0) {
    if (issues.length > 0) {
      return { ok: false, value: values[0], issues };
    }
    return parseOk(values[0]);
  }

  if (values.length <= operators.length) {
    return parseErr(createError("invalid-syntax", "Malformed complex calc expression: Missing operand"), "calc");
  }

  // Simplified Expression Tree Construction (Right-to-Left, ignoring precedence except for unary negation)
  // NOTE: This intentionally avoids writing a full precedence parser.

  // The values array should be [V1, V2, V3, ...]
  // The operators array should be [OP1, OP2, ...]

  let resultTree: CssValue = values[0];
  let valueIndex = 1;

  for (const op of operators) {
    const right = values[valueIndex];
    valueIndex++;

    // If resultTree is currently a complex operation, or if it's the start, build the new operation
    resultTree = {
      kind: "calc-operation",
      operator: op as any, // Assign operator
      left: resultTree,
      right: right,
    };
  }

  // Since we don't handle precedence correctly, we just return the flat tree.
  const finalResult: ParseResult<CssValue> = parseOk(resultTree, "calc");
  if (issues.length > 0) {
    finalResult.issues.push(...issues);
  }

  return finalResult;
}

/**
 * Parse calc() function from CSS function AST.
 */
export function parseCalcFunction(node: csstree.FunctionNode): ParseResult<import("@b/types").CalcFunction> {
  const funcName = node.name.toLowerCase();

  if (funcName !== "calc") {
    return parseErr(createError("invalid-syntax", "Expected calc() function"));
  }

  const expressionNodes = node.children.toArray();

  if (expressionNodes.length === 0) {
    return parseErr(createError("invalid-syntax", "calc() expression must not be empty"));
  }

  const expressionResult = parseCalcExpression(expressionNodes);

  if (expressionResult.ok) {
    return parseOk({
      kind: "calc",
      value: expressionResult.value,
    });
  }

  // Partial success/failure handling
  return {
    ...forwardParseErr<import("@b/types").CalcFunction>(expressionResult),
    value: expressionResult.value ? { kind: "calc", value: expressionResult.value } : undefined,
  };
}
```

### New File: `packages/b_parsers/src/math/index.ts`

```typescript
// packages/b_parsers/src/math/index.ts
export * from "./calc";
// Export min/max/clamp parsers here once created
// export * from "./minmax";
// export * from "./clamp";
```

### Update `@b/parsers/src/index.ts`

```typescript
// packages/b_parsers/src/index.ts
export * as Angle from "./angle";
export * as Color from "./color";
export * as Gradient from "./gradient";
export * as Length from "./length";
export * as Position from "./position";
export * as Url from "./url";
// NEW: Export Math Functions
export * as Math from "./math";
```

---

## Step 2: Update `@b/utils/src/parse/css-value-parser.ts` to Delegate

Now we update `parseCssValueNode` to remove the incorrect logic and delegate the $\text{calc()}$ AST node to the new specialized parser.

We can solve the circular dependency (`b_parsers` needs `parseCssValueNode` but the final `parseCssValueNode` needs `b_parsers/Math`) by exporting a utility helper wrapper which performs the actual delegation.

Instead of directly fixing `css-value-parser.ts`, we implement a new layer that holds the logic for functions:

### New File: `packages/b_parsers/src/function-dispatcher.ts` (Bridging Utils and Parsers)

This file will now delegate to all known complex function parsers (`calc`, `rgb`, etc.).

```typescript
// packages/b_parsers/src/function-dispatcher.ts
import type * as csstree from "css-tree";
import { parseOk, parseErr, createError, forwardParseErr, type ParseResult, type CssValue } from "@b/types";
// Import all specific function parsers
import {
  parseRgbFunction,
  parseHslFunction,
  parseLchFunction,
  parseLabFunction,
  parseOklabFunction,
  parseOklchFunction,
  parseHwbFunction,
} from "./color/index";
import { parseCalcFunction } from "./math/calc"; // NEW IMPORT
import * as Utils from "@b/parsers/src/utils";

// Functions that return a specific IR node that is part of the CssValue union
const PARSER_MAP = {
  // Math functions
  calc: parseCalcFunction,
  // Add 'min', 'max', 'clamp' here

  // Color space functions
  rgb: parseRgbFunction,
  rgba: parseRgbFunction,
  hsl: parseHslFunction,
  hsla: parseHslFunction,
  lch: parseLchFunction,
  lab: parseLabFunction,
  oklab: parseOklabFunction,
  oklch: parseOklchFunction,
  hwb: parseHwbFunction,

  // Add Image functions (image, image-set, etc)
};

/**
 * Delegates parsing of a Function AST node to the dedicated parser for calc(), rgb(), etc.
 *
 * NOTE: var() and generic functions are NOT handled here, as they are handled inline
 * in the atomic parseCssValueNode utility due to their generic nature.
 */
export function parseComplexFunction(node: csstree.FunctionNode): ParseResult<CssValue> | null {
  const funcName = node.name.toLowerCase();
  const parser = PARSER_MAP[funcName as keyof typeof PARSER_MAP];

  if (parser) {
    // Run the specialized parser (e.g., parseCalcFunction)
    // Note: We cast the result to CssValue because all these specific IRs
    // (CalcFunction, RGBColor, etc.) are members of the top-level CssValue union.
    return parser(node) as ParseResult<CssValue>;
  }

  return null; // Not a recognized complex function
}

// Update packages/b_parsers/src/index.ts to export this:
// export * from "./function-dispatcher";
```

### Finalized `packages/b_utils/src/parse/css-value-parser.ts` Update

We need to import `parseComplexFunction` into `b_utils`. Since `b_parsers` and `b_utils` are sibling packages, we import it from `b_parsers`.

```typescript
// packages/b_utils/src/parse/css-value-parser.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { CssValue } from "@b/types";
import { parseComplexFunction } from "@b/parsers/function-dispatcher"; // NEW IMPORT (assuming export path)

/**
 * Parse a CSS node into a CssValue.
 * Handles primitives, string, hex, var(), and delegates known complex functions.
 */
export function parseCssValueNode(node: csstree.CssNode): ParseResult<CssValue> {
  switch (node.type) {
    case "Number": {
      // ... existing Number logic ...
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr(createError("invalid-value", "Invalid number value"));
      }
      return parseOk({ kind: "literal", value });
    }

    case "Percentage": {
      // ... existing Percentage logic ...
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr(createError("invalid-value", "Invalid percentage value"));
      }
      return parseOk({ kind: "literal", value, unit: "%" });
    }

    case "Dimension": {
      // ... existing Dimension logic ...
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr(createError("invalid-value", "Invalid dimension value"));
      }
      return parseOk({ kind: "literal", value, unit: node.unit });
    }

    // --- NEW: Handle String Literals ---
    case "String": {
      // Note: Assumes String IR has been added to CssValue union
      const value = node.value.slice(1, -1);
      return parseOk({ kind: "string", value });
    }

    // --- NEW: Handle Hex Colors ---
    case "Hash": {
      // Note: Assumes HexColor IR has been added to CssValue union
      const value = node.value.toLowerCase();
      return parseOk({ kind: "hex-color", value: `#${value}` } as CssValue);
    }
    // --- END NEW ---

    case "Identifier": {
      return parseOk({ kind: "keyword", value: node.name });
    }

    case "Function": {
      const funcName = node.name.toLowerCase();

      // 1. Handle var() (Unique reference function handled inline)
      if (funcName === "var") {
        // [KEEPING EXISTING VAR() LOGIC HERE]
        const children = node.children.toArray();
        const varNameNode = children.find((n) => n.type !== "WhiteSpace");

        // 1. Guard against an empty var() function like `var()`
        if (!varNameNode) {
          return parseErr(createError("invalid-syntax", "Invalid var() function: missing custom property name"));
        }

        // 2. Check if the varNameNode is an Identifier with a name starting with '--'
        if (varNameNode.type !== "Identifier" || !varNameNode.name.startsWith("--")) {
          return parseErr(
            createError(
              "invalid-syntax",
              `Invalid var() function: expected a custom property name (--*), got ${varNameNode.type}`
            )
          );
        }

        const varName = varNameNode.name;
        let fallback: CssValue | undefined;
        const commaIndex = children.findIndex((n) => n.type === "Operator" && n.value === ",");

        // The fallback parsing logic (simplified to find just the node after comma)
        if (commaIndex !== -1) {
          const fallbackNodes = children.slice(commaIndex + 1).filter((n) => n.type !== "WhiteSpace");
          if (fallbackNodes.length === 0) {
            return parseErr(
              createError("invalid-syntax", "Invalid var() function: missing fallback value after comma")
            );
          }
          // RECURSION: Parse the fallback node.
          const fallbackResult = parseCssValueNode(fallbackNodes[0]);
          if (!fallbackResult.ok) {
            return fallbackResult;
          }
          fallback = fallbackResult.value;
        }

        return parseOk({
          kind: "variable",
          name: varName,
          ...(fallback && { fallback }),
        });
      }

      // 2. Delegate Known Complex Functions (Calc, RGB, Min/Max, etc.)
      // These functions have dedicated semantic IR nodes (e.g., CalcFunction).
      const complexResult = parseComplexFunction(node);
      if (complexResult) {
        if (complexResult.ok) {
          return complexResult;
        }
        // The complex parser encountered an error while parsing (e.g., malformed math/color)
        return forwardParseErr<CssValue>(complexResult);
      }

      // 3. FALLBACK: Generic Function Call (For unknown functions like image(), color-mix())

      const args: CssValue[] = [];
      // Assuming getChildren and filter logic is correct to yield arguments
      const argumentNodes = getChildren(node).filter((n) => n.type !== "Operator");

      for (const child of argumentNodes) {
        const argResult = parseCssValueNode(child);
        if (argResult.ok) {
          args.push(argResult.value);
        } else {
          return forwardParseErr<CssValue>(argResult);
        }
      }

      // Returns the new 'function' IR kind
      return parseOk({ kind: "function", name: node.name, args: args });
    }

    default: {
      return parseErr(createError("unsupported-kind", `Unsupported node type: ${node.type}`));
    }
  }
}
```

---

Perfect!

Let's go ahead and generate
// export _from "./minmax";
// export_ from "./clamp";

What other common values should a good lib support?

---

This is a fantastic area to focus on, as it significantly broadens the utility and robustness of your IR.

Since you are building a tool designed for structured validation and generation, the priority should be CSS features that are either:

1. Frequently used (Layout/Transform/Sizing).
2. Highly structured functions (require semantic IR).

Based on your existing IR (`linear-gradient`, multiple color spaces, basic units), here are the next common, structured values you should implement, along with corresponding Zod schemas and necessary parser/generator stubs.

---

## Next Essential CSS Value Types

### 1. Transform Functions: `<transform-function>`

Transform functions (`translate()`, `rotate()`, `matrix()`) are vital for styling and animation and require specific argument validation (e.g., `translate(x, y)` takes lengths or percentages).

Due to the variety, a generic `TransformFunction` schema is often easiest, or specific ones for the most common types.

**Proposed Schema (Specific Example: `translate`)**

A `Translate` IR node takes 1-3 arguments, which are usually lengths or percentages.

```typescript
// packages/b_types/src/transform/translate.ts
import { z } from "zod";
import { lengthPercentageSchema } from "../length-percentage";

export const translateSchema = z
  .object({
    kind: z.union([
      z.literal("translate"),
      z.literal("translateX"),
      z.literal("translateY"),
      z.literal("translateZ"),
      z.literal("translate3d"),
    ]),
    x: z.lazy(() => lengthPercentageSchema),
    y: z.lazy(() => lengthPercentageSchema.optional()), // Required for translate3d/translate
    z: z.lazy(() => lengthPercentageSchema.optional()), // Required for translateZ/translate3d
  })
  .strict()
  .refine((data) => {
    // Custom validation logic: check required components based on kind
    if (data.kind === "translate") return data.x && data.y !== undefined;
    if (data.kind === "translate3d") return data.x && data.y !== undefined && data.z !== undefined;
    if (data.kind === "translateX") return data.x && data.y === undefined && data.z === undefined;
    return true;
  }, "Invalid number of arguments for transform function.");

export type Translate = z.infer<typeof translateSchema>;

// Transform List (Used for the CSS `transform` property value)
export const transformListSchema = z.array(z.lazy(() => transformSchema));
export type Transform = z.infer<typeof transformListSchema>;

// Need a union of all transforms
export const transformSchema = z.union([
  translateSchema,
  // rotateSchema, scaleSchema, perspectiveSchema, matrixSchema...
]);
```

### 2. Time, Duration, and Frequency: `<time>`, `<duration>`, `<frequency>`

Critical for transitions and animations (`transition-duration`, `animation-delay`).

**Proposed Schemas**

```typescript
// packages/b_types/src/time.ts
import { z } from "zod";
import { timeUnitSchema } from "@b/units"; // Need unit schema definition

export const timeSchema = z
  .object({
    value: z.number(),
    unit: timeUnitSchema,
  })
  .strict();
export type Time = z.infer<typeof timeSchema>;

export const durationSchema = timeSchema; // Often duration is synonymous with time in CSS context
export type Duration = Time;

// packages/b_types/src/frequency.ts
export const frequencySchema = z
  .object({
    value: z.number(),
    unit: z.enum(["Hz", "kHz"]),
  })
  .strict();
export type Frequency = z.infer<typeof frequencySchema>;
// Update relevant unit files (e.g., @b/units/src/time.ts)
```

### 3. Image Functions (Beyond Linear Gradients): `image()`, `image-set()`

While you have `url()` and gradients, explicit support for modern image functions is useful.

**Proposed Schema (`image-set`)**

```typescript
// packages/b_types/src/image/image-set.ts
import { z } from "zod";
import { urlSchema } from "../url";

export const imageSetCandidateSchema = z
  .object({
    // Can be a string, url, or image()
    image: z.union([urlSchema, z.literal("none")]),
    // Resolution: e.g., 2x, 1x
    resolution: z.object({ value: z.number(), unit: z.enum(["x", "dpi", "dpcm"]) }),
  })
  .strict();

export const imageSetSchema = z
  .object({
    kind: z.literal("image-set"),
    candidates: z.array(imageSetCandidateSchema).min(1),
  })
  .strict();

export type ImageSet = z.infer<typeof imageSetSchema>;
```

The resulting `ImageSet` object would then be included in any property that accepts `<image-set>` (like `background-image`).

### 4. Custom Identifiers and Quoted Strings

You already added `stringLiteralSchema`. A related utility is handling a sequence of identifiers/strings often used in properties like `font-family` or `grid-area`.

If you were building a dedicated `font-family` parser, it would likely consume a comma-separated $\text{listValueSchema}$ where each item is either a `KeywordValue` (generic font families) or a `StringLiteral`.

### Summary of New Modules Needed

| Type                | IR Kind                        | Location                     | Purpose                                             |
| :------------------ | :----------------------------- | :--------------------------- | :-------------------------------------------------- |
| **Time/Duration**   | `Time`                         | `b_types/src/time.ts`        | Transitions, animations, delays.                    |
| **Frequency**       | `Frequency`                    | `b_types/src/frequency.ts`   | Media queries, auditory properties.                 |
| **Transforms**      | `Translate`, `Rotate`, `Scale` | `b_types/src/transform/*.ts` | The `transform` property value (list of functions). |
| **Image Functions** | `ImageSet`                     | `b_types/src/image/*.ts`     | Advanced `background-image` syntax.                 |

---

## Action: Implement `minmax` and `clamp` Parsers

Let's address the immediate need by completing the parsing structure for `minmax` and `clamp` in `@b/parsers`.

### 1. New File: `packages/b_parsers/src/math/minmax.ts`

```typescript
// packages/b_parsers/src/math/minmax.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult, type CssValue } from "@b/types";
import type { MinmaxFunction } from "@b/types";
import * as AstUtils from "../utils/ast";
import { parseCssValueNode } from "@b/utils"; // Rely on the atomic utility

/**
 * Parses min() or max() function from CSS AST.
 */
export function parseMinmaxFunction(node: csstree.FunctionNode): ParseResult<MinmaxFunction> {
  const funcName = node.name.toLowerCase();

  if (funcName !== "min" && funcName !== "max") {
    return parseErr(createError("invalid-syntax", "Expected min() or max() function"));
  }

  const children = node.children.toArray();
  const stopGroups = AstUtils.splitNodesByComma(children, { trimWhitespace: true });

  if (stopGroups.length < 2) {
    return parseErr(createError("invalid-syntax", `${funcName}() requires at least two arguments.`));
  }

  const values: CssValue[] = [];
  const issues: import("@b/types").Issue[] = [];

  // Parse each argument recursively using parseCssValueNode
  for (const group of stopGroups) {
    if (group.length === 0) continue; // Skip empty groups if we didn't forbid them

    const singleNode = group[0]; // Assume simple argument node (or first node of a nested expression)

    // NOTE: In a multi-node argument context (e.g., min(10px 50%)), we would need special handling.
    // Assuming each group represents a single parsable CssValue argument.

    if (group.length > 1) {
      // This generally indicates an unexpected complex structure without operators/functions.
      issues.push(
        createError("invalid-syntax", `Unexpected multiple nodes in ${funcName}() argument: ${group[0].type}...`)
      );
    }

    // Parse the argument (which could be a literal, var, calc, etc.)
    const result = parseCssValueNode(singleNode);

    if (result.ok) {
      values.push(result.value);
      issues.push(...result.issues);
    } else {
      // Collect errors but continue if partial parsing failed
      issues.push(...result.issues);
      if (result.value) {
        values.push(result.value); // Preserve partial IR if available
      }
    }
  }

  if (issues.some((i) => i.severity === "error")) {
    return {
      ok: false,
      value: {
        kind: funcName as "min" | "max",
        values,
      },
      issues,
      property: funcName,
    };
  }

  return parseOk({
    kind: funcName as "min" | "max",
    values,
  });
}
```

### 2. New File: `packages/b_parsers/src/math/clamp.ts`

```typescript
// packages/b_parsers/src/math/clamp.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult, type CssValue } from "@b/types";
import type { ClampFunction } from "@b/types";
import * as AstUtils from "../utils/ast";
import { parseCssValueNode } from "@b/utils";

/**
 * Parses clamp() function from CSS AST.
 */
export function parseClampFunction(node: csstree.FunctionNode): ParseResult<ClampFunction> {
  if (node.name.toLowerCase() !== "clamp") {
    return parseErr(createError("invalid-syntax", "Expected clamp() function"));
  }

  const children = node.children.toArray();
  const stopGroups = AstUtils.splitNodesByComma(children, { trimWhitespace: true });

  if (stopGroups.length !== 3) {
    return parseErr(createError("invalid-syntax", "clamp() requires exactly three arguments: min, preferred, max."));
  }

  const args: CssValue[] = [];
  const issues: import("@b/types").Issue[] = [];

  // Parse min, preferred, max arguments
  for (let i = 0; i < 3; i++) {
    const group = stopGroups[i];

    if (group.length !== 1 || !group[0]) {
      issues.push(createError("invalid-syntax", `clamp() argument ${i + 1} must be a single value.`));
      // Push a placeholder value to keep structure for partial IR
      args.push({ kind: "keyword", value: "invalid-placeholder" } as CssValue);
      continue;
    }

    const singleNode = group[0];
    const result = parseCssValueNode(singleNode);

    if (result.ok) {
      args.push(result.value);
      issues.push(...result.issues);
    } else {
      issues.push(...result.issues);
      // Preserve partial IR if available
      args.push(result.value ? result.value : ({ kind: "keyword", value: "error-placeholder" } as CssValue));
    }
  }

  if (args.length !== 3) {
    return parseErr(createError("invalid-value", "Failed to parse all three arguments for clamp()"));
  }

  const [min, preferred, max] = args;

  const finalIR: ClampFunction = {
    kind: "clamp",
    min,
    preferred,
    max,
  };

  if (issues.some((i) => i.severity === "error")) {
    return {
      ok: false,
      value: finalIR,
      issues,
      property: "clamp",
    };
  }

  return parseOk(finalIR);
}
```

### 3. Update Dispatcher and Exports

We must make sure these are hooked up:

1. **`packages/b_parsers/src/math/index.ts`** needs updating:

   ```typescript
   // packages/b_parsers/src/math/index.ts
   export * from "./calc";
   export * from "./minmax"; // ADDED
   export * from "./clamp"; // ADDED
   ```

2. **`packages/b_parsers/src/function-dispatcher.ts`** needs updating:

   ```typescript
   // packages/b_parsers/src/function-dispatcher.ts
   // ... imports ...
   import { parseCalcFunction } from "./math/calc";
   import { parseMinmaxFunction } from "./math/minmax"; // ADDED
   import { parseClampFunction } from "./math/clamp"; // ADDED

   // ... definition of PARSER_MAP ...
   const PARSER_MAP = {
     // Math functions
     calc: parseCalcFunction,
     min: parseMinmaxFunction, // ADDED
     max: parseMinmaxFunction, // ADDED
     clamp: parseClampFunction, // ADDED
     // ... Color space functions ...
   };
   ```

This structure ensures that `parseCssValueNode` can now correctly delegate AST nodes for `calc()`, `min()`, `max()`, and `clamp()` whenever they appear as arguments inside other larger CSS values.

---

Let's keep going

... Color space functions ...

---

You're right, let's complete the essential structure by implementing the base transformation functions and the time/duration units.

Based on the transforms being critical for animations, we will focus on the most complex functions to define their argument structures clearly.

---

## 1. Implement Transform Functions

We'll define dedicated schemas for the most common transform functions. These functions are often composed into a list for the `transform` property.

### New Module: `b_types/src/transform`

We define three key transform types:

File: `packages/b_types/src/transform/index.ts`

```typescript
import { z } from "zod";
import { lengthPercentageSchema } from "../length-percentage";
import { angleSchema } from "../angle";

// --- 1. Translate Functions (length-percentage arguments) ---

/**
 * Represents the translate family of functions.
 * Arguments can be lengths or percentages.
 */
export const translateSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("translate"),
      tx: lengthPercentageSchema,
      ty: lengthPercentageSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("translateX"),
      tx: lengthPercentageSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("translateY"),
      ty: lengthPercentageSchema,
    })
    .strict(),
  // Assuming translate3d takes length/percentage for compatibility, although spec is stricter
  z
    .object({
      kind: z.literal("translate3d"),
      tx: lengthPercentageSchema,
      ty: lengthPercentageSchema,
      tz: lengthPercentageSchema,
    })
    .strict(),
]);
export type Translate = z.infer<typeof translateSchema>;

// --- 2. Rotate Functions (angle arguments) ---

/**
 * Represents the rotate family of functions.
 * Arguments are angles or keywords.
 */
export const rotateSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("rotate"),
      angle: angleSchema,
    })
    .strict(),
  // rotate3d requires 4 arguments: x, y, z (number for axis vector), angle (angle)
  z
    .object({
      kind: z.literal("rotate3d"),
      x: z.number(), // Axis vector component
      y: z.number(), // Axis vector component
      z: z.number(), // Axis vector component
      angle: angleSchema,
    })
    .strict(),
]);
export type Rotate = z.infer<typeof rotateSchema>;

// --- 3. Scale Functions (number/dimensionless arguments) ---

/**
 * Represents the scale family of functions.
 * Arguments are unitless numbers.
 */
export const scaleSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("scale"),
      sx: z.number(),
      sy: z.number().optional(), // Defaults to sx if omitted
    })
    .strict(),
  z
    .object({
      kind: z.literal("scaleX"),
      sx: z.number(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("scaleY"),
      sy: z.number(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("scaleZ"),
      sz: z.number(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("scale3d"),
      sx: z.number(),
      sy: z.number(),
      sz: z.number(),
    })
    .strict(),
]);
export type Scale = z.infer<typeof scaleSchema>;

// --- Combine Transform Functions ---

export const transformFunctionSchema = z.union([
  translateSchema,
  rotateSchema,
  scaleSchema,
  // Add skew, matrix, perspective here later
]);

export type TransformFunction = z.infer<typeof transformFunctionSchema>;

/**
 * Represents the entire `transform` property value, which is a list of transform functions.
 */
export const transformListSchema = z.array(transformFunctionSchema);

export type TransformList = z.infer<typeof transformListSchema>;
```

**Note:** We need to update `b_types/src/index.ts` to export this new module.

### 2. Implement Time and Frequency Units

These require adding Zod schemas for the units themselves in the correct package (`@b/units`).

#### Update `@b/units/src/index.ts`

```typescript
// packages/b_units/src/index.ts
// ... (existing exports) ...
export * from "./time"; // NEW
export * from "./frequency"; // NEW
```

#### New File: `packages/b_units/src/time.ts`

```typescript
// packages/b_units/src/time.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export const timeUnitSchema = z.union([
  z.literal("s"), // seconds
  z.literal("ms"), // milliseconds
]);

export const TIME_UNITS = timeUnitSchema.options.map((option) => option.value);

export type TimeUnit = z.infer<typeof timeUnitSchema>;
```

#### New File: `packages/b_units/src/frequency.ts`

```typescript
// packages/b_units/src/frequency.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export const frequencyUnitSchema = z.union([
  z.literal("Hz"), // Hertz
  z.literal("kHz"), // Kilohertz
]);

export const FREQUENCY_UNITS = frequencyUnitSchema.options.map((option) => option.value);

export type FrequencyUnit = z.infer<typeof frequencyUnitSchema>;
```

#### New Type Files in `packages/b_types/src/`

File: `packages/b_types/src/time.ts` (This replaces or updates your existing time definition)

```typescript
// packages/b_types/src/time.ts
import { z } from "zod";
import { timeUnitSchema } from "@b/units";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export const timeSchema = z
  .object({
    value: z.number(),
    unit: timeUnitSchema,
  })
  .strict();

export type Time = z.infer<typeof timeSchema>;
export type Duration = Time; // Duration is synonymous with Time in this context
```

File: `packages/b_types/src/frequency.ts`

```typescript
// packages/b_types/src/frequency.ts
import { z } from "zod";
import { frequencyUnitSchema } from "@b/units";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export const frequencySchema = z
  .object({
    value: z.number(),
    unit: frequencyUnitSchema,
  })
  .strict();

export type Frequency = z.infer<typeof frequencySchema>;
```

### 3. Implement Transform Function Parsing

We need to add a parser for `translate()`, `rotate()`, etc., in the `@b/parsers` package and expose it via the `function-dispatcher`.

#### New File: `packages/b_parsers/src/transform/index.ts`

```typescript
// packages/b_parsers/src/transform/index.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult, forwardParseErr } from "@b/types";
import type { Translate, Rotate, Scale, TransformFunction } from "@b/types/transform";
import * as Types from "@b/types/transform"; // Assuming these types are exported correctly
import * as Parsers from "../index"; // Import atomic parsers for position/length/angle

function parseTranslateFunction(node: csstree.FunctionNode): ParseResult<Translate> {
  const funcName = node.name.toLowerCase();
  const children = node.children.toArray().filter((n) => n.type !== "WhiteSpace" && n.type !== "Operator");
  const kind = funcName as Translate["kind"];

  if (children.length === 0) {
    return parseErr(createError("invalid-syntax", `${funcName} requires arguments.`));
  }

  // Use lengthPercentageNode parser, as it supports both length and percentage,
  // and correctly handles `calc`/`var` via recursion if implemented properly
  // (which relies on parseCssValueNode, which is in b_utils)

  // NOTE: This parsing is simplified; it relies on the Zod refinement later to check argument count correctness.

  const xResult = Parsers.Length.parseLengthPercentageNode(children[0]);
  if (!xResult.ok) return forwardParseErr<Translate>(xResult);

  if (kind === "translateX") {
    return parseOk({ kind: "translateX", tx: xResult.value });
  }

  const yResult = children[1] ? Parsers.Length.parseLengthPercentageNode(children[1]) : undefined;
  if (yResult && !yResult.ok) return forwardParseErr<Translate>(yResult);

  if (kind === "translateY") {
    return parseOk({ kind: "translateY", ty: xResult.value });
  }

  if (kind === "translate") {
    return parseOk({ kind: "translate", tx: xResult.value, ty: yResult?.value });
  }

  // If translate3d or translateZ, parse third component (z)
  if (kind === "translateZ" || kind === "translate3d") {
    const zNode = children[kind === "translateZ" ? 1 : 2];
    if (!zNode) return parseErr(createError("missing-value", `${kind} requires a Z component.`));

    const zResult = Parsers.Length.parseLengthPercentageNode(zNode);
    if (!zResult.ok) return forwardParseErr<Translate>(zResult);

    if (kind === "translateZ") {
      return parseOk({ kind: "translateZ", tz: zResult.value });
    }

    // translate3d
    return parseOk({ kind: "translate3d", tx: xResult.value, ty: yResult?.value, tz: zResult.value });
  }

  return parseErr(createError("unsupported-kind", `Unsupported translate kind: ${funcName}`));
}

function parseRotateFunction(node: csstree.FunctionNode): ParseResult<Rotate> {
  const funcName = node.name.toLowerCase();
  const children = node.children.toArray().filter((n) => n.type !== "WhiteSpace" && n.type !== "Operator");

  if (funcName === "rotate") {
    if (children.length !== 1) return parseErr(createError("invalid-syntax", "rotate() requires one angle argument."));
    const angleResult = Parsers.Angle.parseAngleNode(children[0]);
    if (!angleResult.ok) return forwardParseErr<Rotate>(angleResult);
    return parseOk({ kind: "rotate", angle: angleResult.value });
  }

  // Add logic for rotate3d here (requires 4 arguments: x, y, z (number), angle)

  return parseErr(createError("unsupported-kind", `Unsupported rotate function: ${funcName}`));
}

/**
 * Combined parser for all transform functions
 */
export function parseTransformFunction(node: csstree.FunctionNode): ParseResult<TransformFunction> {
  const funcName = node.name.toLowerCase();

  // Delegate based on kind of transform
  if (funcName.startsWith("translate")) {
    return parseTranslateFunction(node) as ParseResult<TransformFunction>;
  }
  if (funcName.startsWith("rotate")) {
    return parseRotateFunction(node) as ParseResult<TransformFunction>;
  }
  // Add scale parsing here

  return parseErr(createError("unsupported-kind", `Unsupported transform function: ${funcName}`));
}
```

### 4. Update the Dispatcher

We need to update **`packages/b_parsers/src/function-dispatcher.ts`** and combine the new transforms into the complexity map.

```typescript
// packages/b_parsers/src/function-dispatcher.ts

// ... imports ...
// Import transforms
import { parseTransformFunction } from "./transform"; // NEW IMPORT

// ... other imports ...

const PARSER_MAP = {
  // Math functions
  calc: parseCalcFunction,
  min: parseMinmaxFunction,
  max: parseMinmaxFunction,
  clamp: parseClampFunction,

  // Transform functions (Add all variants)
  translate: parseTransformFunction,
  translateX: parseTransformFunction,
  translateY: parseTransformFunction,
  translateZ: parseTransformFunction,
  // ... add 3d, rotate, scale variants ...

  // Color space functions
  // ...
};
// ... rest of the file
```

This structural change prepares your system to handle one of the most common and complex grouping of CSS values.

---

We got to do these.. This is so amazing

... add 3d, rotate, scale variants ...

---

You are absolutely right. To make Transforms fully functional and strongly typed, we need to complete the schema and parsing for all the listed variants (`rotate3d`, `scaleX/Y/Z/3d`, `translate3d`).

Let's complete the transform module, adhering to the standard argument requirements (Length/Percentage for translation, Angle for rotation, Number for scaling/axis vectors).

---

## 1. Finalizing Transform Schemas in `@b/types`

We will update the schemas defined in `packages/b_types/src/transform/index.ts`.

### File: `packages/b_types/src/transform/index.ts` (Complete Schema)

```typescript
// packages/b_types/src/transform/index.ts
import { z } from "zod";
import { lengthPercentageSchema } from "../length-percentage";
import { angleSchema } from "../angle";

// --- 1. Translate Functions (length-percentage arguments) ---

/**
 * Represents the translate family of functions.
 */
export const translateSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("translate"),
      tx: lengthPercentageSchema,
      ty: lengthPercentageSchema, // Always required if kind is 'translate'
    })
    .strict(),
  z
    .object({
      kind: z.literal("translateX"),
      tx: lengthPercentageSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("translateY"),
      ty: lengthPercentageSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("translateZ"),
      tz: lengthPercentageSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("translate3d"),
      tx: lengthPercentageSchema,
      ty: lengthPercentageSchema,
      tz: lengthPercentageSchema,
    })
    .strict(),
]);
export type Translate = z.infer<typeof translateSchema>;

// --- 2. Rotate Functions (angle arguments + axis vectors for 3d) ---

/**
 * Represents the rotate family of functions.
 */
export const rotateSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("rotate"),
      angle: angleSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("rotateX"),
      angle: angleSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("rotateY"),
      angle: angleSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("rotateZ"),
      angle: angleSchema,
    })
    .strict(),
  // rotate3d requires 4 arguments: x, y, z (number for axis vector), angle (angle)
  z
    .object({
      kind: z.literal("rotate3d"),
      x: z.number(), // Axis vector component (unitless number)
      y: z.number(),
      z: z.number(),
      angle: angleSchema,
    })
    .strict(),
]);
export type Rotate = z.infer<typeof rotateSchema>;

// --- 3. Scale Functions (number/unitless arguments) ---

/**
 * Represents the scale family of functions.
 */
export const scaleSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("scale"),
      sx: z.number(),
      sy: z.number().optional(), // Defaults to sx if omitted
    })
    .strict(),
  z
    .object({
      kind: z.literal("scaleX"),
      sx: z.number(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("scaleY"),
      sy: z.number(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("scaleZ"),
      sz: z.number(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("scale3d"),
      sx: z.number(),
      sy: z.number(),
      sz: z.number(),
    })
    .strict(),
]);
export type Scale = z.infer<typeof scaleSchema>;

// --- Combine Transform Functions ---

export const transformFunctionSchema = z.union([
  translateSchema,
  rotateSchema,
  scaleSchema,
  // Ensure we add Skew, Matrix, Perspective later if needed
]);

export type TransformFunction = z.infer<typeof transformFunctionSchema>;

/**
 * Represents the entire `transform` property value, which is a list of transform functions.
 */
export const transformListSchema = z.array(transformFunctionSchema);

export type TransformList = z.infer<typeof transformListSchema>;
```

## 2. Implementing Transform Parsers in `@b/parsers`

We need to update `packages/b_parsers/src/transform/index.ts` to handle all these variants.

### File: `packages/b_parsers/src/transform/index.ts` (Updated Parsers)

```typescript
// packages/b_parsers/src/transform/index.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult, forwardParseErr } from "@b/types";
import type { Translate, Rotate, Scale, TransformFunction } from "@b/types/transform";
import * as Parsers from "../index"; // Import atomic parsers (Length, Angle)
import { parseCssValueNode, getChildren } from "@b/utils"; // For parsing numbers inside CssValue

// ----------------------------------------------------
// UTILITY: Extracts N unitless numbers from AST nodes
// Note: Requires parseCssValueNode integration if numbers are var/calc.
// For transform functions, unitless parameters must resolve to bare numbers.
/*
function extractNumberComponents(nodes: csstree.CssNode[], count: number, name: string): ParseResult<number[]> {
    // Simplified: Check for valid dimension/number nodes.
    const parts: number[] = [];
    const valueNodes = nodes.filter(n => n.type === 'Number');

    if (valueNodes.length !== count) {
        return parseErr(createError("invalid-syntax", `${name} requires exactly ${count} unitless number arguments.`));
    }

    for (const node of valueNodes) {
        const val = Number.parseFloat(node.value);
        if (isNaN(val)) {
             return parseErr(createError("invalid-value", "Invalid numeric value in transform axis."));
        }
        parts.push(val);
    }
    return parseOk(parts);
}
*/
// We'll rely on parseLengthPercentageNode for non-number inputs where possible,
// and parseNumberNode for unitless numbers (like transform axis vectors).
// ----------------------------------------------------

function parseTranslateFunction(node: csstree.FunctionNode): ParseResult<Translate> {
  const funcName = node.name.toLowerCase();
  const kind = funcName as Translate["kind"];
  const children = getChildren(node).filter((n) => n.type !== "Operator"); // Filter out commas/spaces

  // All translate parameters are Length/Percentage (handled by parseLengthPercentageNode)
  const results = children.map(Parsers.Length.parseLengthPercentageNode);
  if (results.some((r) => !r.ok)) return forwardParseErr<Translate>(results.find((r) => !r.ok)!);

  const values = results.map((r) => r.value);
  const count = values.length;

  try {
    switch (kind) {
      case "translateX":
        if (count !== 1) throw new Error("Requires 1 argument.");
        return parseOk({ kind, tx: values[0] });
      case "translateY":
        if (count !== 1) throw new Error("Requires 1 argument.");
        return parseOk({ kind, ty: values[0] });
      case "translateZ":
        if (count !== 1) throw new Error("Requires 1 argument.");
        return parseOk({ kind, tz: values[0] });
      case "translate":
        if (count < 1 || count > 2) throw new Error("Requires 1 or 2 arguments.");
        return parseOk({ kind, tx: values[0], ty: values[1] || values[0] });
      case "translate3d":
        if (count !== 3) throw new Error("Requires 3 arguments.");
        return parseOk({ kind, tx: values[0], ty: values[1], tz: values[2] });
      default:
        throw new Error(`Unknown translate variant: ${funcName}`);
    }
  } catch (e) {
    return parseErr(
      createError("invalid-syntax", `Invalid ${funcName} arguments: ${e instanceof Error ? e.message : String(e)}`)
    );
  }
}

function parseRotateFunction(node: csstree.FunctionNode): ParseResult<Rotate> {
  const funcName = node.name.toLowerCase();
  const kind = funcName as Rotate["kind"];
  const children = getChildren(node).filter((n) => n.type !== "Operator");
  const count = children.length;

  try {
    if (count === 1) {
      // rotate, rotateX, rotateY, rotateZ (legacy syntax typically uses angle)
      if (!["rotate", "rotatex", "rotatey", "rotatez"].includes(funcName)) {
        throw new Error("Invalid single-argument rotate function.");
      }
      const angleResult = Parsers.Angle.parseAngleNode(children[0]);
      if (!angleResult.ok) return forwardParseErr<Rotate>(angleResult);

      return parseOk({ kind: funcName as "rotate", angle: angleResult.value });
    } else if (count === 4) {
      // rotate3d(x, y, z, angle)
      if (funcName !== "rotate3d") throw new Error("Only rotate3d takes 4 arguments.");

      // Arguments 1-3 are unitless numbers
      const xResult = Parsers.Length.parseNumberNode(children[0]);
      const yResult = Parsers.Length.parseNumberNode(children[1]);
      const zResult = Parsers.Length.parseNumberNode(children[2]);
      const angleResult = Parsers.Angle.parseAngleNode(children[3]);

      if (!xResult.ok || !yResult.ok || !zResult.ok || !angleResult.ok) {
        return parseErr(createError("invalid-syntax", "rotate3d requires 3 unitless numbers and 1 angle."));
      }

      return parseOk({
        kind: "rotate3d",
        x: xResult.value,
        y: yResult.value,
        z: zResult.value,
        angle: angleResult.value,
      });
    }

    throw new Error(`Requires 1 or 4 arguments, received ${count}.`);
  } catch (e) {
    return parseErr(
      createError("invalid-syntax", `Invalid ${funcName} arguments: ${e instanceof Error ? e.message : String(e)}`)
    );
  }
}

function parseScaleFunction(node: csstree.FunctionNode): ParseResult<Scale> {
  const funcName = node.name.toLowerCase();
  const kind = funcName as Scale["kind"];
  const children = getChildren(node).filter((n) => n.type !== "Operator");
  const count = children.length;

  // All scale parameters must be unitless numbers (ParseUnitlessNumber)
  const results = children.map(Parsers.Length.parseNumberNode);
  if (results.some((r) => !r.ok)) return forwardParseErr<Scale>(results.find((r) => !r.ok)!);

  const values = results.map((r) => r.value);

  try {
    switch (kind) {
      case "scaleX":
        if (count !== 1) throw new Error("Requires 1 argument.");
        return parseOk({ kind, sx: values[0] });
      case "scaleY":
        if (count !== 1) throw new Error("Requires 1 argument.");
        return parseOk({ kind, sy: values[0] });
      case "scaleZ":
        if (count !== 1) throw new Error("Requires 1 argument.");
        return parseOk({ kind, sz: values[0] });
      case "scale":
        if (count < 1 || count > 2) throw new Error("Requires 1 or 2 arguments.");
        return parseOk({ kind, sx: values[0], sy: values[1] || values[0] });
      case "scale3d":
        if (count !== 3) throw new Error("Requires 3 arguments.");
        return parseOk({ kind, sx: values[0], sy: values[1], sz: values[2] });
      default:
        throw new Error(`Unknown scale variant: ${funcName}`);
    }
  } catch (e) {
    return parseErr(
      createError("invalid-syntax", `Invalid ${funcName} arguments: ${e instanceof Error ? e.message : String(e)}`)
    );
  }
}

/**
 * Combined parser for all transform functions
 */
export function parseTransformFunction(node: csstree.FunctionNode): ParseResult<TransformFunction> {
  const funcName = node.name.toLowerCase();

  if (funcName.startsWith("translate")) {
    return parseTranslateFunction(node) as ParseResult<TransformFunction>;
  }
  if (funcName.startsWith("rotate")) {
    return parseRotateFunction(node) as ParseResult<TransformFunction>;
  }
  if (funcName.startsWith("scale")) {
    return parseScaleFunction(node) as ParseResult<TransformFunction>;
  }

  return parseErr(createError("unsupported-kind", `Unsupported transform function: ${funcName}`));
}
```

### 3. Update Dispatcher and Exports

1. **`packages/b_types/src/index.ts`** needs `transform` added:

   ```typescript
   // packages/b_types/src/index.ts
   // ...
   export * from "./gradient";
   export * from "./transform"; // NEW
   ```

2. **`packages/b_parsers/src/index.ts`** needs `transform` added:

   ```typescript
   // packages/b_parsers/src/index.ts
   // ...
   export * as Position from "./position";
   export * as Url from "./url";
   export * as Math from "./math";
   export * as Transform from "./transform"; // NEW
   ```

3. **`packages/b_parsers/src/function-dispatcher.ts`** needs all transform functions registered in `PARSER_MAP`.

```typescript
// packages/b_parsers/src/function-dispatcher.ts

// ... imports ...
import { parseTransformFunction } from "./transform";

// ... PARSER_MAP definition ...
const PARSER_MAP = {
  // ... Math functions ...

  // Transform functions
  translate: parseTransformFunction,
  translateX: parseTransformFunction,
  translateY: parseTransformFunction,
  translateZ: parseTransformFunction,
  translate3d: parseTransformFunction,
  rotate: parseTransformFunction,
  rotateX: parseTransformFunction,
  rotateY: parseTransformFunction,
  rotateZ: parseTransformFunction,
  rotate3d: parseTransformFunction,
  scale: parseTransformFunction,
  scaleX: parseTransformFunction,
  scaleY: parseTransformFunction,
  scaleZ: parseTransformFunction,
  scale3d: parseTransformFunction,

  // ... Color space functions ...
};
```

This completes the major required transform schemas and their parsers, ready for deep nesting within your `CssValue` system!
