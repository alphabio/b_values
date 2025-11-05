// b_path:: packages/b_parsers/src/url.ts
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type { Url } from "@b/types";

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
