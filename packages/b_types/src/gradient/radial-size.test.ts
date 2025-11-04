// b_path:: packages/b_types/src/gradient/radial-size.test.ts
import { describe, expect, it } from "vitest";
import { radialGradientSizeSchema } from "./radial-size";

describe("radialGradientSizeSchema", () => {
  it("validates keyword size - closest-side", () => {
    const result = radialGradientSizeSchema.parse({
      kind: "keyword",
      value: "closest-side",
    });
    expect(result).toEqual({
      kind: "keyword",
      value: "closest-side",
    });
  });

  it("validates keyword size - farthest-corner", () => {
    const result = radialGradientSizeSchema.parse({
      kind: "keyword",
      value: "farthest-corner",
    });
    expect(result).toEqual({
      kind: "keyword",
      value: "farthest-corner",
    });
  });

  it("validates circle explicit size", () => {
    const result = radialGradientSizeSchema.parse({
      kind: "circle-explicit",
      radius: { value: 100, unit: "px" },
    });
    expect(result).toEqual({
      kind: "circle-explicit",
      radius: { value: 100, unit: "px" },
    });
  });

  it("validates ellipse explicit size", () => {
    const result = radialGradientSizeSchema.parse({
      kind: "ellipse-explicit",
      radiusX: { value: 50, unit: "%" },
      radiusY: { value: 100, unit: "px" },
    });
    expect(result).toEqual({
      kind: "ellipse-explicit",
      radiusX: { value: 50, unit: "%" },
      radiusY: { value: 100, unit: "px" },
    });
  });

  it("rejects invalid keyword", () => {
    expect(() => radialGradientSizeSchema.parse({ kind: "keyword", value: "large" })).toThrow();
  });

  it("rejects circle without radius", () => {
    expect(() => radialGradientSizeSchema.parse({ kind: "circle-explicit" })).toThrow();
  });

  it("rejects ellipse with missing radiusY", () => {
    expect(() =>
      radialGradientSizeSchema.parse({
        kind: "ellipse-explicit",
        radiusX: { value: 50, unit: "%" },
      }),
    ).toThrow();
  });
});
