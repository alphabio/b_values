// b_path:: packages/b_declarations/src/properties/padding-bottom/types.ts

import type { CssValue } from "@b/types";

export type PaddingBottomIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" }
  | { kind: "value"; value: CssValue };
