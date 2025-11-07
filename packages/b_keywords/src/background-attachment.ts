// b_path:: packages/b_keywords/src/background-attachment.ts

import { getLiteralValues } from "./utils";
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment
 */
export const backgroundAttachment = z.union([z.literal("scroll"), z.literal("fixed"), z.literal("local")]);

export const BACKGROUND_ATTACHMENT = getLiteralValues(backgroundAttachment);

export type BackgroundAttachment = z.infer<typeof backgroundAttachment>;
