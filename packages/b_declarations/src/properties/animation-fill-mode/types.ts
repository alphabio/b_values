// b_path:: packages/b_declarations/src/properties/animation-fill-mode/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";

export type AnimationFillModeIR = {
  kind: "keyword";
  value: z.infer<typeof Keywords.cssWide> | z.infer<typeof Keywords.animationFillModeKeywordSchema>;
};
