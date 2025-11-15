// b_path:: packages/b_declarations/src/properties/font-family/types.ts

import type * as Keywords from "@b/keywords";

export type FontFamilyIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer";
    }
  | {
      kind: "list";
      families: Array<Keywords.GenericFamily | string>;
    };
