// b_path:: packages/b_types/src/image.test.ts

import { describe, expect, it } from "vitest";
import { imageSchema } from "./image";

describe("imageSchema", () => {
  it("validates url image", () => {
    const result = imageSchema.safeParse({
      kind: "url",
      url: "https://example.com/image.png",
    });
    expect(result.success).toBe(true);
  });

  it("validates gradient image", () => {
    const result = imageSchema.safeParse({
      kind: "gradient",
      gradient: {
        kind: "linear",
        colorStops: [],
        repeating: false,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = imageSchema.safeParse({
      kind: "url",
    });
    expect(result.success).toBe(false);
  });
});
