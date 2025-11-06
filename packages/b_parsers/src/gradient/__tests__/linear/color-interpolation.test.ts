// b_path:: packages/b_parsers/src/gradient/__tests__/linear/color-interpolation.test.ts
import { describe, it, expect } from "vitest";
import * as Linear from "../../linear";

describe("Linear Gradient Parser - Color Interpolation", () => {
  describe("Rectangular Color Spaces", () => {
    it("parses 'in srgb'", () => {
      const css = "linear-gradient(in srgb, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb" });
      }
    });

    it("parses 'in srgb-linear'", () => {
      const css = "linear-gradient(in srgb-linear, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb-linear" });
      }
    });

    it("parses 'in display-p3'", () => {
      const css = "linear-gradient(in display-p3, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "display-p3" });
      }
    });

    it("parses 'in display-p3-linear'", () => {
      const css = "linear-gradient(in display-p3-linear, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "display-p3-linear" });
      }
    });

    it("parses 'in a98-rgb'", () => {
      const css = "linear-gradient(in a98-rgb, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "a98-rgb" });
      }
    });

    it("parses 'in prophoto-rgb'", () => {
      const css = "linear-gradient(in prophoto-rgb, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "prophoto-rgb" });
      }
    });

    it("parses 'in rec2020'", () => {
      const css = "linear-gradient(in rec2020, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "rec2020" });
      }
    });

    it("parses 'in lab'", () => {
      const css = "linear-gradient(in lab, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "lab" });
      }
    });

    it("parses 'in oklab'", () => {
      const css = "linear-gradient(in oklab, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "oklab" });
      }
    });

    it("parses 'in xyz'", () => {
      const css = "linear-gradient(in xyz, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "xyz" });
      }
    });

    it("parses 'in xyz-d50'", () => {
      const css = "linear-gradient(in xyz-d50, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "xyz-d50" });
      }
    });

    it("parses 'in xyz-d65'", () => {
      const css = "linear-gradient(in xyz-d65, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "xyz-d65" });
      }
    });
  });

  describe("Polar Color Spaces", () => {
    it("parses 'in hsl'", () => {
      const css = "linear-gradient(in hsl, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "hsl" });
      }
    });

    it("parses 'in hwb'", () => {
      const css = "linear-gradient(in hwb, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "hwb" });
      }
    });

    it("parses 'in lch'", () => {
      const css = "linear-gradient(in lch, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "lch" });
      }
    });

    it("parses 'in oklch'", () => {
      const css = "linear-gradient(in oklch, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "oklch" });
      }
    });
  });

  describe("Hue Interpolation Methods", () => {
    it("parses 'in hsl shorter hue'", () => {
      const css = "linear-gradient(in hsl shorter hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hsl",
          hueInterpolationMethod: "shorter hue",
        });
      }
    });

    it("parses 'in hsl longer hue'", () => {
      const css = "linear-gradient(in hsl longer hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hsl",
          hueInterpolationMethod: "longer hue",
        });
      }
    });

    it("parses 'in hsl increasing hue'", () => {
      const css = "linear-gradient(in hsl increasing hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hsl",
          hueInterpolationMethod: "increasing hue",
        });
      }
    });

    it("parses 'in hsl decreasing hue'", () => {
      const css = "linear-gradient(in hsl decreasing hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hsl",
          hueInterpolationMethod: "decreasing hue",
        });
      }
    });

    it("parses 'in lch shorter hue'", () => {
      const css = "linear-gradient(in lch shorter hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "shorter hue",
        });
      }
    });

    it("parses 'in lch longer hue'", () => {
      const css = "linear-gradient(in lch longer hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "longer hue",
        });
      }
    });

    it("parses 'in lch increasing hue'", () => {
      const css = "linear-gradient(in lch increasing hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "increasing hue",
        });
      }
    });

    it("parses 'in lch decreasing hue'", () => {
      const css = "linear-gradient(in lch decreasing hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "decreasing hue",
        });
      }
    });

    it("parses 'in oklch shorter hue'", () => {
      const css = "linear-gradient(in oklch shorter hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "oklch",
          hueInterpolationMethod: "shorter hue",
        });
      }
    });

    it("parses 'in oklch longer hue'", () => {
      const css = "linear-gradient(in oklch longer hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "oklch",
          hueInterpolationMethod: "longer hue",
        });
      }
    });

    it("parses 'in oklch increasing hue'", () => {
      const css = "linear-gradient(in oklch increasing hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "oklch",
          hueInterpolationMethod: "increasing hue",
        });
      }
    });

    it("parses 'in oklch decreasing hue'", () => {
      const css = "linear-gradient(in oklch decreasing hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "oklch",
          hueInterpolationMethod: "decreasing hue",
        });
      }
    });
  });

  describe("Combined with Direction", () => {
    it("parses direction + color interpolation", () => {
      const css = "linear-gradient(45deg in srgb, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "angle", value: { kind: "literal", value: 45, unit: "deg" } });
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb" });
      }
    });

    it("parses to-side + color interpolation", () => {
      const css = "linear-gradient(to right in hsl, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-side", value: "right" });
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "hsl" });
      }
    });

    it("parses to-corner + color interpolation + hue", () => {
      const css = "linear-gradient(to top right in lch longer hue, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-corner", value: "top right" });
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "longer hue",
        });
      }
    });
  });
});
