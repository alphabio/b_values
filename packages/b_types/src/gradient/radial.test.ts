// b_path:: packages/b_types/src/gradient/radial.test.ts
import { describe, expect, it } from "vitest";
import { radialGradientSchema } from "./radial";

describe("radialGradientSchema", () => {
  it("validates simple radial gradient", () => {
    const result = radialGradientSchema.parse({
      kind: "radial",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.kind).toBe("radial");
    expect(result.colorStops).toHaveLength(2);
    expect(result.repeating).toBe(false);
  });

  it("validates gradient with circle shape", () => {
    const result = radialGradientSchema.parse({
      kind: "radial",
      shape: "circle",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.shape).toBe("circle");
  });

  it("validates gradient with ellipse shape", () => {
    const result = radialGradientSchema.parse({
      kind: "radial",
      shape: "ellipse",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.shape).toBe("ellipse");
  });

  it("validates gradient with keyword size", () => {
    const result = radialGradientSchema.parse({
      kind: "radial",
      size: { kind: "keyword", value: "closest-side" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.size).toEqual({ kind: "keyword", value: "closest-side" });
  });

  it("validates gradient with position", () => {
    const result = radialGradientSchema.parse({
      kind: "radial",
      position: { horizontal: "left", vertical: "top" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.position).toEqual({ horizontal: "left", vertical: "top" });
  });

  it("validates gradient with color space", () => {
    const result = radialGradientSchema.parse({
      kind: "radial",
      colorSpace: "oklch",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.colorSpace).toBe("oklch");
  });

  it("validates repeating radial gradient", () => {
    const result = radialGradientSchema.parse({
      kind: "radial",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: true,
    });
    expect(result.repeating).toBe(true);
  });

  it("rejects wrong kind", () => {
    expect(() =>
      radialGradientSchema.parse({
        kind: "linear",
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      }),
    ).toThrow();
  });
});
