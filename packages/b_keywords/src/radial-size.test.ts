import { describe, expect, it } from "vitest";
import { radialSizeKeywordSchema } from "./radial-size";

describe("radialSizeKeywordSchema", () => {
  it("accepts valid size keywords", () => {
    expect(radialSizeKeywordSchema.parse("closest-side")).toBe("closest-side");
    expect(radialSizeKeywordSchema.parse("farthest-side")).toBe("farthest-side");
    expect(radialSizeKeywordSchema.parse("closest-corner")).toBe("closest-corner");
    expect(radialSizeKeywordSchema.parse("farthest-corner")).toBe("farthest-corner");
  });

  it("rejects invalid values", () => {
    expect(() => radialSizeKeywordSchema.parse("center")).toThrow();
    expect(() => radialSizeKeywordSchema.parse("")).toThrow();
    expect(() => radialSizeKeywordSchema.parse("nearest")).toThrow();
  });
});
