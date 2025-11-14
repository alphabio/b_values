// b_path:: packages/b_declarations/src/properties/animation-play-state/types.ts

import type * as Keywords from "@b/keywords";

export type AnimationPlayStateIR = {
  kind: "keyword";
  value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | Keywords.AnimationPlayStateKeyword;
};
