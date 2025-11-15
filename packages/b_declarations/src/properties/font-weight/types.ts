// b_path:: packages/b_declarations/src/properties/font-weight/types.ts

import type * as Keywords from "@b/keywords";

export type FontWeightIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.FontWeightKeyword;
    }
  | {
      kind: "number";
      value: number;
    };
