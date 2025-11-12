// b_path:: packages/b_generators/src/image/image.ts

import { generateOk, generateErr, createError, type GenerateResult, type Image } from "@b/types";
import * as Generators from "@b/generators";

/**
 * Generate a single image value.
 */
export function generate(layer: Image): GenerateResult {
  switch (layer.kind) {
    case "none":
      return generateOk("none");

    case "url":
      return generateOk(`url(${layer.url})`);

    case "gradient": {
      return Generators.Gradient.generate(layer.gradient);
    }

    default:
      return generateErr(createError("invalid-ir", "Unsupported image layer kind"));
  }
}
