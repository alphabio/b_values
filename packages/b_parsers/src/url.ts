// b_path:: packages/b_parsers/src/url.ts
import { ok, err, type Result } from "@b/types";
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
export function parseUrl(input: string): Result<Url, string> {
  const trimmed = input.trim();

  // Must start with url(
  if (!trimmed.startsWith("url(")) {
    return err(`Expected url() function, got: ${input}`);
  }

  // Must end with )
  if (!trimmed.endsWith(")")) {
    return err(`Invalid url() function: missing closing parenthesis in "${input}"`);
  }

  // Extract content between url( and )
  const content = trimmed.slice(4, -1).trim();

  // Handle quoted strings
  const quotedMatch = content.match(/^(['"])(.*)\1$/);
  if (quotedMatch) {
    return ok({
      kind: "url",
      value: quotedMatch[2],
    });
  }

  // Handle unquoted URL
  if (content) {
    return ok({
      kind: "url",
      value: content,
    });
  }

  return err(`Empty url() function in "${input}"`);
}
