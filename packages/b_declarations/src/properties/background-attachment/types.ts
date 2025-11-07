// b_path:: packages/b_declarations/src/properties/background-attachment/types.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * Single attachment value. This is the component type.
 * Here, it's just a simple keyword from our vocabulary.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment
 */
const attachmentValueSchema = Keywords.backgroundAttachment;
export type AttachmentValue = z.infer<typeof attachmentValueSchema>;

/**
 * The final IR schema for the entire `background-attachment` property.
 * This is the top-level property type.
 * It's a discriminated union of a keyword OR a list of component values.
 */
export const backgroundAttachmentIRSchema = z.discriminatedUnion("kind", [
  // OPTION A: The entire property is a CSS-wide keyword.
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide, // The vocabulary is CSS-wide keywords.
  }),

  // OPTION B: The entire property is a list of <attachment> values.
  z.object({
    kind: z.literal("list"),
    values: z.array(attachmentValueSchema).min(1),
  }),
]);

export type BackgroundAttachmentIR = z.infer<typeof backgroundAttachmentIRSchema>;
