// b_path:: packages/b_declarations/src/properties/font-size/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";
import type { CssValue } from "@b/types";

export type FontSizeIR =
  | {
      kind: "keyword";
      value:
        | z.infer<typeof Keywords.cssWide>
        | z.infer<typeof Keywords.absoluteSizeSchema>
        | z.infer<typeof Keywords.relativeSizeSchema>;
    }
  | {
      kind: "value";
      value: CssValue;
    };
