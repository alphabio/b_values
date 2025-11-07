// b_path:: packages/b_generators/src/background-size/generator.ts

import { generateOk, generateErr, createError, type GenerateResult, type SizeLayer, type SizeValue } from "@b/types";
import * as Length from "../length";

/**
 * Generate CSS string for a single <bg-size> value.
 *
 * Syntax: [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain
 *
 * @param layer - The SizeLayer IR
 * @returns GenerateResult with CSS string
 */
export function generateBackgroundSizeValue(layer: SizeLayer): GenerateResult {
  if (layer.kind === "keyword") {
    return generateOk(layer.value);
  }

  // Explicit size
  const widthResult = generateSizeValue(layer.width);
  if (!widthResult.ok) return widthResult;

  const heightResult = generateSizeValue(layer.height);
  if (!heightResult.ok) return heightResult;

  // If both values are the same, output only one
  if (widthResult.value === heightResult.value) {
    return generateOk(widthResult.value);
  }

  // Different values - output both
  return generateOk(`${widthResult.value} ${heightResult.value}`);
}

function generateSizeValue(value: SizeValue): GenerateResult {
  if (value.kind === "auto") {
    return generateOk("auto");
  }

  if (value.kind === "length") {
    const result = Length.generate(value.value);
    if (!result.ok) {
      return generateErr(createError("invalid-value", "Failed to generate length"));
    }
    return generateOk(result.value);
  }

  if (value.kind === "percentage") {
    // Simple percentage generation: value + unit
    const cssValue = `${value.value.value}${value.value.unit}`;
    return generateOk(cssValue);
  }

  return generateErr(createError("invalid-value", `Unknown size value kind: ${(value as { kind: string }).kind}`));
}
