// b_path:: packages/b_declarations/src/properties/perspective/types.ts

import type { z } from "zod";
import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type PerspectiveIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> | "none" }
  | { kind: "value"; value: CssValue };
