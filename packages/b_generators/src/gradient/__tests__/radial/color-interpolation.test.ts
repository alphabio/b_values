// b_path:: packages/b_generators/src/gradient/__tests__/radial/color-interpolation.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Radial from "../../radial";

describe("Radial Gradient Generator - Color Interpolation", () => {
  describe("Rectangular Color Spaces", () => {
    it("generates 'in srgb'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "srgb" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in srgb, red, blue)");
      }
    });

    it("generates 'in srgb'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "srgb" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in srgb, red, blue)");
      }
    });

    it("generates 'in display-p3'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "display-p3" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in display-p3, red, blue)");
      }
    });

    it("generates 'in display-p3-radial'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "display-p3" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in display-p3, red, blue)");
      }
    });

    it("generates 'in a98-rgb'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "a98-rgb" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in a98-rgb, red, blue)");
      }
    });

    it("generates 'in prophoto-rgb'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "prophoto-rgb" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in prophoto-rgb, red, blue)");
      }
    });

    it("generates 'in rec2020'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "rec2020" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in rec2020, red, blue)");
      }
    });

    it("generates 'in lab'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "lab" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in lab, red, blue)");
      }
    });

    it("generates 'in oklab'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "oklab" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in oklab, red, blue)");
      }
    });

    it("generates 'in xyz'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "xyz" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in xyz, red, blue)");
      }
    });

    it("generates 'in xyz-d50'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "xyz-d50" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in xyz-d50, red, blue)");
      }
    });

    it("generates 'in xyz-d65'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "xyz-d65" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in xyz-d65, red, blue)");
      }
    });
  });

  describe("Polar Color Spaces - No Hue Method", () => {
    it("generates 'in hsl'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hsl" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hsl, red, blue)");
      }
    });

    it("generates 'in hwb'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hwb" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hwb, red, blue)");
      }
    });

    it("generates 'in lch'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "lch" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in lch, red, blue)");
      }
    });

    it("generates 'in oklch'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "oklch" },
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

  describe("Polar Color Spaces - With Hue Method", () => {
    it("generates 'in hsl shorter hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hsl", hueInterpolationMethod: "shorter hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hsl shorter hue, red, blue)");
      }
    });

    it("generates 'in hsl longer hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hsl", hueInterpolationMethod: "longer hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hsl longer hue, red, blue)");
      }
    });

    it("generates 'in hsl increasing hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hsl", hueInterpolationMethod: "increasing hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hsl increasing hue, red, blue)");
      }
    });

    it("generates 'in hsl decreasing hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hsl", hueInterpolationMethod: "decreasing hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hsl decreasing hue, red, blue)");
      }
    });

    it("generates 'in hwb shorter hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hwb", hueInterpolationMethod: "shorter hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hwb shorter hue, red, blue)");
      }
    });

    it("generates 'in hwb longer hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hwb", hueInterpolationMethod: "longer hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hwb longer hue, red, blue)");
      }
    });

    it("generates 'in hwb increasing hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hwb", hueInterpolationMethod: "increasing hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hwb increasing hue, red, blue)");
      }
    });

    it("generates 'in hwb decreasing hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "hwb", hueInterpolationMethod: "decreasing hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in hwb decreasing hue, red, blue)");
      }
    });

    it("generates 'in lch shorter hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "lch", hueInterpolationMethod: "shorter hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in lch shorter hue, red, blue)");
      }
    });

    it("generates 'in lch longer hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "lch", hueInterpolationMethod: "longer hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in lch longer hue, red, blue)");
      }
    });

    it("generates 'in lch increasing hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "lch", hueInterpolationMethod: "increasing hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in lch increasing hue, red, blue)");
      }
    });

    it("generates 'in lch decreasing hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "lch", hueInterpolationMethod: "decreasing hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in lch decreasing hue, red, blue)");
      }
    });

    it("generates 'in oklch shorter hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "oklch", hueInterpolationMethod: "shorter hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in oklch shorter hue, red, blue)");
      }
    });

    it("generates 'in oklch longer hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "oklch", hueInterpolationMethod: "longer hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in oklch longer hue, red, blue)");
      }
    });

    it("generates 'in oklch increasing hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "oklch", hueInterpolationMethod: "increasing hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in oklch increasing hue, red, blue)");
      }
    });

    it("generates 'in oklch decreasing hue'", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        colorInterpolationMethod: { colorSpace: "oklch", hueInterpolationMethod: "decreasing hue" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(in oklch decreasing hue, red, blue)");
      }
    });
  });
});
