// b_path:: packages/b_declarations/src/properties/text-transform/types.ts

import type * as Keywords from "@b/keywords";

export type TextTransformIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.TextTransformKeyword;
};
