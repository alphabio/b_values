// b_path:: packages/b_declarations/src/properties/font-size/types.ts

import type * as Keywords from "@b/keywords";
import type { CssValue } from "@b/types";

export type FontSizeIR =
  | {
      kind: "keyword";
      value:
        | "initial"
        | "inherit"
        | "unset"
        | "revert"
        | "revert-layer"
        | Keywords.AbsoluteSize
        | Keywords.RelativeSize;
    }
  | {
      kind: "value";
      value: CssValue;
    };
