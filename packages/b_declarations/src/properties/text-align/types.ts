// b_path:: packages/b_declarations/src/properties/text-align/types.ts

import type * as Keywords from "@b/keywords";

export type TextAlignIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.TextAlignKeyword;
};
