// b_path:: packages/b_parsers/src/background/image.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult, type Image } from "@b/types";
import * as Ast from "@b/utils";
import * as Gradient from "../gradient";
import * as Url from "../url";

export function parseImageValue(valueNode: csstree.Value): ParseResult<Image> {
  if (!valueNode || !valueNode.children) {
    return parseErr("background-image", createError("invalid-value", "Invalid AST node: missing children"));
  }

  const children = Ast.nodeListToArray(valueNode.children);

  if (children.length === 0) {
    return parseErr("background-image", createError("missing-value", "Empty background layer"));
  }

  const firstNode = children[0];

  // Handle Url node (css-tree parses url() as Url type, not Function)
  if (firstNode.type === "Url") {
    return parseOk({
      kind: "url",
      url: firstNode.value,
    });
  }

  // Handle url() function (for completeness)
  if (Ast.isFunctionNode(firstNode, "url")) {
    const urlResult = Url.parseUrlFromNode(firstNode);

    if (urlResult.ok) {
      return parseOk({
        kind: "url",
        url: urlResult.value.value,
      });
    }
    return forwardParseErr<Image>(urlResult);
  }

  // Handle gradient functions
  if (Ast.isFunctionNode(firstNode)) {
    const funcName = (firstNode as csstree.FunctionNode).name.toLowerCase();

    if (funcName.includes("gradient")) {
      const gradientResult = Gradient.parseFromNode(firstNode);

      if (gradientResult.ok) {
        return parseOk({
          kind: "gradient",
          gradient: gradientResult.value,
        });
      }
      return forwardParseErr<Image>(gradientResult);
    }
  }

  return parseErr(
    "background-image",
    createError("invalid-value", "Unsupported background-image value", {
      suggestion: "Use url(), gradient, or 'none'",
    }),
  );
}
