// b_path:: packages/b_types/src/url.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/url
 */
export const urlSchema = z
  .object({
    kind: z.literal("url"),
    value: z.string(),
  })
  .strict();

export type Url = z.infer<typeof urlSchema>;
