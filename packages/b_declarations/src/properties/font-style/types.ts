// b_path:: packages/b_declarations/src/properties/font-style/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";
import type * as Type from "@b/types";

export type FontStyleIR =
  | {
      kind: "keyword";
      value: z.infer<typeof Keywords.cssWide> | z.infer<typeof Keywords.fontStyleKeywordSchema>;
    }
  | {
      kind: "oblique";
      angle?: Type.Angle;
    };
