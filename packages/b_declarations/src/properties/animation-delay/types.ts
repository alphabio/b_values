// b_path:: packages/b_declarations/src/properties/animation-delay/types.ts

import type { z } from "zod";
import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";
import type * as Type from "@b/types";

export type AnimationDelayIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> }
  | { kind: "time"; value: Type.Time }
  | { kind: "value"; value: CssValue };
