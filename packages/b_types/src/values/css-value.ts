// b_path:: packages/b_types/src/values/css-value.ts
import { z } from "zod";

/**
 * Represents a literal numeric value with optional unit
 * @see https://drafts.csswg.org/css-values-4/#numeric-types
 */
export const literalValueSchema = z.object({
  kind: z.literal("literal"),
  value: z.number(),
  unit: z.string().optional(),
});

/**
 * Represents a CSS custom property reference (var() function)
 * @see https://drafts.csswg.org/css-variables/#using-variables
 */
export const variableReferenceSchema: z.ZodType<{
  kind: "variable";
  name: string;
  fallback?: CssValue;
}> = z.object({
  kind: z.literal("variable"),
  name: z.string(),
  fallback: z.lazy((): z.ZodType<CssValue> => cssValueSchema).optional(),
});

/**
 * Represents a CSS keyword value
 * @see https://drafts.csswg.org/css-values-4/#keywords
 */
export const keywordValueSchema = z.object({
  kind: z.literal("keyword"),
  value: z.string(),
});

export const listValueSchema: z.ZodType<{
  kind: "list";
  separator: " " | ",";
  values: CssValue[];
}> = z.object({
  kind: z.literal("list"),
  separator: z.enum([" ", ","]),
  values: z.array(z.lazy((): z.ZodType<CssValue> => cssValueSchema)),
});

// Represents a single operation within a calc() expression
export const calcOperationSchema: z.ZodType<{
  kind: "calc-operation";
  operator: "+" | "-" | "*" | "/";
  // The operands can be any valid CSS value, including another operation
  left: CssValue;
  right: CssValue;
}> = z.object({
  kind: z.literal("calc-operation"),
  operator: z.enum(["+", "-", "*", "/"]),
  // Use z.lazy() for the recursive definition
  left: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
  right: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
});

// A top-level calc() function just holds the root operation/value
export const calcFunctionSchema: z.ZodType<{
  kind: "calc";
  value: CssValue;
}> = z.object({
  kind: z.literal("calc"),
  // The value inside can be a simple literal or a complex operation tree
  value: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
});

// For min() and max()
export const minmaxFunctionSchema: z.ZodType<{
  kind: "min" | "max";
  values: CssValue[];
}> = z.object({
  kind: z.union([z.literal("min"), z.literal("max")]),
  values: z.array(z.lazy((): z.ZodType<CssValue> => cssValueSchema)),
});

// For clamp()
export const clampFunctionSchema: z.ZodType<{
  kind: "clamp";
  min: CssValue;
  preferred: CssValue;
  max: CssValue;
}> = z.object({
  kind: z.literal("clamp"),
  // clamp() always has 3 arguments: min, preferred, max
  min: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
  preferred: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
  max: z.lazy((): z.ZodType<CssValue> => cssValueSchema),
});

export const urlFunctionSchema = z.object({
  kind: z.literal("url"),
  url: z.string(),
});

export const attrFunctionSchema: z.ZodType<{
  kind: "attr";
  name: string;
  typeOrUnit?: string; // e.g., "color", "px"
  fallback?: CssValue;
}> = z.object({
  kind: z.literal("attr"),
  name: z.string(),
  typeOrUnit: z.string().optional(),
  fallback: z.lazy((): z.ZodType<CssValue> => cssValueSchema).optional(),
});

/**
 * Union of all possible CSS value representations
 * This is the foundation for representing authored CSS values
 * that may contain symbolic references (var()), keywords, or literals
 */
// export const cssValueSchema = z.union([literalValueSchema, variableReferenceSchema, keywordValueSchema]);

export const cssValueSchema = z.union([
  // Primitives
  literalValueSchema,
  variableReferenceSchema,
  keywordValueSchema,

  // Functions
  calcFunctionSchema, // Or the more detailed calcOperationSchema if you parse the internals
  minmaxFunctionSchema,
  clampFunctionSchema,
  urlFunctionSchema,
  attrFunctionSchema,

  // lchColorSchema,
  // rgbColorSchema, etc.

  // Structural
  listValueSchema,
]);

export type LiteralValue = z.infer<typeof literalValueSchema>;
export type VariableReference = z.infer<typeof variableReferenceSchema>;
export type KeywordValue = z.infer<typeof keywordValueSchema>;
export type CssValue = z.infer<typeof cssValueSchema>;
