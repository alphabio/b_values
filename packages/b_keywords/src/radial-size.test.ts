// b_path:: packages/b_keywords/src/radial-size.test.ts
import { describe, expect, it } from "vitest";
import { radialSizeKeyword } from "./radial-size";

describe("radialSizeKeyword", () => {
  it("accepts valid size keywords", () => {
    expect(radialSizeKeyword.parse("closest-side")).toBe("closest-side");
    expect(radialSizeKeyword.parse("farthest-side")).toBe("farthest-side");
    expect(radialSizeKeyword.parse("closest-corner")).toBe("closest-corner");
    expect(radialSizeKeyword.parse("farthest-corner")).toBe("farthest-corner");
  });

  it("rejects invalid values", () => {
    expect(() => radialSizeKeyword.parse("center")).toThrow();
    expect(() => radialSizeKeyword.parse("")).toThrow();
    expect(() => radialSizeKeyword.parse("nearest")).toThrow();
  });
});
