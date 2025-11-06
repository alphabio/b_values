// b_path:: packages/b_parsers/src/gradient/gradient.ts
import type { ParseResult } from "@b/types";
import type * as Type from "@b/types";
import * as Radial from "./radial";
import * as Linear from "./linear";
import * as Conic from "./conic";

/**
 * Unified gradient parser that detects gradient type and dispatches to appropriate parser.
 *
 * Supports:
 * - linear-gradient() / repeating-linear-gradient()
 * - radial-gradient() / repeating-radial-gradient()
 * - conic-gradient() / repeating-conic-gradient()
 *
 * @param css - CSS gradient function string
 * @returns Parsed gradient IR
 */
export function parse(css: string): ParseResult<Type.Gradient> {
  const trimmed = css.trim();

  if (trimmed.startsWith("radial-gradient(") || trimmed.startsWith("repeating-radial-gradient(")) {
    return Radial.parse(css);
  }

  if (trimmed.startsWith("linear-gradient(") || trimmed.startsWith("repeating-linear-gradient(")) {
    return Linear.parse(css);
  }

  if (trimmed.startsWith("conic-gradient(") || trimmed.startsWith("repeating-conic-gradient(")) {
    return Conic.parse(css);
  }

  return {
    ok: false,
    issues: [
      {
        code: "invalid-value",
        severity: "error",
        message: `Expected gradient function (linear-gradient, radial-gradient, or conic-gradient), got: ${trimmed.slice(0, 50)}`,
      },
    ],
  };
}
