// b_path:: packages/b_keywords/src/radial-shape.test.ts
import { describe, expect, it } from "vitest";
import { radialShape } from "./radial-shape";

describe("radialShape", () => {
  it("accepts valid shapes", () => {
    expect(radialShape.parse("circle")).toBe("circle");
    expect(radialShape.parse("ellipse")).toBe("ellipse");
  });

  it("rejects invalid shapes", () => {
    expect(() => radialShape.parse("square")).toThrow();
    expect(() => radialShape.parse("")).toThrow();
    expect(() => radialShape.parse("round")).toThrow();
  });
});
