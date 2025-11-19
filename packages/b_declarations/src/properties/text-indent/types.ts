// b_path:: packages/b_declarations/src/properties/text-indent/types.ts

import type { CssValue } from "@b/types";

export type TextIndentIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" }
  | { kind: "value"; value: CssValue };
