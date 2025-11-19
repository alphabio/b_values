// b_path:: packages/b_declarations/src/properties/word-spacing/types.ts

import type { CssValue } from "@b/types";

export type WordSpacingIR =
  | { kind: "keyword"; value: "normal" | "inherit" | "initial" | "revert" | "revert-layer" | "unset" }
  | { kind: "value"; value: CssValue };
