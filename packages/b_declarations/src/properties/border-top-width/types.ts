// b_path:: packages/b_declarations/src/properties/border-top-width/types.ts

import type { z } from "zod";
import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type BorderTopWidthIR =
  | {
      kind: "keyword";
      value: z.infer<typeof Keywords.cssWide> | z.infer<typeof Keywords.lineWidthKeywordSchema>;
    }
  | { kind: "value"; value: CssValue };
