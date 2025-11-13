// b_path:: packages/b_declarations/src/properties/padding-left/types.ts

import type { CssValue } from "@b/types";

export type PaddingLeftIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" }
  | { kind: "value"; value: CssValue };
