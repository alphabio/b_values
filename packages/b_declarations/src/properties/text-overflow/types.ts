// b_path:: packages/b_declarations/src/properties/text-overflow/types.ts

import type * as Keywords from "@b/keywords";

export type TextOverflowIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.TextOverflowKeyword;
};
