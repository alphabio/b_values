// b_path:: packages/b_declarations/src/properties/letter-spacing/types.ts

import type { CssValue } from "@b/types";

export type LetterSpacingIR =
  | { kind: "keyword"; value: "normal" | "inherit" | "initial" | "revert" | "revert-layer" | "unset" }
  | { kind: "value"; value: CssValue };
