// b_path:: packages/b_declarations/src/properties/background-image/parser.ts
/**
 * Multi-value background-image parser
 *
 * Architecture: Multi-value parser (receives raw string)
 * - Splits value by top-level commas
 * - Parses EACH layer to AST individually
 * - One bad layer doesn't break others (resilient)
 *
 * Property syntax: background-image = <bg-image>#
 * Where <bg-image> = <image> | none
 * And <image> = <url> | <gradient>
 */

import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, splitByComma } from "../../utils";
import * as Ast from "@b/utils";
import type { BackgroundImageIR, ImageLayer } from "./types";
import * as csstree from "@eslint/css-tree";

/**
 * Parse background-image from raw string value.
 *
 * Multi-value parser: Handles comma-separated layers with partial failure resilience.
 */
export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  const trimmed = value.trim();

  // Handle single keywords: 'none', 'inherit', 'initial', etc.
  if (isCSSWideKeyword(trimmed)) {
    const result = parseCSSWideKeyword(trimmed);
    if (result.ok) {
      return parseOk({
        kind: "keyword",
        value: result.value,
      });
    }
  }

  if (trimmed.toLowerCase() === "none") {
    return parseOk({
      kind: "keyword",
      value: "none",
    });
  }

  // Split by top-level commas
  const layerStrings = splitByComma(trimmed);
  const layerResults: ParseResult<ImageLayer>[] = [];

  for (const layerStr of layerStrings) {
    // ✨ Parse EACH layer to AST individually
    let layerAst: csstree.Value;
    try {
      layerAst = csstree.parse(layerStr.trim(), {
        context: "value",
        positions: true,
      }) as csstree.Value;
    } catch (e) {
      // This layer has syntax error - record and continue to next
      const errorMessage = e instanceof Error ? e.message : String(e);
      const issue = createError("invalid-syntax", `Invalid syntax in background layer: ${errorMessage}`);
      layerResults.push(parseErr(issue));
      continue;
    }

    // Parse the validated AST for this layer
    const layerResult = parseImageLayerFromAST(layerAst);
    layerResults.push(layerResult);
  }

  // Aggregate results - collect valid layers and all issues
  return aggregateLayerResults(layerResults);
}

/**
 * Parse a single background layer from its AST.
 * Helper function for layer-by-layer parsing.
 */
function parseImageLayerFromAST(valueNode: csstree.Value): ParseResult<ImageLayer> {
  if (!valueNode || !valueNode.children) {
    return parseErr(createError("invalid-value", "Invalid AST node: missing children"));
  }

  const children = Ast.nodeListToArray(valueNode.children);

  if (children.length === 0) {
    return parseErr(createError("missing-value", "Empty background layer"));
  }

  const firstNode = children[0];

  // Handle 'none' identifier
  if (Ast.isIdentifier(firstNode, "none")) {
    return parseOk({ kind: "none" });
  }

  // Handle Url node (css-tree parses url() as Url type, not Function)
  if (firstNode.type === "Url") {
    return parseOk({
      kind: "url",
      url: firstNode.value,
    });
  }

  // Handle url() function (for completeness)
  if (Ast.isFunctionNode(firstNode, "url")) {
    const urlResult = Parsers.Url.parseUrlFromNode(firstNode);

    if (urlResult.ok) {
      return parseOk({
        kind: "url",
        url: urlResult.value.value,
      });
    }
    return forwardParseErr<ImageLayer>(urlResult);
  }

  // Handle gradient functions
  if (Ast.isFunctionNode(firstNode)) {
    const funcName = (firstNode as csstree.FunctionNode).name.toLowerCase();

    if (funcName.includes("gradient")) {
      const gradientResult = Parsers.Gradient.parseFromNode(firstNode);

      if (gradientResult.ok) {
        return parseOk({
          kind: "gradient",
          gradient: gradientResult.value,
        });
      }
      return forwardParseErr<ImageLayer>(gradientResult);
    }
  }

  return parseErr(
    createError("invalid-value", "Unsupported background-image value", {
      suggestion: "Use url(), gradient, or 'none'",
    }),
  );
}

/**
 * Aggregate layer results into final BackgroundImageIR.
 * Collects all valid layers and all issues from all layers.
 */
function aggregateLayerResults(layerResults: ParseResult<ImageLayer>[]): ParseResult<BackgroundImageIR> {
  const validLayers: ImageLayer[] = [];
  const allIssues: Array<NonNullable<ParseResult<ImageLayer>["issues"][number]>> = [];

  for (const result of layerResults) {
    // Collect all issues
    allIssues.push(...result.issues);

    // Collect valid values
    if (result.value) {
      validLayers.push(result.value);
    }
  }

  // If we have at least one valid layer, return success with partial results
  if (validLayers.length > 0) {
    return {
      ok: allIssues.length === 0,
      value: {
        kind: "layers",
        layers: validLayers,
      },
      issues: allIssues,
    };
  }

  // No valid layers - return error
  return {
    ok: false,
    value: undefined,
    issues: allIssues.length > 0 ? allIssues : [createError("invalid-value", "No valid background layers found")],
  };
}
