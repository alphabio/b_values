// b_path:: packages/b_declarations/src/properties/visibility/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";

export type VisibilityIR = {
  kind: "keyword";
  value: z.infer<typeof Keywords.cssWide> | z.infer<typeof Keywords.visibilityKeywordSchema>;
};
