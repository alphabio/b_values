// b_path:: packages/b_declarations/src/properties/transform-origin/types.ts

import type * as Type from "@b/types";

export type TransformOriginIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer";
    }
  | {
      kind: "position";
      value: Type.Position2D;
    };
