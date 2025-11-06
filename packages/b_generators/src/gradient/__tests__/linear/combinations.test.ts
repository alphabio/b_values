// b_path:: packages/b_generators/src/gradient/__tests__/linear/combinations.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Linear from "../../linear";

describe("Linear Gradient Generator - Combinations", () => {
  it("generates direction + interpolation", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: { kind: "angle", value: { kind: "literal", value: 45, unit: "deg" } },
      colorInterpolationMethod: { colorSpace: "oklch" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(45deg, in oklch, red, blue)");
    }
  });

  it("generates direction + positions", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: { kind: "to-side", value: "right" },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(to right, red 0%, blue 100%)");
    }
  });

  it("generates interpolation + positions", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorInterpolationMethod: { colorSpace: "srgb" },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(in srgb, red 0%, blue 100%)");
    }
  });

  it("generates all features combined", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: { kind: "to-corner", value: "bottom right" },
      colorInterpolationMethod: { colorSpace: "oklch", hueInterpolationMethod: "shorter hue" },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 50, unit: "%" } },
        { color: { kind: "named", name: "green" }, position: { kind: "literal", value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(to bottom right, in oklch shorter hue, red 0%, blue 50%, green 100%)");
    }
  });

  it("generates repeating + direction", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: { kind: "angle", value: { kind: "literal", value: 45, unit: "deg" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: true,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("repeating-linear-gradient(45deg, red, blue)");
    }
  });

  it("generates repeating + positions", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "px" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 20, unit: "px" } },
      ],
      repeating: true,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("repeating-linear-gradient(red 0px, blue 20px)");
    }
  });

  it("generates repeating + interpolation", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorInterpolationMethod: { colorSpace: "srgb" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: true,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("repeating-linear-gradient(in srgb, red, blue)");
    }
  });

  it("generates dynamic direction + stops", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: { kind: "angle", value: { kind: "variable", name: "--angle" } },
      colorStops: [{ color: { kind: "variable", name: "--c1" } }, { color: { kind: "variable", name: "--c2" } }],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(var(--angle), var(--c1), var(--c2))");
    }
  });

  it("generates complex real-world gradient", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: { kind: "angle", value: { kind: "literal", value: 135, unit: "deg" } },
      colorInterpolationMethod: { colorSpace: "oklch" },
      colorStops: [
        {
          color: { kind: "hex", value: "#ff0000" },
          position: [
            { kind: "literal", value: 0, unit: "%" },
            { kind: "literal", value: 10, unit: "%" },
          ],
        },
        {
          color: { kind: "hex", value: "#00ff00" },
          position: [
            { kind: "literal", value: 10, unit: "%" },
            { kind: "literal", value: 50, unit: "%" },
          ],
        },
        {
          color: { kind: "hex", value: "#0000ff" },
          position: [
            { kind: "literal", value: 50, unit: "%" },
            { kind: "literal", value: 100, unit: "%" },
          ],
        },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(135deg, in oklch, #ff0000 0% 10%, #00ff00 10% 50%, #0000ff 50% 100%)");
    }
  });
});
