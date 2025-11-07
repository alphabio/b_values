// b_path:: packages/b_declarations/src/properties/background-image/generator.ts
import type { Issue, GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BackgroundImageIR } from "./types";

/**
 * Generate a background-image CSS value from its IR representation.
 *
 * @param ir - Background image IR
 * @returns GenerateResult with CSS string or issues
 */
export function generateBackgroundImage(ir: BackgroundImageIR): GenerateResult {
  if (ir.kind === "keyword") {
    return {
      ok: true,
      value: ir.value,
      property: "background-image",
      issues: [],
    };
  }

  // Generate each layer
  const layerStrings: string[] = [];
  const allIssues: Issue[] = [];

  for (let i = 0; i < ir.values.length; i++) {
    const layer = ir.values[i];

    // Handle string keywords directly
    if (typeof layer === "string") {
      layerStrings.push(layer);
      continue;
    }

    const layerResult = Generators.Background.generateImageValue(layer, ["list", i]);
    if (!layerResult.ok) {
      return layerResult;
    }
    layerStrings.push(layerResult.value);
    allIssues.push(...layerResult.issues);
  }

  // Join with comma and space
  return {
    ok: true,
    value: layerStrings.join(", "),
    property: "background-image",
    issues: allIssues,
  };
}
