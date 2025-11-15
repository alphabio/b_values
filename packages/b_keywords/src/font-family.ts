// b_path:: packages/b_keywords/src/font-family.ts
import { z } from "zod";

/**
 * Generic font families
 * @see https://drafts.csswg.org/css-fonts-4/#generic-font-families
 */
export const genericFamilySchema = z.union([
  z.literal("serif"),
  z.literal("sans-serif"),
  z.literal("monospace"),
  z.literal("cursive"),
  z.literal("fantasy"),
  z.literal("system-ui"),
  z.literal("ui-serif"),
  z.literal("ui-sans-serif"),
  z.literal("ui-monospace"),
  z.literal("ui-rounded"),
  z.literal("math"),
  z.literal("emoji"),
  z.literal("fangsong"),
]);

export type GenericFamily = z.infer<typeof genericFamilySchema>;
