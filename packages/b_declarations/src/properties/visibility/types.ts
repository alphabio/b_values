// b_path:: packages/b_declarations/src/properties/visibility/types.ts

import type * as Keywords from "@b/keywords";

export type VisibilityIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.VisibilityKeyword;
};
