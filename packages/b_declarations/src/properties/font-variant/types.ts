// b_path:: packages/b_declarations/src/properties/font-variant/types.ts

import type * as Keywords from "@b/keywords";

export type FontVariantIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.FontVariantKeyword;
};
