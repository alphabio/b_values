// b_path:: packages/b_declarations/src/properties/border-bottom-width/types.ts

import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type BorderBottomWidthIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.BorderWidth.LineWidthKeyword;
    }
  | { kind: "value"; value: CssValue };
