// b_path:: packages/b_declarations/src/properties/border-right-style/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";

export type BorderRightStyleIR = {
  kind: "keyword";
  value: z.infer<typeof Keywords.cssWide> | z.infer<typeof Keywords.borderStyleKeywordSchema>;
};
