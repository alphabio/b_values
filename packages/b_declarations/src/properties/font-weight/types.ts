// b_path:: packages/b_declarations/src/properties/font-weight/types.ts

import type { z } from "zod";
import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type FontWeightIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> | z.infer<typeof Keywords.fontWeightKeywordSchema> }
  | { kind: "value"; value: CssValue };
