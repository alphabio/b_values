// b_path:: packages/b_declarations/src/properties/line-height/types.ts

import type { CssValue } from "@b/types";

export type LineHeightIR =
  | { kind: "keyword"; value: "normal" | "inherit" | "initial" | "revert" | "revert-layer" | "unset" }
  | { kind: "value"; value: CssValue };
