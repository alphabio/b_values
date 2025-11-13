// b_path:: packages/b_declarations/src/properties/border-left-width/types.ts

import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type BorderLeftWidthIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.LineWidthKeyword;
    }
  | { kind: "value"; value: CssValue };
