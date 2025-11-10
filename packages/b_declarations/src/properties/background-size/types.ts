// b_path:: packages/b_declarations/src/properties/background-size/types.ts
import { z } from "zod";
import { bgSizeSchema } from "@b/types"; // <-- Import the reusable component type!
import * as Keywords from "@b/keywords";

/**
 * The final IR for the entire `background-size` property.
 */
export const backgroundSizeIR = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(bgSizeSchema).min(1),
  }),
]);

export type BackgroundSizeIR = z.infer<typeof backgroundSizeIR>;
