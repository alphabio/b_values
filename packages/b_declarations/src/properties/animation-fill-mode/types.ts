// b_path:: packages/b_declarations/src/properties/animation-fill-mode/types.ts

import type * as Keywords from "@b/keywords";

export type AnimationFillModeIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.AnimationFillModeKeyword;
};
