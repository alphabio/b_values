// b_path:: packages/b_types/src/gradient/radial-size.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "../values";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export const radialGradientSizeSchema = z.union([
  z
    .object({
      kind: z.literal("keyword"),
      value: Keywords.radialSizeKeyword,
    })
    .strict(),
  z
    .object({
      kind: z.literal("circle-explicit"),
      radius: cssValueSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("ellipse-explicit"),
      radiusX: cssValueSchema,
      radiusY: cssValueSchema,
    })
    .strict(),
]);

export type RadialGradientSize = z.infer<typeof radialGradientSizeSchema>;
