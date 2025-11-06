// b_path:: packages/b_generators/src/gradient/__tests__/radial/combinations.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Radial from "../../radial";

describe("Radial Gradient Generator - Combinations", () => {
  it("generates shape + size + position", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "circle",
      size: { kind: "keyword", value: "farthest-corner" },
      position: {
        horizontal: { kind: "literal", value: 30, unit: "%" },
        vertical: { kind: "literal", value: 40, unit: "%" },
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(circle farthest-corner at 30% 40%, red, blue)");
    }
  });

  it("generates shape + size + position + interpolation", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "ellipse",
      size: { kind: "keyword", value: "closest-side" },
      position: {
        horizontal: { kind: "keyword", value: "center" },
        vertical: { kind: "keyword", value: "top" },
      },
      colorInterpolationMethod: { colorSpace: "oklch" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(ellipse closest-side at center top, in oklch, red, blue)");
    }
  });

  it("generates explicit size + position + interpolation", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: { kind: "circle-explicit", radius: { kind: "literal", value: 100, unit: "px" } },
      position: {
        horizontal: { kind: "literal", value: 50, unit: "%" },
        vertical: { kind: "literal", value: 25, unit: "%" },
      },
      colorInterpolationMethod: { colorSpace: "srgb" },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(100px at 50% 25%, in srgb, red 0%, blue 100%)");
    }
  });

  it("generates repeating with all features", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "circle",
      size: { kind: "keyword", value: "farthest-side" },
      position: {
        horizontal: { kind: "keyword", value: "center" },
        vertical: { kind: "keyword", value: "center" },
      },
      colorInterpolationMethod: { colorSpace: "lch", hueInterpolationMethod: "longer hue" },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "px" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 50, unit: "px" } },
      ],
      repeating: true,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(
        "repeating-radial-gradient(circle farthest-side at center center, in lch longer hue, red 0px, blue 50px)",
      );
    }
  });

  it("generates with dynamic values in size and position", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: { kind: "circle-explicit", radius: { kind: "variable", name: "--radius" } },
      position: {
        horizontal: { kind: "variable", name: "--pos-x" },
        vertical: { kind: "variable", name: "--pos-y" },
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(var(--radius) at var(--pos-x) var(--pos-y), red, blue)");
    }
  });

  it("generates ellipse with explicit size and all features", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: {
        kind: "ellipse-explicit",
        radiusX: { kind: "literal", value: 100, unit: "px" },
        radiusY: { kind: "literal", value: 50, unit: "px" },
      },
      position: {
        horizontal: { kind: "literal", value: 20, unit: "%" },
        vertical: { kind: "literal", value: 80, unit: "%" },
      },
      colorInterpolationMethod: { colorSpace: "display-p3" },
      colorStops: [
        { color: { kind: "named", name: "red" } },
        { color: { kind: "named", name: "yellow" } },
        { color: { kind: "named", name: "blue" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(100px 50px at 20% 80%, in display-p3, red, yellow, blue)");
    }
  });

  it("generates with calc() in both size and position", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: {
        kind: "circle-explicit",
        radius: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: { kind: "literal", value: 50, unit: "px" },
            right: { kind: "literal", value: 10, unit: "px" },
          },
        },
      },
      position: {
        horizontal: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "-",
            left: { kind: "literal", value: 50, unit: "%" },
            right: { kind: "literal", value: 20, unit: "px" },
          },
        },
        vertical: { kind: "keyword", value: "center" },
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(calc(50px + 10px) at calc(50% - 20px) center, red, blue)");
    }
  });

  it("generates minimal gradient (no optional features)", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(red, blue)");
    }
  });

  it("generates maximal gradient (all features)", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "ellipse",
      size: { kind: "keyword", value: "farthest-corner" },
      position: {
        horizontal: { kind: "literal", value: 50, unit: "%" },
        vertical: { kind: "literal", value: 25, unit: "%" },
      },
      colorInterpolationMethod: { colorSpace: "oklch", hueInterpolationMethod: "shorter hue" },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
        { color: { kind: "named", name: "yellow" }, position: { kind: "literal", value: 50, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(
        "radial-gradient(ellipse farthest-corner at 50% 25%, in oklch shorter hue, red 0%, yellow 50%, blue 100%)",
      );
    }
  });
});
