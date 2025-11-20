// b_path:: packages/b_declarations/src/properties/backdrop-filter/types.ts

import type * as Type from "@b/types";

export type BackdropFilterIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | "none";
    }
  | { kind: "css-value"; value: Type.CssValue }
  | { kind: "filter-list"; value: Type.FilterList };
