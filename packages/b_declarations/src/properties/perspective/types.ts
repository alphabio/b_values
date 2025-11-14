// b_path:: packages/b_declarations/src/properties/perspective/types.ts

import type * as Type from "@b/types";

export type PerspectiveIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | "none";
    }
  | {
      kind: "length";
      value: Type.Length;
    };
