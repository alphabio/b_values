// b_path:: packages/b_types/src/color/special.test.ts
import { describe, expect, it } from "vitest";
import { specialColorSchema } from "./special";

describe("specialColorSchema", () => {
  it("validates transparent keyword", () => {
    const result = specialColorSchema.safeParse({
      kind: "special",
      keyword: "transparent",
    });
    expect(result.success).toBe(true);
  });

  it("validates currentcolor keyword", () => {
    const result = specialColorSchema.safeParse({
      kind: "special",
      keyword: "currentcolor",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid special color keywords", () => {
    const result = specialColorSchema.safeParse({
      kind: "special",
      keyword: "inherit",
    });
    expect(result.success).toBe(false);
  });

  it("rejects uppercase keywords", () => {
    const result = specialColorSchema.safeParse({
      kind: "special",
      keyword: "TRANSPARENT",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong kind", () => {
    const result = specialColorSchema.safeParse({
      kind: "named",
      keyword: "transparent",
    });
    expect(result.success).toBe(false);
  });
});
