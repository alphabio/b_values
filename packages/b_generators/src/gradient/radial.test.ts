// b_path:: packages/b_generators/src/gradient/radial.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Radial from "./radial";

describe("Radial Gradient Generator", () => {
  it("generates simple radial gradient", () => {
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

  it("generates radial gradient with circle shape", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "circle",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(circle, red, blue)");
    }
  });

  it("generates radial gradient with ellipse shape", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "ellipse",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(ellipse, red, blue)");
    }
  });

  it("generates radial gradient with size keyword", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "circle",
      size: { kind: "keyword", value: "closest-side" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(circle closest-side, red, blue)");
    }
  });

  it("generates radial gradient with explicit circle size", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: { kind: "circle-explicit", radius: { value: 50, unit: "px" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(50px, red, blue)");
    }
  });

  it("generates radial gradient with explicit ellipse size", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: {
        kind: "ellipse-explicit",
        radiusX: { value: 50, unit: "px" },
        radiusY: { value: 100, unit: "px" },
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(50px 100px, red, blue)");
    }
  });

  it("generates radial gradient with position", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      position: { horizontal: "center", vertical: "top" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(at center top, red, blue)");
    }
  });

  it("generates radial gradient with shape, size, and position", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "circle",
      size: { kind: "keyword", value: "farthest-corner" },
      position: { horizontal: { value: 30, unit: "%" }, vertical: { value: 40, unit: "%" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(circle farthest-corner at 30% 40%, red, blue)");
    }
  });

  it("generates repeating radial gradient", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { value: 0, unit: "px" } },
        { color: { kind: "named", name: "blue" }, position: { value: 20, unit: "px" } },
      ],
      repeating: true,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("repeating-radial-gradient(red 0px, blue 20px)");
    }
  });

  it("generates radial gradient with color stops at positions", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      shape: "circle",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { value: 0, unit: "%" } },
        { color: { kind: "named", name: "yellow" }, position: { value: 50, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(circle, red 0%, yellow 50%, blue 100%)");
    }
  });

  it("generates radial gradient with color interpolation method", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      colorInterpolationMethod: {
        colorSpace: "oklch",
        hueInterpolationMethod: undefined,
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(in oklch, red, blue)");
    }
  });
});
