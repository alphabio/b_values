// b_path:: packages/b_declarations/src/properties/transform/types.ts

import type * as Type from "@b/types";

export type TransformIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | "none";
    }
  | {
      kind: "transform-list";
      value: Type.TransformList;
    };
