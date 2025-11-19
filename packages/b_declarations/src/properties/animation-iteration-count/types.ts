// b_path:: packages/b_declarations/src/properties/animation-iteration-count/types.ts

import type { z } from "zod";
import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type AnimationIterationCountIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> | "infinite" }
  | { kind: "value"; value: CssValue };
