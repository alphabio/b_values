// b_path:: packages/b_declarations/src/properties/background-image/parser.ts
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
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
export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  const trimmed = value.trim();

  // Handle CSS-wide keywords
  if (isCSSWideKeyword(trimmed)) {
    const keywordResult = parseCSSWideKeyword(trimmed);
    if (keywordResult.ok) {
      return parseOk({
        kind: "keyword",
        value: keywordResult.value,
      });
    }
  }

  // Handle 'none' keyword
  if (trimmed.toLowerCase() === "none") {
    return parseOk({
      kind: "keyword",
      value: "none",
    });
  }

  // Split into layers (comma-separated)
  const layerStrings = splitByComma(trimmed);
  const layerResults: ParseResult<ImageLayer>[] = [];

  for (const layerStr of layerStrings) {
    const layer = layerStr.trim();

    // Parse 'none'
    if (layer.toLowerCase() === "none") {
      layerResults.push(parseOk({ kind: "none" }));
      continue;
    }

    // Delegate to url() parser
    if (layer.startsWith("url(")) {
      const urlResult = Parsers.Url.parseUrl(layer);
      if (urlResult.ok) {
        layerResults.push(
          parseOk({
            kind: "url",
            url: urlResult.value.value,
          }),
        );
      } else {
        layerResults.push(forwardParseErr<ImageLayer>(urlResult));
      }
      continue;
    }

    // Delegate to linear-gradient parser
    if (layer.startsWith("linear-gradient(") || layer.startsWith("repeating-linear-gradient(")) {
      const gradientResult = Parsers.Gradient.Linear.parse(layer);
      if (gradientResult.ok) {
        layerResults.push(
          parseOk({
            kind: "gradient",
            gradient: gradientResult.value,
          }),
        );
      } else {
        layerResults.push(forwardParseErr<ImageLayer>(gradientResult));
      }
      continue;
    }

    // Delegate to radial-gradient parser
    if (layer.startsWith("radial-gradient(") || layer.startsWith("repeating-radial-gradient(")) {
      const gradientResult = Parsers.Gradient.Radial.parse(layer);
      if (gradientResult.ok) {
        layerResults.push(
          parseOk({
            kind: "gradient",
            gradient: gradientResult.value,
          }),
        );
      } else {
        layerResults.push(forwardParseErr<ImageLayer>(gradientResult));
      }
      continue;
    }

    // Delegate to conic-gradient parser
    if (layer.startsWith("conic-gradient(") || layer.startsWith("repeating-conic-gradient(")) {
      const gradientResult = Parsers.Gradient.Conic.parse(layer);
      if (gradientResult.ok) {
        layerResults.push(
          parseOk({
            kind: "gradient",
            gradient: gradientResult.value,
          }),
        );
      } else {
        layerResults.push(forwardParseErr<ImageLayer>(gradientResult));
      }
      continue;
    }

    // TODO: Handle other <image> types:
    // - image()
    // - image-set()
    // - cross-fade()
    // - element()

    layerResults.push(parseErr(createError("invalid-value", `Unsupported image type in background-image: ${layer}`)));
  }

  // Aggregate all issues from layer results
  const allIssues = layerResults.flatMap((r) => r.issues);
  const successfulLayers = layerResults.filter((r) => r.ok).map((r) => r.value as ImageLayer);

  const finalValue: BackgroundImageIR = {
    kind: "layers",
    layers: successfulLayers,
  };

  // If there are any errors, return failure with all issues but still include successful layers
  if (allIssues.some((i) => i.severity === "error")) {
    const result: ParseResult<BackgroundImageIR> = {
      ok: false,
      value: finalValue,
      issues: allIssues,
      property: "background-image",
    };
    return result;
  }

  return parseOk(finalValue, "background-image");
}
