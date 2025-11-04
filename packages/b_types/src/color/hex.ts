// b_path:: packages/b_types/src/color/hex.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
 */
export const hexColorSchema = z.object({
  kind: z.literal("hex"),
  value: z.string().regex(/^#[0-9A-F]{6}([0-9A-F]{2})?$/),
});

export type HexColor = z.infer<typeof hexColorSchema>;
