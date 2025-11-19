// b_path:: packages/b_declarations/src/properties/white-space/types.ts

import type * as Keywords from "@b/keywords";

export type WhiteSpaceIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.WhiteSpaceKeyword;
};
