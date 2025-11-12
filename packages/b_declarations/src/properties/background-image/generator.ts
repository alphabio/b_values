// b_path:: packages/b_declarations/src/properties/background-image/generator.ts
import type { Issue, GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundImageIR } from "./types";

/**
 * Generate a background-image CSS value from its IR representation.
 * Returns value-only (no property prefix).
 */
export function generateBackgroundImage(ir: BackgroundImageIR): GenerateResult {
  if (ir.kind === "keyword") {
    return {
      ok: true,
      value: ir.value,
      issues: [],
    };
  }

  const layerStrings: string[] = [];
  const allIssues: Issue[] = [];

  for (let i = 0; i < ir.values.length; i++) {
    const layer = ir.values[i];
    const layerResult = generateValue(layer, (l) => Generators.Image.generate(l));
    if (!layerResult.ok) {
      return layerResult;
    }
    layerStrings.push(layerResult.value);
    allIssues.push(...layerResult.issues);
  }

  return {
    ok: true,
    value: layerStrings.join(", "),
    issues: allIssues,
  };
}
