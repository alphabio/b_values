// b_path:: packages/b_types/src/color/hex.ts
import { z } from "zod";

/**
 * Hex color schema supporting 3, 4, 6, and 8 digit formats (case-insensitive).
 * - #rgb (3 digits)
 * - #rgba (4 digits)
 * - #rrggbb (6 digits)
 * - #rrggbbaa (8 digits)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
 */
export const hexColorSchema = z.object({
  kind: z.literal("hex"),
  value: z.string().regex(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i),
});

export type HexColor = z.infer<typeof hexColorSchema>;
