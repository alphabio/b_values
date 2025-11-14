// b_path:: packages/b_units/src/time.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export const timeUnitSchema = z.union([z.literal("s"), z.literal("ms")]);

export const TIME_UNITS = timeUnitSchema.options.map((option) => option.value);

export type TimeUnit = z.infer<typeof timeUnitSchema>;
