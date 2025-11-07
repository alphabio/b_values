// b_path:: packages/b_declarations/src/properties/background-image/parser.ts
/**
 * AST-native background-image parser
 *
 * Property syntax: background-image = <bg-image>#
 * Where <bg-image> = <image> | none
 * And <image> = <url> | <gradient> | <image()> | etc.
 */

import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword } from "../../utils";
import * as Ast from "@b/utils";
import type { BackgroundImageIR, ImageLayer } from "./types";
import type * as csstree from "@eslint/css-tree";

/**
 * Parse background-image from AST node.
 *
 * Single-pass approach:
 * 1. Check for keywords (none, inherit, initial, etc.)
 * 2. Split layers by comma using AST structure
 * 3. Dispatch each layer to appropriate parser based on node type
 */
export function parseBackgroundImage(valueNode: csstree.Value): ParseResult<BackgroundImageIR> {
  // Safety check - valueNode should have children
  if (!valueNode || !valueNode.children) {
    return parseErr(createError("invalid-value", "Invalid AST node: missing children"));
  }

  const children = Ast.nodeListToArray(valueNode.children);

  // Handle single keywords: 'none', 'inherit', 'initial', etc.
  if (children.length === 1 && Ast.isIdentifier(children[0])) {
    const keyword = children[0].name.toLowerCase();

    // CSS-wide keywords (inherit, initial, unset, revert)
    if (isCSSWideKeyword(keyword)) {
      const result = parseCSSWideKeyword(keyword);
      if (result.ok) {
        return parseOk({
          kind: "keyword",
          value: result.value,
        });
      }
    }

    // 'none' keyword
    if (keyword === "none") {
      return parseOk({
        kind: "keyword",
        value: "none",
      });
    }
  }

  // Split by top-level commas
  const layerGroups = Ast.splitNodesByComma(children);
  const layerResults: ParseResult<ImageLayer>[] = [];

  for (const group of layerGroups) {
    if (group.length === 0) continue;

    const firstNode = group[0];

    // Handle 'none' identifier
    if (Ast.isIdentifier(firstNode, "none")) {
      layerResults.push(parseOk({ kind: "none" }));
      continue;
    }

    // Handle Url node (css-tree parses url() as Url type, not Function)
    if (firstNode.type === "Url") {
      layerResults.push(
        parseOk({
          kind: "url",
          url: firstNode.value,
        }),
      );
      continue;
    }

    // Handle url() function (for completeness, though css-tree uses Url type)
    if (Ast.isFunctionNode(firstNode, "url")) {
      const urlResult = Parsers.Url.parseUrlFromNode(firstNode);

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

    // Handle gradient functions
    if (Ast.isFunctionNode(firstNode)) {
      const funcName = (firstNode as csstree.FunctionNode).name.toLowerCase();

      if (funcName.includes("gradient")) {
        const gradientResult = Parsers.Gradient.parseFromNode(firstNode);

        if (gradientResult.ok) {
          layerResults.push(
            parseOk({
              kind: "gradient",
              gradient: gradientResult.value,
            }),
          );
        } else {
          // Preserve partial value for generator inspection
          if (gradientResult.value) {
            layerResults.push({
              ok: false,
              value: {
                kind: "gradient",
                gradient: gradientResult.value,
              },
              issues: gradientResult.issues,
            });
          } else {
            layerResults.push(forwardParseErr<ImageLayer>(gradientResult));
          }
        }
        continue;
      }
    }

    // Unsupported image type
    const nodeStr = generateNodeToString(firstNode).slice(0, 50);
    layerResults.push(
      parseErr(
        createError("invalid-value", `Unsupported image type in background-image: ${nodeStr}`, {
          location: Ast.getNodeLocation(firstNode),
        }),
      ),
    );
  }

  // Aggregate results
  const allIssues = layerResults.flatMap((r) => r.issues);
  const successfulLayers = layerResults.filter((r) => r.ok).map((r) => r.value as ImageLayer);
  const partialLayers = layerResults.filter((r) => !r.ok && r.value).map((r) => r.value as ImageLayer);
  const allLayers = [...successfulLayers, ...partialLayers];

  const finalValue: BackgroundImageIR = {
    kind: "layers",
    layers: allLayers,
  };

  // Return error if any issues are errors, but still include partial value
  if (allIssues.some((i) => i.severity === "error")) {
    return {
      ok: false,
      value: finalValue,
      issues: allIssues,
      property: "background-image",
    };
  }

  return parseOk(finalValue, "background-image");
}

/**
 * Helper: Generate string from AST node
 * TODO: Move to AST utilities
 */
function generateNodeToString(node: csstree.CssNode): string {
  const csstree = require("@eslint/css-tree");
  return csstree.generate(node);
}
