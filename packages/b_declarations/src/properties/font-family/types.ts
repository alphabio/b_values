// b_path:: packages/b_declarations/src/properties/font-family/types.ts

import type { z } from "zod";
import type * as Keywords from "@b/keywords";

export type FontFamilyIR =
  | {
      kind: "keyword";
      value: z.infer<typeof Keywords.cssWide>;
    }
  | {
      kind: "list";
      families: Array<z.infer<typeof Keywords.genericFamilySchema> | string>;
    };
