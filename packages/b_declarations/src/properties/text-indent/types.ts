// b_path:: packages/b_declarations/src/properties/text-indent/types.ts

import type { z } from "zod";
import type { CssValue } from "@b/types";
import type * as Keywords from "@b/keywords";

export type TextIndentIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> }
  | { kind: "value"; value: CssValue };
