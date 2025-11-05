// b_path:: packages/b_declarations/src/properties/background-image/parser.ts
import { ok, err, type Result } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, splitByComma } from "../../utils";
import type { BackgroundImageIR, ImageLayer } from "./types";

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
      const urlResult = Parsers.Url.parseUrl(layer);
      if (!urlResult.ok) {
        return err(`Invalid url() in background-image: ${urlResult.error}`);
      }
      layers.push({
        kind: "url",
        url: urlResult.value.value,
      });
      continue;
    }

    // Delegate to linear-gradient parser
    if (layer.startsWith("linear-gradient(") || layer.startsWith("repeating-linear-gradient(")) {
      const gradientResult = Parsers.Gradient.Linear.parse(layer);
      if (!gradientResult.ok) {
        return err(`Invalid linear-gradient in background-image: ${gradientResult.error}`);
      }
      layers.push({
        kind: "gradient",
        gradient: gradientResult.value,
      });
      continue;
    }

    // Delegate to radial-gradient parser
    if (layer.startsWith("radial-gradient(") || layer.startsWith("repeating-radial-gradient(")) {
      const gradientResult = Parsers.Gradient.Radial.parse(layer);
      if (!gradientResult.ok) {
        return err(`Invalid radial-gradient in background-image: ${gradientResult.error}`);
      }
      layers.push({
        kind: "gradient",
        gradient: gradientResult.value,
      });
      continue;
    }

    // Delegate to conic-gradient parser
    if (layer.startsWith("conic-gradient(") || layer.startsWith("repeating-conic-gradient(")) {
      const gradientResult = Parsers.Gradient.Conic.parse(layer);
      if (!gradientResult.ok) {
        return err(`Invalid conic-gradient in background-image: ${gradientResult.error}`);
      }
      layers.push({
        kind: "gradient",
        gradient: gradientResult.value,
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
