// b_path:: packages/b_declarations/src/properties/border-top-style/types.ts

import type * as Keywords from "@b/keywords";

export type BorderTopStyleIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.BorderStyleKeyword;
};
