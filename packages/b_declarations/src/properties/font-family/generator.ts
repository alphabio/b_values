// b_path:: packages/b_declarations/src/properties/font-family/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type { FontFamilyIR } from "./types";

export function generateFontFamily(ir: FontFamilyIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const parts = ir.families.map((family) => {
    // Check if it's a generic family (no quotes needed)
    const isGeneric = Keywords.genericFamilySchema.safeParse(family).success;
    if (isGeneric) {
      return family;
    }

    // Check if the family name needs quotes
    // Needs quotes if: contains spaces, starts with digit, or contains special chars
    const needsQuotes = /\s/.test(family) || /^\d/.test(family) || /[^a-zA-Z0-9-]/.test(family);

    if (needsQuotes) {
      // Escape any quotes in the name
      const escaped = family.replace(/"/g, '\\"');
      return `"${escaped}"`;
    }

    return family;
  });

  return generateOk(parts.join(", "));
}
