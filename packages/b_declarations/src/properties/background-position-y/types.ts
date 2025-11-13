// b_path:: packages/b_declarations/src/properties/background-position-y/types.ts

import type { CssValue } from "@b/types";

export type BackgroundPositionYIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" }
  | { kind: "value"; value: CssValue };
