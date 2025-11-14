// b_path:: packages/b_declarations/src/properties/animation-direction/types.ts

import type * as Keywords from "@b/keywords";

export type AnimationDirectionIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.AnimationDirectionKeyword;
};
