// b_path:: packages/b_declarations/src/properties/background-image/generator.ts
import { generateOk, generateErr, createError, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BackgroundImageIR, ImageLayer } from "./types";

/**
 * Generate a background-image CSS value from its IR representation.
 *
 * @param ir - Background image IR
 * @returns GenerateResult with CSS string or issues
 */
export function generateBackgroundImage(ir: BackgroundImageIR): GenerateResult {
  // Handle CSS-wide keywords
  if (ir.kind === "keyword") {
    return generateOk(ir.value, "background-image");
  }

  // Generate each layer
  const layerStrings: string[] = [];
  const allIssues: import("@b/types").Issue[] = [];

  for (const layer of ir.layers) {
    const layerResult = generateImageLayer(layer);
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

/**
 * Generate a single image layer.
 */
function generateImageLayer(layer: ImageLayer): GenerateResult {
  switch (layer.kind) {
    case "none":
      return generateOk("none", "background-image");

    case "url":
      // Generate url() function
      return generateOk(`url(${layer.url})`, "background-image");

    case "gradient": {
      return Generators.Gradient.generate(layer.gradient);
    }

    default:
      return generateErr(
        createError("invalid-ir", "Unsupported image layer kind", {
          property: "background-image",
        }),
        "background-image",
      );
  }
}
