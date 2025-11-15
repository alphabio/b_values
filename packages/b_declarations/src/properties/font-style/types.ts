// b_path:: packages/b_declarations/src/properties/font-style/types.ts

import type * as Type from "@b/types";

export type FontStyleIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | "normal" | "italic";
    }
  | {
      kind: "oblique";
      angle?: Type.Angle;
    };
