// b_path:: packages/b_keywords/src/utils/zod.ts
import { z } from "zod";

/**
 * Extract literal string values from a Zod schema.
 *
 * Recursively traverses ZodLiteral and ZodUnion schemas to collect all literal string values.
 *
 * @param schema
 * @returns Array of literal string values
 *
 */
export function getLiteralValues(schema: z.core.$ZodType): string[] {
  if (schema instanceof z.ZodLiteral) {
    return [String(schema.value)];
  }
  if (schema instanceof z.ZodUnion) {
    return schema.options.flatMap(getLiteralValues);
  }
  return [];
}
