// b_path:: packages/b_declarations/src/properties/transition-delay/types.ts

import type { z } from "zod";
import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type TransitionDelayIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> }
  | { kind: "value"; value: CssValue };
