// b_path:: packages/b_types/src/color/named.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/named-color
 */
export const namedColorSchema = z.object({
  kind: z.literal("named"),
  name: Keywords.namedColorSchema,
});

export type NamedColor = z.infer<typeof namedColorSchema>;
