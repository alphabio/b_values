// b_path:: packages/b_declarations/src/properties/border-top-right-radius/types.ts

import type { CssValue } from "@b/types";

export type BorderTopRightRadiusIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" }
  | { kind: "circular"; radius: CssValue }
  | { kind: "elliptical"; horizontal: CssValue; vertical: CssValue };
