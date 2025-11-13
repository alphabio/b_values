// b_path:: packages/b_declarations/src/properties/border-top-width/types.ts

import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type BorderTopWidthIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.LineWidthKeyword;
    }
  | { kind: "value"; value: CssValue };
