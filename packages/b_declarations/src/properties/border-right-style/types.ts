// b_path:: packages/b_declarations/src/properties/border-right-style/types.ts

import type * as Keywords from "@b/keywords";

export type BorderRightStyleIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.BorderStyleKeyword;
};
