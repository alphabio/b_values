// b_path:: packages/b_declarations/src/properties/background-image/parser.ts
/**
 * Multi-value background-image parser
 *
 * Architecture: Uses createMultiValueParser factory for resilient list parsing
 * - Handles comma-separated layers
 * - Detects missing commas (incomplete consumption bug fix)
 * - One bad layer doesn't break others (resilient)
 *
 * Property syntax: background-image = <bg-image>#
 * Where <bg-image> = <image> | none
 * And <image> = <url> | <gradient>
 */

import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import * as Ast from "@b/utils";
import type { BackgroundImageIR, ImageLayer } from "./types";
import type * as csstree from "@eslint/css-tree";

/**
 * Pre-parse handler for top-level keywords.
 */
function preParse(value: string): ParseResult<BackgroundImageIR> | null {
  if (value.toLowerCase() === "none") {
    return parseOk({
      kind: "keyword",
      value: "none",
    });
  }

  if (isCSSWideKeyword(value)) {
    const result = parseCSSWideKeyword(value);
    if (result.ok) {
      return parseOk({
        kind: "keyword",
        value: result.value,
      });
    }
  }

  return null; // Not a keyword, proceed to list parsing
}

/**
 * Parse a single background layer from its AST.
 * Item parser for the multi-value parser factory.
 */
function parseImageLayer(valueNode: csstree.Value): ParseResult<ImageLayer> {
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
 * Aggregator for combining valid layers into final IR.
 */
function aggregator(layers: ImageLayer[]): BackgroundImageIR {
  return {
    kind: "layers",
    layers,
  };
}

/**
 * Parse background-image from raw string value.
 *
 * Multi-value parser: Handles comma-separated layers with:
 * - Partial failure resilience
 * - Missing comma detection
 * - Complete consumption validation
 */
export const parseBackgroundImage = createMultiValueParser<ImageLayer, BackgroundImageIR>({
  preParse,
  itemParser: parseImageLayer,
  aggregator,
});
