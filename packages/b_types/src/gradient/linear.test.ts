// b_path:: packages/b_types/src/gradient/linear.test.ts
import { describe, expect, it } from "vitest";
import { linearGradientSchema } from "./linear";

describe("linearGradientSchema", () => {
  it("validates simple gradient", () => {
    const result = linearGradientSchema.parse({
      kind: "linear",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.kind).toBe("linear");
    expect(result.colorStops).toHaveLength(2);
    expect(result.repeating).toBe(false);
  });

  it("validates gradient with angle direction", () => {
    const result = linearGradientSchema.parse({
      kind: "linear",
      direction: { kind: "angle", value: { kind: "literal", value: 90, unit: "deg" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.direction).toEqual({ kind: "angle", value: { kind: "literal", value: 90, unit: "deg" } });
  });

  it("validates gradient with to-side direction", () => {
    const result = linearGradientSchema.parse({
      kind: "linear",
      direction: { kind: "to-side", value: "right" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.direction).toEqual({ kind: "to-side", value: "right" });
  });

  it("validates gradient with color space", () => {
    const result = linearGradientSchema.parse({
      kind: "linear",
      colorInterpolationMethod: { colorSpace: "oklch" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.colorInterpolationMethod?.colorSpace).toBe("oklch");
  });

  it("validates repeating gradient", () => {
    const result = linearGradientSchema.parse({
      kind: "linear",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: true,
    });
    expect(result.repeating).toBe(true);
  });

  it("rejects wrong kind", () => {
    expect(() =>
      linearGradientSchema.parse({
        kind: "radial",
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      }),
    ).toThrow();
  });

  it("rejects single color stop", () => {
    expect(() =>
      linearGradientSchema.parse({
        kind: "linear",
        colorStops: [{ color: { kind: "named", name: "red" } }],
        repeating: false,
      }),
    ).toThrow();
  });
});
