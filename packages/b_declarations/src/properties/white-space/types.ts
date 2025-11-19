// b_path:: packages/b_declarations/src/properties/white-space/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";

export type WhiteSpaceIR = {
  kind: "keyword";
  value: z.infer<typeof Keywords.cssWide> | Keywords.WhiteSpaceKeyword;
};
