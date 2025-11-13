// b_path:: packages/b_declarations/src/properties/margin-bottom/types.ts

import type { CssValue } from "@b/types";

export type MarginBottomIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | "auto" }
  | { kind: "value"; value: CssValue };
