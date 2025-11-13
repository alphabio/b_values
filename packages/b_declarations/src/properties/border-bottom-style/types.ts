// b_path:: packages/b_declarations/src/properties/border-bottom-style/types.ts

import type * as Keywords from "@b/keywords";

export type BorderBottomStyleIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.BorderStyleKeyword;
};
