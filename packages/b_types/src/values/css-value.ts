// b_path:: packages/b_types/src/values/css-value.ts
import { z } from "zod";
import { getLiteralValues } from "@b/keywords";

/**
 * Represents a literal numeric value with optional unit
 * @see https://drafts.csswg.org/css-values-4/#numeric-types
 */
export const literalValueSchema = z
  .object({
    kind: z.literal("literal"),
    value: z.number(),
    unit: z.string().optional(),
  })
  .strict();

export const keywordValueSchema = z
  .object({
    kind: z.literal("keyword"),
    value: z.string(),
  })
  .strict();

/**
 * Represents a CSS custom property reference (var() function)
 * @see https://drafts.csswg.org/css-variables/#using-variables
 */
export const variableReferenceSchema: z.ZodType<{
  kind: "variable";
  name: string;
  fallback?: CssValue;
}> = z
  .object({
    kind: z.literal("variable"),
    name: z.string(),
    fallback: z.lazy((): z.ZodType<CssValue> => cssValueSchema).optional(),
  })
  .strict();

// --- NEW SCHEMAS ---

/**
 * Represents a CSS string literal (e.g., "Hello World")
 * @see https://drafts.csswg.org/css-values-4/#strings
 */
export const stringLiteralSchema = z
  .object({
    kind: z.literal("string"),
    value: z.string(),
  })
  .strict();

/**
 * Represents a CSS hex color value
 * (e.g., #RRGGBB or #RGB)
 */
// export const hexColorSchema = z
//   .object({
//     kind: z.literal("hex-color"),
//     value: z.string().regex(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/),
//   })
//   .strict();

// --- END NEW SCHEMAS ---

export const listValueSchema: z.ZodType<{
  kind: "list";
  separator: " " | ",";
  values: CssValue[];
}> = z
  .object({
    kind: z.literal("list"),
    separator: z.enum([" ", ","]),
    values: z.array(z.lazy((): z.ZodType<CssValue> => cssValueSchema)),
  })
  .strict();

// Represents a single operation within a calc() expression
export const calcOperationSchema: z.ZodType<{
  kind: "calc-operation";
  operator: "+" | "-" | "*" | "/";
  // The operands can be any valid CSS value, including another operation
  left: CssValue;
  right: CssValue;
}> = z
  .object({
    kind: z.literal("calc-operation"),
    operator: z.enum(["+", "-", "*", "/"]),
    // Use z.lazy() for the recursive definition
    left: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
    right: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
  })
  .strict();

// A top-level calc() function just holds the root operation/value
export const calcFunctionSchema: z.ZodType<{
  kind: "calc";
  value: CssValue;
}> = z
  .object({
    kind: z.literal("calc"),
    // The value inside can be a simple literal or a complex operation tree
    value: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
  })
  .strict();

// For min() and max()
export const minmaxFunctionSchema: z.ZodType<{
  kind: "min" | "max";
  values: CssValue[];
}> = z
  .object({
    kind: z.union([z.literal("min"), z.literal("max")]),
    values: z.array(z.lazy((): z.ZodType<CssValue> => cssValueSchema)),
  })
  .strict();

// For clamp()
export const clampFunctionSchema: z.ZodType<{
  kind: "clamp";
  min: CssValue;
  preferred: CssValue;
  max: CssValue;
}> = z
  .object({
    kind: z.literal("clamp"),
    // clamp() always has 3 arguments: min, preferred, max
    min: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
    preferred: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
    max: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
  })
  .strict();

export const urlFunctionSchema = z
  .object({
    kind: z.literal("url"),
    url: z.string(),
  })
  .strict();

export const attrFunctionSchema: z.ZodType<{
  kind: "attr";
  name: string;
  typeOrUnit?: string; // e.g., "color", "px"
  fallback?: CssValue;
}> = z
  .object({
    kind: z.literal("attr"),
    name: z.string(),
    typeOrUnit: z.string().optional(),
    fallback: z.lazy((): z.ZodType<CssValue> => cssValueSchema).optional(),
  })
  .strict();

/**
 * Represents an RGB/HSL color function
 */
export const rgbFunctionSchema: z.ZodType<{
  kind: "rgb" | "rgba";
  components: CssValue[];
}> = z
  .object({
    kind: z.union([z.literal("rgb"), z.literal("rgba")]),
    components: z.array(z.lazy((): z.ZodType<CssValue> => cssValueSchema)),
  })
  .strict();

export const hslFunctionSchema: z.ZodType<{
  kind: "hsl" | "hsla";
  components: CssValue[];
}> = z
  .object({
    kind: z.union([z.literal("hsl"), z.literal("hsla")]),
    components: z.array(z.lazy((): z.ZodType<CssValue> => cssValueSchema)),
  })
  .strict();

/**
 * Represents a generic CSS function call (e.g., linear-gradient(...))
 */
export const functionCallSchema: z.ZodType<{
  kind: "function";
  name: string;
  args: CssValue[];
}> = z
  .object({
    kind: z.literal("function"),
    name: z.string(),
    args: z.array(z.lazy((): z.ZodType<CssValue> => cssValueSchema)),
  })
  .strict();

/**
 * Union of all possible CSS value representations
 * This is the foundation for representing authored CSS values
 * that may contain symbolic references (var()), keywords, or literals
 */
// export const cssValueSchema = z.union([literalValueSchema, variableReferenceSchema, keywordValueSchema]);

export const allCssValueSchema = [
  // Structural
  listValueSchema,

  // Primitives
  literalValueSchema,
  keywordValueSchema,
  stringLiteralSchema,
  variableReferenceSchema,

  // Functions
  urlFunctionSchema,
  functionCallSchema,
  calcFunctionSchema,
  attrFunctionSchema,
  clampFunctionSchema,
  minmaxFunctionSchema,
  calcOperationSchema,

  // lchColorSchema,
  // hexColorSchema,
  rgbFunctionSchema,
  hslFunctionSchema,
];

const allCssValues = allCssValueSchema.flatMap(getLiteralValues);

export const cssValueSchema = z.union(allCssValueSchema, {
  error: () => `Expected ${allCssValues.join(" | ")}`,
});

export type LiteralValue = z.infer<typeof literalValueSchema>;
export type VariableReference = z.infer<typeof variableReferenceSchema>;
export type KeywordValue = z.infer<typeof keywordValueSchema>;
export type CssValue = z.infer<typeof cssValueSchema>;
