// b_path:: packages/b_declarations/src/properties/font-stretch/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";

export type FontStretchIR = {
  kind: "keyword";
  value: z.infer<typeof Keywords.cssWide> | z.infer<typeof Keywords.fontStretchKeywordSchema>;
};
