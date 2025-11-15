// b_path:: packages/b_declarations/src/properties/perspective-origin/types.ts

import type * as Type from "@b/types";

export type PerspectiveOriginIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer";
    }
  | {
      kind: "position";
      value: Type.Position2D;
    };
