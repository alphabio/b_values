// b_path:: packages/b_parsers/src/url.ts
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type { Url } from "@b/types";
import type * as csstree from "@eslint/css-tree";

/**
 * Parse a CSS url() function.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/url
 *
 * @example
 * ```ts
 * parseUrl("url(image.png)")
 * parseUrl('url("image.png")')
 * parseUrl("url('image.png')")
 * ```
 */
export function parseUrl(input: string): ParseResult<Url> {
  const trimmed = input.trim();

  // Must start with url(
  if (!trimmed.startsWith("url(")) {
    return parseErr(createError("invalid-syntax", `Expected url() function, got: ${input}`));
  }

  // Must end with )
  if (!trimmed.endsWith(")")) {
    return parseErr(createError("invalid-syntax", `Invalid url() function: missing closing parenthesis in "${input}"`));
  }

  // Extract content between url( and )
  const content = trimmed.slice(4, -1).trim();

  // Handle quoted strings
  const quotedMatch = content.match(/^(['"])(.*)\1$/);
  if (quotedMatch) {
    return parseOk({
      kind: "url",
      value: quotedMatch[2],
    });
  }

  // Handle unquoted URL
  if (content) {
    return parseOk({
      kind: "url",
      value: content,
    });
  }

  return parseErr(createError("invalid-syntax", `Empty url() function in "${input}"`));
}

/**
 * Parse a CSS url() function from AST node.
 * AST-native version for improved performance and error locations.
 *
 * @param node - FunctionNode representing url()
 * @returns Parsed URL IR
 */
export function parseUrlFromNode(node: csstree.FunctionNode): ParseResult<Url> {
  if (node.name.toLowerCase() !== "url") {
    return parseErr(createError("invalid-syntax", `Expected url() function, got: ${node.name}()`));
  }

  const children = node.children.toArray();

  // url() should have exactly one child (the URL string or identifier)
  if (children.length === 0) {
    return parseErr(createError("invalid-syntax", "Empty url() function"));
  }

  if (children.length > 1) {
    return parseErr(createError("invalid-syntax", "url() function should have exactly one argument"));
  }

  const child = children[0];

  // Handle string literals (quoted)
  if (child.type === "String") {
    return parseOk({
      kind: "url",
      value: child.value,
    });
  }

  // Handle raw URL (identifier or url token)
  if (child.type === "Url") {
    return parseOk({
      kind: "url",
      value: child.value,
    });
  }

  // Handle identifier (unquoted URL)
  if (child.type === "Identifier") {
    return parseOk({
      kind: "url",
      value: child.name,
    });
  }

  // Unexpected child type
  return parseErr(createError("invalid-syntax", `Unexpected content in url() function: ${child.type}`));
}
