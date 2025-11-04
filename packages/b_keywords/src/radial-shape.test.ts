// b_path:: packages/b_keywords/src/radial-shape.test.ts
import { describe, expect, it } from "vitest";
import { radialShapeSchema } from "./radial-shape";

describe("radialShapeSchema", () => {
  it("accepts valid shapes", () => {
    expect(radialShapeSchema.parse("circle")).toBe("circle");
    expect(radialShapeSchema.parse("ellipse")).toBe("ellipse");
  });

  it("rejects invalid shapes", () => {
    expect(() => radialShapeSchema.parse("square")).toThrow();
    expect(() => radialShapeSchema.parse("")).toThrow();
    expect(() => radialShapeSchema.parse("round")).toThrow();
  });
});
