// b_path:: packages/b_types/src/gradient/conic.test.ts
import { describe, expect, it } from "vitest";
import { conicGradientSchema } from "./conic";

describe("conicGradientSchema", () => {
  it("validates simple conic gradient", () => {
    const result = conicGradientSchema.parse({
      kind: "conic",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.kind).toBe("conic");
    expect(result.colorStops).toHaveLength(2);
    expect(result.repeating).toBe(false);
  });

  it("validates gradient with fromAngle", () => {
    const result = conicGradientSchema.parse({
      kind: "conic",
      fromAngle: { kind: "literal", value: 45, unit: "deg" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.fromAngle).toEqual({ kind: "literal", value: 45, unit: "deg" });
  });

  it("validates gradient with position", () => {
    const result = conicGradientSchema.parse({
      kind: "conic",
      position: { horizontal: { kind: "keyword", value: "left" }, vertical: { kind: "keyword", value: "top" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.position).toEqual({
      horizontal: { kind: "keyword", value: "left" },
      vertical: { kind: "keyword", value: "top" },
    });
  });

  it("validates gradient with color space", () => {
    const result = conicGradientSchema.parse({
      kind: "conic",
      colorInterpolationMethod: { colorSpace: "oklch" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.colorInterpolationMethod?.colorSpace).toBe("oklch");
  });

  it("validates repeating conic gradient", () => {
    const result = conicGradientSchema.parse({
      kind: "conic",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: true,
    });
    expect(result.repeating).toBe(true);
  });

  it("validates gradient with angle positions in color stops", () => {
    const result = conicGradientSchema.parse({
      kind: "conic",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "deg" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 180, unit: "deg" } },
      ],
      repeating: false,
    });
    expect(result.colorStops[0].position).toEqual({ kind: "literal", value: 0, unit: "deg" });
    expect(result.colorStops[1].position).toEqual({ kind: "literal", value: 180, unit: "deg" });
  });

  it("rejects wrong kind", () => {
    expect(() =>
      conicGradientSchema.parse({
        kind: "linear",
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      }),
    ).toThrow();
  });
});
