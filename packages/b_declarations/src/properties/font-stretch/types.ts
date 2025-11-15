// b_path:: packages/b_declarations/src/properties/font-stretch/types.ts

import type * as Keywords from "@b/keywords";

export type FontStretchIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.FontStretchKeyword;
};
