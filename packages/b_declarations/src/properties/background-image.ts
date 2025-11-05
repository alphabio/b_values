// b_path:: packages/b_declarations/src/properties/background-image.ts
import { ok, err, type Result } from "@b/types";
import { parseUrl } from "@b/parsers";
import { defineProperty } from "../registry";
import { isCSSWideKeyword, parseCSSWideKeyword, splitByComma } from "../utils";

/**
 * Background image value IR.
 * Can be a list of image layers.
 */
export type BackgroundImageIR =
  | { kind: "keyword"; value: string }
  | { kind: "layers"; layers: ImageLayer[] };

/**
 * Single image layer - can be various <image> types.
 * 
 * <image> = 
 *   <url> |
 *   <gradient> |
 *   <image()> |
 *   <image-set()> |
 *   <cross-fade()> |
 *   <element()>
 */
export type ImageLayer =
  | { kind: "url"; url: string }
  | { kind: "gradient"; value: string } // Placeholder until gradient parsers are added
  | { kind: "none" };

/**
 * Parse a background-image value.
 * 
 * Property syntax: background-image = <bg-image>#
 * Where <bg-image> = <image> | none
 * And <image> = <url> | <gradient> | <image()> | etc.
 * 
 * This parser:
 * 1. Handles CSS-wide keywords (inherit, initial, etc.)
 * 2. Splits comma-separated layers
 * 3. Delegates each layer to appropriate VALUE parser
 */
export function parseBackgroundImage(value: string): Result<BackgroundImageIR, string> {
  const trimmed = value.trim();

  // Handle CSS-wide keywords
  if (isCSSWideKeyword(trimmed)) {
    const keywordResult = parseCSSWideKeyword(trimmed);
    if (keywordResult.ok) {
      return ok({
        kind: "keyword",
        value: keywordResult.value,
      });
    }
  }

  // Handle 'none' keyword
  if (trimmed.toLowerCase() === "none") {
    return ok({
      kind: "keyword",
      value: "none",
    });
  }

  // Split into layers (comma-separated)
  const layerStrings = splitByComma(trimmed);
  const layers: ImageLayer[] = [];

  for (const layerStr of layerStrings) {
    const layer = layerStr.trim();

    // Parse 'none'
    if (layer.toLowerCase() === "none") {
      layers.push({ kind: "none" });
      continue;
    }

    // Delegate to url() parser
    if (layer.startsWith("url(")) {
      const urlResult = parseUrl(layer);
      if (!urlResult.ok) {
        return err(`Invalid url() in background-image: ${urlResult.error}`);
      }
      layers.push({
        kind: "url",
        url: urlResult.value.value,
      });
      continue;
    }

    // Handle gradients (placeholder - delegate to gradient parsers when available)
    if (
      layer.startsWith("linear-gradient(") ||
      layer.startsWith("radial-gradient(") ||
      layer.startsWith("conic-gradient(") ||
      layer.startsWith("repeating-linear-gradient(") ||
      layer.startsWith("repeating-radial-gradient(") ||
      layer.startsWith("repeating-conic-gradient(")
    ) {
      // TODO: Delegate to parseLinearGradient(), parseRadialGradient(), etc.
      layers.push({
        kind: "gradient",
        value: layer,
      });
      continue;
    }

    // TODO: Handle other <image> types:
    // - image()
    // - image-set()
    // - cross-fade()
    // - element()

    return err(`Unsupported image type in background-image: ${layer}`);
  }

  return ok({
    kind: "layers",
    layers,
  });
}

/**
 * background-image property definition.
 */
export const backgroundImageProperty = defineProperty({
  name: "background-image",
  syntax: "<bg-image>#",
  parser: parseBackgroundImage,
  inherited: false,
  initial: "none",
});
