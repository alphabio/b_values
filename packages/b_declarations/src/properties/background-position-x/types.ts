// b_path:: packages/b_declarations/src/properties/background-position-x/types.ts

import type { CssValue } from "@b/types";

export type BackgroundPositionXIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" }
  | { kind: "value"; value: CssValue };
