// b_path:: packages/b_declarations/src/properties/padding-top/types.ts

import type { CssValue } from "@b/types";

export type PaddingTopIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" }
  | { kind: "value"; value: CssValue };
