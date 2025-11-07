// b_path:: packages/b_keywords/src/none.ts
import { z } from "zod";

export const none = z.literal("none");
export type None = z.infer<typeof none>;
