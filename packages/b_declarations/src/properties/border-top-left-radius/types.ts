// b_path:: packages/b_declarations/src/properties/border-top-left-radius/types.ts

import type { CssValue } from "@b/types";

export type BorderTopLeftRadiusIR =
  | { kind: "keyword"; value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" }
  | { kind: "circular"; radius: CssValue }
  | { kind: "elliptical"; horizontal: CssValue; vertical: CssValue };
