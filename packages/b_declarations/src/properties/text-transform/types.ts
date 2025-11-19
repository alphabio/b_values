// b_path:: packages/b_declarations/src/properties/text-transform/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";

export type TextTransformIR = {
  kind: "keyword";
  value: z.infer<typeof Keywords.cssWide> | Keywords.TextTransformKeyword;
};
