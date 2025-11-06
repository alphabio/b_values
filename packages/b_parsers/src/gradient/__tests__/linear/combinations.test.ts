// b_path:: packages/b_parsers/src/gradient/__tests__/linear/combinations.test.ts
import { describe, it, expect } from "vitest";
import * as Linear from "../../linear";

describe("Linear Gradient Parser - Combinations", () => {
  it("parses direction + interpolation + stops", () => {
    const css = "linear-gradient(45deg in srgb, red 0%, yellow 50%, blue 100%)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({ kind: "angle", value: { kind: "literal", value: 45, unit: "deg" } });
      expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb" });
      expect(result.value.colorStops).toHaveLength(3);
    }
  });

  it("parses to-side + interpolation + hue + stops", () => {
    const css = "linear-gradient(to right in lch longer hue, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({ kind: "to-side", value: "right" });
      expect(result.value.colorInterpolationMethod).toEqual({
        colorSpace: "lch",
        hueInterpolationMethod: "longer hue",
      });
      expect(result.value.colorStops).toHaveLength(2);
    }
  });

  it("parses to-corner + interpolation + positioned stops", () => {
    const css = "linear-gradient(to top left in display-p3, red 10%, yellow 50%, blue 90%)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({ kind: "to-corner", value: "top left" });
      expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "display-p3" });
      expect(result.value.colorStops).toHaveLength(3);
    }
  });

  it("parses var() direction + interpolation + stops", () => {
    const css = "linear-gradient(var(--angle) in srgb, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({ kind: "angle", value: { kind: "variable", name: "--angle" } });
      expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb" });
    }
  });

  it("parses calc() direction + interpolation + stops", () => {
    const css = "linear-gradient(calc(45deg + 10deg) in hsl, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction?.kind).toBe("angle");
      if (result.value.direction?.kind === "angle") {
        expect(result.value.direction.value.kind).toBe("calc");
      }
      expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "hsl" });
    }
  });

  it("parses repeating + direction + interpolation", () => {
    const css = "repeating-linear-gradient(45deg in srgb, red 0%, blue 10%)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.repeating).toBe(true);
      expect(result.value.direction).toEqual({ kind: "angle", value: { kind: "literal", value: 45, unit: "deg" } });
      expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb" });
    }
  });

  it("parses repeating without direction", () => {
    const css = "repeating-linear-gradient(red 0%, blue 10%)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.repeating).toBe(true);
      expect(result.value.direction).toBeUndefined();
    }
  });

  it("parses repeating + to-corner + hue interpolation", () => {
    const css = "repeating-linear-gradient(to bottom right in oklch shorter hue, red 0%, blue 5%)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.repeating).toBe(true);
      expect(result.value.direction).toEqual({ kind: "to-corner", value: "bottom right" });
      expect(result.value.colorInterpolationMethod).toEqual({
        colorSpace: "oklch",
        hueInterpolationMethod: "shorter hue",
      });
    }
  });

  it("parses complex: repeating + calc() + interpolation + var() positions", () => {
    const css = "repeating-linear-gradient(calc(90deg - 45deg) in lab, red var(--start), blue var(--end))";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.repeating).toBe(true);
      expect(result.value.direction?.kind).toBe("angle");
      expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "lab" });
      expect(result.value.colorStops[0].position).toEqual({ kind: "variable", name: "--start" });
      expect(result.value.colorStops[1].position).toEqual({ kind: "variable", name: "--end" });
    }
  });
});
